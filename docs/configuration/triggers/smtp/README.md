# Smtp

The `smtp` trigger lets you send emails with smtp.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | :--- | --- | --- |
| `DD_TRIGGER_SMTP_{trigger_name}_HOST` | :red_circle: | Smtp server host | Valid hostname or IP address | |
| `DD_TRIGGER_SMTP_{trigger_name}_PORT` | :red_circle: | Smtp server port | Valid smtp port | |
| `DD_TRIGGER_SMTP_{trigger_name}_FROM` | :red_circle: | Email from address | Valid email address | |
| `DD_TRIGGER_SMTP_{trigger_name}_TO` | :red_circle: | Email to address | Valid email address | |
| `DD_TRIGGER_SMTP_{trigger_name}_USER` | :white_circle: | Smtp user | | |
| `DD_TRIGGER_SMTP_{trigger_name}_PASS` | :white_circle: | Smtp password | | |
| `DD_TRIGGER_SMTP_{trigger_name}_TLS_ENABLED` | :white_circle: | Use TLS | `true`, `false` | `false` |
| `DD_TRIGGER_SMTP_{trigger_name}_TLS_VERIFY` | :white_circle: | Verify server TLS certificate | `true`, `false` | `true` |
| `DD_TRIGGER_SMTP_{trigger_name}_ALLOWCUSTOMTLD` | :white_circle: | Allow custom tlds for the email addresses | `true`, `false` | `false` |

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration).

## Examples

### Send an email with Gmail

<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
        - DD_TRIGGER_SMTP_GMAIL_HOST=smtp.gmail.com
        - DD_TRIGGER_SMTP_GMAIL_PORT=465
        - DD_TRIGGER_SMTP_GMAIL_USER=john.doe@gmail.com
        - DD_TRIGGER_SMTP_GMAIL_PASS=mysecretpass
        - DD_TRIGGER_SMTP_GMAIL_FROM=john.doe@gmail.com
        - DD_TRIGGER_SMTP_GMAIL_TO=jane.doe@gmail.com
        - DD_TRIGGER_SMTP_GMAIL_TLS_ENABLED=true 
```

### **Docker**

```bash
docker run \
    -e DD_TRIGGER_SMTP_GMAIL_HOST="smtp.gmail.com" \
    -e DD_TRIGGER_SMTP_GMAIL_PORT="465" \
    -e DD_TRIGGER_SMTP_GMAIL_USER="john.doe@gmail.com" \
    -e DD_TRIGGER_SMTP_GMAIL_PASS="mysecretpass" \
    -e DD_TRIGGER_SMTP_GMAIL_FROM="john.doe@gmail.com" \
    -e DD_TRIGGER_SMTP_GMAIL_TO="jane.doe@gmail.com" \
    -e DD_TRIGGER_SMTP_GMAIL_TLS_ENABLED="true" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

!> For Gmail, you need to create an application specific password first ([See gmail documentation](https://security.google.com/settings/security/apppasswords)).
