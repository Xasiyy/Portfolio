# web

Frontend du portfolio : un site Next.js exporté en fichiers statiques (HTML, CSS, JS) et servi par nginx. Il affiche les projets, le formulaire de contact, et la fenêtre qui affiche un sandbox en direct.

## Sommaire

- [Place dans l'architecture](#place-dans-larchitecture)
- [Stack](#stack)
- [Export statique : ce que ça implique](#export-statique--ce-que-ça-implique)
- [Structure du code](#structure-du-code)
- [Communication avec l'api](#communication-avec-lapi)
- [Le composant SandboxModal](#le-composant-sandboxmodal)
- [Comment un sandbox s'affiche dans le navigateur](#comment-un-sandbox-saffiche-dans-le-navigateur)
- [Configuration](#configuration)
- [Build et exécution](#build-et-exécution)
- [Dépannage](#dépannage)

## Place dans l'architecture

```
Navigateur
  │
  ├── https://asiyaad.tech          -> Caddy -> nginx (127.0.0.1:8080)   fichiers statiques
  ├── https://api.asiyaad.tech      -> Caddy -> api                       données (fetch)
  └── https://sandbox.asiyaad.tech  -> Caddy -> sandbox-runner            iframe du sandbox
```

`web` ne contient aucune logique serveur. Une fois la page chargée, c'est le **navigateur du visiteur** qui appelle directement l'api et le runner.

## Stack

| Outil | Rôle |
|---|---|
| Next.js 16 (App Router) | Routing par dossiers, build, optimisation |
| React 19 | Composants et état |
| Tailwind CSS 4 + daisyUI | Styles |
| styled-components | Quelques composants stylés (avec un registry pour le rendu) |
| three.js + @react-three/fiber + @shadergradient/react | Fonds animés en shader WebGL |
| nginx 1.27 | Sert les fichiers en production |

## Export statique : ce que ça implique

`next.config.ts` contient `output: "export"`. Au build, Next.js génère un dossier `out/` qui ne contient que des fichiers :

```
out/
├── index.html
├── projects/index.html
├── projects/cub3d/index.html
├── contact/index.html
└── _next/static/...      (JS et CSS)
```

`trailingSlash: true` fait générer `projects/cub3d/index.html` plutôt que `projects/cub3d.html`. nginx sait servir ce format sans configuration particulière.

Ce choix a trois conséquences :

1. **Pas de serveur Node en production.** nginx sert des fichiers. C'est léger, rapide et facile à mettre en cache.
2. **Les données sont chargées côté client.** Il n'y a pas de serveur pour appeler l'api au moment de la requête. Les pages sont des composants `"use client"` qui appellent l'api dans un `useEffect` après l'affichage. C'est pour ça qu'on voit brièvement « Chargement… ».
3. **Les variables `NEXT_PUBLIC_*` sont figées au build.** Next.js remplace `process.env.NEXT_PUBLIC_API_URL` par sa valeur dans le JavaScript généré. Changer de domaine impose donc de reconstruire l'image.

`images.unoptimized: true` est obligatoire avec l'export statique, car l'optimisation d'images de Next.js demande un serveur.

## Structure du code

```
apps/web/src/
├── app/
│   ├── layout.tsx              # layout racine : polices, Navbar, LanguageToggle
│   ├── page.tsx                # /
│   ├── about/page.tsx          # /about
│   ├── contact/page.tsx        # /contact
│   ├── projects/
│   │   ├── page.tsx            # /projects
│   │   ├── cub3d/page.tsx      # /projects/cub3d
│   │   ├── minishell/page.tsx
│   │   ├── push_swap/page.tsx
│   │   ├── ftclock/page.tsx
│   │   └── transcendence/page.tsx
│   └── pages/                  # contenu réel des pages
│       ├── home.tsx, about.tsx, contact.tsx, projects.tsx
│       └── project-details/    # une page détaillée par projet
├── components/
│   ├── sandbox-modal.tsx       # fenêtre qui affiche un sandbox
│   ├── navbar.tsx, shiny-button.tsx, project-timeline.tsx, ...
│   ├── shader-background*.tsx  # fonds WebGL
│   └── ui/
└── lib/
    ├── api.ts                  # tous les appels HTTP
    ├── registry.tsx            # registry styled-components
    └── utils.ts
```

Avec l'App Router, chaque dossier sous `app/` est une route, et son `page.tsx` est le composant affiché. Les fichiers `page.tsx` se contentent d'importer le vrai contenu depuis `app/pages/`.

## Communication avec l'api

Tous les appels sont centralisés dans `lib/api.ts` :

| Fonction | Requête | Utilisée par |
|---|---|---|
| `getProjects()` | `GET {API_URL}/projects` | liste des projets, pages de détail |
| `getProject(id)` | `GET {API_URL}/projects/:id` | |
| `createSandbox(id)` | `POST {API_URL}/projects/:id/sandbox` | `SandboxModal` |
| `sendContact(data)` | `POST {API_URL}/contact` | formulaire de contact (gère le `429`) |
| `getSandboxUrl(id)` | construit l'URL noVNC | `SandboxModal` (variante graphique) |
| `getTerminalSandboxUrl(id)` | construit l'URL ttyd | `SandboxModal` (variante terminal) |

Les pages de détail récupèrent tous les projets, puis trouvent le leur par son titre :

```ts
getProjects().then((projects) => {
  setProject(projects.find((p) => p.title === "Cub3D") ?? null);
});
```

Le titre en base doit donc correspondre **exactement** à celui attendu par la page. Le bouton « Tester » ne s'affiche que si `project.repoUrl` existe.

Comme le site (`asiyaad.tech`) et l'api (`api.asiyaad.tech`) sont sur des origines différentes, chaque appel est une requête **cross-origin**. Le navigateur l'autorise uniquement parce que l'api répond avec le bon en-tête CORS.

## Le composant SandboxModal

Fichier : `components/sandbox-modal.tsx`.

### Props

| Prop | Valeurs | Effet |
|---|---|---|
| `projectId` | uuid | Projet à lancer |
| `onClose` | fonction | Ferme la fenêtre |
| `variant` | `"graphical"` (défaut) ou `"terminal"` | Choisit l'URL noVNC ou ttyd, et le ratio d'affichage (4/3 ou 16/9) |
| `size` | `"default"` ou `"large"` | `large` occupe presque tout l'écran |

| Projet | Variante | Taille |
|---|---|---|
| Cub3D | graphical | default |
| push_swap | graphical | large |
| minishell | terminal | default |
| transcendence | terminal | default |

### États successifs

```
ouverture
  │  useEffect -> createSandbox(projectId)
  v
"Compilation et lancement en cours..."      (sandboxId = null)
  │  réponse { sandboxId }                  (erreur -> "Impossible de lancer le sandbox")
  v
"Démarrage de l'affichage..."               (ready = false, attente de 5 s)
  │  setTimeout 5000 ms
  v
<iframe src={url du sandbox}>               (ready = true)
  │  bouton "Réessayer"
  v
attempt + 1 -> la key de l'iframe change -> React recrée l'iframe -> nouvelle attente de 5 s
```

**Pourquoi attendre 5 secondes ?** Quand le runner répond, le conteneur est démarré, mais les programmes à l'intérieur (Xvfb, x11vnc, websockify) mettent un peu de temps à se lancer. Si l'iframe se charge trop tôt, noVNC trouve un serveur pas encore prêt et affiche une erreur.

**Pourquoi `key={attempt}` ?** Quand la `key` d'un élément React change, React détruit l'ancien élément et en crée un nouveau. L'iframe recharge donc complètement la page du sandbox, ce qui relance la connexion WebSocket.

## Comment un sandbox s'affiche dans le navigateur

### Variante graphique (noVNC)

URL construite par `getSandboxUrl` :

```
https://sandbox.asiyaad.tech/sandboxes/<id>/vnc.html?autoconnect=true&resize=scale&path=sandboxes/<id>/websockify
```

| Partie | Signification |
|---|---|
| `/sandboxes/<id>/` | Préfixe que le runner reconnaît pour savoir vers quel conteneur relayer |
| `vnc.html` | Page du client noVNC, servie par websockify dans le conteneur |
| `autoconnect=true` | Se connecte sans bouton « Connect » |
| `resize=scale` | Adapte l'image à la taille de l'iframe |
| `path=sandboxes/<id>/websockify` | Chemin du WebSocket. noVNC construit `wss://sandbox.asiyaad.tech/sandboxes/<id>/websockify` |

Ce qui se passe ensuite :

1. L'iframe charge `vnc.html` et ses fichiers JS en HTTP classique, à travers Caddy, le runner, puis le conteneur.
2. Le JavaScript de noVNC ouvre un **WebSocket** vers `wss://.../websockify`.
3. Par ce WebSocket passent, dans un sens, les images de l'écran (protocole VNC/RFB), et dans l'autre, les touches clavier et les mouvements de souris.
4. noVNC dessine l'écran dans un `<canvas>`.

### Variante terminal (ttyd)

URL construite par `getTerminalSandboxUrl` :

```
https://sandbox.asiyaad.tech/sandboxes/<id>/
```

ttyd sert sa page à la racine. Cette page contient xterm.js, un émulateur de terminal en JavaScript, qui ouvre un WebSocket vers ttyd. Les frappes partent par le WebSocket et la sortie du programme revient par le même chemin.

Le fonctionnement côté serveur de ces deux variantes est détaillé dans la doc du sandbox-runner.

### Pourquoi `https` et `wss` sont obligatoires

Le site est en HTTPS. Un navigateur refuse de charger une ressource en `http://` ou `ws://` depuis une page HTTPS : c'est le **mixed content**. Le runner doit donc être exposé en HTTPS (`sandbox.asiyaad.tech` derrière Caddy). noVNC passe automatiquement en `wss://` quand la page est en `https://`.

## Configuration

Variables lues au **build** (arguments Docker) :

| Variable | Production | Local |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.asiyaad.tech` | `http://localhost:3001` |
| `NEXT_PUBLIC_SANDBOX_RUNNER_URL` | `https://sandbox.asiyaad.tech` | `http://localhost:4000` |

En développement avec `pnpm dev:web`, ces valeurs se mettent dans `apps/web/.env.local`.

## Build et exécution

Le Dockerfile est en **multi-stage** : la première étape compile, la seconde ne garde que le résultat.

```
Étape "build" (node:22-alpine)
  ├─ ARG/ENV NEXT_PUBLIC_*        (injectées depuis le compose)
  ├─ pnpm install --filter web
  └─ pnpm --filter web build      -> apps/web/out/

Étape "runtime" (nginx:1.27-alpine)
  ├─ COPY out/ -> /usr/share/nginx/html
  ├─ EXPOSE 80
  └─ HEALTHCHECK wget http://localhost:80/
```

L'image finale ne contient ni Node.js, ni node_modules, ni code source : seulement nginx et des fichiers statiques.

```bash
pnpm dev:web                                                     # local, http://localhost:3000
docker compose -f apps/docker-compose.prod.yml up -d --build web
```

En production, le conteneur écoute sur le port 80 et il est publié sur `127.0.0.1:8080` de l'hôte. Caddy relaie `asiyaad.tech` vers ce port.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| L'ancien domaine apparaît encore dans les requêtes | `NEXT_PUBLIC_*` modifiée sans rebuild de `web` |
| « Chargement… » ne disparaît jamais | L'api ne répond pas, ou erreur CORS (voir la console du navigateur) |
| « Impossible de lancer le sandbox » | La requête `POST /projects/:id/sandbox` a échoué. Regarder son code HTTP dans l'onglet Network |
| L'iframe affiche une erreur SSL | Le sous-domaine `sandbox` n'est pas configuré dans Caddy |
| noVNC affiche « Failed to connect » | Le conteneur n'était pas prêt : cliquer sur « Réessayer » |
| Le bouton « Tester » n'apparaît pas | Le projet n'a pas de `repoUrl`, ou son titre en base ne correspond pas |
