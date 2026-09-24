"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { SandboxModal } from "@/components/sandbox-modal";
import { ShinyButton } from "@/components/shiny-button";
import { InfoCard } from "@/components/info-card";

export function TranscendenceDetail() {
  const [project, setProject] = useState<any | null>(null);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "transcendence") ?? null);
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
        <h1 className="font-serif text-4xl mb-8 text-white">
          ft_transcendence — DrawDraw
        </h1>

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

        {showSandbox && (
          <SandboxModal projectId={project.id} onClose={() => setShowSandbox(false)} variant="terminal" />
        )}

        <p className="mb-3 font-black text-white/70">Documents</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><a href="https://docs.docker.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">Docker Documentation</a></li>
          <li><a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">React Documentation</a></li>
          <li><a href="https://mariadb.com/kb/en/documentation/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">MariaDB Documentation</a></li>
          <li><a href="https://github.com/owasp-modsecurity/ModSecurity/wiki" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">ModSecurity Reference Manual</a></li>
          <li><a href="https://developer.hashicorp.com/vault/docs" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">HashiCorp Vault Documentation</a></li>
          <li><a href="https://coreruleset.org/docs/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">OWASP CRS Documentation</a></li>
          <li><a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">OWASP Top 10</a></li>
          <li><a href="https://pages.nist.gov/800-63-3/sp800-63b.html" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">NIST SP 800-63B — Digital Identity Guidelines</a></li>
          <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">OWASP Authentication Cheat Sheet</a></li>
          <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">OWASP Password Storage Cheat Sheet</a></li>
          <li><a href="https://docs.nestjs.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">NestJS Documentation</a></li>
          <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">MDN — WebSockets API</a></li>
        </ul>

      <p className="mb-3 mt-8 font-black text-white/70">Collaborateurs</p>
      <div className="flex flex-wrap gap-3">
        <a
          href="https://github.com/wakhoo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur-md transition hover:bg-black/70"
        >
          <img src="https://github.com/wakhoo.png" alt="wakhoo" className="h-7 w-7 rounded-full" />
          <span className="text-sm font-medium text-violet-400">wakhoo</span>
        </a>
        <a
          href="https://github.com/uxornova"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur-md transition hover:bg-black/70"
        >
          <img src="https://github.com/uxornova.png" alt="uxornova" className="h-7 w-7 rounded-full" />
          <span className="text-sm font-medium text-violet-400">uxornova</span>
        </a>
      </div>
      <p className="mb-3 font-black text-white/70">Dépôt du projet</p>
      <a
        href="https://github.com/wakhoo/42_transcendence"
        target="_blank"
        rel="noopener noreferrer"
        className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
        style={{ backgroundColor: "#333333" }}
      >
        <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-white">wakhoo/42_transcendence</span>
          <span className="text-xs text-white/50 transition group-hover:text-violet-300">
            Voir le projet sur GitHub ↗
          </span>
        </div>
      </a>


      </main>
    </div>
  );
}
