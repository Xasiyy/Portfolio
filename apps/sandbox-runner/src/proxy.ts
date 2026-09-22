import { createProxyMiddleware } from "http-proxy-middleware";
import { Request, Response, NextFunction } from 'express';

type SandboxEntry = { containerId: string; port: string; contextPath: string; createAt: number };

const SANDBOX_ID_PATTERN = /^\/sandboxes\/([^/]+)/;

function extractSandboxId(url?: string): string | undefined {
    return url?.match(SANDBOX_ID_PATTERN)?.[1];
}

//pour une requete HTTP normale on passe par Express mais pour une vrai upgrade 
//Websocket  brute il faut extraire depuis req.url, qui lui n'a pas ete tronque par le routeur Express
function getSandboxProxy(req: any): string | undefined {
    return req.params?.id ?? extractSandboxId(req.url);
}

// cree un middleware qui relaie la requete HTPP entrante vers https://127.0.0.1:<port>, le port 
// etant retrouve dans la Map grace au sandboxId present dans l'URL 
export function createSandboxProxy(sandbox: Map<string, SandboxEntry>) {
    return createProxyMiddleware({
        ws: true,
        router: (req) => {
            const id = getSandboxProxy(req);
            const entry = id? sandbox.get(id) : undefined;
            return entry ? `http://127.0.0.1:${entry.port}` : undefined;
        },

        // cette fonction retire le prefixe /sandboxes/id avant transmission
        pathRewrite: (path: string, req: Request) => {
            const id = getSandboxProxy(req);
            const prefix = `/sandboxes/${id}`;
            //si apres avoir retire le prefixe il ne reste rien on force / plutot qu'une chaine vide qui serait invalide
            return path.startsWith(prefix) ? path.slice(prefix.length) || '/' : path;
        },
        changeOrigin: true,
        on: {
            error: (err: Error, req: Request, res: Response | any) => {
                console.error(`Proxy error for sandbox ${getSandboxProxy(req)}:`, err.message);
                if (typeof res?.status === 'function') {
                    res.status(502).json({ ok: false, error: 'Sandbox unreachable '});
                }
                else if (typeof res?.end === 'function') {
                    res.end();
                }
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