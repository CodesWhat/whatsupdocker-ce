# Basic Authentication

The `basic` authentication lets you protect drydock access using the [Http Basic auth standard](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_AUTH_BASIC_{auth_name}_USER` | :red_circle: | Username | | |
| `DD_AUTH_BASIC_{auth_name}_HASH` | :red_circle: | Htpasswd compliant hash | [See htpasswd documentation](https://httpd.apache.org/docs/current/programs/htpasswd.html) | |

!> Hash values may contain special characters (`$`, `{`, `}`); don't forget to protect them! \
\
Use single quotes in Bash commands \
`DD_AUTH_BASIC_JOHN_HASH='{SHA}1rToTufzHYhhemtgQhRRJy6/Gjo='`

!> **Known limitation:** Passwords containing colon characters (`:`) are not supported due to a bug in the underlying `passport-http` library. Authentication will fail if your password contains a colon. Use passwords without colons until this is resolved.

## Examples

<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_AUTH_BASIC_JOHN_USER=john
      - DD_AUTH_BASIC_JOHN_HASH={SHA}1rToTufzHYhhemtgQhRRJy6/Gjo=
      - DD_AUTH_BASIC_JANE_USER=jane
      - DD_AUTH_BASIC_JANE_HASH={SHA}GHntYTv7Vgljq49/TZ+KI9s6PB0=
      - DD_AUTH_BASIC_BOB_USER=bob
      - DD_AUTH_BASIC_BOB_HASH={SHA}tjm75MZa6ep5tCaHAehlaoDJWxQ=
```

### **Docker**

```bash
docker run \
  -e DD_AUTH_BASIC_JOHN_USER="john" \
  -e DD_AUTH_BASIC_JOHN_HASH='{SHA}1rToTufzHYhhemtgQhRRJy6/Gjo=' \
  -e DD_AUTH_BASIC_JANE_USER="jane" \
  -e DD_AUTH_BASIC_JANE_HASH='{SHA}GHntYTv7Vgljq49/TZ+KI9s6PB0=' \
  -e DD_AUTH_BASIC_BOB_USER="bob" \
  -e DD_AUTH_BASIC_BOB_HASH='{SHA}tjm75MZa6ep5tCaHAehlaoDJWxQ=' \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

## How to create a password hash

### You can use htpasswd with SHA

```bash
htpasswd -nbs john doe

# Output: john:{SHA}1rToTufzHYhhemtgQhRRJy6/Gjo=
```

## Or you can use an online service

[Like this one](https://wtools.io/generate-htpasswd-online).
