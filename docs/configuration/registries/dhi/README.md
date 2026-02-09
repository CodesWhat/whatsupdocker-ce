# DHI (Docker Hardened Images)

The `dhi` registry lets you configure [Docker Hardened Images](https://docs.docker.com/dhi/get-started/) integration.

Supported credentials:
- Docker ID login + password/access token
- Base64 auth string (`login:password`), like `.docker/config.json`

### Variables

| Env var                            | Required       | Description                                                                                   | Supported values                                         | Default value when missing |
| ---------------------------------- |:--------------:| --------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------- |
| `WUD_REGISTRY_DHI_PUBLIC_LOGIN`    | :white_circle: | Docker ID login                                                                               | `WUD_REGISTRY_DHI_PUBLIC_PASSWORD` must be defined       |                            |
| `WUD_REGISTRY_DHI_PUBLIC_PASSWORD` | :white_circle: | Docker ID password or access token                                                           | `WUD_REGISTRY_DHI_PUBLIC_LOGIN` must be defined          |                            |
| `WUD_REGISTRY_DHI_PUBLIC_TOKEN`    | :white_circle: | Alias for password/access token (deprecated; replaced by `WUD_REGISTRY_DHI_PUBLIC_PASSWORD`) | `WUD_REGISTRY_DHI_PUBLIC_LOGIN` must be defined          |                            |
| `WUD_REGISTRY_DHI_PUBLIC_AUTH`     | :white_circle: | Base64 auth string (`login:password`)                                                        | `WUD_REGISTRY_DHI_PUBLIC_LOGIN/PASSWORD` must not be set |                            |

### Examples

#### Configure with login/password

<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  whatsupdocker:
    image: ghcr.io/codeswhat/wud-ce
    ...
    environment:
      - WUD_REGISTRY_DHI_PUBLIC_LOGIN=mydockerid
      - WUD_REGISTRY_DHI_PUBLIC_PASSWORD=my-token-or-password
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_DHI_PUBLIC_LOGIN="mydockerid" \
  -e WUD_REGISTRY_DHI_PUBLIC_PASSWORD="my-token-or-password" \
  ...
  ghcr.io/codeswhat/wud-ce
```
<!-- tabs:end -->

#### Configure with base64 auth string

<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  whatsupdocker:
    image: ghcr.io/codeswhat/wud-ce
    ...
    environment:
      - WUD_REGISTRY_DHI_PUBLIC_AUTH=bXlkb2NrZXJpZDpteS10b2tlbi1vci1wYXNzd29yZA==
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_DHI_PUBLIC_AUTH="bXlkb2NrZXJpZDpteS10b2tlbi1vci1wYXNzd29yZA==" \
  ...
  ghcr.io/codeswhat/wud-ce
```
<!-- tabs:end -->
