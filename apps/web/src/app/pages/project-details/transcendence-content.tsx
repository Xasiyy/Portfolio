import { InfoCard } from "@/components/info-card";

export function TranscendenceContentFr() {
  return (
    <>
       <div className="space-y-6 leading-relaxed">
          <p>
            ft_transcendence est le projet final du tronc commun de l'école
            42. Nous l'avons nommé <strong className="text-white">DrawDraw</strong>
            : une plateforme web de jeu multijoueur en temps réel basée sur le
            principe du dessin et du devinement de mots, à la manière d'un
            Pictionary. Un joueur désigné reçoit un mot secret qu'il doit
            dessiner sur un canvas interactif pendant que les autres
            participants devinent le mot via un tchat direct.
          </p>

          <p>
            L'application intègre une authentification ultra sécurisée
            (OAuth 2.0, 2FA/TOTP, chiffrement bcrypt, sessions JWT avec
            rotation), une suite sociale complète (tchat, salons
            privés/publics, amis, blocage, modération IA) ainsi qu'une
            infrastructure durcie basée sur Docker (4 réseaux isolés,
            reverse-proxy Nginx avec WAF ModSecurity et gestionnaire de
            secrets HashiCorp Vault).
          </p>

          <p>
            Le projet respecte à 100 % les standards de sécurité OWASP/NIST
            et garantit une conformité RGPD intégrale. C'est le projet le
            plus complet du cursus en développement web : il regroupe les
            fondements de la cybersécurité, du backend (serveurs complexes,
            gestion des requêtes, base de données, WebSocket) et du frontend,
            pensé pour offrir une interface agréable aux utilisateurs.
          </p>
        </div>

        <InfoCard title="Architecture Docker et isolation réseau">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[ INTERNET / NAVIGATEUR ]
                           │ (HTTPS 8443 / HTTP 8080 -> Redirect)
                           ▼
                 ┌───────────────────┐
                 │    Nginx + WAF    │  <-- Réseau: dmz
                 │   (ModSecurity)   │
                 └─────────┬─────────┘
                           │  <-- Réseau: internal
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│ Frontend (React)│                 │ Backend (NestJS)│
│   (Vite App)    │                 │ REST / WebSockets
└─────────────────┘                 └────┬────────┬───┘
                                         │        │
                   Réseau: vault_net --> │        │ <-- Réseau: db
                                         ▼        ▼
                                   ┌────────┐  ┌─────────┐
                                   │ Vault  │  │ MariaDB │
                                   └────────┘  └─────────┘`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            L'architecture réseau repose sur une isolation stricte des
            services à travers quatre réseaux virtuels distincts. Le
            conteneur Nginx est le seul composant directement exposé à
            Internet depuis la <code>dmz</code>, sur le port HTTPS 8443. Il
            fait office de reverse proxy et intègre le WAF{" "}
            <strong className="text-white">ModSecurity</strong>, configuré
            avec les règles OWASP CRS pour filtrer le trafic et bloquer les
            attaques courantes (injections SQL, XSS, LFI).
          </p>
          <p>
            Derrière ce pare-feu, le réseau <code>internal</code> permet à
            Nginx de communiquer avec le frontend (SPA React compilée via
            Vite) et le backend NestJS, qui centralise la logique métier :
            requêtes REST sur <code>/api</code> et connexions temps réel
            WebSockets via Socket.IO pour le tchat (<code>/chat</code>) et le
            jeu (<code>/game</code>). Enfin, le réseau <code>db</code> relie
            exclusivement le backend à MariaDB, et le réseau{" "}
            <code>vault_net</code> isole les échanges confidentiels entre le
            backend et HashiCorp Vault — empêchant tout accès direct du
            frontend aux données ou aux secrets.
          </p>
        </div>

        <InfoCard title="Flux d'exécution & traitement des requêtes">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[ Naviguer sur le site / Actions ]
                                  │
           ┌──────────────────────┴──────────────────────┐
           ▼                                             ▼
[ Route HTTP / API REST ]                     [ WebSocket / Socket.IO ]
Requête unique -> Réponse                       Connexion persistante bi-directionnelle
(Auth, Profil, RGPD, Export)                    (Tchat temps réel, Tracé Canvas, Chrono)
           │                                             │
           ▼                                             ▼
 Controller -> Guard -> Service               Gateways (/chat & /game) -> Service
           │                                             │
           └──────────────────────┬──────────────────────┘
                                  ▼
                         TypeORM -> MariaDB`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-white">Flux REST.</strong> Les
            opérations ponctuelles (connexion, mise à jour de profil)
            passent par un modèle classique requête/réponse. Le{" "}
            <strong className="text-white">Controller</strong> réceptionne la
            requête et vérifie sa conformité via un DTO (
            <code>class-validator</code>) ; le{" "}
            <strong className="text-white">Guard</strong> contrôle la
            présence et la validité du token JWT (header{" "}
            <code>Authorization: Bearer</code>) ; le{" "}
            <strong className="text-white">Service</strong> exécute la
            logique métier (hachage bcrypt, génération d'un secret TOTP) ;
            puis le repository TypeORM exécute la requête SQL sécurisée sur
            MariaDB.
          </p>
          <p>
            <strong className="text-white">Flux WebSocket.</strong> Le
            tchat et le dessin en direct reposent sur une connexion
            bidirectionnelle établie par un handshake Socket.IO, lui aussi
            sécurisé par token JWT. La <code>ChatGateway</code> gère la
            présence en ligne, l'envoi des messages, les indicateurs de
            saisie et les invitations à jouer, tandis que la{" "}
            <code>GameGateway</code> transmet les coordonnées de tracé du
            canvas, synchronise les chronomètres de 60 secondes par tour et
            valide instantanément les mots devinés.
          </p>
        </div>

        <InfoCard title="Schéma de la base de données (TypeORM & MariaDB)">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`┌──────────────┐       1:N       ┌──────────────┐
│    users     ├────────────────>│   sessions   │
│ (public_id)  │                 └──────────────┘
└──────┬───────┘
       │ 1:N
       ├────────────────────────>┌──────────────┐
       │                         │ audit_logs   │ (sans FK pour persistance)
       │ 1:N                     └──────────────┘
       ├────────────────────────>┌──────────────┐
       │                         │ verification_│
       │ 1:N                     │    codes     │
       ├────────────────────────>└──────────────┘
       │                         ┌──────────────┐       N:1       ┌──────────────┐
       ├────────────────────────>│   messages   ├────────────────>│   channels   │
       │ 1:N                     └──────────────┘                 └──────┬───────┘
       ├────────────────────────>┌──────────────┐                        │ 1:N
       │                         │channel_mbers ├────────────────────────┘
       │ 1:N (Requêteur/Cible)   └──────────────┘
       └────────────────────────>┌──────────────┐
                                 │ friendships  │
                                 └──────────────┘`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            La base de données repose sur 11 tables avec contraintes
            d'intégrité et UUID publics. Le moteur de jeu, lui, sépare
            volontairement les opérations instantanées des accès à la base
            de données : l'état des parties en cours est conservé en
            mémoire vive côté serveur, et les tracés du canvas sont
            regroupés par paquets d'instructions avant d'être envoyés, pour
            éviter toute saturation du flux temps réel.
          </p>
          <p>
            En cas de déconnexion, un délai de grâce laisse au joueur le
            temps de se reconnecter sans être déclaré forfait ni perturber
            la répartition des rôles. La base de données n'est sollicitée
            qu'à l'issue de la partie, pour enregistrer l'historique et les
            scores finaux — moment où la session en mémoire est nettoyée.
          </p>
        </div>

        <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
          Liste des modules implémentés dans ce projet
        </h2>
        <InfoCard title="Infrastructure & Sécurité">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Déploiement Docker complet :</strong>{" "}
              infrastructure conteneurisée gérée par Docker Compose avec
              isolation réseau sur 4 réseaux distincts (
              <code>dmz</code>, <code>internal</code>, <code>db</code>,{" "}
              <code>vault_net</code>).
            </li>
            <li>
              <strong className="text-white">Reverse proxy Nginx & WAF :</strong>{" "}
              point d'entrée unique en HTTPS (port 8443) avec pare-feu
              applicatif ModSecurity et règles OWASP CRS contre les
              injections (SQLi, XSS, LFI).
            </li>
            <li>
              <strong className="text-white">Gestion centralisée des secrets :</strong>{" "}
              intégration d'HashiCorp Vault pour le stockage et la
              distribution sécurisée des clés et identifiants.
            </li>
            <li>
              <strong className="text-white">Architecture full-stack moderne :</strong>{" "}
              backend NestJS et frontend SPA réactif conçu avec React et
              Vite.
            </li>
            <li>
              <strong className="text-white">Base de données relationnelle & ORM :</strong>{" "}
              persistance sous MariaDB gérée via TypeORM.
            </li>
            <li>
              <strong className="text-white">Validation stricte des entrées :</strong>{" "}
              contrôle de la conformité des données entrantes sur toutes les
              routes de l'API via des DTOs.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Authentification & conformité RGPD">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Authentification standard :</strong>{" "}
              mots de passe hachés via bcrypt, sessions par tokens JWT.
            </li>
            <li>
              <strong className="text-white">OAuth 2.0 :</strong> connexion
              simplifiée via un fournisseur externe (Google).
            </li>
            <li>
              <strong className="text-white">2FA / TOTP :</strong> double
              authentification paramétrable via QR Code et jetons temporaires
              dédiés.
            </li>
            <li>
              <strong className="text-white">Codes à usage unique :</strong>{" "}
              sécurisation des actions sensibles par code à 6 chiffres envoyé
              par email.
            </li>
            <li>
              <strong className="text-white">Comptes & profils :</strong>{" "}
              personnalisation des informations utilisateur, avatars, suivi
              des statistiques.
            </li>
            <li>
              <strong className="text-white">Conformité RGPD intégrale :</strong>{" "}
              droit d'accès, de rectification, de portabilité (export JSON)
              et droit à l'oubli (anonymisation des messages).
            </li>
            <li>
              <strong className="text-white">Registre d'audit RGPD :</strong>{" "}
              journalisation immuable de toute modification/suppression de
              données personnelles.
            </li>
            <li>
              <strong className="text-white">Politique de confidentialité & CGU :</strong>{" "}
              pages légales dédiées intégrées à l'application.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Social & tchat en temps réel">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Tchat multi-canaux :</strong>{" "}
              communication instantanée par WebSockets, présence en ligne et
              indicateurs de saisie.
            </li>
            <li>
              <strong className="text-white">Salons de discussion :</strong>{" "}
              création et administration de canaux publics/privés avec rôles
              (admins, membres).
            </li>
            <li>
              <strong className="text-white">Messagerie directe :</strong>{" "}
              échanges privés de joueur à joueur.
            </li>
            <li>
              <strong className="text-white">Amis & blocage :</strong>{" "}
              demandes d'amis, liste de contacts, blocage d'utilisateurs.
            </li>
            <li>
              <strong className="text-white">Modération automatisée par IA :</strong>{" "}
              filtrage des messages déplacés via dictionnaire de termes
              bannis et avertissements.
            </li>
            <li>
              <strong className="text-white">Modération avancée :</strong>{" "}
              mute temporaire ou exclusion d'un salon.
            </li>
            <li>
              <strong className="text-white">Invitations au jeu :</strong>{" "}
              envoi direct de défis depuis la fenêtre de tchat.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Moteur de jeu multijoueur">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Dessin en temps réel :</strong>{" "}
              canvas HTML5 interactif, synchronisation des tracés à très
              basse latence.
            </li>
            <li>
              <strong className="text-white">Parties multijoueurs (3+) :</strong>{" "}
              plusieurs participants simultanés par salon de jeu.
            </li>
            <li>
              <strong className="text-white">Rôles et tours :</strong>{" "}
              alternance automatique dessinateur/devineur, attribution des
              mots secrets, validation instantanée des réponses.
            </li>
            <li>
              <strong className="text-white">Chronomètre :</strong> gestion
              automatique des rounds (60 secondes) et décompte des points en
              direct.
            </li>
            <li>
              <strong className="text-white">Gestion des déconnexions :</strong>{" "}
              période de grâce pour se reconnecter sans perdre son état.
            </li>
            <li>
              <strong className="text-white">Mode spectateur :</strong>{" "}
              rejoindre une partie en cours en observateur, sans impact sur
              le score.
            </li>
            <li>
              <strong className="text-white">Historique des parties :</strong>{" "}
              enregistrement automatique des résultats et scores en base de
              données.
            </li>
          </ul>
        </InfoCard>

        <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
          Liste des technologies utilisées et leurs impacts
        </h2>
        <InfoCard title="Technologies — Backend & base de données">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">NestJS :</strong> cœur du
              backend — modules, DTOs, intégration native REST et
              WebSockets.
            </li>
            <li>
              <strong className="text-white">TypeORM :</strong> gestion des
              relations complexes entre entités et protection contre les
              injections SQL.
            </li>
            <li>
              <strong className="text-white">MariaDB :</strong> persistance
              des comptes, historique des parties et journaux d'audit RGPD.
            </li>
            <li>
              <strong className="text-white">Socket.IO :</strong>{" "}
              transmission instantanée des événements de tchat et
              synchronisation du canvas/chronomètres.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Technologies — Frontend">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">React :</strong> SPA réactive et
              modulaire, mise à jour fluide sans rechargement de page.
            </li>
            <li>
              <strong className="text-white">Vite :</strong> build rapide,
              HMR, bundle de production optimisé.
            </li>
            <li>
              <strong className="text-white">HTML5 Canvas API :</strong>{" "}
              rendu graphique du dessin, outils de tracé, capture des
              coordonnées en temps réel.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Technologies — Infrastructure, réseau & sécurité">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Docker & Docker Compose :</strong>{" "}
              isolation de chaque service, orchestration de 5 conteneurs sur
              4 réseaux virtuels.
            </li>
            <li>
              <strong className="text-white">Nginx :</strong> reverse proxy,
              terminaison SSL/TLS, redirection HTTP → HTTPS, routage vers
              frontend/backend.
            </li>
            <li>
              <strong className="text-white">ModSecurity (WAF, OWASP CRS) :</strong>{" "}
              analyse du trafic en temps réel, blocage SQLi/XSS/LFI.
            </li>
            <li>
              <strong className="text-white">HashiCorp Vault :</strong>{" "}
              stockage et distribution sécurisée des clés API, secrets JWT et
              identifiants de base de données.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Technologies — Sécurité applicative & auth">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">bcrypt :</strong> hachage des
              mots de passe avec facteur de coût élevé.
            </li>
            <li>
              <strong className="text-white">JSON Web Tokens (JWT) :</strong>{" "}
              authentification stateless sur les routes REST et le handshake
              WebSocket.
            </li>
            <li>
              <strong className="text-white">otplib :</strong> génération et
              vérification des secrets TOTP pour la 2FA.
            </li>
          </ul>
        </InfoCard>

        <p>
        Je vous invite à visionner la vidéo de présentation du projet qui simule une partie multijoueur et toutes les fonctionnalités du projet. Pour des problèmes de complexité et éviter de changer le projet de l'équipe, il n'est pas hébergé et je ne le mets pas en test dans un conteneur car cela nécessiterait de modifier et d'enlever beaucoup de fonctionnalités. Si vous souhaitez aller plus loin, vous pouvez vous rendre sur le git du projet pour le lancer en local et le tester intégralement.
        </p>
        <div className="mt-16 mb-16">
          <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <iframe
              src="https://www.youtube-nocookie.com/embed/AhKPoZHwpTA"
              title="Démo de DrawDraw (ft_transcendence)"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
    </>
  );
}

export function TranscendenceContentEn() {
  return (
    <>
      <div className="space-y-6 leading-relaxed">
        <p>
          ft_transcendence is the final project of the 42 core curriculum. We
          named it <strong className="text-white">DrawDraw</strong>: a
          real-time multiplayer web game based on drawing and guessing words,
          like Pictionary. A designated player receives a secret word that
          they must draw on an interactive canvas while the other
          participants try to guess the word through a live chat.
        </p>

        <p>
          The application includes highly secure authentication (OAuth 2.0,
          2FA/TOTP, bcrypt hashing, JWT sessions with rotation), a complete
          social suite (chat, private/public rooms, friends, blocking, AI
          moderation) and a hardened Docker-based infrastructure (4 isolated
          networks, Nginx reverse proxy with the ModSecurity WAF and the
          HashiCorp Vault secrets manager).
        </p>

        <p>
          The project fully complies with the OWASP/NIST security standards
          and guarantees full GDPR compliance. It is the most complete web
          development project of the curriculum: it brings together the
          foundations of cybersecurity, backend (complex servers, request
          handling, database, WebSocket) and frontend, designed to offer
          users a pleasant interface.
        </p>
      </div>

      <InfoCard title="Docker architecture and network isolation">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[ INTERNET / BROWSER ]
                           │ (HTTPS 8443 / HTTP 8080 -> Redirect)
                           ▼
                 ┌───────────────────┐
                 │    Nginx + WAF    │  <-- Network: dmz
                 │   (ModSecurity)   │
                 └─────────┬─────────┘
                           │  <-- Network: internal
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│ Frontend (React)│                 │ Backend (NestJS)│
│   (Vite App)    │                 │ REST / WebSockets
└─────────────────┘                 └────┬────────┬───┘
                                         │        │
                  Network: vault_net --> │        │ <-- Network: db
                                         ▼        ▼
                                   ┌────────┐  ┌─────────┐
                                   │ Vault  │  │ MariaDB │
                                   └────────┘  └─────────┘`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          The network architecture relies on strict isolation of the services
          across four separate virtual networks. The Nginx container is the
          only component directly exposed to the Internet, from the{" "}
          <code>dmz</code>, on HTTPS port 8443. It acts as a reverse proxy
          and includes the{" "}
          <strong className="text-white">ModSecurity</strong> WAF, configured
          with the OWASP CRS rules to filter traffic and block common attacks
          (SQL injection, XSS, LFI).
        </p>
        <p>
          Behind this firewall, the <code>internal</code> network lets Nginx
          communicate with the frontend (a React SPA built with Vite) and the
          NestJS backend, which centralizes the business logic: REST requests
          on <code>/api</code> and real-time WebSocket connections through
          Socket.IO for the chat (<code>/chat</code>) and the game
          (<code>/game</code>). Finally, the <code>db</code> network connects
          only the backend to MariaDB, and the{" "}
          <code>vault_net</code> network isolates confidential exchanges
          between the backend and HashiCorp Vault — preventing any direct
          access from the frontend to the data or the secrets.
        </p>
      </div>

      <InfoCard title="Execution flow & request handling">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[ Browsing the site / Actions ]
                                  │
           ┌──────────────────────┴──────────────────────┐
           ▼                                             ▼
[ HTTP route / REST API ]                     [ WebSocket / Socket.IO ]
Single request -> Response                      Persistent bidirectional connection
(Auth, Profile, GDPR, Export)                   (Real-time chat, Canvas drawing, Timer)
           │                                             │
           ▼                                             ▼
 Controller -> Guard -> Service               Gateways (/chat & /game) -> Service
           │                                             │
           └──────────────────────┬──────────────────────┘
                                  ▼
                         TypeORM -> MariaDB`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          <strong className="text-white">REST flow.</strong> One-off
          operations (logging in, updating a profile) go through a classic
          request/response model. The{" "}
          <strong className="text-white">Controller</strong> receives the
          request and checks that it is valid with a DTO (
          <code>class-validator</code>); the{" "}
          <strong className="text-white">Guard</strong> checks that the JWT
          token is present and valid (<code>Authorization: Bearer</code>{" "}
          header); the{" "}
          <strong className="text-white">Service</strong> runs the business
          logic (bcrypt hashing, generating a TOTP secret); then the TypeORM
          repository runs the secure SQL query on MariaDB.
        </p>
        <p>
          <strong className="text-white">WebSocket flow.</strong> The chat
          and live drawing rely on a bidirectional connection established by
          a Socket.IO handshake, also secured by a JWT token. The{" "}
          <code>ChatGateway</code> handles online presence, sending messages,
          typing indicators and game invitations, while the{" "}
          <code>GameGateway</code> transmits the canvas drawing coordinates,
          synchronizes the 60-second timers for each turn and instantly
          validates the guessed words.
        </p>
      </div>

      <InfoCard title="Database schema (TypeORM & MariaDB)">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`┌──────────────┐       1:N       ┌──────────────┐
│    users     ├────────────────>│   sessions   │
│ (public_id)  │                 └──────────────┘
└──────┬───────┘
       │ 1:N
       ├────────────────────────>┌──────────────┐
       │                         │ audit_logs   │ (no FK, for persistence)
       │ 1:N                     └──────────────┘
       ├────────────────────────>┌──────────────┐
       │                         │ verification_│
       │ 1:N                     │    codes     │
       ├────────────────────────>└──────────────┘
       │                         ┌──────────────┐       N:1       ┌──────────────┐
       ├────────────────────────>│   messages   ├────────────────>│   channels   │
       │ 1:N                     └──────────────┘                 └──────┬───────┘
       ├────────────────────────>┌──────────────┐                        │ 1:N
       │                         │channel_mbers ├────────────────────────┘
       │ 1:N (Requester/Target)  └──────────────┘
       └────────────────────────>┌──────────────┐
                                 │ friendships  │
                                 └──────────────┘`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          The database is built on 11 tables with integrity constraints and
          public UUIDs. The game engine, for its part, deliberately separates
          instant operations from database access: the state of ongoing games
          is kept in server memory, and canvas strokes are grouped into
          batches of instructions before being sent, to avoid saturating the
          real-time stream.
        </p>
        <p>
          If a player disconnects, a grace period gives them time to
          reconnect without forfeiting or disrupting the role assignment. The
          database is only used at the end of the game, to save the history
          and the final scores — which is when the in-memory session is
          cleaned up.
        </p>
      </div>

      <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
        Modules implemented in this project
      </h2>
      <InfoCard title="Infrastructure & Security">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Full Docker deployment:</strong>{" "}
            containerized infrastructure managed by Docker Compose with
            network isolation across 4 separate networks (
            <code>dmz</code>, <code>internal</code>, <code>db</code>,{" "}
            <code>vault_net</code>).
          </li>
          <li>
            <strong className="text-white">Nginx reverse proxy & WAF:</strong>{" "}
            single HTTPS entry point (port 8443) with the ModSecurity
            application firewall and OWASP CRS rules against injections
            (SQLi, XSS, LFI).
          </li>
          <li>
            <strong className="text-white">Centralized secrets management:</strong>{" "}
            HashiCorp Vault integration for the secure storage and
            distribution of keys and credentials.
          </li>
          <li>
            <strong className="text-white">Modern full-stack architecture:</strong>{" "}
            NestJS backend and a reactive SPA frontend built with React and
            Vite.
          </li>
          <li>
            <strong className="text-white">Relational database & ORM:</strong>{" "}
            persistence in MariaDB managed through TypeORM.
          </li>
          <li>
            <strong className="text-white">Strict input validation:</strong>{" "}
            incoming data is checked on every API route using DTOs.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Authentication & GDPR compliance">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Standard authentication:</strong>{" "}
            passwords hashed with bcrypt, sessions with JWT tokens.
          </li>
          <li>
            <strong className="text-white">OAuth 2.0:</strong> simplified
            login through an external provider (Google).
          </li>
          <li>
            <strong className="text-white">2FA / TOTP:</strong> configurable
            two-factor authentication with a QR code and dedicated temporary
            tokens.
          </li>
          <li>
            <strong className="text-white">One-time codes:</strong>{" "}
            sensitive actions secured by a 6-digit code sent by email.
          </li>
          <li>
            <strong className="text-white">Accounts & profiles:</strong>{" "}
            customizable user information, avatars, statistics tracking.
          </li>
          <li>
            <strong className="text-white">Full GDPR compliance:</strong>{" "}
            right of access, rectification and portability (JSON export) and
            right to be forgotten (message anonymization).
          </li>
          <li>
            <strong className="text-white">GDPR audit log:</strong>{" "}
            immutable logging of every change/deletion of personal data.
          </li>
          <li>
            <strong className="text-white">Privacy policy & terms of use:</strong>{" "}
            dedicated legal pages built into the application.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Social & real-time chat">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Multi-channel chat:</strong>{" "}
            instant communication over WebSockets, online presence and
            typing indicators.
          </li>
          <li>
            <strong className="text-white">Chat rooms:</strong>{" "}
            creation and administration of public/private channels with
            roles (admins, members).
          </li>
          <li>
            <strong className="text-white">Direct messages:</strong>{" "}
            private player-to-player conversations.
          </li>
          <li>
            <strong className="text-white">Friends & blocking:</strong>{" "}
            friend requests, contact list, blocking users.
          </li>
          <li>
            <strong className="text-white">AI-based automated moderation:</strong>{" "}
            filtering of inappropriate messages using a dictionary of banned
            terms, with warnings.
          </li>
          <li>
            <strong className="text-white">Advanced moderation:</strong>{" "}
            temporary mute or removal from a room.
          </li>
          <li>
            <strong className="text-white">Game invitations:</strong>{" "}
            challenges sent directly from the chat window.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Multiplayer game engine">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Real-time drawing:</strong>{" "}
            interactive HTML5 canvas, very low-latency stroke
            synchronization.
          </li>
          <li>
            <strong className="text-white">Multiplayer games (3+):</strong>{" "}
            several simultaneous participants per game room.
          </li>
          <li>
            <strong className="text-white">Roles and turns:</strong>{" "}
            automatic drawer/guesser rotation, secret word assignment,
            instant answer validation.
          </li>
          <li>
            <strong className="text-white">Timer:</strong> automatic round
            management (60 seconds) and live score counting.
          </li>
          <li>
            <strong className="text-white">Disconnection handling:</strong>{" "}
            grace period to reconnect without losing your state.
          </li>
          <li>
            <strong className="text-white">Spectator mode:</strong>{" "}
            join an ongoing game as an observer, with no impact on the
            score.
          </li>
          <li>
            <strong className="text-white">Game history:</strong>{" "}
            results and scores automatically saved in the database.
          </li>
        </ul>
      </InfoCard>

      <h2 className="mt-16 mb-6 font-serif text-2xl text-white">
        Technologies used and their impact
      </h2>
      <InfoCard title="Technologies — Backend & database">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">NestJS:</strong> core of the
            backend — modules, DTOs, native REST and WebSocket integration.
          </li>
          <li>
            <strong className="text-white">TypeORM:</strong> management of
            complex relationships between entities and protection against
            SQL injection.
          </li>
          <li>
            <strong className="text-white">MariaDB:</strong> persistence of
            accounts, game history and GDPR audit logs.
          </li>
          <li>
            <strong className="text-white">Socket.IO:</strong>{" "}
            instant delivery of chat events and canvas/timer
            synchronization.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Technologies — Frontend">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">React:</strong> reactive, modular
            SPA, smooth updates without page reloads.
          </li>
          <li>
            <strong className="text-white">Vite:</strong> fast builds, HMR,
            optimized production bundle.
          </li>
          <li>
            <strong className="text-white">HTML5 Canvas API:</strong>{" "}
            graphical rendering of the drawing, drawing tools, real-time
            coordinate capture.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Technologies — Infrastructure, networking & security">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Docker & Docker Compose:</strong>{" "}
            isolation of each service, orchestration of 5 containers across
            4 virtual networks.
          </li>
          <li>
            <strong className="text-white">Nginx:</strong> reverse proxy,
            SSL/TLS termination, HTTP → HTTPS redirect, routing to the
            frontend/backend.
          </li>
          <li>
            <strong className="text-white">ModSecurity (WAF, OWASP CRS):</strong>{" "}
            real-time traffic analysis, blocking SQLi/XSS/LFI.
          </li>
          <li>
            <strong className="text-white">HashiCorp Vault:</strong>{" "}
            secure storage and distribution of API keys, JWT secrets and
            database credentials.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Technologies — Application security & auth">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">bcrypt:</strong> password hashing
            with a high cost factor.
          </li>
          <li>
            <strong className="text-white">JSON Web Tokens (JWT):</strong>{" "}
            stateless authentication on the REST routes and the WebSocket
            handshake.
          </li>
          <li>
            <strong className="text-white">otplib:</strong> generation and
            verification of TOTP secrets for 2FA.
          </li>
        </ul>
      </InfoCard>

      <p>
        I invite you to watch the project's demo video, which simulates a multiplayer game and shows all of the project's features. Because of its complexity, and to avoid changing the team's project, it is not hosted, and I am not offering it for testing in a container, as that would require modifying and removing many features. If you want to go further, you can visit the project's repository to run it locally and test it fully.
      </p>
      <div className="mt-16 mb-16">
        <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <iframe
            src="https://www.youtube-nocookie.com/embed/AhKPoZHwpTA"
            title="DrawDraw demo (ft_transcendence)"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
}
