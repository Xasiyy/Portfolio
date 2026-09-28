import express from 'express';
import { cloneRepo, buildImage, runContainer, stopAndRemoveContainer, removeImage } from './docker.js';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { checkSandboxExists, createSandboxProxy } from './proxy.js';

//refuse toute requete qui ne porte pas la cle partagee avec l'API
function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    const expected = process.env.RUNNER_API_KEY;
    const provided = req.header('x-runner-key') ?? '';

    if (!expected || provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) 
    {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }
    next();
}

const router = express.Router();
const sandbox = new Map<string, { containerId: string; port: string; contextPath: string; createAt: number }>();
const sandboxProxy = createSandboxProxy(sandbox);

router.delete('/sandboxes/:id', requireApiKey, async (req, res) => {
    try {
        const { id } = req.params;
        if (!sandbox.has(id)) {
            res.status(404).json({ ok: false, error: 'Sandbox not found' });
            return;
        }
        await deleteSandbox(id);
        res.status(200).json({ ok:true });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

router.use('/sandboxes/:id', checkSandboxExists(sandbox), sandboxProxy);

const pendingDletions = new Set<string>();
const SANDBOX_TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_SANDBOXES = Number(process.env.MAX_SANDBOXES ?? 4);
let inFlight = 0;

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
    if (pendingDletions.has(id))
        return;

    const entry = sandbox.get(id);
    if (!entry)
        return;
    
    pendingDletions.add(id);
    try {
        try {
            await stopAndRemoveContainer(entry.containerId);
        }
        catch (err) {
            console.error(`Failed to stop/remove container for sandbox ${id}:`, err);
        }
        try {
            await removeImage(`sandbox-${id}`);
        }
        catch (err) {
            console.error(`Failed to renove image for sandbox ${id}:`, err);
        }
        await rm(entry.contextPath, { recursive: true, force:true });
        sandbox.delete(id);
    }
    finally {
        pendingDletions.delete(id);
    }    
}

//recoit une URL de repo, genere un identifiant unique puis enchaine clone - build run avec un 
// tag de l'id enregistre dans la map le resultat et reurn id et port au client
router.post('/sandboxes', requireApiKey, async (req, res) => {
    if (sandbox.size + inFlight >= MAX_SANDBOXES) {
        res.status(503).json({ ok: false, error: 'Too many sandboxes running, retry in a few minutes' });
        return;
    }

    inFlight++;
    const sandboxId = randomUUID();
    const tag = `sandbox-${sandboxId}`;
    let contextPath: string | undefined;

    try {
        const { repoUrl } = req.body as { repoUrl: string };

        contextPath = await cloneRepo(repoUrl);
        await buildImage(contextPath, tag);
        const { containerId, port: hostPort } = await runContainer(tag);

        sandbox.set(sandboxId, { containerId, port: hostPort, contextPath, createAt: Date.now() });
        res.status(200).json({ sandboxId, port: hostPort });
    }
    catch (err) {
        if (contextPath)
            await rm(contextPath, { recursive: true, force: true }).catch(() => {});
        await removeImage(tag).catch(() => {});
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
    finally {
        inFlight--;
    }
});

router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

export { router, sandbox, deleteSandbox, sandboxProxy };