import { createProxyMiddleware } from "http-proxy-middleware";
import { Request, Response, NextFunction } from 'express';

type SandboxEntry = { containerId: string; port: string; contextPath: string; createAt: number };

// cree un middleware qui relaie la requete HTPP entrante vers https://127.0.0.1:<port>, le port 
// etant retrouve dans la Map grace au sandboxId present dans l'URL 
export function createSandboxProxy(sandbox: Map<string, SandboxEntry>) {
    return createProxyMiddleware({
        router: (req: Request) => {
            const entry = sandbox.get(req.params.id);
            return entry ? `http://127.0.0.1:${entry.port}` : undefined;
        },

        // cette fonction retire le prefixe /sandboxes/id avant transmission
        pathRewrite: (path: string, req: Request) => {
            const prefix = `/sandboxes/${req.params.id}`;
            //si apres avoir retire le prefixe il ne reste rien on force / plutot qu'une chaine vide qui serait invalide
            return path.startsWith(prefix) ? path.slice(prefix.length) || '/' : path;
        },
        changeOrigin: true,
        on: {
            error: (err: Error, req: Request, res: Response | any) => {
                console.error(`Proxy error for sandbox ${req.params.id}:`, err.message);
                res.status(502).json({ ok: false, error: 'Sandbox unreachable' });
            },
        },
    });
}

// middleware qui verifie que le sandboxId de l'URL existe bien dans la Map, si non il repond 
// pas un 404 tout de suite et bloque la requete avant qu'elle aille plus loin 
export function checkSandboxExists(sandbox: Map<string, SandboxEntry>) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!sandbox.has(req.params.id)) {
            res.status(404).json({ ok: false, error: 'Sandbox not found' });
            return;
        }
        next();
    };
}