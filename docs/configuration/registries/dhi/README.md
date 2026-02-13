# DHI (Docker Hardened Images)

The `dhi` registry lets you configure [Docker Hardened Images](https://docs.docker.com/dhi/get-started/) integration.

Supported credentials:

- Docker ID login + password/access token
- Base64 auth string (`login:password`), like `.docker/config.json`

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_REGISTRY_DHI_PUBLIC_LOGIN` | :white_circle: | Docker ID login | `DD_REGISTRY_DHI_PUBLIC_PASSWORD` must be defined | |
| `DD_REGISTRY_DHI_PUBLIC_PASSWORD` | :white_circle: | Docker ID password or access token | `DD_REGISTRY_DHI_PUBLIC_LOGIN` must be defined | |
| `DD_REGISTRY_DHI_PUBLIC_TOKEN` | :white_circle: | Alias for password/access token (deprecated; replaced by `DD_REGISTRY_DHI_PUBLIC_PASSWORD`) | `DD_REGISTRY_DHI_PUBLIC_LOGIN` must be defined | |
| `DD_REGISTRY_DHI_PUBLIC_AUTH` | :white_circle: | Base64 auth string (`login:password`) | `DD_REGISTRY_DHI_PUBLIC_LOGIN/PASSWORD` must not be set | |

## Examples

### Configure with login/password

<!-- tabs:start -->
### **Docker Compose (Login/Password)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_DHI_PUBLIC_LOGIN=mydockerid
      - DD_REGISTRY_DHI_PUBLIC_PASSWORD=my-token-or-password
```

### **Docker (Login/Password)**

```bash
docker run \
  -e DD_REGISTRY_DHI_PUBLIC_LOGIN="mydockerid" \
  -e DD_REGISTRY_DHI_PUBLIC_PASSWORD="my-token-or-password" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### Configure with base64 auth string

<!-- tabs:start -->
### **Docker Compose (Base64 Auth)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_DHI_PUBLIC_AUTH=bXlkb2NrZXJpZDpteS10b2tlbi1vci1wYXNzd29yZA==
```

### **Docker (Base64 Auth)**

```bash
docker run \
  -e DD_REGISTRY_DHI_PUBLIC_AUTH="bXlkb2NrZXJpZDpteS10b2tlbi1vci1wYXNzd29yZA==" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
