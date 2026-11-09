# verso-i18n PR service

Readers of a translated Quarto site sign in with GitHub from the review tray
and submit their reviews; the service commits them to a fork it owns and opens
a pull request on the site's repository in the reader's name.

One instance serves every site (like giscus); the shared one is
`https://verso.nectric.com.au`. A site owner hosts nothing: they install the
**verso-i18n** GitHub App on the repository, set `verso-translate.review.repo`,
and list their site's origin in `_i18n/_service.yml`:

```yaml
# _quarto.yml
verso-translate:
  review:
    repo: owner/name
    # service: https://verso.example.org   # another instance (default: the shared one)
    # service: false                        # no submissions; reviews stay in the browser
```

```yaml
# _i18n/_service.yml
origins:
  - https://owner.github.io
```

The service keeps no database. Sessions are sealed into the reader's browser;
repository snapshots are a disposable cache.

## Image

```
ghcr.io/mitchelloharawild/verso-service:latest   # latest release (tag v*)
ghcr.io/mitchelloharawild/verso-service:main     # main branch
```

`linux/amd64` and `linux/arm64`. It contains Node and the pandoc release that
Quarto bundles (build argument `PANDOC_VERSION`, kept in step with Quarto so
that units are split from the source exactly as authors' CLI splits them).

## Configuration

| Variable | |
|---|---|
| `VERSO_PUBLIC_URL` | Public address, e.g. `https://verso.example.org`. The GitHub App's callback URL must be `<url>/auth/callback`. |
| `VERSO_APP_ID`, `VERSO_CLIENT_ID`, `VERSO_CLIENT_SECRET` | verso-i18n (reads site repositories, signs readers in) |
| `VERSO_PRIVATE_KEY` or `VERSO_PRIVATE_KEY_FILE` | its private key: PEM text (`\n` escapes allowed) or a file |
| `VERSO_WRITER_APP_ID` | verso-i18n-writer (writes to the forks) |
| `VERSO_WRITER_PRIVATE_KEY` or `VERSO_WRITER_PRIVATE_KEY_FILE` | its private key |
| `VERSO_FORK_OWNER` | Organisation that owns the forks; verso-i18n-writer is installed there |
| `VERSO_SESSION_KEY` | 32 random bytes, base64 (`openssl rand -base64 32`). Changing it signs everyone out. |
| `PORT` | default `8787` |
| `VERSO_CACHE` | default `/var/cache/verso` (mount a volume to keep snapshots across restarts; optional) |

Inside the container the service also reads `~/.config/verso/secrets.env`
(`/home/node/.config/verso/`), and the key files default to `verso-i18n.pem` and
`verso-i18n-writer.pem` in that folder, so mounting that folder is enough.

## Run

```sh
docker run -d --name verso -p 8787:8787 --restart unless-stopped \
  -v /etc/verso:/home/node/.config/verso:ro \
  -e VERSO_PUBLIC_URL=https://verso.example.org \
  ghcr.io/mitchelloharawild/verso-service:latest
```

or with Compose:

```yaml
services:
  verso:
    image: ghcr.io/mitchelloharawild/verso-service:latest
    restart: unless-stopped
    ports: ["8787:8787"]
    env_file: secrets.env
    environment:
      VERSO_PUBLIC_URL: https://verso.example.org
      VERSO_PRIVATE_KEY_FILE: /run/secrets/verso-i18n.pem
      VERSO_WRITER_PRIVATE_KEY_FILE: /run/secrets/verso-i18n-writer.pem
    volumes:
      - ./keys:/run/secrets:ro
```

Put it behind HTTPS (a reverse proxy, or a platform that terminates TLS, such
as Fly.io, Render, Railway or Cloud Run). Run a **single instance**: the
submission rate limit is kept in memory.

`GET /healthz` answers `ok` without calling GitHub (the image's health check).
`GET /status?repo=owner/name[&dir=sub/]` reports whether both Apps can reach a
site and which origins it allows.

## Develop

```sh
node service/server.ts --static ../site/_book   # also serves a rendered site
node scripts/build.mjs --service                # bundle → service/dist/server.mjs
docker build -t verso-service .
```

`.github/workflows/service-image.yml` builds both architectures on pull requests
and publishes on pushes to `main` and on `v*` tags.
