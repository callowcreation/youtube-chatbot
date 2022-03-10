import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient, SetSecretOptions } from "@azure/keyvault-secrets";
import * as jsonwebtoken from 'jsonwebtoken';

import { Cached } from "../Interfaces/api-interfaces";
import { APICredentials, Credentials } from "../Interfaces/credentials-interface";

const jwt_secret = Buffer.from(process.env.generated_secret_for_jwt_token, 'base64');
const keyVaultName = process.env["keyvault_account_name"];
const url = "https://" + keyVaultName + ".vault.azure.net";

const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

/**
 * Verifies and decodes a jwt
 * @param token a jwt to verify and decode
 * @returns the javascript object based on the allowed types
 */
function verify(token: string): APICredentials | Credentials {
    return jsonwebtoken.verify(token, jwt_secret, { algorithms: ['HS256'] });
}

/**
 * Creates a jwt
 * @param payload the javascript object to create in the jwt payload
 * @returns the jwt as a string
 */
function sign(payload: Credentials | Cached) {
    return jsonwebtoken.sign(payload, jwt_secret, { algorithm: 'HS256' });
}

export const jwtToken = {
    sign,
    verify
}

export const secretStore = {
    getJwt: (id: string) => client.getSecret(id),
    setJwt: (id: string, jwt_token: string, options: SetSecretOptions) => client.setSecret(id, jwt_token, options)
}