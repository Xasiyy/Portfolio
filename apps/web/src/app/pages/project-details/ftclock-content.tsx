import { InfoCard } from "@/components/info-card";

export function FtClockContentFr() {
  return (
    <>
       <h2 className="font-serif text-2xl mt-12 mb-6 text-white">Le but de l'application</h2>
        <div className="space-y-6 leading-relaxed">
          <p>
            J'ai créé <strong className="text-white">ft_Clock</strong>, une application web
            destinée aux étudiants de l'école 42. Au sein de notre cursus, le temps passé connecté
            sur les ordinateurs du campus est enregistré sous forme de « logtime ». Selon notre
            profil ou notre statut, nous devons atteindre un volume d'heures mensuel précis (par
            exemple 160 heures, une valeur entièrement personnalisable dans l'application).
          </p>
          <p>
            L'outil officiel de 42 permet de consulter le cumul d'heures effectuées, mais il ne
            calcule pas clairement le reste à faire ni le rythme quotidien à maintenir pour
            atteindre l'objectif. J'ai conçu ft_Clock pour répondre immédiatement à cette
            problématique : connaître mon avancement mensuel et savoir exactement combien d'heures
            je dois effectuer aujourd'hui.
          </p>
        </div>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
          Fonctionnalités et expérience utilisateur
        </h2>
        <p className="leading-relaxed">
          L'interface de l'application met à disposition un ensemble d'outils de suivi clair :
        </p>
        <InfoCard>
          <ul className="space-y-3">
            <li><strong className="text-white">Calendrier mensuel interactif</strong> : visualisation au jour le jour des heures accomplies, avec possibilité de naviguer d'un mois à l'autre.</li>
            <li><strong className="text-white">Tableau de bord synthétique</strong> : quatre indicateurs clés affichent les heures faites, les heures restantes, l'objectif mensuel total et la moyenne quotidienne théorique à réaliser.</li>
            <li><strong className="text-white">Indicateur quotidien précis</strong> : un message du jour indique directement le temps de présence restant pour la journée ou confirme l'atteinte de l'objectif.</li>
            <li><strong className="text-white">Paramétrage des contraintes</strong> : ajustement du quota d'heures mensuel et possibilité d'inclure ou d'exclure les week-ends des jours travaillés.</li>
            <li><strong className="text-white">Gestion des jours non travaillés</strong> : option pour marquer une date comme « jour off » (congé, maladie, etc.), ce qui l'exclut automatiquement des calculs.</li>
            <li><strong className="text-white">Saisie et synchronisation des données</strong> : les heures peuvent être saisies manuellement en cliquant sur une case du calendrier, ou rapatriées automatiquement grâce au bouton « Sync 42 ».</li>
          </ul>
        </InfoCard>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">Un moteur de calcul dynamique</h3>
        <p className="leading-relaxed">
          Le calcul de la moyenne quotidienne est adaptatif. L'application prend la totalité des
          heures restantes à faire et les répartit équitablement sur les jours ouvrés restants dans
          le mois (en écartant les week-ends si spécifié, ainsi que les jours déclarés « off »).
          Si un surplus d'heures est réalisé lors d'une journée, celui-ci est automatiquement lissé
          sur l'ensemble des jours suivants, réduisant ainsi l'effort quotidien requis.
        </p>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">Architecture technique</h2>
        <p className="leading-relaxed">
          Pour garantir la légèreté et la pérennité de l'application, j'ai fait le choix d'une
          architecture sobre, sans surcouche de frameworks complexes.
        </p>

        <InfoCard title="Vue d'ensemble">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`                          ┌────────────────────────┐
                          │   Navigateur Client    │
                          │ HTML / CSS / JS Vanilla│
                          └───────────┬────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │ HTTPS                                       │ API REST
               ▼                                             ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐
│       Serveur Node.js       │               │      Firebase (Google)      │
│  Hébergé sur Railway (PaaS) │               │ Authentification / Firestore│
└──────────────┬──────────────┘               └─────────────────────────────┘
               │
               │ HTTPS (OAuth2 / Token)
               ▼
┌─────────────────────────────┐
│       API Officielle 42     │
└─────────────────────────────┘`}
          </pre>
        </InfoCard>

        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li><strong className="text-white">Frontend</strong> : conçu exclusivement en HTML, CSS et JavaScript « vanilla » (sans React ni framework tiers). L'intégralité de l'interface utilisateur est rédigée en français.</li>
          <li><strong className="text-white">Backend</strong> : un serveur Node.js avec le framework Express gère la distribution de l'application au navigateur et assure le rôle de passerelle sécurisée vers l'API de 42.</li>
          <li><strong className="text-white">Base de données et authentification</strong> : l'infrastructure repose sur la suite cloud Firebase de Google.</li>
          <li><strong className="text-white">Gestion du code source</strong> : suivi de version entièrement centralisé sur GitHub.</li>
        </ul>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">Hébergement et infrastructure</h2>
        <div className="space-y-6 leading-relaxed">
          <p>
            L'application backend et frontend est déployée sur <strong className="text-white">Railway</strong>,
            une plateforme cloud gérant l'hébergement continu. Un pipeline d'intégration continue
            est configuré : chaque validation de code (push) sur la branche principale de mon dépôt
            GitHub déclenche automatiquement la compilation et la mise en ligne de la nouvelle
            version. L'application est joignable via un nom de domaine personnalisé :{" "}
            <code>ftclock.dev</code>.
          </p>
          <p>
            Les données applicatives ne sont pas résidentes sur le serveur d'hébergement mais sont
            directement hébergées au sein de la base de données NoSQL Firestore de Google.
          </p>
        </div>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
          Gestion des utilisateurs et sécurité des données
        </h2>
        <p className="leading-relaxed">
          La gestion des identités et l'isolation des données reposent sur des mécanismes stricts :
        </p>
        <InfoCard>
          <ul className="space-y-3">
            <li><strong className="text-white">Authentification sécurisée</strong> : l'inscription et la connexion s'effectuent par identifiant (email) et mot de passe (6 caractères minimum) via Firebase Authentication. Aucun mot de passe n'est stocké en brut sur mes serveurs ; la sécurité des identifiants est entièrement gérée par l'infrastructure de Google.</li>
            <li><strong className="text-white">Rattachement au compte 42</strong> : lors de son inscription ou ultérieurement, l'utilisateur indique son identifiant 42 (login) afin de permettre le ciblage des requêtes d'heures.</li>
            <li><strong className="text-white">Espace de données cloisonné</strong> : chaque utilisateur possède son propre espace dans Firestore, comprenant un profil utilisateur ainsi qu'un document structuré par mois (historique journalier, jours off déclarés, objectifs et paramètres de week-end).</li>
            <li><strong className="text-white">Synchronisation temps réel</strong> : la réactivité de Firestore assure une mise à jour instantanée des données sur tous les appareils connectés simultanément.</li>
            <li><strong className="text-white">Règles d'accès restreintes</strong> : des règles de sécurité au niveau de la base de données imposent qu'un utilisateur soit authentifié pour lire ou modifier du contenu, et restreignent son périmètre d'accès à ses seules données personnelles.</li>
          </ul>
        </InfoCard>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
          Intégration de l'API 42 et flux de synchronisation
        </h2>
        <p className="leading-relaxed">
          L'accès au temps de connexion réel des étudiants nécessite une interconnexion sécurisée
          avec l'API officielle de l'école 42.
        </p>

        <InfoCard title="Flux « Sync 42 »">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[Navigateur]                 [Serveur Node.js]                [API 42]
     │                              │                            │
     │ ─── 1. Clic "Sync 42" ──────►│                            │
     │                              │ ─── 2. Token d'accès ─────►│
     │                              │ ◄─── (ou réutilisation) ───│
     │                              │                            │
     │                              │ ─── 3. Req. Logtime ──────►│
     │                              │ ◄─── 4. Données brutes ────│
     │                              │                            │
     │ ◄── 5. Transmission ─────────│                            │
     │                              │                            │
  (Calcul, mise à jour UI & sauvegarde Firestore)`}
          </pre>
        </InfoCard>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">Protocoles d'échange et de stockage</h3>
        <ul className="list-disc space-y-3 pl-5 leading-relaxed">
          <li><strong className="text-white">Passe-plat sécurisé</strong> : l'application est enregistrée auprès du service d'authentification de 42, qui délivre une clé secrète client. Cette clé n'est jamais exposée côté navigateur ni écrite dans le code public sur GitHub ; elle est stockée dans les variables d'environnement confidentielles sur l'hébergeur Railway.</li>
          <li><strong className="text-white">Obtention des jetons</strong> : lorsque l'utilisateur déclenche la synchronisation, son client sollicite le serveur Node.js. Le serveur demande un jeton d'accès temporaire auprès de 42, qu'il conserve en mémoire vive jusqu'à son expiration afin de minimiser le nombre de requêtes d'authentification.</li>
          <li><strong className="text-white">Récupération des logs</strong> : le serveur effectue la requête auprès de 42 pour récupérer la liste brute des sessions de connexion associées au login de l'étudiant (exprimées au format heures:minutes:secondes).</li>
          <li><strong className="text-white">Traitement côté client</strong> : le navigateur reçoit les données, filtre les sessions correspondant au mois affiché, convertit les durées en valeur numérique d'heures (arrondies à la minute près) et enregistre ces nouvelles métriques dans Firestore. L'interface et les graphiques de suivi se mettent à jour immédiatement.</li>
        </ul>

        <InfoCard title="Mesures de sécurité serveur">
          <p className="mb-4">
            Afin de protéger le serveur et de préserver les quotas d'utilisation imposés par 42,
            j'ai mis en place plusieurs garde-fous :
          </p>
          <ul className="space-y-3">
            <li><strong className="text-white">Filtrage des entrées</strong> : validation stricte de la chaîne de caractères du login (caractères alphanumériques et tirets uniquement) afin de prévenir l'injection de requêtes arbitraires vers d'autres endpoints de l'API.</li>
            <li><strong className="text-white">Limitation de débit (rate limiting)</strong> : restriction du nombre maximal de requêtes par minute et par utilisateur pour contrer les tentatives de déni de service.</li>
            <li><strong className="text-white">Politique d'en-têtes HTTP</strong> : configuration des en-têtes de sécurité (CORS) afin que seul le domaine officiel de l'application soit autorisé à communiquer avec mon API backend.</li>
          </ul>
        </InfoCard>

        <p className="leading-relaxed">
          ft_Clock est un projet complet né de la volonté de résoudre un problème quotidien partagé
          par les étudiants de l'école 42. Développer cette application m'a permis de maîtriser
          l'ensemble de la chaîne de production logicielle : de la conception d'une interface
          claire en JS Vanilla jusqu'au déploiement continu d'un backend sur le cloud, en passant
          par l'intégration d'une API distante, la gestion d'une base de données NoSQL et
          l'application rigoureuse des principes de sécurité informatique.
        </p>
    </>
  );
}

export function FtClockContentEn() {
  return (
    <>
      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">The purpose of the app</h2>
      <div className="space-y-6 leading-relaxed">
        <p>
          I created <strong className="text-white">ft_Clock</strong>, a web application for
          42 students. In our curriculum, the time spent logged in on the campus computers is
          recorded as "logtime". Depending on our profile or status, we have to reach a
          specific number of hours each month (for example 160 hours, a value that is fully
          customizable in the app).
        </p>
        <p>
          42's official tool shows the total number of hours completed, but it does not
          clearly calculate how many hours are left or the daily pace needed to reach the
          goal. I designed ft_Clock to solve this problem right away: knowing my monthly
          progress and exactly how many hours I need to do today.
        </p>
      </div>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
        Features and user experience
      </h2>
      <p className="leading-relaxed">
        The app's interface provides a set of clear tracking tools:
      </p>
      <InfoCard>
        <ul className="space-y-3">
          <li><strong className="text-white">Interactive monthly calendar</strong>: a day-by-day view of the hours completed, with the ability to navigate from one month to another.</li>
          <li><strong className="text-white">Summary dashboard</strong>: four key indicators show the hours done, the hours remaining, the total monthly goal and the theoretical daily average to achieve.</li>
          <li><strong className="text-white">Precise daily indicator</strong>: a message of the day shows the attendance time left for the day or confirms that the goal has been reached.</li>
          <li><strong className="text-white">Constraint settings</strong>: adjust the monthly hour quota and choose whether weekends count as working days.</li>
          <li><strong className="text-white">Days off management</strong>: an option to mark a date as a "day off" (holiday, sick leave, etc.), which automatically excludes it from the calculations.</li>
          <li><strong className="text-white">Data entry and synchronization</strong>: hours can be entered manually by clicking a calendar cell, or retrieved automatically with the "Sync 42" button.</li>
        </ul>
      </InfoCard>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">A dynamic calculation engine</h3>
      <p className="leading-relaxed">
        The daily average is calculated adaptively. The app takes all the remaining hours and
        spreads them evenly over the remaining working days of the month (leaving out weekends
        if specified, as well as days declared "off"). If extra hours are done on a given day,
        the surplus is automatically spread over all the following days, reducing the daily
        effort required.
      </p>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">Technical architecture</h2>
      <p className="leading-relaxed">
        To keep the app lightweight and long-lasting, I chose a simple architecture, without
        layers of complex frameworks.
      </p>

      <InfoCard title="Overview">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`                          ┌────────────────────────┐
                          │     Client Browser     │
                          │ HTML / CSS / JS Vanilla│
                          └───────────┬────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │ HTTPS                                       │ REST API
               ▼                                             ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐
│       Node.js server        │               │      Firebase (Google)      │
│  Hosted on Railway (PaaS)   │               │ Authentication / Firestore  │
└──────────────┬──────────────┘               └─────────────────────────────┘
               │
               │ HTTPS (OAuth2 / Token)
               ▼
┌─────────────────────────────┐
│       Official 42 API       │
└─────────────────────────────┘`}
        </pre>
      </InfoCard>

      <ul className="list-disc space-y-2 pl-5 leading-relaxed">
        <li><strong className="text-white">Frontend</strong>: built entirely in "vanilla" HTML, CSS and JavaScript (no React or third-party framework). The entire user interface is written in French.</li>
        <li><strong className="text-white">Backend</strong>: a Node.js server with the Express framework serves the application to the browser and acts as a secure gateway to the 42 API.</li>
        <li><strong className="text-white">Database and authentication</strong>: the infrastructure relies on Google's Firebase cloud suite.</li>
        <li><strong className="text-white">Source code management</strong>: version control fully centralized on GitHub.</li>
      </ul>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">Hosting and infrastructure</h2>
      <div className="space-y-6 leading-relaxed">
        <p>
          The backend and frontend are deployed on <strong className="text-white">Railway</strong>,
          a cloud platform that handles continuous hosting. A continuous integration pipeline
          is set up: every push to the main branch of my GitHub repository automatically
          triggers the build and the release of the new version. The app is reachable through
          a custom domain name:{" "}
          <code>ftclock.dev</code>.
        </p>
        <p>
          The application data does not live on the hosting server: it is stored directly in
          Google's Firestore NoSQL database.
        </p>
      </div>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
        User management and data security
      </h2>
      <p className="leading-relaxed">
        Identity management and data isolation rely on strict mechanisms:
      </p>
      <InfoCard>
        <ul className="space-y-3">
          <li><strong className="text-white">Secure authentication</strong>: sign-up and login use an identifier (email) and a password (6 characters minimum) through Firebase Authentication. No password is stored in plain text on my servers; credential security is handled entirely by Google's infrastructure.</li>
          <li><strong className="text-white">Linking to the 42 account</strong>: at sign-up or later, users enter their 42 login so that hour requests can target the right account.</li>
          <li><strong className="text-white">Isolated data space</strong>: each user has their own space in Firestore, with a user profile and one document per month (daily history, declared days off, goals and weekend settings).</li>
          <li><strong className="text-white">Real-time synchronization</strong>: Firestore's reactivity ensures the data is updated instantly on all devices connected at the same time.</li>
          <li><strong className="text-white">Restricted access rules</strong>: database-level security rules require users to be authenticated to read or modify content, and restrict their access to their own personal data only.</li>
        </ul>
      </InfoCard>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
        42 API integration and synchronization flow
      </h2>
      <p className="leading-relaxed">
        Accessing students' real login time requires a secure connection to the official API
        of the 42 school.
      </p>

      <InfoCard title={'"Sync 42" flow'}>
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`[Browser]                    [Node.js server]                 [42 API]
     │                              │                            │
     │ ─── 1. Click "Sync 42" ─────►│                            │
     │                              │ ─── 2. Access token ──────►│
     │                              │ ◄─── (or reuse) ───────────│
     │                              │                            │
     │                              │ ─── 3. Logtime req. ──────►│
     │                              │ ◄─── 4. Raw data ──────────│
     │                              │                            │
     │ ◄── 5. Transfer ─────────────│                            │
     │                              │                            │
  (Calculation, UI update & Firestore save)`}
        </pre>
      </InfoCard>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">Exchange and storage protocols</h3>
      <ul className="list-disc space-y-3 pl-5 leading-relaxed">
        <li><strong className="text-white">Secure pass-through</strong>: the app is registered with 42's authentication service, which issues a client secret. This secret is never exposed in the browser or written in the public code on GitHub; it is stored in confidential environment variables on the Railway host.</li>
        <li><strong className="text-white">Getting tokens</strong>: when the user triggers a sync, their client calls the Node.js server. The server requests a temporary access token from 42 and keeps it in memory until it expires, to minimize the number of authentication requests.</li>
        <li><strong className="text-white">Fetching the logs</strong>: the server queries 42 to fetch the raw list of login sessions linked to the student's login (expressed as hours:minutes:seconds).</li>
        <li><strong className="text-white">Client-side processing</strong>: the browser receives the data, filters the sessions for the displayed month, converts the durations into numeric hours (rounded to the nearest minute) and saves these new metrics in Firestore. The interface and the tracking charts update immediately.</li>
      </ul>

      <InfoCard title="Server security measures">
        <p className="mb-4">
          To protect the server and preserve the usage quotas imposed by 42, I set up several
          safeguards:
        </p>
        <ul className="space-y-3">
          <li><strong className="text-white">Input filtering</strong>: strict validation of the login string (alphanumeric characters and hyphens only) to prevent arbitrary requests from being injected toward other API endpoints.</li>
          <li><strong className="text-white">Rate limiting</strong>: a cap on the maximum number of requests per minute and per user to counter denial-of-service attempts.</li>
          <li><strong className="text-white">HTTP header policy</strong>: security headers (CORS) are configured so that only the app's official domain is allowed to communicate with my backend API.</li>
        </ul>
      </InfoCard>

      <p className="leading-relaxed">
        ft_Clock is a complete project born from the desire to solve an everyday problem shared
        by 42 students. Building this app taught me the entire software production chain: from
        designing a clear interface in vanilla JS to continuously deploying a backend in the
        cloud, including integrating a remote API, managing a NoSQL database and rigorously
        applying security principles.
      </p>
    </>
  );
}
