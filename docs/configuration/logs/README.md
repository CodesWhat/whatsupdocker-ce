# Logs

You can adjust the log level with env var WUD_LOG_LEVEL.

### Variables

| Env var          | Required       | Description | Supported values            | Default value when missing  |
| ---------------- |:--------------:| ----------- | --------------------------- | --------------------------- | 
| `WUD_LOG_LEVEL`  | :white_circle: | Log level   | error info debug trace      | `info`                      |
| `WUD_LOG_FORMAT` | :white_circle: | Log format  | text json                   | `text`                      |

### Examples

#### Set debug level

<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  whatsupdocker:
    image: ghcr.io/codeswhat/wud-ce
    ...
    environment:
      - WUD_LOG_LEVEL=debug
```
#### **Docker**
```bash
docker run -e WUD_LOG_LEVEL=debug ... ghcr.io/codeswhat/wud-ce
```
<!-- tabs:end -->

#### Set json format (for ElasticSearch ingestion for example)

<!-- tabs:start -->
#### **Docker**
```bash
docker run -e WUD_LOG_FORMAT=json ... ghcr.io/codeswhat/wud-ce
```

#### **Docker Compose**
```yaml
services:
  whatsupdocker:
    image: ghcr.io/codeswhat/wud-ce
    ...
    environment:
      - WUD_LOG_FORMAT=json
```
<!-- tabs:end -->
