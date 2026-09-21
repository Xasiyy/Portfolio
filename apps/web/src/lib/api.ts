// ce fichier va permettre de centralise les appels HTPP vers le back NestJs

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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