# Contrat de preview : vue d'ensemble

Ce document décrit ce qu'il faut savoir pour lancer le projet, en entier ou service par service, sans lire le code source : la stack, les commandes d'orchestration, les dépendances entre services, les health checks, les variables d'environnement et les décisions transverses.

Le détail de chaque service se trouve dans sa propre documentation :

- [api/api.md](./api/api.md) : NestJS, base de données, contact, création des sandboxes
- [web/web.md](./web/web.md) : frontend Next.js, affichage des sandboxes
- [sandbox-runner/sandbox-runner.md](./sandbox-runner/sandbox-runner.md) : clone, build, exécution, proxy HTTP et WebSocket
- [vps/vps.md](./vps/vps.md) : hébergement, DNS, Caddy, pare-feu, déploiement

## Stack

| Élément | Technologie |
|---|---|
| Monorepo | pnpm workspaces (`pnpm-workspace.yaml`), 3 applications sous `apps/` |
| `api` | NestJS 10, TypeScript, TypeORM, PostgreSQL |
| `web` | Next.js 16 en export statique (`output: "export"`), React 19, Tailwind CSS 4, servi par nginx |
| `sandbox-runner` | Node 22, Express, dockerode (pilote le daemon Docker de l'hôte), http-proxy-middleware |
| Base de données | PostgreSQL 16 (`postgres:16-alpine`), une instance partagée |
| Orchestration | Docker Compose, un Dockerfile par application, construit depuis la racine du monorepo |
| Production | VPS Hostinger, Caddy en reverse proxy HTTPS |

## Fichiers Compose

| Fichier | Usage | Différences principales |
|---|---|---|
| `apps/docker-compose.yml` | local | Ports publiés sur toutes les interfaces, Postgres exposé sur `5432`, identifiants Postgres par défaut, URLs en `localhost` |
| `apps/docker-compose.prod.yml` | production | Ports publiés sur `127.0.0.1` uniquement, Postgres non exposé, mot de passe dans `DB_PASSWORD`, URLs en `https://*.asiyaad.tech`, `restart: unless-stopped` |

Les deux fichiers lisent `apps/.env` pour les secrets.

## Lancer le projet

### Tout avec Docker

```bash
docker compose -f apps/docker-compose.yml up --build
```

| URL | Service |
|---|---|
| http://localhost:8080 | web |
| http://localhost:3001 | api |
| http://localhost:4000 | sandbox-runner |
| localhost:5432 | db |

### Commandes utiles

```bash
docker compose -f apps/docker-compose.yml up -d db       # base de données seule
docker compose -f apps/docker-compose.yml logs -f api    # suivre les logs d'un service
docker compose -f apps/docker-compose.yml ps             # état et health de chaque service
docker compose -f apps/docker-compose.yml down           # tout arrêter
docker compose -f apps/docker-compose.yml down -v        # tout arrêter et supprimer la base
```

### Service par service (hot reload)

```bash
pnpm install
docker compose -f apps/docker-compose.yml up -d db
pnpm dev:api       # :3001, lit apps/api/.env
pnpm dev:sandbox   # :4000, lit apps/sandbox-runner/.env
pnpm dev:web       # :3000, lit apps/web/.env.local
```

Le sandbox-runner nécessite Linux : il utilise `network_mode: host` et le socket `/var/run/docker.sock`.

## Graphe de dépendances

### Local (`docker-compose.yml`)

```
db (Postgres)          health : pg_isready
sandbox-runner         health : GET /health
 └─ api                attend db healthy ET sandbox-runner healthy
     └─ web            attend api healthy
```

### Production (`docker-compose.prod.yml`)

```
db (Postgres)          health : pg_isready
 └─ api                attend db healthy
web                    indépendant
sandbox-runner         indépendant
```

En production, `api` n'attend pas le runner. Si le runner n'est pas encore prêt, la création d'un sandbox échoue avec une erreur `502`, mais le reste du site fonctionne.

### Communications à l'exécution

| De | Vers | Adresse | Protocole |
|---|---|---|---|
| navigateur | web | `asiyaad.tech` (via Caddy) | HTTPS |
| navigateur | api | `api.asiyaad.tech` (via Caddy) | HTTPS, CORS |
| navigateur | sandbox-runner | `sandbox.asiyaad.tech` (via Caddy) | HTTPS et WebSocket (iframe) |
| api | db | `db:5432` (DNS interne Docker) | PostgreSQL |
| api | sandbox-runner | `host.docker.internal:4000` | HTTP, en-tête `x-runner-key` |
| api | Gmail | SMTP | nodemailer |
| sandbox-runner | daemon Docker | `/var/run/docker.sock` | API Docker |
| sandbox-runner | conteneurs sandbox | `127.0.0.1:<port aléatoire>` | HTTP et WebSocket |

## Health checks

| Service | Vérification | Défini dans |
|---|---|---|
| `db` | `pg_isready -U <user>` | compose |
| `api` | `GET /health` (processus + ping Postgres via Terminus) | `apps/api/Dockerfile` |
| `web` | `GET /` sur nginx | `apps/web/Dockerfile` |
| `sandbox-runner` | `GET /health` | `apps/sandbox-runner/Dockerfile` |

Intervalle de 10 secondes, timeout de 3 secondes, 3 essais avant de passer à l'état `unhealthy`.

## Variables d'environnement

Les tableaux complets sont dans la doc de chaque service. Résumé :

| Service | Variables | Moment de lecture |
|---|---|---|
| `api` | `NODE_ENV`, `PORT`, `DATABASE_URL`, `CORS_ORIGIN`, `SANDBOX_RUNNER_URL`, `RUNNER_API_KEY`, `MAIL_USER`, `MAIL_PASS`, `MAIL_TO` | Au démarrage, validées par Joi (`apps/api/src/config/env.validation.ts`). L'api refuse de démarrer si une variable manque ou est invalide |
| `web` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SANDBOX_RUNNER_URL` | **Au build**, passées en `args` Docker. Les modifier impose de reconstruire l'image |
| `sandbox-runner` | `RUNNER_API_KEY`, `PORT` (4000), `MAX_SANDBOXES` (4) | Au démarrage |
| `db` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Au premier démarrage du volume |

Secrets à placer dans `apps/.env` (exclu de Git et des images Docker) : `RUNNER_API_KEY`, `MAIL_USER`, `MAIL_PASS`, `MAIL_TO`, et `DB_PASSWORD` en production.

`RUNNER_API_KEY` doit être **identique pour `api` et `sandbox-runner` sur une même machine**, et contenir au moins 32 caractères. Elle peut, et devrait, être différente entre la machine locale et le serveur :

```bash
openssl rand -hex 32
```

## Décisions transverses

### Schéma de la base : migrations automatiques

`synchronize` est désactivé dans tous les environnements : TypeORM ne modifie jamais le schéma tout seul à partir des entités. À la place, `migrationsRun: true` fait exécuter par l'api, à chaque démarrage, les migrations de `apps/api/src/migrations/` qui n'ont pas encore été appliquées. TypeORM garde la trace de celles déjà jouées dans la table `migrations`.

Conséquence : modifier une entité ne suffit pas. Il faut générer une migration (voir [api/api.md](./api/api.md)).

Le seed (`apps/api/src/seed.ts`) n'est **pas** automatique. Il se lance à la main, et il vide la table `project` avant d'insérer les projets.

### Accès au socket Docker (`sandbox-runner`)

`sandbox-runner` monte `/var/run/docker.sock` : il contrôle entièrement le daemon Docker de l'hôte, ce qui équivaut à un accès root sur la machine. Un utilisateur non root dans le conteneur ne réduit pas ce risque. En conséquence :

- le port 4000 n'est jamais ouvert à Internet. En production, le pare-feu ne l'autorise que depuis les réseaux Docker, et l'accès public passe uniquement par Caddy ;
- la création et la suppression de sandboxes exigent la clé `RUNNER_API_KEY`, que seule l'api possède ;
- le visiteur ne choisit jamais le dépôt à lancer : il envoie l'id d'un projet, et l'api lit l'URL du dépôt en base ;
- seuls des dépôts de confiance doivent être enregistrés, puisque leur `Dockerfile` est exécuté par le daemon de l'hôte.

### Réseau hôte pour le runner

Les conteneurs sandbox publient leur port sur `127.0.0.1:<port aléatoire>` de l'hôte. Pour les joindre, le runner partage la pile réseau de l'hôte (`network_mode: host`). Il n'est donc pas dans le réseau du compose, et l'api le joint par `host.docker.internal`.

### Exposition des ports en production

Tous les ports publiés en production sont préfixés par `127.0.0.1:`. Docker écrit ses propres règles iptables, qui passent avant UFW : sans ce préfixe, un port publié serait accessible depuis Internet même s'il est bloqué par le pare-feu. Seul Caddy (ports 80 et 443) est exposé publiquement.

### Frontend statique

`web` est exporté en fichiers statiques. Il n'y a pas de serveur Node en production : toutes les données sont chargées par le navigateur, qui appelle directement l'api. C'est pour ça que l'api doit autoriser l'origine du site (CORS), et que les URLs de l'api et du runner sont figées au build.
