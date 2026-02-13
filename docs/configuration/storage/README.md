# Storage
  
If you want the state to persist after the container removal, you need to mount  ```/store``` as a volume.

## Examples

<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    volumes:
      - /path-on-my-host:/store
```

### **Docker**

```bash
docker run \
  -v /path-on-my-host:/store
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
