# Red Prayer Book

A pocket Orthodox prayer book. The manuscript screens live in `artifacts/red-prayer-book`. Companion and Compose a Prayer call the API server in `artifacts/api-server`. This repository does not include an API key, and it does not invent replies when the service is absent.

## Companion service

### Install

From the repository root:

```sh
pnpm install
```

### Environment

```sh
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Then edit `artifacts/api-server/.env`:

- `DATABASE_URL` — a Postgres connection string
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — your own Anthropic key; leave it empty until you have one
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — defaults to `https://api.anthropic.com`
- `PORT` — for example `5000`

Do not commit `.env`.

### Database

Load the env file, then push the schema:

```sh
set -a
. artifacts/api-server/.env
set +a
pnpm --filter @workspace/db run push
```

### Start the server

From the repository root:

```sh
pnpm --filter @workspace/api-server run serve
```

`serve` builds the server, loads `artifacts/api-server/.env` when that file exists, and listens on `PORT`. No Replit variable is required. If the key or database URL is missing, the process still listens and `GET /api/service` reports what is missing. Companion routes answer `503` and do not invent a reply.

### Point the app at the server

`EXPO_PUBLIC_API_URL` may include a scheme. `http://localhost:5000` stays http. A bare host in `EXPO_PUBLIC_DOMAIN` still uses https.

```sh
EXPO_PUBLIC_API_URL=http://localhost:5000 pnpm --filter @workspace/red-prayer-book run start:web
```

Other local starts, with no Replit variables:

```sh
pnpm --filter @workspace/red-prayer-book run start
pnpm --filter @workspace/red-prayer-book run start:web
```

When the app cannot reach a configured server, Companion and Compose a Prayer show how to connect this service instead of an error or a spinner.
