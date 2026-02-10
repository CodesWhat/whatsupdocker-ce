# Ntfy
![logo](ntfy.png)

The `ntfy` trigger lets you send container update notifications via [Ntfy](https://ntfy.sh/).

### Variables

| Env var                                         |    Required    | Description                               | Supported values                                                                       | Default value when missing |
|-------------------------------------------------|:--------------:|-------------------------------------------|----------------------------------------------------------------------------------------|----------------------------| 
| `DD_TRIGGER_NTFY_{trigger_name}_AUTH_PASSWORD` | :white_circle: | Password (if basic auth is enabled)       |                                                                                        |                            |
| `DD_TRIGGER_NTFY_{trigger_name}_AUTH_TOKEN`    | :white_circle: | Bearer token (if bearer auth is enabled)  |                                                                                        |                            |
| `DD_TRIGGER_NTFY_{trigger_name}_AUTH_USER`     | :white_circle: | User (if basic auth is enabled)           |                                                                                        |                            |
| `DD_TRIGGER_NTFY_{trigger_name}_PRIORITY`      | :white_circle: | The Ntfy message priority                 | Integer between `0` and `5` [see here](https://docs.ntfy.sh/publish/#message-priority) |                            |
| `DD_TRIGGER_NTFY_{trigger_name}_TOPIC`         | :red_circle:   | The Ntfy topic name                       |                                                                                        |                            |
| `DD_TRIGGER_NTFY_{trigger_name}_URL`           | :red_circle:   | The Ntfy server url                       | The `http` or `https` gotify server address                                            | `https://notify.sh`        |

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration).

### Examples

#### Configure the trigger to publish to the official public ntfy service

<!-- tabs:start -->
#### **Docker Compose (Public)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_TRIGGER_NTFY_THRESHOLD=minor
      - DD_TRIGGER_NTFY_SH_TOPIC=xxxxyyyyzzzz
```
#### **Docker (Public)**
```bash
docker run \
  -e DD_TRIGGER_NTFY_THRESHOLD="minor" \
  -e DD_TRIGGER_NTFY_SH_TOPIC="xxxxyyyyzzzz" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

#### Configure the trigger to publish to a private ntfy service with basic auth enabled

<!-- tabs:start -->
#### **Docker Compose (Private with Auth)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_TRIGGER_NTFY_PRIVATE_URL=http://ntfy.local
      - DD_TRIGGER_NTFY_PRIVATE_TOPIC=xxxxyyyyzzzz
      - DD_TRIGGER_NTFY_PRIVATE_AUTH_USER=john
      - DD_TRIGGER_NTFY_PRIVATE_AUTH_PASSWORD=doe
```
#### **Docker (Private with Auth)**
```bash
docker run \
  -e DD_TRIGGER_NTFY_PRIVATE_URL="http://ntfy.local" \
  -e DD_TRIGGER_NTFY_PRIVATE_TOPIC="xxxxyyyyzzzz" \
  -e DD_TRIGGER_NTFY_PRIVATE_AUTH_USER="john" \
  -e DD_TRIGGER_NTFY_PRIVATE_AUTH_PASSWORD="doe" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
