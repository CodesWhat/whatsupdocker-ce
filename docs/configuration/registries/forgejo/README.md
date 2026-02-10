# FORGEJO
![logo](forgejo.png)

The `forgejo` registry lets you configure a self-hosted [Forgejo](https://forgejo.org/) integration.

### Variables

| Env var                                         |    Required    | Description                                                     | Supported values                                                      | Default value when missing |
|-------------------------------------------------|:--------------:|-----------------------------------------------------------------|-----------------------------------------------------------------------|----------------------------| 
| `DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_URL`      | :red_circle:   | Registry URL (e.g. https://forgejo.acme.com)                    |                                                                       |                            |
| `DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_LOGIN`    | :red_circle:   | Forgejo username                                                | DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_PASSWORD must be defined         |                            |
| `DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_PASSWORD` | :red_circle:   | Forgejo password or personal access token                       | DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_LOGIN must be defined            |                            |
| `DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_AUTH`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | DD_REGISTRY_FORGEJO_{REGISTRY_NAME}_LOGIN/TOKEN  must not be defined |                            |
### Examples

#### Configure
<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_FORGEJO_PRIVATE_URL=https://forgejo.acme.com
      - DD_REGISTRY_FORGEJO_PRIVATE_LOGIN=john
      - DD_REGISTRY_FORGEJO_PRIVATE_PASSWORD=doe
```
#### **Docker**
```bash
docker run \
  -e "DD_REGISTRY_FORGEJO_PRIVATE_URL=https://forgejo.acme.com" \
  -e "DD_REGISTRY_FORGEJO_PRIVATE_LOGIN=john" \
  -e "DD_REGISTRY_FORGEJO_PRIVATE_PASSWORD=doe" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
