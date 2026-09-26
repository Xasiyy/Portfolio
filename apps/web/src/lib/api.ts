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

export function getTerminalSandboxUrl(sandboxId: string) {
    //ttyd sert sa page directement a la racine de son container
    return `${SANDBOX_RUNNER_URL}/sandboxes/${sandboxId}/`;
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

export async function sendContact(data: Record<string, FormDataEntryValue>) {
    const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (res.status === 429)
        throw new Error("Trop de messages envoyés, réessayez dans une heure.");
    if (!res.ok)
        throw new Error("L'envoi a échoué, réessayez plus tard.");
}
