"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { InfoCard } from "@/components/info-card";

export function PortfolioDetail() {
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "portfolio") ?? null);
    });
  }, []);

  if (!project)
    return <p className="mx-auto max-w-3xl px-6 py-24">Chargement…</p>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#333333" }}>
      <Link
        href="/projects"
        aria-label="Retour aux projets"
        className="fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 shadow-lg backdrop-blur-md transition hover:bg-black/70"
      >
        ←
      </Link>

      <main className="mx-auto max-w-3xl px-6 py-24 text-white/80">
        <h1 className="font-serif text-4xl mb-8 text-white">Portfolio</h1>

        <div className="space-y-6 leading-relaxed">
          <p>
            Ce portfolio est le site sur lequel vous naviguez en ce moment. Il
            présente mon parcours et mes projets, mais son vrai défi est
            ailleurs : permettre à n'importe quel visiteur de{" "}
            <strong className="text-white">tester un projet en direct</strong>
            , depuis son navigateur, sans rien installer. Un clic sur{" "}
            « Tester » suffit pour que le serveur récupère le dépôt Git du
            projet, le compile, le lance dans un conteneur isolé et affiche
            le résultat dans la page.
          </p>

          <p>
            Le projet est un monorepo pnpm composé de trois applications :
            un frontend <strong className="text-white">Next.js</strong>, une
            API <strong className="text-white">NestJS</strong> reliée à une
            base PostgreSQL, et un service maison, le{" "}
            <strong className="text-white">sandbox-runner</strong>, qui pilote
            Docker pour transformer un dépôt Git en application utilisable
            dans le navigateur. L'ensemble est conteneurisé avec Docker
            Compose et hébergé sur un VPS, derrière le reverse proxy Caddy en
            HTTPS.
          </p>

          <p>
            Cette page explique, étape par étape, comment un dépôt Git est
            récupéré, construit, exécuté, puis affiché chez le visiteur, et
            comment chaque étape est sécurisée.
          </p>
        </div>

        <InfoCard title="Architecture globale">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`               [ NAVIGATEUR DU VISITEUR ]
                           │ HTTPS / WSS
                           ▼
                 ┌───────────────────┐
                 │   Caddy (:443)    │  <-- seul point d'entrée public
                 └─────────┬─────────┘
          ┌────────────────┼──────────────────┐
          ▼                ▼                  ▼
   ┌────────────┐   ┌─────────────┐   ┌────────────────┐
   │    web     │   │     api     │   │ sandbox-runner │
   │  (Next.js) │   │  (NestJS)   ├──►│   (Express)    │
   │   nginx    │   └──────┬──────┘   └───────┬────────┘
   └────────────┘          │                  │ docker.sock
                           ▼                  ▼
                    ┌────────────┐    ┌────────────────┐
                    │ PostgreSQL │    │ Docker daemon  │
                    └────────────┘    └───────┬────────┘
                                              ▼
                                   [ sandbox A ] [ sandbox B ]`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-white">Le frontend.</strong> Le site est
            exporté en fichiers statiques et servi par nginx : il n'y a aucun
            serveur Node en production. Toutes les données (liste des
            projets, formulaire de contact, lancement d'un sandbox) sont
            chargées directement par le navigateur, qui appelle l'API.
          </p>
          <p>
            <strong className="text-white">L'API.</strong> Elle stocke les
            projets en base (titre, description, technologies, URL du dépôt
            Git), gère le formulaire de contact et sert d'intermédiaire de
            confiance entre le visiteur et le sandbox-runner. Le schéma de la
            base évolue uniquement par migrations TypeORM, jouées
            automatiquement à chaque démarrage.
          </p>
          <p>
            <strong className="text-white">Le sandbox-runner.</strong> Il a
            deux rôles : <em>orchestrateur</em> (créer et détruire des
            conteneurs, sur demande de l'API uniquement) et{" "}
            <em>reverse proxy</em> (relayer le trafic du visiteur vers le bon
            conteneur). Il ne crée pas les conteneurs lui-même : il envoie
            des requêtes au daemon Docker de la machine via le socket{" "}
            <code>/var/run/docker.sock</code>. Les sandboxes tournent donc à
            côté des autres conteneurs, et non à l'intérieur du runner.
          </p>
        </div>

        <InfoCard title="Du clic sur « Tester » au conteneur">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Navigateur                API                    sandbox-runner
    │                      │                            │
    │ POST /projects/:id/sandbox                        │
    ├─────────────────────►│                            │
    │                      │ lit repoUrl en base        │
    │                      │                            │
    │                      │ POST /sandboxes            │
    │                      │ x-runner-key: ****         │
    │                      ├───────────────────────────►│
    │                      │                            │ 1. git clone
    │                      │                            │ 2. docker build
    │                      │                            │ 3. docker run
    │                      │   { sandboxId, port }      │
    │                      │◄───────────────────────────┤
    │   { sandboxId }      │                            │
    │◄─────────────────────┤                            │
    │                                                   │
    │ iframe : /sandboxes/<sandboxId>/...               │
    ├──────────────────────────────────────────────────►│ ──► conteneur`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-white">
              Le visiteur ne choisit jamais le dépôt.
            </strong>{" "}
            Le navigateur n'envoie que l'identifiant d'un projet. C'est l'API
            qui lit l'URL du dépôt en base de données : impossible donc de lui
            faire lancer un dépôt arbitraire. La route est aussi limitée à
            trois lancements toutes les dix minutes par visiteur.
          </p>
          <p>
            <strong className="text-white">Une clé partagée.</strong> Seule
            l'API peut demander la création d'un sandbox : elle joint à sa
            requête l'en-tête <code>x-runner-key</code>, une clé secrète
            d'au moins 32 caractères connue uniquement d'elle et du runner.
            Le runner la compare en temps constant (
            <code>timingSafeEqual</code>), pour qu'un attaquant ne puisse pas
            deviner la clé caractère par caractère en mesurant le temps de
            réponse.
          </p>
        </div>

        <InfoCard title="Récupérer un dépôt Git : clone, build, run">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`POST /sandboxes { repoUrl }
  ↓
requireApiKey()             ──►  clé invalide ? 401
  ↓
contrôle de capacité        ──►  4 sandboxes max ? 503
  ↓
sandboxId = randomUUID()    ──►  identifiant impossible à deviner
  ↓
cloneRepo()
  ├── mkdtemp()             ──►  /tmp/sandbox-aB3xYz
  └── git clone --depth 1   ──►  dernier commit uniquement
  ↓
buildImage()
  ├── archive tar du dossier cloné
  ├── envoi au daemon       ──►  exécution du Dockerfile du dépôt
  └── lecture du flux       ──►  erreur dans le flux ? échec
  ↓
runContainer()
  ├── port 3000 du conteneur ──► 127.0.0.1:<port libre> de l'hôte
  └── limites               ──►  256 Mo de RAM, 1 CPU
  ↓
Map.set(sandboxId, { containerId, port })  ──►  réponse { sandboxId, port }`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-white">Le clone.</strong> Le runner crée
            un dossier temporaire au nom unique, puis lance{" "}
            <code>git clone --depth 1</code> : seul le dernier commit est
            téléchargé, sans l'historique, ce qui rend l'opération beaucoup
            plus rapide. La commande est lancée avec <code>execFile</code> et
            non <code>exec</code> : les arguments sont transmis tels quels à
            Git, sans passer par un shell, donc une URL piégée (
            <code>; rm -rf /</code>) ne serait jamais interprétée comme une
            commande. Le clone se fait sans identifiants : les dépôts doivent
            être publics.
          </p>
          <p>
            <strong className="text-white">Le build.</strong> Chaque projet
            fournit son propre <code>Dockerfile</code> à la racine. Le dossier
            cloné est empaqueté en archive tar (le « contexte de build ») et
            envoyé au daemon Docker, qui exécute le Dockerfile étape par
            étape. Particularité : un build qui échoue ne renvoie pas
            d'erreur HTTP, l'erreur arrive <em>dans le flux</em> de messages
            renvoyé par le daemon, qu'il faut donc lire jusqu'au bout. Les
            couches sont mises en cache : le deuxième lancement d'un même
            projet est bien plus rapide.
          </p>
          <p>
            <strong className="text-white">Le lancement.</strong> Le
            conteneur écoute sur son port 3000, publié sur un port libre
            choisi par Docker (par exemple <code>32768</code>), et uniquement
            sur <code>127.0.0.1</code> : il est invisible depuis Internet.
            Plusieurs sandboxes peuvent ainsi tourner en même temps sans
            conflit. Si une étape échoue, le dossier cloné et l'image sont
            supprimés immédiatement.
          </p>
        </div>

        <InfoCard title="Le proxy : relayer HTTP et WebSocket">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Navigateur : GET /sandboxes/3f2b.../vnc.html
                    │
                    │  router      ──►  cible http://127.0.0.1:32768
                    │  pathRewrite ──►  /vnc.html
                    ▼
Conteneur  : GET /vnc.html


Navigateur ──wss──► Caddy ──ws──► runner ──ws──► conteneur
            (chaque maillon doit laisser passer l'upgrade)`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            Toute requête dont l'URL commence par{" "}
            <code>/sandboxes/&lt;id&gt;</code> est relayée vers le conteneur
            correspondant. Le runner cherche le port associé à l'id dans sa
            table en mémoire, retire le préfixe de l'URL, puis transmet la
            requête. Un id inconnu ou expiré renvoie une erreur 404.
          </p>
          <p>
            Un écran distant ou un terminal a besoin d'un canal ouvert en
            permanence et dans les deux sens : c'est le rôle du{" "}
            <strong className="text-white">WebSocket</strong>. La connexion
            commence par une requête HTTP qui demande à changer de protocole
            (<code>101 Switching Protocols</code>), puis reste ouverte. Express
            ne voit pas ces demandes : il faut les brancher à la main sur
            l'événement <code>upgrade</code> du serveur Node.
          </p>
        </div>

        <InfoCard title="À l'intérieur d'un conteneur sandbox">
          <p className="mb-4 text-sm text-white/70">
            Selon le projet, le conteneur expose soit un écran virtuel, soit
            un terminal.
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white">
                <th className="py-2 pr-4 font-serif">Mode</th>
                <th className="py-2 font-serif">Fonctionnement</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">graphique</td>
                <td className="py-2">
                  Utilisé par Cub3D et push_swap. <code>Xvfb</code> crée un
                  écran virtuel en mémoire, le programme s'y affiche,{" "}
                  <code>x11vnc</code> diffuse cet écran en VNC,{" "}
                  <code>websockify</code> le traduit en WebSocket, et{" "}
                  <code>noVNC</code> le dessine dans un canvas côté
                  navigateur.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono">terminal</td>
                <td className="py-2">
                  Utilisé par minishell. <code>ttyd</code> lance le programme
                  dans un pseudo-terminal et le partage sur le web ;{" "}
                  <code>xterm.js</code> affiche la sortie et renvoie les
                  frappes clavier par WebSocket.
                </td>
              </tr>
            </tbody>
          </table>
          <pre className="mt-6 overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Touche « W » dans Cub3D :

noVNC (navigateur)
  ↓  trame WebSocket chiffrée (TLS)
Caddy  ──►  sandbox-runner  ──►  127.0.0.1:32768
  ↓
websockify : WebSocket ──► TCP :5900
  ↓
x11vnc injecte la touche dans l'écran virtuel
  ↓
cub3D redessine la scène ──► l'image repart en sens inverse`}
          </pre>
        </InfoCard>

        <InfoCard title="Durée de vie & nettoyage">
          <p className="mb-4">
            Un sandbox n'est pas fait pour durer : il est détruit
            automatiquement entre 30 et 35 minutes après sa création.
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Expiration :</strong> toutes les
              5 minutes, le runner supprime les sandboxes de plus de 30
              minutes.
            </li>
            <li>
              <strong className="text-white">Arrêt du runner :</strong> à la
              réception de <code>SIGTERM</code> ou <code>SIGINT</code>, tous
              les sandboxes sont supprimés avant la fermeture du serveur.
            </li>
            <li>
              <strong className="text-white">Échec de création :</strong> le
              dossier cloné et l'image sont supprimés immédiatement.
            </li>
            <li>
              <strong className="text-white">Suppression complète :</strong>{" "}
              conteneur, image, dossier cloné puis entrée de la table. Chaque
              étape est isolée dans son propre <code>try/catch</code>, pour
              que le nettoyage continue même si un élément a déjà disparu.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Sécurité">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white">
                <th className="py-2 pr-4 font-serif">Mesure</th>
                <th className="py-2 font-serif">Détail</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Dépôt choisi par l'API</td>
                <td className="py-2">
                  Le visiteur n'envoie qu'un id de projet.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Clé partagée</td>
                <td className="py-2">
                  <code>x-runner-key</code>, comparée en temps constant.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Pas d'injection</td>
                <td className="py-2">
                  <code>execFile</code>, sans shell.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Ports non exposés</td>
                <td className="py-2">
                  Tout est publié sur <code>127.0.0.1</code> ; seul Caddy
                  (80/443) est public, derrière le pare-feu UFW.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">Ressources plafonnées</td>
                <td className="py-2">
                  256 Mo de RAM, 1 CPU, 4 sandboxes simultanés.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Identifiants imprévisibles</td>
                <td className="py-2">
                  UUID v4 : impossible d'accéder au sandbox d'un autre
                  visiteur.
                </td>
              </tr>
            </tbody>
          </table>
        </InfoCard>

        <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
          Technologies utilisées et leurs impacts
        </h2>
        <InfoCard title="Technologies">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Next.js & React :</strong>{" "}
              frontend exporté en fichiers statiques, servi par nginx.
            </li>
            <li>
              <strong className="text-white">NestJS & TypeORM :</strong> API
              modulaire, validation des variables d'environnement au
              démarrage, migrations automatiques.
            </li>
            <li>
              <strong className="text-white">PostgreSQL :</strong> stockage
              des projets et des messages de contact.
            </li>
            <li>
              <strong className="text-white">Express & dockerode :</strong>{" "}
              sandbox-runner qui pilote le daemon Docker depuis Node.js.
            </li>
            <li>
              <strong className="text-white">http-proxy-middleware :</strong>{" "}
              relais dynamique du trafic HTTP et WebSocket vers chaque
              conteneur.
            </li>
            <li>
              <strong className="text-white">Docker & Docker Compose :</strong>{" "}
              un conteneur par service, et un conteneur éphémère par
              sandbox.
            </li>
            <li>
              <strong className="text-white">Caddy :</strong> reverse proxy
              HTTPS avec certificats automatiques, seul point d'entrée
              public du serveur.
            </li>
          </ul>
        </InfoCard>

        <p>
        Vous êtes déjà en train de tester ce projet en naviguant sur le site. Pour voir le sandbox en action, je vous invite à vous rendre sur les pages de Cub3D, minishell ou push_swap et à cliquer sur le bouton Tester : tout ce qui est décrit sur cette page se déroule alors en quelques secondes.
        </p>

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
          <p className="mb-3 font-black text-white/70">Documents</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><a href="https://docs.docker.com/engine/api/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">Docker Engine API</a></li>
            <li><a href="https://github.com/apocas/dockerode" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">dockerode</a></li>
            <li><a href="https://git-scm.com/docs/git-clone" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">Git — git clone</a></li>
            <li><a href="https://docs.nestjs.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">NestJS Documentation</a></li>
            <li><a href="https://nextjs.org/docs/app/guides/static-exports" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">Next.js — Static Exports</a></li>
            <li><a href="https://caddyserver.com/docs/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">Caddy Documentation</a></li>
            <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">MDN — WebSockets API</a></li>
          </ul>
        </div>

        <p className="mb-3 mt-8 font-black text-white/70">Dépôt du projet</p>
        <a
          href="https://github.com/Xasiyy/Portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">Portfolio</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              Voir le projet sur GitHub ↗
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
