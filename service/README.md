# verso-i18n PR service

Signs readers in with GitHub and turns their reviews into pull requests on the
site's repository. One shared instance, `https://verso.nectric.com.au`, serves
every site; it keeps no database.

## Site setup

Install the **verso-i18n** GitHub App on the repository, then:

```yaml
# _quarto.yml
verso-translate:
  review:
    repo: owner/name
    # service: https://verso.example.org   # another instance
    # service: false                        # no submissions
```

```yaml
# _i18n/_service.yml
origins:
  - https://owner.github.io
```

## Running an instance

```sh
docker run -d -p 8787:8787 \
  -v /etc/verso:/home/node/.config/verso:ro \
  -e VERSO_PUBLIC_URL=https://verso.example.org \
  ghcr.io/mitchelloharawild/verso-service:latest
```

The mounted folder holds `secrets.env`, `verso-i18n.pem` and
`verso-i18n-writer.pem`. Run one instance behind HTTPS.

| Variable | |
|---|---|
| `VERSO_PUBLIC_URL` | Public address; the App's callback is `<url>/auth/callback` |
| `VERSO_APP_ID`, `VERSO_CLIENT_ID`, `VERSO_CLIENT_SECRET` | verso-i18n App |
| `VERSO_PRIVATE_KEY` / `VERSO_PRIVATE_KEY_FILE` | its private key |
| `VERSO_WRITER_APP_ID` | verso-i18n-writer App |
| `VERSO_WRITER_PRIVATE_KEY` / `VERSO_WRITER_PRIVATE_KEY_FILE` | its private key |
| `VERSO_FORK_OWNER` | Organisation holding the forks |
| `VERSO_SESSION_KEY` | `openssl rand -base64 32` |
| `PORT`, `VERSO_CACHE` | default `8787`, `/var/cache/verso` |

`GET /healthz` checks liveness; `GET /status?repo=owner/name` checks a site.

## Development

```sh
node service/server.ts --static <rendered site>
docker build -t verso-service .
```
