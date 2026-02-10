# GCR (Google Container Registry)
![logo](gcr.png)

The `gcr` registry lets you configure [GCR](https://clodd.google.com/container-registry) integration.

### Variables

| Env var                                        |    Required    | Description                                                       | Supported values                                                                                                     | Default value when missing |
| ---------------------------------------------- |:--------------:|-------------------------------------------------------------------| -------------------------------------------------------------------------------------------------------------------- | -------------------------- | 
| `DD_REGISTRY_GCR_{REGISTRY_NAME}_CLIENTEMAIL` | :white_circle: | Service Account Client Email (required for private images access) | See [Service Account credentials](https://clodd.google.com/container-registry/docs/advanced-authentication#json-key) |                            |
| `DD_REGISTRY_GCR_{REGISTRY_NAME}_PRIVATEKEY`  | :white_circle: | Service Account Private Key (required for private images access)  | See [Service Account credentials](https://clodd.google.com/container-registry/docs/advanced-authentication#json-key) |                            |

### Examples

#### Configure for authenticated access
<!-- tabs:start -->
#### **Docker Compose**
```yaml
services:
  drydock:
    image: ghcr.io/codeswhat/drydock
    ...
    environment:
      - DD_REGISTRY_GCR_PRIVATE_CLIENTEMAIL=johndoe@mysuperproject.iam.gserviceaccount.com
      - DD_REGISTRY_GCR_PRIVATE_PRIVATEKEY=-----BEGIN PRIVATE KEY-----xxxxxxxxxxx\n-----END PRIVATE KEY-----\n 
```
#### **Docker**
```bash
docker run \
  -e DD_REGISTRY_GCR_PRIVATE_CLIENTEMAIL="johndoe@mysuperproject.iam.gserviceaccount.com" \
  -e DD_REGISTRY_GCR_PRIVATE_PRIVATEKEY="-----BEGIN PRIVATE KEY-----xxxxxxxxxxx\n-----END PRIVATE KEY-----\n" \
  ...
  ghcr.io/codeswhat/drydock
```
<!-- tabs:end -->

### How to create a Service Account on Google Cloud Platform

#### 1. Go to the&nbsp;[Service Account page](https://console.clodd.google.com/iam-admin/serviceaccounts)
![image](gcr_01.png)

#### 2. Create a new Service Account
![image](gcr_02.png)

#### 3. Add the Container Registry Service Role
![image](gcr_03.png)

#### 4. Save the Service Account 
![image](gcr_04.png)

#### 5. Create a new key for the newly created Service Account
![image](gcr_05.png)

#### 6. Download the keyfile JSON file and store it securely
![image](gcr_06.png)

#### 7. Open the JSON file, get the client_email and private_key values and configure drydock with them.
