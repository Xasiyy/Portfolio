import { InfoCard } from "@/components/info-card";

export function PortfolioContentFr() {
  return (
    <>
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
    </>
  );
}

export function PortfolioContentEn() {
  return (
    <>
      <div className="space-y-6 leading-relaxed">
        <p>
          This portfolio is the site you are browsing right now. It presents
          my background and my projects, but its real challenge lies
          elsewhere: letting any visitor{" "}
          <strong className="text-white">test a project live</strong>, from
          their browser, without installing anything. One click on "Try it"
          is enough for the server to fetch the project's Git repository,
          build it, run it in an isolated container and display the result
          on the page.
        </p>

        <p>
          The project is a pnpm monorepo made of three applications: a{" "}
          <strong className="text-white">Next.js</strong> frontend, a{" "}
          <strong className="text-white">NestJS</strong> API connected to a
          PostgreSQL database, and a custom-built service, the{" "}
          <strong className="text-white">sandbox-runner</strong>, which drives
          Docker to turn a Git repository into an application usable in the
          browser. Everything is containerized with Docker Compose and hosted
          on a VPS, behind the Caddy reverse proxy over HTTPS.
        </p>

        <p>
          This page explains, step by step, how a Git repository is fetched,
          built, run and then displayed to the visitor, and how each step is
          secured.
        </p>
      </div>

      <InfoCard title="Overall architecture">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`                 [ VISITOR'S BROWSER ]
                           │ HTTPS / WSS
                           ▼
                 ┌───────────────────┐
                 │   Caddy (:443)    │  <-- only public entry point
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
          <strong className="text-white">The frontend.</strong> The site is
          exported as static files and served by nginx: there is no Node
          server in production. All the data (project list, contact form,
          sandbox launch) is loaded directly by the browser, which calls the
          API.
        </p>
        <p>
          <strong className="text-white">The API.</strong> It stores the
          projects in the database (title, description, technologies, Git
          repository URL), handles the contact form and acts as a trusted
          intermediary between the visitor and the sandbox-runner. The
          database schema changes only through TypeORM migrations, which run
          automatically at every startup.
        </p>
        <p>
          <strong className="text-white">The sandbox-runner.</strong> It has
          two roles: <em>orchestrator</em> (creating and destroying
          containers, at the API's request only) and{" "}
          <em>reverse proxy</em> (relaying the visitor's traffic to the right
          container). It does not create the containers itself: it sends
          requests to the machine's Docker daemon through the{" "}
          <code>/var/run/docker.sock</code> socket. The sandboxes therefore
          run alongside the other containers, not inside the runner.
        </p>
      </div>

      <InfoCard title={'From clicking "Try it" to the container'}>
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Browser                   API                    sandbox-runner
    │                      │                            │
    │ POST /projects/:id/sandbox                        │
    ├─────────────────────►│                            │
    │                      │ reads repoUrl from the DB  │
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
    │ iframe: /sandboxes/<sandboxId>/...                │
    ├──────────────────────────────────────────────────►│ ──► container`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          <strong className="text-white">
            The visitor never chooses the repository.
          </strong>{" "}
          The browser only sends a project's identifier. It is the API that
          reads the repository URL from the database, so it is impossible to
          make it launch an arbitrary repository. The route is also limited to
          three launches every ten minutes per visitor.
        </p>
        <p>
          <strong className="text-white">A shared key.</strong> Only the API
          can request the creation of a sandbox: it adds the{" "}
          <code>x-runner-key</code> header to its request, a secret key of at
          least 32 characters known only to it and to the runner. The runner
          compares it in constant time (
          <code>timingSafeEqual</code>), so that an attacker cannot guess the
          key character by character by measuring the response time.
        </p>
      </div>

      <InfoCard title="Fetching a Git repository: clone, build, run">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`POST /sandboxes { repoUrl }
  ↓
requireApiKey()             ──►  invalid key? 401
  ↓
capacity check              ──►  4 sandboxes max? 503
  ↓
sandboxId = randomUUID()    ──►  identifier impossible to guess
  ↓
cloneRepo()
  ├── mkdtemp()             ──►  /tmp/sandbox-aB3xYz
  └── git clone --depth 1   ──►  latest commit only
  ↓
buildImage()
  ├── tar archive of the cloned folder
  ├── send to the daemon    ──►  runs the repository's Dockerfile
  └── read the stream       ──►  error in the stream? failure
  ↓
runContainer()
  ├── container port 3000   ──► 127.0.0.1:<free port> on the host
  └── limits                ──►  256 MB of RAM, 1 CPU
  ↓
Map.set(sandboxId, { containerId, port })  ──►  response { sandboxId, port }`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          <strong className="text-white">The clone.</strong> The runner
          creates a temporary folder with a unique name, then runs{" "}
          <code>git clone --depth 1</code>: only the latest commit is
          downloaded, without the history, which makes the operation much
          faster. The command is run with <code>execFile</code> and not{" "}
          <code>exec</code>: the arguments are passed to Git as they are,
          without going through a shell, so a malicious URL (
          <code>; rm -rf /</code>) would never be interpreted as a command.
          The clone is done without credentials: the repositories must be
          public.
        </p>
        <p>
          <strong className="text-white">The build.</strong> Each project
          provides its own <code>Dockerfile</code> at its root. The cloned
          folder is packed into a tar archive (the "build context") and sent
          to the Docker daemon, which runs the Dockerfile step by step. One
          particularity: a build that fails does not return an HTTP error;
          the error arrives <em>in the stream</em> of messages sent back by
          the daemon, which therefore has to be read to the end. Layers are
          cached, so the second launch of the same project is much faster.
        </p>
        <p>
          <strong className="text-white">The launch.</strong> The container
          listens on its port 3000, which is published on a free port chosen
          by Docker (for example <code>32768</code>), and only on{" "}
          <code>127.0.0.1</code>: it is invisible from the Internet. Several
          sandboxes can therefore run at the same time without conflicts. If
          a step fails, the cloned folder and the image are deleted
          immediately.
        </p>
      </div>

      <InfoCard title="The proxy: relaying HTTP and WebSocket">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Browser    : GET /sandboxes/3f2b.../vnc.html
                    │
                    │  router      ──►  target http://127.0.0.1:32768
                    │  pathRewrite ──►  /vnc.html
                    ▼
Container  : GET /vnc.html


Browser ──wss──► Caddy ──ws──► runner ──ws──► container
         (every link in the chain must let the upgrade through)`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          Every request whose URL starts with{" "}
          <code>/sandboxes/&lt;id&gt;</code> is relayed to the corresponding
          container. The runner looks up the port associated with the id in
          its in-memory table, strips the prefix from the URL, then forwards
          the request. An unknown or expired id returns a 404 error.
        </p>
        <p>
          A remote screen or a terminal needs a channel that stays open
          permanently and in both directions: that is the role of the{" "}
          <strong className="text-white">WebSocket</strong>. The connection
          starts with an HTTP request asking to switch protocols
          (<code>101 Switching Protocols</code>), then stays open. Express
          does not see these requests: they have to be wired by hand to the
          Node server's <code>upgrade</code> event.
        </p>
      </div>

      <InfoCard title="Inside a sandbox container">
        <p className="mb-4 text-sm text-white/70">
          Depending on the project, the container exposes either a virtual
          screen or a terminal.
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white">
              <th className="py-2 pr-4 font-serif">Mode</th>
              <th className="py-2 font-serif">How it works</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">graphical</td>
              <td className="py-2">
                Used by Cub3D and push_swap. <code>Xvfb</code> creates a
                virtual screen in memory, the program displays on it,{" "}
                <code>x11vnc</code> streams that screen over VNC,{" "}
                <code>websockify</code> translates it into WebSocket, and{" "}
                <code>noVNC</code> draws it in a canvas in the browser.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">terminal</td>
              <td className="py-2">
                Used by minishell. <code>ttyd</code> runs the program in a
                pseudo-terminal and shares it on the web;{" "}
                <code>xterm.js</code> displays the output and sends the
                keystrokes back over WebSocket.
              </td>
            </tr>
          </tbody>
        </table>
        <pre className="mt-6 overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Pressing "W" in Cub3D:

noVNC (browser)
  ↓  encrypted WebSocket frame (TLS)
Caddy  ──►  sandbox-runner  ──►  127.0.0.1:32768
  ↓
websockify: WebSocket ──► TCP :5900
  ↓
x11vnc injects the key into the virtual screen
  ↓
cub3D redraws the scene ──► the image travels back the other way`}
        </pre>
      </InfoCard>

      <InfoCard title="Lifetime & cleanup">
        <p className="mb-4">
          A sandbox is not meant to last: it is destroyed automatically 30
          to 35 minutes after it is created.
        </p>
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Expiration:</strong> every 5
            minutes, the runner deletes the sandboxes older than 30 minutes.
          </li>
          <li>
            <strong className="text-white">Runner shutdown:</strong> when it
            receives <code>SIGTERM</code> or <code>SIGINT</code>, all the
            sandboxes are deleted before the server closes.
          </li>
          <li>
            <strong className="text-white">Creation failure:</strong> the
            cloned folder and the image are deleted immediately.
          </li>
          <li>
            <strong className="text-white">Full deletion:</strong>{" "}
            container, image, cloned folder, then the table entry. Each step
            is isolated in its own <code>try/catch</code>, so that the
            cleanup continues even if an element has already disappeared.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Security">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white">
              <th className="py-2 pr-4 font-serif">Measure</th>
              <th className="py-2 font-serif">Details</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4">Repository chosen by the API</td>
              <td className="py-2">
                The visitor only sends a project id.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4">Shared key</td>
              <td className="py-2">
                <code>x-runner-key</code>, compared in constant time.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4">No injection</td>
              <td className="py-2">
                <code>execFile</code>, without a shell.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4">Ports not exposed</td>
              <td className="py-2">
                Everything is published on <code>127.0.0.1</code>; only Caddy
                (80/443) is public, behind the UFW firewall.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4">Capped resources</td>
              <td className="py-2">
                256 MB of RAM, 1 CPU, 4 simultaneous sandboxes.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Unpredictable identifiers</td>
              <td className="py-2">
                UUID v4: impossible to access another visitor's sandbox.
              </td>
            </tr>
          </tbody>
        </table>
      </InfoCard>

      <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
        Technologies used and their impact
      </h2>
      <InfoCard title="Technologies">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Next.js & React:</strong>{" "}
            frontend exported as static files, served by nginx.
          </li>
          <li>
            <strong className="text-white">NestJS & TypeORM:</strong> modular
            API, validation of the environment variables at startup,
            automatic migrations.
          </li>
          <li>
            <strong className="text-white">PostgreSQL:</strong> storage for
            the projects and the contact messages.
          </li>
          <li>
            <strong className="text-white">Express & dockerode:</strong>{" "}
            sandbox-runner that drives the Docker daemon from Node.js.
          </li>
          <li>
            <strong className="text-white">http-proxy-middleware:</strong>{" "}
            dynamic relaying of HTTP and WebSocket traffic to each
            container.
          </li>
          <li>
            <strong className="text-white">Docker & Docker Compose:</strong>{" "}
            one container per service, and one ephemeral container per
            sandbox.
          </li>
          <li>
            <strong className="text-white">Caddy:</strong> HTTPS reverse
            proxy with automatic certificates, the server's only public
            entry point.
          </li>
        </ul>
      </InfoCard>

      <p>
        You are already testing this project by browsing the site. To see the sandbox in action, I invite you to visit the Cub3D, minishell or push_swap pages and click the Try it button: everything described on this page then happens in a few seconds.
      </p>
    </>
  );
}

