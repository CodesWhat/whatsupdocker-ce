# DOCR (DigitalOcean Container Registry)

The `docr` registry lets you configure [DigitalOcean Container Registry](https://docs.digitalocean.com/products/container-registry/) integration.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_REGISTRY_DOCR_{REGISTRY_NAME}_TOKEN` | :white_circle: | DigitalOcean API token (recommended) | | |
| `DD_REGISTRY_DOCR_{REGISTRY_NAME}_LOGIN` | :white_circle: | Registry username for basic auth | | `doctl` when `TOKEN` is set |
| `DD_REGISTRY_DOCR_{REGISTRY_NAME}_PASSWORD` | :white_circle: | Registry password for basic auth | | |
| `DD_REGISTRY_DOCR_{REGISTRY_NAME}_AUTH` | :white_circle: | Base64 encoded `login:password` credential | Valid base64 string | |

?> `TOKEN` is a convenience alias. drydock maps it to basic auth automatically.
?> The DOCR endpoint is fixed to `https://registry.digitalocean.com`.

## Examples

### Configure with API token

<!-- tabs:start -->
### **Docker Compose (API Token)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_DOCR_PRIVATE_TOKEN=dop_v1_xxxxxxxxxxxxx
```

### **Docker (API Token)**

```bash
docker run \
  -e "DD_REGISTRY_DOCR_PRIVATE_TOKEN=dop_v1_xxxxxxxxxxxxx" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### Configure with explicit basic auth

<!-- tabs:start -->
### **Docker Compose (Basic Auth)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_DOCR_PRIVATE_LOGIN=doctl
      - DD_REGISTRY_DOCR_PRIVATE_PASSWORD=dop_v1_xxxxxxxxxxxxx
```

### **Docker (Basic Auth)**

```bash
docker run \
  -e "DD_REGISTRY_DOCR_PRIVATE_LOGIN=doctl" \
  -e "DD_REGISTRY_DOCR_PRIVATE_PASSWORD=dop_v1_xxxxxxxxxxxxx" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### Configure with `AUTH` from `~/.docker/config.json`

If your Docker config has:

```json
{
  "auths": {
    "registry.digitalocean.com": {
      "auth": "ZG9jdGw6ZG9wX3YxX3h4eHh4eHh4eHh4"
    }
  }
}
```

use:

```bash
docker run \
  -e "DD_REGISTRY_DOCR_PRIVATE_AUTH=ZG9jdGw6ZG9wX3YxX3h4eHh4eHh4eHh4" \
  ...
  ghcr.io/codeswhat/drydock
```
