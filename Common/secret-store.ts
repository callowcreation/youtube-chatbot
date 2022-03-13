import { DefaultAzureCredential } from "@azure/identity";
import { KeyVaultSecret, SecretClient, SetSecretOptions } from "@azure/keyvault-secrets";
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
 export function verifyJwt(token: string): APICredentials | Credentials {
    return jsonwebtoken.verify(token, jwt_secret, { algorithms: ['HS256'] });
}

/**
 * Creates a jwt
 * @param payload the javascript object to create in the jwt payload
 * @returns the jwt as a string
 */
 export function signJwt(payload: Credentials | Cached) {
    return jsonwebtoken.sign(payload, jwt_secret, { algorithm: 'HS256' });
}

/**
 * 
 * @param id channel id
 * @returns the keystore secret containing a jwt 
 */
export async function readJwt(id: string): Promise<KeyVaultSecret> {
    return client.getSecret(id);
}

/**
 * 
 * @param id channel id the key for the secret
 * @param jwt_token the jwt to store
 * @param options options to dictate how the secret is handled
 * @returns the keystore secret containing a jwt 
 */
export async function writeJwt(id: string, jwt_token: string, options: SetSecretOptions): Promise<KeyVaultSecret> {
    return client.setSecret(id, jwt_token, options);
}
