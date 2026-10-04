# api

Service NestJS qui sert de source de vérité au portfolio : il stocke les projets et les messages de contact dans PostgreSQL, envoie les emails de contact, et sert de point d'entrée pour demander la création d'un sandbox.

## Sommaire

- [Place dans l'architecture](#place-dans-larchitecture)
- [Structure du code](#structure-du-code)
- [Cycle de vie d'une requête dans NestJS](#cycle-de-vie-dune-requête-dans-nestjs)
- [Module Projects](#module-projects)
- [Module Sandbox : comment l'api parle au runner](#module-sandbox--comment-lapi-parle-au-runner)
- [Module Contact](#module-contact)
- [Module Health](#module-health)
- [Base de données](#base-de-données)
- [Configuration](#configuration)
- [Sécurité](#sécurité)
- [Build et exécution](#build-et-exécution)
- [Dépannage](#dépannage)

## Place dans l'architecture

```
Navigateur ──HTTPS──> Caddy (api.asiyaad.tech:443) ──HTTP──> api (127.0.0.1:3001)
                                                              │
                                     ┌────────────────────────┼─────────────────────────┐
                                     v                        v                         v
                              PostgreSQL (db:5432)   sandbox-runner              Gmail (SMTP)
                              réseau Docker interne  (host.docker.internal:4000)  via nodemailer
```

L'api est le seul service qui :
- lit et écrit dans la base de données ;
- connaît les identifiants Gmail ;
- possède la clé `RUNNER_API_KEY` qui permet de créer des sandboxes.

Le navigateur ne parle jamais directement à la base ni au runner pour créer un sandbox : il passe obligatoirement par l'api, qui applique ses règles (validation, rate limiting) avant de transmettre.

## Structure du code

```
apps/api/src/
├── main.ts                 # démarrage : CORS, ValidationPipe, trust proxy
├── app.module.ts           # module racine : config, TypeORM, throttler, modules métier
├── config/
│   └── env.validation.ts   # schéma Joi des variables d'environnement
├── projects/               # GET /projects, GET /projects/:id, POST /projects/:id/sandbox
├── sandbox/                # client HTTP vers le sandbox-runner
├── contact/                # POST /contact (sauvegarde + email)
├── health/                 # GET /health
├── migrations/             # migrations TypeORM
├── data-source.ts          # DataSource utilisée par la CLI TypeORM et le seed
└── seed.ts                 # remplit la table project
```

NestJS organise le code en **modules**. Chaque module regroupe :
- un **controller**, qui reçoit les requêtes HTTP et définit les routes ;
- un **service**, qui contient la logique métier ;
- éventuellement une **entity**, qui décrit une table de la base.

NestJS crée lui-même les instances de ces classes et les fournit à ceux qui en ont besoin : c'est l'**injection de dépendances**. Quand `ProjectsController` déclare `private readonly sandboxService: SandboxService` dans son constructeur, c'est NestJS qui lui passe l'instance. Il peut le faire parce que `ProjectsModule` importe `SandboxModule`, qui exporte `SandboxService`.

## Cycle de vie d'une requête dans NestJS

Prenons `POST https://api.asiyaad.tech/projects/<uuid>/sandbox` :

1. **Caddy** reçoit la requête en HTTPS, la déchiffre et la transmet en HTTP à `127.0.0.1:3001`. Il ajoute l'en-tête `X-Forwarded-For` avec l'IP réelle du visiteur.
2. **Express**, le serveur HTTP utilisé par NestJS, reçoit la requête. Comme `main.ts` contient `app.set('trust proxy', 1)`, Express fait confiance au premier proxy (Caddy) et prend l'IP dans `X-Forwarded-For`. Sans ce réglage, tous les visiteurs auraient l'IP de Caddy, et le rate limiting bloquerait tout le monde en même temps.
3. **CORS** : le navigateur a envoyé un en-tête `Origin: https://asiyaad.tech`. L'api répond avec `Access-Control-Allow-Origin` uniquement si l'origine correspond à `CORS_ORIGIN`. Sinon, le navigateur bloque la lecture de la réponse.
4. **Guard** : `ThrottlerGuard` compte les requêtes de cette IP sur cette route. Au-delà de la limite, il répond `429 Too Many Requests` sans exécuter le controller.
5. **Pipes** : `ParseUUIDPipe` vérifie que `:id` est un UUID valide (sinon `400`). Le `ValidationPipe` global valide le body s'il y en a un.
6. **Controller**, puis **service**, puis la base ou le runner.
7. La valeur retournée par le controller est convertie en JSON et renvoyée. Une `HttpException` levée n'importe où devient une réponse d'erreur JSON avec le bon code HTTP.

## Module Projects

Fichiers : `projects.controller.ts`, `projects.service.ts`, `project.entity.ts`.

### Entité `Project`

| Colonne | Type | Rôle |
|---|---|---|
| `id` | uuid | Clé primaire générée par Postgres |
| `title` | varchar | Nom du projet (le frontend s'en sert pour retrouver un projet) |
| `description` | text | Description courte |
| `imageUrl` | varchar, nullable | Image de présentation |
| `techStack` | simple-array | Liste stockée sous forme `C,Makefile` dans une seule colonne |
| `repoUrl` | varchar, nullable | **URL Git clonée par le sandbox-runner** |
| `liveUrl` | varchar, nullable | Lien vers une démo externe |
| `featured` | boolean | Mise en avant |
| `order` | int | Ordre d'affichage |
| `completedAt` | varchar(7) | Date au format `YYYY-MM` |
| `createdAt` / `updatedAt` | timestamp | Remplis automatiquement par TypeORM |

### Routes

| Méthode | Route | Ce qui se passe |
|---|---|---|
| `GET` | `/projects` | `repository.find({ order: { order: 'ASC' } })` |
| `GET` | `/projects/:id` | `findOneBy({ id })`, ou `404 NotFoundException` |
| `POST` | `/projects/:id/sandbox` | Voir la section suivante |

### Pourquoi le frontend n'envoie pas l'URL du repo

Le frontend envoie seulement l'**id** du projet. C'est l'api qui va chercher `repoUrl` en base.

C'est une décision de sécurité. Si le navigateur pouvait envoyer une URL de repo, n'importe qui pourrait faire construire et exécuter son propre code sur le serveur. Ici, seuls les repos enregistrés en base par l'administrateur peuvent être lancés.

## Module Sandbox : comment l'api parle au runner

Fichier : `sandbox/sandbox.service.ts`.

```
ProjectsController.createSandbox(id)
  │  1. findOne(id) -> project.repoUrl     (400 si absent)
  v
SandboxService.createSandbox(repoUrl)
  │  2. fetch POST ${SANDBOX_RUNNER_URL}/sandboxes
  │       headers: Content-Type: application/json
  │                x-runner-key: ${RUNNER_API_KEY}
  │       body:    { "repoUrl": "https://github.com/..." }
  v
sandbox-runner : clone, build, run (de 10 s à plusieurs minutes)
  │
  v
réponse { sandboxId, port }  ->  renvoyée telle quelle au navigateur
```

### Comment l'api atteint le runner

`SANDBOX_RUNNER_URL` vaut `http://host.docker.internal:4000`. Le runner ne vit pas dans le réseau Docker de l'api : il tourne en `network_mode: host`, donc directement sur le réseau de la machine. Pour sortir de son conteneur et atteindre la machine hôte, l'api utilise le nom spécial `host.docker.internal`, déclaré dans le compose :

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

`host-gateway` est remplacé par Docker par l'IP de la passerelle (en général `172.17.0.1`), c'est-à-dire l'hôte vu depuis un conteneur.

### Timeout

La requête peut durer longtemps, puisqu'elle attend la fin du `docker build`. Un `AbortController` coupe la requête au bout de **200 000 ms (3 min 20 s)**. Attention : le commentaire du fichier parle de « 2 min », alors que la valeur réelle est de 200 secondes.

### Traduction des erreurs

Le service ne laisse jamais sortir une erreur brute. Il convertit chaque cas en `HttpException` :

| Situation | Réponse de l'api |
|---|---|
| Runner répond `503` (trop de sandboxes) | `503`, avec le message du runner |
| Runner répond une autre erreur (`401`, `500`...) | `502 Bad Gateway`, avec le message du runner |
| Timeout dépassé | `504 Gateway Timeout` |
| Runner injoignable (réseau, pare-feu) | `502 "Sandbox runner unreachable"` |

## Module Contact

Fichiers : `contact.controller.ts`, `contact.service.ts`, `contact.entity.ts`, `dto/create-contact.dto.ts`.

### Flux

1. Le navigateur envoie `POST /contact` avec `{ firstName, lastName, email, message, website }`.
2. Le `ValidationPipe` applique les règles du DTO :
   - `firstName` et `lastName` : chaînes non vides, 100 caractères maximum ;
   - `email` : email valide, 254 caractères maximum ;
   - `message` : 50 000 caractères maximum ;
   - un champ inconnu provoque un `400`, grâce à `forbidNonWhitelisted`.
3. **Honeypot** : `website` est un champ caché dans le formulaire. Un humain ne le voit pas et le laisse vide, alors qu'un bot remplit tous les champs. S'il est rempli, le service répond `{ ok: true }` sans rien faire : le bot croit avoir réussi.
4. Le message est enregistré dans la table `contact`.
5. nodemailer l'envoie par SMTP Gmail, avec `MAIL_USER` et `MAIL_PASS` (un mot de passe d'application Google), vers `MAIL_TO`. Le `replyTo` est l'email du visiteur, donc répondre au mail lui répond directement.
6. Si l'envoi échoue, l'erreur est loggée et l'api répond `500`. Le message reste quand même enregistré en base.

Rate limit : 10 messages par heure et par IP.

## Module Health

`GET /health` utilise `@nestjs/terminus` pour pinger la base. Il répond `200` si Postgres répond, `503` sinon. Le `HEALTHCHECK` du Dockerfile appelle cette route toutes les 10 secondes, et Docker marque le conteneur `healthy` ou `unhealthy`.

## Base de données

- **ORM** : TypeORM, configuré dans `app.module.ts` avec `TypeOrmModule.forRootAsync`.
- **Connexion** : `DATABASE_URL`, par exemple `postgres://portfolio:<mdp>@db:5432/portfolio`. Le nom d'hôte `db` est le nom du service dans le compose : Docker fournit un DNS interne qui le résout vers l'IP du conteneur Postgres.
- **Schéma** : `synchronize: false` et `migrationsRun: true`. Au démarrage, l'api exécute automatiquement les migrations compilées (`dist/migrations/*.js`) qui n'ont pas encore été appliquées. TypeORM garde la trace de celles déjà jouées dans la table `migrations`.
- **Migrations existantes** : `init`, `AddCompletedAtToProject`, `AddNameToContact`.

### Créer une nouvelle migration

Après avoir modifié une entité :

```bash
cd apps/api
pnpm exec typeorm-ts-node-commonjs migration:generate src/migrations/NomDeLaMigration -d src/data-source.ts
```

TypeORM compare les entités à la base réelle et génère le SQL nécessaire. Relis toujours le fichier généré avant de le committer.

### Seed

```bash
cd apps/api
pnpm exec ts-node src/seed.ts
```

Attention : le seed fait un `clear()` de la table `project` avant d'insérer, ce qui supprime tous les projets existants.

## Configuration

Toutes les variables sont validées au démarrage par Joi (`config/env.validation.ts`). Si une variable manque ou est invalide, l'api refuse de démarrer et affiche laquelle.

| Variable | Validation | Exemple |
|---|---|---|
| `NODE_ENV` | `development`, `production` ou `test` | `production` |
| `PORT` | nombre, `3001` par défaut | `3001` |
| `DATABASE_URL` | URI, obligatoire | `postgres://portfolio:xxx@db:5432/portfolio` |
| `CORS_ORIGIN` | obligatoire | `https://asiyaad.tech` |
| `SANDBOX_RUNNER_URL` | URI, obligatoire | `http://host.docker.internal:4000` |
| `RUNNER_API_KEY` | au moins 32 caractères | généré avec `openssl rand -hex 32` |
| `MAIL_USER` | email | adresse Gmail d'envoi |
| `MAIL_PASS` | obligatoire | mot de passe d'application Google |
| `MAIL_TO` | email | adresse de réception |

## Sécurité

| Mesure | Où |
|---|---|
| CORS limité au domaine du site | `main.ts` |
| Validation stricte des body (whitelist, forbidNonWhitelisted, transform) | `main.ts` |
| Validation des UUID dans l'URL | `ParseUUIDPipe` |
| Rate limiting : 3 sandboxes par 10 min, 10 messages par heure | `@Throttle` |
| IP réelle derrière Caddy | `trust proxy 1` |
| Le client ne choisit pas le repo à lancer | `projects.controller.ts` |
| Clé partagée pour parler au runner | `sandbox.service.ts` |
| Port publié sur `127.0.0.1` uniquement, donc joignable seulement via Caddy | `docker-compose.prod.yml` |
| Le processus tourne en utilisateur non root (`USER node`) | `Dockerfile` |

## Build et exécution

Le Dockerfile est construit depuis la racine du monorepo, car il a besoin de `pnpm-lock.yaml` :

1. `node:22-alpine`, puis `corepack enable` pour avoir pnpm.
2. Copie des manifestes, puis `pnpm install --filter api --frozen-lockfile`. Cette couche reste en cache tant que les dépendances ne changent pas.
3. Copie du code, puis `pnpm --filter api build` (le compilateur NestJS produit `dist/`).
4. `USER node`, `EXPOSE 3001`, `HEALTHCHECK` sur `/health`.
5. `CMD node apps/api/dist/main.js`.

```bash
pnpm dev:api                                                   # local, hot reload
docker compose -f apps/docker-compose.prod.yml up -d --build api
docker compose -f apps/docker-compose.prod.yml logs -f api
```

## Dépannage

| Symptôme | Cause probable |
|---|---|
| L'api ne démarre pas, message `"X" is required` | Variable manquante dans `apps/.env` |
| `502 Sandbox runner unreachable` | Pare-feu (règle UFW du port 4000) ou runner arrêté |
| `502` avec le message `Unauthorized` | `RUNNER_API_KEY` différente entre l'api et le runner |
| `504 Sandbox creation timed out` | Le build dépasse 200 s (VPS surchargé, image lourde) |
| `429` | Limite de requêtes atteinte pour cette IP |
| Erreur CORS dans la console du navigateur | `CORS_ORIGIN` ne correspond pas exactement à l'URL du site |
| `500` sur `/contact` | Mot de passe d'application Gmail invalide ou révoqué |
