# Basic Authentication

The `basic` authentication lets you protect drydock access using the [Http Basic auth standard](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).

### Variables

| Env var                           | Required       | Description              | Supported values                                                                           | Default value when missing |
| --------------------------------- |:--------------:| ------------------------ | ------------------------------------------------------------------------------------------ | -------------------------- | 
| `DD_AUTH_BASIC_{auth_name}_USER` | :red_circle:   | Username                 |                                                                                            |                            |
| `DD_AUTH_BASIC_{auth_name}_HASH` | :red_circle:   | Htpasswd compliant hash  | [See htpasswd documentation](https://httpd.apache.org/docs/current/programs/htpasswd.html) |                            |

!> Hash will likely contain `$` signs; don't forget to protect them! \
\
[double `$$` in Docker Compose files](https://docs.docker.com/compose/compose-file/compose-file-v3/#variable-substitution) \
`DD_AUTH_BASIC_JOHN_HASH: $$apr1$$aefKbZEa$$ZSA5Y3zv9vDQOxr283NGx/` \
\
or use single quotes in Bash commands \
`DD_AUTH_BASIC_JOHN_HASH='$apr1$aefKbZEa$ZSA5Y3zv9vDQOxr283NGx/'` \
\
or escape them in Bash commands \
`DD_AUTH_BASIC_JOHN_HASH="\$apr1\$aefKbZEa$ZSA5Y3zv9vDQOxr283NGx/"`

!> **Known limitation:** Passwords containing colon characters (`:`) are not supported due to a bug in the underlying `passport-http` library. Authentication will fail if your password contains a colon. Use passwords without colons until this is resolved.

### Examples

<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_AUTH_BASIC_JOHN_USER=john
      - DD_AUTH_BASIC_JOHN_HASH=$$apr1$$8zDVtSAY$$62WBh9DspNbUKMZXYRsjS/
      - DD_AUTH_BASIC_JANE_USER=jane
      - DD_AUTH_BASIC_JANE_HASH=$$apr1$$5iyu65pm$$m/6I35fjUT7.1CMnS2w9d1
      - DD_AUTH_BASIC_BOB_USER=bob
      - DD_AUTH_BASIC_BOB_HASH=$apr1$$aefKbZEa$$ZSA5Y3zv9vDQOxr283NGx/
```
#### **Docker**
```bash
docker run \
  -e DD_AUTH_BASIC_JOHN_USER="john" \
  -e DD_AUTH_BASIC_JOHN_HASH='$apr1$8zDVtSAY$62WBh9DspNbUKMZXYRsjS/' \
  -e DD_AUTH_BASIC_JANE_USER="jane" \
  -e DD_AUTH_BASIC_JANE_HASH='$apr1$5iyu65pm$m/6I35fjUT7.1CMnS2w9d1' \
  -e DD_AUTH_BASIC_JANE_USER="bob" \
  -e DD_AUTH_BASIC_JANE_HASH='$apr1$aefKbZEa$ZSA5Y3zv9vDQOxr283NGx/' \    
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### How to create a password hash
#### You can use htpasswd
```bash
htpasswd -nib john doe

# Output: john:$apr1$8zDVtSAY$62WBh9DspNbUKMZXYRsjS/
```

#### Or you can use an online service
[Like this one](https://wtools.io/generate-htpasswd-online).
