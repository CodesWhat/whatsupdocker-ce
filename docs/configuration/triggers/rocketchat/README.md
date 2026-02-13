# Rocket.Chat

![logo](rocketchat.png)

The `rocketchat` trigger lets you post image update notifications to a Rocket.Chat channel or user.

## Variables

| Env var | Required | Description | Supported values | Default value when missing |
| --- | :---: | --- | --- | --- |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_URL` | :red_circle: | Rocket.Chat workspace URL, e.g. <https://example.com>. | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_USER_ID` | :red_circle: | User id of the user sending the notification. Displayed when generating a personal access token (PAT). | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_AUTH_TOKEN` | :red_circle: | PAT of the user sending the notification. | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_CHANNEL` | :red_circle: | Where the message is sent to. | Channel ID (`6561ce603d237c33797650d7`), channel name (`#example`) or username (`@example`). | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_ALIAS` | :white_circle: | Alters the sender's name shown for the message, but keeps the username as is. Requires `message-impersonate` permission, typically only present on the `bot` role. | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_AVATAR` | :white_circle: | Display the sender's avatar as the provided image URL. Requires `message-impersonate` permission, typically only on the `bot` role. | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_EMOJI` | :white_circle: | Display the sender's avatar as an emoji, e.g. `:smile:`. | | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_PARSE_URLS` | :white_circle: | Whether Rocket.Chat should generate link previews when the message text contains URLs. Enabled by default. | `true`, `false` | |
| `DD_TRIGGER_ROCKETCHAT_{trigger_name}_DISABLETITLE` | :white_circle: | Disable title to have full control over the message formatting. | `true`, `false` | `false` |

!> The Rocket.Chat channel must already exist on the workspace (the trigger won't automatically create it)

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration).

?> See also the [Rocket.Chat API documentation](https://developer.rocket.chat/apidocs/post-message) for additional information.

## Examples

<!-- tabs:start -->
### **Docker Compose**

```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
        - DD_TRIGGER_ROCKETCHAT_LOCAL_URL=https://example.com
        - DD_TRIGGER_ROCKETCHAT_LOCAL_USER_ID=jDdn8oh9BfJKnWdDY
        - DD_TRIGGER_ROCKETCHAT_LOCAL_AUTH_TOKEN=Rbqz90hnkRyVwRfcmE5PzkP5Pqwml_fo7ZUXzxv2_zx
        - DD_TRIGGER_ROCKETCHAT_LOCAL_CHANNEL=#drydock
```

### **Docker**

```bash
docker run \
    -e DD_TRIGGER_ROCKETCHAT_LOCAL_URL="https://example.com" \
    -e DD_TRIGGER_ROCKETCHAT_LOCAL_USER_ID="jDdn8oh9BfJKnWdDY" \
    -e DD_TRIGGER_ROCKETCHAT_LOCAL_AUTH_TOKEN="Rbqz90hnkRyVwRfcmE5PzkP5Pqwml_fo7ZUXzxv2_zx" \
    -e DD_TRIGGER_ROCKETCHAT_LOCAL_CHANNEL="#drydock" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

## How to obtain the sender's user ID and auth token

1. Log in to your Rocket.Chat workspace with the sender's account
2. Click on your profile picture in the top left corner, then click on "Profile"
3. Click on "Personal Access Tokens" in the left menu
4. Type a name for the token, select "Ignore Two Factor Authentication" and click on "Add"
5. Confirm your password or 2FA code
6. Copy the user ID and auth token values
