import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient, SetSecretOptions } from "@azure/keyvault-secrets";
import * as jsonwebtoken from 'jsonwebtoken';


const secret = Buffer.from(process.env.client_secret, 'base64');
const keyVaultName = process.env["ytchatbot_KEYSTORE"];
const url = "https://" + keyVaultName + ".vault.azure.net";

const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

export function verifyAndDecodeJwt(jwt_token: string) {
    return jsonwebtoken.verify(jwt_token, secret, { algorithms: ['HS256'] });
}

export function makeJwtToken(payload: any) {
    return jsonwebtoken.sign(payload, secret, { algorithm: 'HS256' });
}

export const secretStore = {
    getJwt: (id: string) => client.getSecret(id),
    setJwt: (id: string, jwt_token: string, options: SetSecretOptions) => client.setSecret(id, jwt_token, options)
}