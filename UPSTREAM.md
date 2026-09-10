# Upstream source

| Field | Value |
|---|---|
| Upstream project | Plane |
| Source | https://zeshan.local |
| Edition | Community (CE) |
| Licence | GNU AGPL v3.0-only |
| Retained notices | `LICENSE.txt`, `COPYRIGHT.txt`, SPDX + copyright headers on 3,757 files |

## Licence obligations — read before deploying

AGPLv3 permits rebranding. Its distinguishing requirement is **section 13**:

> if you modify the Program, your modified version must prominently offer all
> users interacting with it remotely through a computer network … an
> opportunity to receive the Corresponding Source of your version.

**Running this rebranded version as a network service obliges you to offer its
users your modified source**, even though you distribute no files. In practice:
publish this directory's source, including the branding changes, and link to it
from the application — or supply it on request to every user.

The per-file `SPDX-License-Identifier: AGPL-3.0-only` headers must stay. So
must the `Copyright (c) 2023-present Plane Software, Inc. and contributors`
lines, including on the three logo components whose artwork was replaced — the
files remain derivative works.

`AGPL-3.0-only` (not `-or-later`) means you may not relicense under a later
AGPL version.

## Community vs Enterprise

This is the Community Edition. The upgrade paths in
`packages/constants/src/payment.ts` lead to the upstream vendor's paid tiers and
were repointed to a placeholder. Do not copy Enterprise-licensed code into this
tree — it is not AGPL.

## Privacy changes from upstream

| What | Upstream | Here |
|---|---|---|
| `Instance.is_telemetry_enabled` | `True` | `False` |
| Instance-registration endpoint default | `True` | `False` |
| `_DEFAULT_OTLP_ENDPOINT` | `https://telemetry.plane.so` | `""` |
| `grpc_endpoint_from_url` host fallback | `telemetry.plane.so` | `localhost` |

The scheduled `push-instance-metrics` Celery task remains in the beat schedule
but returns early while telemetry is disabled. That last row matters: without
it, an empty `OTLP_ENDPOINT` still resolved to the vendor's collector.

## Pulling upstream fixes

```sh
git remote add upstream https://zeshan.local
git fetch upstream --depth=50
```

Expect conflicts in:

- `packages/constants/src/{metadata,endpoints,payment}.ts`
- `packages/propel/src/icons/brand/*.tsx`
- `apps/{web,admin,space}/styles/globals.css` — the accent override block
- `apps/api/plane/license/models/instance.py` and `migrations/0001_initial.py`
- `apps/api/plane/utils/otlp_endpoints.py`
- `apps/api/plane/license/api/views/admin.py`

The bulk rename touched 494 files. Resolve in favour of upstream code and
re-apply the rename to user-visible strings only — and re-check that the
telemetry defaults above have not been reset.

## One file is not AGPL

`apps/api/plane/utils/email.py` carries
`SPDX-License-Identifier: LicenseRef-Plane-Commercial` and states
*"DO NOT remove or modify this notice. Proprietary and confidential."*

The bulk rename initially altered its licence name and EULA URL. **That file has
been reverted to its upstream contents verbatim** and must stay that way. It is
the only file in the tree under that licence — verify with:

```sh
grep -rl 'LicenseRef-Plane-Commercial' --exclude-dir=node_modules .
```

If you intend to redistribute this product, check whether you have the right to
include that file at all.


## Email logo: a sweep repair worth knowing about

The domain sweep rewrote the `<img src>` in all 11 transactional email
templates from a vendor CDN (`media.docs.plane.so`) to a single placeholder,
which would have shown a broken image in every outbound email.

They now resolve through a new template tag,
`plane/utils/templatetags/branding.py`, which builds an **absolute** URL from
`settings.WEB_URL` plus `/static/logos/Logo.png`. Mail clients cannot resolve
relative paths, so an absolute URL on a host you control is the only thing that
works — and `WEB_URL` must therefore be set, or email images will not render.
