# Zeshan Projects

Project and work management: projects, work items, cycles, modules, views,
pages, analytics, workflows, and public roadmap publishing.

## Architecture

Four frontends and a Django API, all behind one reverse proxy.

| Service | Package | Role |
|---|---|---|
| `web` | `apps/web` | Main application |
| `admin` | `apps/admin` | Instance administration |
| `space` | `apps/space` | Publicly published boards and roadmaps |
| `live` | `apps/live` | Realtime collaborative editing, PDF export |
| `api` | `apps/api` | Django REST API |
| `worker` / `beat-worker` | `apps/api` | Celery task and schedule workers |
| `proxy` | `apps/proxy` | Caddy reverse proxy and TLS |

Backing services: PostgreSQL, Redis, RabbitMQ, and S3-compatible object storage
(MinIO in the bundled compose file).

Shared code lives in `packages/` — `constants`, `types`, `ui`, `propel`
(component library), `editor`, `services`, `i18n`.

## Local setup

```sh
cp .env.example .env
docker compose -f docker-compose-local.yml up -d
```

Or run from source:

```sh
pnpm install
pnpm dev
```

See [OPERATIONS.md](./OPERATIONS.md) for environment variables, ports and
deployment requirements.

## Branding

| Surface | Where |
|---|---|
| Titles, descriptions, social meta | `packages/constants/src/metadata.ts` |
| Accent palette | `--*-accent-*` override block in each of `apps/{web,admin,space}/styles/globals.css` |
| Logo, wordmark and lockup components | `packages/propel/src/icons/brand/` |
| Favicons, apple-touch and PWA icons | `apps/{web,admin,space}/app/assets/favicon/` and `public/favicon/` |
| PWA manifests | `apps/{web,space}/.../site.webmanifest` — upstream shipped these with empty `name` fields |
| Animated brand loaders | `apps/{web,admin,space}/app/assets/images/logo-spinner-{light,dark}.gif` — regenerated as 65-frame GIFs at the original canvas sizes |
| Wordmark served by the API (emails, exports) | `apps/api/plane/static/logos/Logo.png` |
| Website, support address, marketing links | `packages/constants/src/endpoints.ts` |

The upstream accent ramp (`#3F76FF` and its ten tints and shades) was mapped
rung-for-rung onto the brand indigo ramp — 166 occurrences across 36 files —
so the product is not identifiable by colour.

### The palette lives in an external package

Design tokens are published in **`@makeplane/propel`**, an npm dependency, not
in this repository. The accent hue therefore cannot be changed by editing these
sources. Each app's `globals.css` now declares the accent tokens *after* the
token imports, so they win by cascade order — the supported way to retint
without patching `node_modules`.

Because the published package uses two naming conventions, the override sets
both (`--background-color-accent-primary` and `--bg-accent-primary`, etc.).
Declaring a custom property a build does not consume is inert, so this is safe;
but **verify the rendered accent once dependencies are installed** — the exact
token set can only be confirmed against the installed package.

### Three upstream defaults were changed

- **`is_telemetry_enabled` now defaults to `False`** (model, initial migration
  and the instance-registration endpoint). Upstream defaults it to `True` and
  pushes user, workspace, project, issue, cycle and module counts to
  `telemetry.plane.so` on a timer.
- **No default OTLP collector.** `OTLP_ENDPOINT` is empty by default, and the
  hostname fallback inside `otlp_endpoints.py` was changed from the vendor's
  collector to `localhost` — an unconfigured endpoint can no longer leak
  instance metrics off-box.
- **Commercial upgrade links** in `packages/constants/src/payment.ts` pointed at
  the upstream vendor's checkout. They now point at a placeholder you own.

### Deliberately left unchanged

- **AGPL copyright headers.** `Copyright (c) 2023-present Plane Software, Inc.`
  plus `SPDX-License-Identifier: AGPL-3.0-only` appear on 3,757 files, along
  with `LICENSE.txt` and `COPYRIGHT.txt`. The licence requires them.
- **`Plane*` CamelCase identifiers** (`PlaneLogo`, `PlaneLockup`,
  `PlaneWordmark`, …) — real exported symbols. Their *artwork* was replaced;
  their names were not.
- **`@plane/*` workspace package names**, the `plane` Python package, and the
  `plane-db` / `plane-redis` / `plane-mq` / `plane-minio` compose service
  hostnames. The hostnames appear in `.env.example`, `docker-compose*.yml` and
  `deployments/`; they are internal DNS names, never shown to users, and
  renaming them means keeping four files in sync for no visible gain.

### Not covered

Test fixtures still use upstream domains. Decorative empty-state illustrations
(`apps/*/app/assets/empty-state/`) contain incidental blues such as `#006399`
that are not part of the accent ramp; they read as generic line art rather than
brand identity.

## Provenance and licence

AGPL-3.0-only. **Read the network-use obligation in
[UPSTREAM.md](./UPSTREAM.md) before deploying this as a service.**
