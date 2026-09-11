# Flyst Projects — Operations

> Shared infrastructure (Postgres, Redis, S3, SMTP, LLM …) is wired in
> already — see [../INFRA.md](../INFRA.md). This app runs at http://localhost:8030.

## Generated configuration

A ready-to-run configuration has been generated in this directory:

- `.env`

Signing and encryption secrets in it are **real random values**, generated
per-file. Anything only you can supply — API keys, OAuth credentials — is
marked `CHANGE_ME`. Search for it:

```sh
grep -rn CHANGE_ME .
```

These files are gitignored and must not be committed.

Consumed by `docker compose`.

## Ports

| Service | Port | Notes |
|---|---|---|
| Proxy (Caddy) | `80` / `443` | `LISTEN_HTTP_PORT` / `LISTEN_HTTPS_PORT`; the only ports that need exposing |
| web | `3000` | behind the proxy at `/` |
| space | `3002` | behind the proxy at `/spaces` |
| admin | `3001` | behind the proxy at `/god-mode` |
| live | `3003` | realtime collaboration websocket |
| api | `8000` | Django/gunicorn |
| PostgreSQL | `5432` | |
| Redis | `6379` | |
| RabbitMQ | `5672` | |
| MinIO | `9000` | only when `USE_MINIO=1` |

## Required — database

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Full connection URL. Takes precedence over the discrete `POSTGRES_*` values. |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Discrete alternative to `DATABASE_URL` |
| `PGDATA` | Data directory inside the database container |

Read replica (optional): `ENABLE_READ_REPLICA`, `DATABASE_READ_REPLICA_URL`, or
the discrete `POSTGRES_READ_REPLICA_*` set.

## Required — queue and cache

| Variable | Purpose |
|---|---|
| `REDIS_URL` | Cache and session store |
| `AMQP_URL` | Full broker URL. Takes precedence over the discrete `RABBITMQ_*` values. |
| `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_VHOST` | Discrete alternative |

**RabbitMQ is required**, not optional — Celery uses it as the broker. Redis
does not substitute for it.

## Required — application

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django signing key. **Generate a long random value.** |
| `APP_BASE_URL` | Absolute public origin of the web app |
| `ADMIN_BASE_URL` | Absolute public origin of the admin app |
| `SPACE_BASE_URL` | Absolute public origin of the published-boards app |
| `LIVE_BASE_URL` | Absolute public origin of the realtime service |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed browser origins |
| `ALLOWED_HOSTS` | Django host allowlist |
| `DEBUG` | **Must be `0` in production** |

`APP_BASE_PATH`, `ADMIN_BASE_PATH`, `SPACE_BASE_PATH`, `LIVE_BASE_PATH` set
sub-paths when everything is served from one hostname (the compose default).

## File storage

| Variable | Purpose |
|---|---|
| `USE_MINIO` | `1` uses the bundled MinIO; `0` uses an external S3 |
| `AWS_S3_ENDPOINT_URL` | S3 endpoint |
| `AWS_S3_BUCKET_NAME` | Bucket for uploads |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Credentials |
| `MINIO_ENDPOINT_SSL` | `1` when MinIO is served over HTTPS |
| `FILE_SIZE_LIMIT` | Max upload size in bytes (default `5242880` = 5 MB) |
| `SIGNED_URL_EXPIRATION` | Lifetime of signed asset URLs |

Uploads are **not** in the database. The bucket, or the MinIO volume, needs
backups of its own.

## Sessions and cookies

`SESSION_COOKIE_NAME`, `SESSION_COOKIE_AGE`, `ADMIN_SESSION_COOKIE_AGE`,
`SESSION_SAVE_EVERY_REQUEST`, `COOKIE_DOMAIN`.

Set `COOKIE_DOMAIN` when the apps are served from different subdomains, or
sign-in will not carry across them.

## Email

Configured **in the admin app** (God Mode → Email), stored in the database —
not by environment variables. The only related variable is `EMAIL_BACKEND`.

Until an email configuration is saved, invitations, notifications and password
resets are generated but never delivered.

## TLS (bundled proxy)

`SITE_ADDRESS`, `CERT_EMAIL`, `CERT_ACME_CA`, `CERT_ACME_DNS`,
`TRUSTED_PROXIES`.

`TRUSTED_PROXIES` defaults to `0.0.0.0/0` in the example file. **Narrow it to
your actual proxy range** — as shipped, any client can spoof forwarded headers.

## Limits and integrations

| Variable | Purpose |
|---|---|
| `API_KEY_RATE_LIMIT` | Default `60/minute` |
| `WEBHOOK_ALLOWED_HOSTS` | Restricts webhook targets. Leave set to prevent SSRF from user-defined webhooks. |
| `HARD_DELETE_AFTER_DAYS` | Retention before permanent deletion |
| `UNSPLASH_ACCESS_KEY` | Cover-image picker. Unset disables it — the feature calls a third party. |
| `OPENAI_API_KEY`, `GPT_ENGINE` | Deprecated upstream; leave unset |
| `GITHUB_ACCESS_TOKEN` | GitHub importer |
| `ENABLE_DRF_SPECTACULAR` | Serves the OpenAPI schema |
| `INSTANCE_CHANGELOG_URL` | Empty by default; shown in-app if set |
| `ANALYTICS_BASE_API`, `ANALYTICS_SECRET_KEY` | External analytics; unset disables |
| `SCOUT_KEY`, `SCOUT_MONITOR` | APM; unset disables |

## Telemetry — changed from upstream

Instance telemetry is **off by default here**; upstream ships it on. See
`UPSTREAM.md`. To opt in, enable it in the admin panel *and* set `OTLP_ENDPOINT`
to a collector you operate — there is no longer a default collector, and an
unset endpoint resolves to `localhost` rather than a vendor host.

Related: `OTLP_ENDPOINT`, `OTLP_METRICS_PROTOCOL` (`grpc` or `http`),
`SERVICE_NAME`.

## Deployment requirements

- **PostgreSQL, Redis, RabbitMQ and S3-compatible storage** must all be
  reachable. Missing RabbitMQ silently breaks every background job.
- **The `migrator` service (or `python manage.py migrate`) must run before the
  api starts** on every release.
- **`worker` and `beat-worker` are separate processes.** Without them,
  notifications, email delivery, exports, imports, webhook dispatch and
  deletion jobs never run — with no error in the UI.
- Persistent volumes for `pgdata`, `redisdata` and `uploads`.
- Set `DEBUG=0`, a strong `SECRET_KEY`, real `*_BASE_URL` values, a narrowed
  `TRUSTED_PROXIES`, and `WEBHOOK_ALLOWED_HOSTS`.
- Configure email in the admin app, or no user ever receives an invitation.
- Note the AGPL network-use obligation in `UPSTREAM.md`.

## Infrastructure hostnames

`plane-db`, `plane-redis`, `plane-mq` and `plane-minio` are the compose service
names, and appear in `.env.example`, `docker-compose*.yml` and `deployments/`.
They are internal DNS names that no user sees. If you rename them, all of those
files must change together.
