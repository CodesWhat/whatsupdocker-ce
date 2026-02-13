# Slack

![logo](slack.png)

The `slack` trigger lets you post image update notifications to a Slack channel.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_TRIGGER_SLACK_{trigger_name}_TOKEN` | :red_circle: | The Oauth Token of the Slack app | | |
| `DD_TRIGGER_SLACK_{trigger_name}_CHANNEL` | :red_circle: | The name of the channel to post | | |
| `DD_TRIGGER_SLACK_{trigger_name}_DISABLETITLE` | :white_circle: | Disable title to have full control over the message formatting | `true`, `false` | `false` |

!> The Slack channel must already exist on the workspace (the trigger won't automatically create it)

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration).

## Examples

<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
        - DD_TRIGGER_SLACK_TEST_TOKEN=xoxp-743817063446-xxx
        - DD_TRIGGER_SLACK_TEST_CHANNEL=drydock
```

### **Docker**

```bash
docker run \
    -e DD_TRIGGER_SLACK_TEST_TOKEN="xoxp-743817063446-xxx" \
    -e DD_TRIGGER_SLACK_TEST_CHANNEL="drydock" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->
