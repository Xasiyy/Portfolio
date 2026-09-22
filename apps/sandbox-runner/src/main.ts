import express from 'express';
import { router, sandbox, deleteSandbox, sandboxProxy} from './routes.js';

const app = express();
app.use(express.json());
app.use(router);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = app.listen(port, () => {
    console.log(`sandbox-runner listening on port ${port}`);
})

server.on('upgrade', sandboxProxy.upgrade);

async function shutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, cleaning up ${sandbox.size} sandbox(es)...`)

    for (const id of sandbox.keys()) {
        try {
            await deleteSandbox(id);
        }
        catch (err) {
            console.error(`Failed to clean up sandbox ${id} during shutdown:`, err);
        }
    }

    server.close(() => {
        process.exit(0);
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
