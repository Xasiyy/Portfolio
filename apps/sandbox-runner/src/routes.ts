import express from 'express';
import { docker, cloneRepo, buildImage, runContainer, stopAndRemoveContainer } from './docker.js';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';

const router = express.Router();
const sandbox = new Map<string, { containerId: string; port: string; contextPath: string; createAt: number }>();
const SANDBOX_TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

//recoit une URL de repo, genere un identifiant unique puis enchaine clone - build run avec un 
// tag de l'id enregistre dans la map le resultat et reurn id et port au client
router.post('/sandboxes', async (req, res) => {
    try {
        const { repoUrl } = req.body as { repoUrl: string };

        const sandboxId = randomUUID();
        const tag = `sandbox-${sandboxId}`;

        const contextPath = await cloneRepo(repoUrl);
        await buildImage(contextPath, tag);
        const { containerId, port: hostPort } = await runContainer(tag);

        sandbox.set(sandboxId, { containerId, port: hostPort, contextPath, createAt: Date.now() });

        res.status(200).json({ sandboxId, port: hostPort });
    } 
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of sandbox) {
        if (now - entry.createAt > SANDBOX_TTL_MS) {
            deleteSandbox(id).catch((err) => {
                console.error(`Cleanup failed for sandbox ${id}:`, err);
            });
        }
    }
}, CLEANUP_INTERVAL_MS);

async function deleteSandbox(id: string): Promise<void> {
    const entry = sandbox.get(id);
    if (!entry)
        return;

    await stopAndRemoveContainer(entry.containerId);
    await rm(entry.contextPath, { recursive: true, force:true });
    sandbox.delete(id);

}

router.delete('/sandboxes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!sandbox.has(id)) {
            return res.status(404).json({ ok: false, error: 'Sandbox not found' });
        }
        await deleteSandbox(id);
        res.status(200).json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

// tester le script sans dependre du git
router.post('/debug/build', async (req, res) => {
    try {
        const { path: contextPath, tag } = req.body as { path: string; tag: string };
        await buildImage(contextPath, tag);
        res.status(200).json({ ok: true, tag });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

// declare une route HTTP POST/debug/run un point d'entree pour tester runContainer isolement sans passer par tout le pipeline clone -> build
router.post('/debug/run', async (req, res) => {
    try {
        const { tag } = req.body as { tag: string };
        const { containerId, port: hostPort } = await runContainer(tag);
        res.status(200).json({ ok: true, port: hostPort });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

//route de tests temporaire
router.post('/debug/clone', async (req, res) => {
    try {
        const { repoUrl } = req.body as { repoUrl: string };
        const dir = await cloneRepo(repoUrl);
        res.status(200).json({ ok: true, path: dir });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

router.get('/dcker/ping', async (_req, res) => {
    try {
        const containers = await docker.listContainers();
        res.status(200).json({ ok:true, count: containers.length });
    } catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

export { router };