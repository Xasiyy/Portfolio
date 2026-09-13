import path from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import fs from 'node:fs';
import Docker from 'dockerode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const docker = new Docker({ socketPath: '/var/run/docker.sock' }) //instance du client dockerode connecte au socket local
const execFileAsync = promisify(execFile);

export async function cloneRepo(repoUrl: string): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), 'sandbox-'));
    await execFileAsync('git', ['clone', '--depth', '1', repoUrl, dir]);
    return dir;
}

export async function buildImage(contextPath: string, tag: string): Promise<void> {
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

export async function runContainer(tag: string): Promise<{ containerId: string; port: string}> {

    const container = await docker.createContainer({
        Image: tag,
        ExposedPorts: { '3000/tcp': {} },  // declare quel port a l'interieur du conteneur est cense ecouter
        HostConfig: {
            PortBindings: { '3000/tcp': [{ HostPort: '0' }] }, // mapping avec 0 qui attribut n'importe quel port libre
            Memory: 256 * 1024 * 1024, // 256 Mo, en octets
            NanoCpus: 1_000_000_000, // 1 CPU
        },
    });

    await container.start();

    const info = await container.inspect();
    const hostPort = info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort; // chercher le port reellemnent choisi par Docker, mais sans risquer de faire planter le programme si l'info n'est pas la ou on l'attend

    if (!hostPort) {
        throw new Error('No host port assigned to container');
    }

    return { containerId: container.id, port: hostPort };
}

export async function stopAndRemoveContainer(containerId: string): Promise<void> {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
}