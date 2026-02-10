# Kafka
![logo](kafka.png)

The `kafka` trigger lets you publish container update notifications to a Kafka topic.

### Variables

| Env var                                                    | Required       | Description                                                      | Supported values                         | Default value when missing |
| ---------------------------------------------------------- |:--------------:| ---------------------------------------------------------------- | ---------------------------------------- | -------------------------- | 
| `DD_TRIGGER_KAFKA_{trigger_name}_BROKERS`                 | :red_circle:   | Comma separated list of Kafka brokers                            |                                          |                            |
| `DD_TRIGGER_KAFKA_{trigger_name}_SSL`                     | :white_circle: | Is SSL enabled on the TLS connection                             | `true`, `false`                          | `false`                    |
| `DD_TRIGGER_KAFKA_{trigger_name}_TOPIC`                   | :white_circle: | The name of the topic to publish                                 |                                          | `drydock-container`            |
| `DD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_TYPE`     | :white_circle: | The type for authentication                                      | `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-12` | `PLAIN`                    |
| `DD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_USER`     | :white_circle: | The name of the user (required if authentication is enabled)     |                                          |                            |
| `DD_TRIGGER_KAFKA_{trigger_name}_AUTHENTICATION_PASSWORD` | :white_circle: | The password of the user (required if authentication is enabled) |                                          |                            |

!> The topic must already exist on the broker (the trigger won't automatically create it)

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration).

### Examples

#### Post a message to a&nbsp;[Cloud Karafka](https://www.cloudkarafka.com/) broker

<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
        - DD_TRIGGER_KAFKA_KARAKFA_BROKERS=ark-01.srvs.cloudkafka.com:9094,ark-02.srvs.cloudkafka.com:9094,ark-03.srvs.cloudkafka.com:9094
        - DD_TRIGGER_KAFKA_KARAKFA_SSL="true
        - DD_TRIGGER_KAFKA_KARAKFA_TOPIC=my-user-id-drydock-image
        - DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_USER=my-user-id
        - DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_PASSWORD=my-secret
        - DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_TYPE=SCRAM-SHA-256
```

#### **Docker**
```bash
docker run \
    -e DD_TRIGGER_KAFKA_KARAKFA_BROKERS="ark-01.srvs.cloudkafka.com:9094,ark-02.srvs.cloudkafka.com:9094,ark-03.srvs.cloudkafka.com:9094" \
    -e DD_TRIGGER_KAFKA_KARAKFA_SSL="true" \
    -e DD_TRIGGER_KAFKA_KARAKFA_TOPIC="my-user-id-drydock-image" \
    -e DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_USER="my-user-id" \
    -e DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_PASSWORD="my-secret" \
    -e DD_TRIGGER_KAFKA_KARAKFA_AUTHENTICATION_TYPE="SCRAM-SHA-256" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

#### Example of published record
```json
{
  "id":"31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816",
  "name":"homeassistant",
  "watcher":"local",
  "includeTags":"^\\d+\\.\\d+.\\d+$",
  "image":{
    "id":"sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6",
    "registry":{
      "url":"123456789.dkr.ecr.eu-west-1.amazonaws.com"
    },
    "name":"test",
    "tag":{
      "value":"2021.6.4",
      "semver":true
    },
    "digest":{
      "watch":false,
      "repo":"sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72"
    },
    "architecture":"amd64",
    "os":"linux",
    "created":"2021-06-12T05:33:38.440Z"
  },
  "result":{
    "tag":"2021.6.5"
  },
  "updateAvailable": true
}
```
