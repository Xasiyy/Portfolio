// ce fichier va permettre de centralise les appels HTPP vers le back NestJs

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SANDBOX_RUNNER_URL = process.env.NEXT_PUBLIC_SANDBOX_RUNNER_URL;

export async function createSandbox(id: string) {
    const res = await fetch(`${API_URL}/projects/${id}/sandbox`, { method: "POST" });
    if (!res.ok)
        throw new Error("Impossible de lancer le sandbox");
    return res.json() as Promise<{ sandboxId: string; port: string }>;
}

export function getSandboxUrl(sandboxId: string) {
    return `${SANDBOX_RUNNER_URL}/sandboxes/${sandboxId}/vnc.html?autoconnect=true&resize=scale&path=sandboxes/${sandboxId}/websockify`;
}

export async function getProjects() {
    const res = await fetch(`${API_URL}/projects`);
    if (!res.ok)
        throw new Error("Impossible to load projects");
    return res.json();
}

export async function getProject(id: string) {
    const res = await fetch(`${API_URL}/projects/${id}`, { cache: "force-cache" });
    if (!res.ok)
        throw new Error("Project not found");
    return res.json();
}