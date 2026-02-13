# Logs

You can adjust the log level with env var DD_LOG_LEVEL.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| ---------------- | :--------------: | ----------- | --------------------------- | --------------------------- |
| `DD_LOG_LEVEL` | :white_circle: | Log level | error info debug trace | `info` |
| `DD_LOG_FORMAT` | :white_circle: | Log format | text json | `text` |

## Examples

### Set debug level

<!-- tabs:start -->
### **Docker Compose (Debug Level)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_LOG_LEVEL=debug
```

### **Docker (Debug Level)**

```bash
docker run -e DD_LOG_LEVEL=debug ... ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### Set json format (for ElasticSearch ingestion for example)

<!-- tabs:start -->
### **Docker (JSON Format)**

```bash
docker run -e DD_LOG_FORMAT=json ... ghcr.io/codeswhat/drydock
```

### **Docker Compose (JSON Format)**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_LOG_FORMAT=json
```
<!-- tabs:end -->
