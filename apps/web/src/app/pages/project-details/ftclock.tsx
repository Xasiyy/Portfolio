"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { InfoCard } from "@/components/info-card";
import { ShinyButton } from "@/components/shiny-button";

export function FtClockDetail() {
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "Ftclock") ?? null);
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
        <h1 className="font-serif text-4xl mb-8 text-white">ft_Clock</h1>

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

        {project.liveUrl && (
          <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton
              onClick={() => window.open(project.liveUrl, "_blank", "noopener,noreferrer")}
              backgroundColor="#333333"
            >
              Allez sur le site
            </ShinyButton>
          </div>
        )}

        <p className="mb-3 mt-8 font-black text-white/70">Dépôt du projet</p>
        <a
          href="https://github.com/Xasiyy/ft_Clock"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.920.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">ft_Clock</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              Voir le projet sur GitHub ↗
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
