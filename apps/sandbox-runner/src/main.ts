import express from 'express';
import Docker from 'dockerode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json());
const docker = new Docker({ socketPath: '/var/run/docker.sock' })
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function cloneRepo(repoUrl: string): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), 'sandbox-'));
    await execFileAsync('git', ['clone', '--depth', '1', repoUrl, dir]);
    return dir;
}

async function buildImage(contextPath: string, tag: string): Promise<void> {
    const stream = await docker.buildImage(
        { context: contextPath, src: fs.readdirSync(contextPath) },
        { t: tag },
    );

    await new Promise<void>((resolve, reject) => {
        docker.modem.followProgress(stream, (err, events) => {
            if (err) return reject(err);
            const failure = events.find((e) => e.error);
            if (failure)
                return reject(new Error(failure.error));
            resolve();
        });
    });
}

// tester le script sans dependre du git
app.post('/debug/build', async (req, res) => {
    try {
        const { path: contextPath, tag } = req.body as { path: string; tag: string };
        await buildImage(contextPath, tag);
        res.status(200).json({ ok: true, tag });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

//route de tests temporaire
app.post('/debug/clone', async (req, res) => {
    try {
        const { repoUrl } = req.body as { repoUrl: string };
        const dir = await cloneRepo(repoUrl);
        res.status(200).json({ ok: true, path: dir });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/dcker/ping', async (_req, res) => {
    try {
        const containers = await docker.listContainers();
        res.status(200).json({ ok:true, count: containers.length });
    } catch (err) {
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

app.listen(port, () => {
    console.log(`sandbox-runner listening on port ${port}`);
});

