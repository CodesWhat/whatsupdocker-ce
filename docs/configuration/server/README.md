# Server

You can adjust the server configuration with the following environment variables.

### Variables

| Env var                    | Required       | Description                                                                  | Supported values                         | Default value when missing       |
| -------------------------- |:--------------:|----------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------- | 
| `DD_SERVER_ENABLED`       | :white_circle: | If REST API must be exposed                                                  | `true`, `false`                          | `true`                           |
| `DD_SERVER_PORT`          | :white_circle: | Http listener port                                                           | from `0` to `65535`                      | `3000`                           |
| `DD_SERVER_TLS_ENABLED`   | :white_circle: | Enable HTTPS+TLS                                                             | `true`, `false`                          | `false`                          |
| `DD_SERVER_TLS_KEY`       | :white_circle: | TLS server key (required when `DD_SERVER_TLS_ENABLED` is enabled)           | File path to the key file                |                                  |
| `DD_SERVER_TLS_CERT`      | :white_circle: | TLS server certificate (required when `DD_SERVER_TLS_ENABLED` is enabled)   | File path to the cert file               |                                  |
| `DD_SERVER_CORS_ENABLED`  | :white_circle: | Enable [CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) Requests  | `true`, `false`                          | `false`                          |
| `DD_SERVER_CORS_ORIGIN`   | :white_circle: | Supported CORS origin                                                        |                                          | `*`                              |
| `DD_SERVER_CORS_METHODS`  | :white_circle: | Supported CORS methods                                                       | Comma separated list of valid HTTP verbs | `GET,HEAD,PUT,PATCH,POST,DELETE` |
| `DD_SERVER_FEATURE_DELETE`| :white_circle: | If deleting operations are enabled through API & UI                          | `true`, `false`                          | `true`                           |
| `DD_SERVER_METRICS_AUTH`  | :white_circle: | Require authentication on `/metrics` endpoint                                | `true`, `false`                          | `true`                           |

### Examples

#### Disable http listener

<!-- tabs:start -->
#### **Docker Compose (Disable Listener)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_SERVER_ENABLED=false
```
#### **Docker (Disable Listener)**
```bash
docker run \
  -e DD_SERVER_ENABLED=false \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

#### Set http listener port to 8080

<!-- tabs:start -->
#### **Docker Compose (Custom Port)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_SERVER_PORT=8080
```
#### **Docker (Custom Port)**
```bash
docker run \
  -e DD_SERVER_PORT=8080 \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

#### Enable HTTPS

<!-- tabs:start -->
#### **Docker Compose (HTTPS)**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_SERVER_TLS_ENABLED=true
      - DD_SERVER_TLS_KEY=/drydock_certs/server.key
      - DD_SERVER_TLS_CERT=/drydock_certs/server.crt
```
#### **Docker (HTTPS)**
```bash
docker run \
  -e "DD_SERVER_TLS_ENABLED=true" \
  -e "DD_SERVER_TLS_KEY=/drydock_certs/server.key" \
  -e "DD_SERVER_TLS_CERT=/drydock_certs/server.crt" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
