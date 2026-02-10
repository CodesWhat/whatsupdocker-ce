# CUSTOM (Self-hosted Docker Registry)
![logo](custom.png)

The `custom` registry lets you configure a self-hosted [Docker Registry](https://docs.docker.com/registry/) integration.

### Variables

| Env var                        | Required       | Description                                                     | Supported values                                     | Default value when missing |
| ------------------------------ |:--------------:| --------------------------------------------------------------- | ---------------------------------------------------- | -------------------------- | 
| `DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_URL`      | :red_circle:   | Registry URL (e.g. http://localhost:5000)                       |                                                      |                            |
| `DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_LOGIN`    | :white_circle: | Login (when htpasswd auth is enabled on the registry)           | DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_PASSWORD must be defined         |                            |
| `DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_PASSWORD` | :white_circle: | Password (when htpasswd auth is enabled on the registry)        | DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_LOGIN must be defined            |                            |
| `DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_AUTH`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | DD_REGISTRY_CUSTOM_{REGISTRY_NAME}_LOGIN/TOKEN  must not be defined |                            |
### Examples

#### Configure for anonymous access
<!-- tabs:start -->
#### **Docker Compose (Anonymous)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_CUSTOM_PRIVATE_URL=http://localhost:5000
```
#### **Docker (Anonymous)**
```bash
docker run \
  -e "DD_REGISTRY_CUSTOM_PRIVATE_URL=http://localhost:5000" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

#### Configure [for Basic Auth](https://docs.docker.com/registry/configuration/#htpasswd)
<!-- tabs:start -->
#### **Docker Compose (Basic Auth)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_CUSTOM_PRIVATE_URL=http://localhost:5000
      - DD_REGISTRY_CUSTOM_PRIVATE_LOGIN=john
      - DD_REGISTRY_CUSTOM_PRIVATE_PASSWORD=doe
```
#### **Docker (Basic Auth)**
```bash
docker run \
  -e "DD_REGISTRY_CUSTOM_PRIVATE_URL=http://localhost:5000" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE_LOGIN=john" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE_PASSWORD=doe" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->


#### Configure multiple custom registries
<!-- tabs:start -->
#### **Docker Compose (Multiple Registries)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_CUSTOM_PRIVATE1_URL=http://localhost:5000
      - DD_REGISTRY_CUSTOM_PRIVATE1_LOGIN=john
      - DD_REGISTRY_CUSTOM_PRIVATE1_PASSWORD=doe
      - DD_REGISTRY_CUSTOM_PRIVATE2_URL=http://localhost:5001
      - DD_REGISTRY_CUSTOM_PRIVATE2_LOGIN=jane
      - DD_REGISTRY_CUSTOM_PRIVATE2_PASSWORD=doe
```
#### **Docker (Multiple Registries)**
```bash
docker run \
  -e "DD_REGISTRY_CUSTOM_PRIVATE1_URL=http://localhost:5000" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE1_LOGIN=john" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE1_PASSWORD=doe" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE2_URL=http://localhost:5001" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE2_LOGIN=jane" \
  -e "DD_REGISTRY_CUSTOM_PRIVATE2_PASSWORD=doe" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
