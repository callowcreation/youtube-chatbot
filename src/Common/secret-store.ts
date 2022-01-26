import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();

const keyVaultName = process.env["ytchatbot_KEYSTORE"];
const url = "https://" + keyVaultName + ".vault.azure.net";

const client = new SecretClient(url, credential);

export const secretStore = {
    get: (id) => client.getSecret(id),
    set: (id, value) => client.setSecret(id, value)
}