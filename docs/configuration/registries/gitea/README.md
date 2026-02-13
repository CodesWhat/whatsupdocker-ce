# GITEA

![logo](gitea.png)

The `gitea` registry lets you configure a self-hosted [Gitea](https://gitea.com) integration.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_REGISTRY_GITEA_{REGISTRY_NAME}_URL` | :red_circle: | Registry URL (e.g. <https://gitea.acme.com>) | | |
| `DD_REGISTRY_GITEA_{REGISTRY_NAME}_LOGIN` | :red_circle: | Gitea username | DD_REGISTRY_GITEA_{REGISTRY_NAME}_PASSWORD must be defined | |
| `DD_REGISTRY_GITEA_{REGISTRY_NAME}_PASSWORD` | :red_circle: | Gitea password | DD_REGISTRY_GITEA_{REGISTRY_NAME}_LOGIN must be defined | |
| `DD_REGISTRY_GITEA_{REGISTRY_NAME}_AUTH` | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | DD_REGISTRY_GITEA_{REGISTRY_NAME}_LOGIN/TOKEN  must not be defined | |

## Examples

### Configure
<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_GITEA_PRIVATE_URL=https://gitea.acme.com
      - DD_REGISTRY_GITEA_PRIVATE_LOGIN=john
      - DD_REGISTRY_GITEA_PRIVATE_PASSWORD=doe
```

### **Docker**

```bash
docker run \
  -e "DD_REGISTRY_GITEA_PRIVATE_URL=https://gitea.acme.com/" \
  -e "DD_REGISTRY_GITEA_PRIVATE_LOGIN=john" \
  -e "DD_REGISTRY_GITEA_PRIVATE_PASSWORD=doe" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
