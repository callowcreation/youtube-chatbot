import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

import { google } from 'googleapis';
import { createUserItem } from "../DataAccess/user-item-repository";
import { UserItemRecord } from "../Models/user-item-record";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Starting Auth Callback.');

    context.res = {};

    const { code } = req.query;

    oauth2Client.getToken(code, async (err, token) => {
        if (err) {
            console.error('Error while trying to retrieve access token', err);
            context.res.status(500);
            context.res.body = { error: { code: err.code, name: err.name, message: err.message } };
        } else {
            oauth2Client.setCredentials(token);

            const json = await service.channels.list({
                auth: oauth2Client,
                part: ['snippet'],
                mine: true
            });

            if (json.data.items.length > 0) {

                const streamInfo = json.data.items[0];
                const channelId = streamInfo.id;

                const userItemRecord = {
                    id: channelId,
                    expiry_date: token.expiry_date,
                    refresh_token: token.refresh_token
                } as UserItemRecord;

                const credential = new DefaultAzureCredential();

                const keyVaultName = process.env["ytchatbot_KEYSTORE"];
                const url = "https://" + keyVaultName + ".vault.azure.net";
              
                const client = new SecretClient(url, credential);
              
                await client.setSecret(channelId, token.access_token);

                createUserItem(userItemRecord);
            } else {
                context.log.warn(`Channel not found`);
            }
        }
    });

    context.log('Ended Auth Callback.');
};

export default httpTrigger;