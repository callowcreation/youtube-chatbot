import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';
import { postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { makeJwtToken, secretStore } from "../Common/secret-store";
import { Credentials } from "../Interfaces/credentials-interface";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.IS_DEV === '1' ? process.env.redirect_uri_dev : process.env.redirect_uri_prod;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    console.log('Starting Auth Callback.');

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

                const expires_in = token.expiry_date - Date.now()
                const credentials: Credentials = {
                    refresh_token: token.refresh_token,
                    access_token: token.access_token,
                    scope: token.scope,
                    token_type: token.token_type,
                    expires_in: expires_in
                };

                const expiresOn = new Date();
                expiresOn.setSeconds(expiresOn.getSeconds() + credentials.expires_in);

                const payload = makeJwtToken(credentials);
                await secretStore.setJwt(channelId, payload, { expiresOn });

                const result = await postRequest(endpoints.api.user.path('updatetokens'), channelId, {
                    tokens: [
                        { youtubeId: channelId, youtubeRefreshToken: token.refresh_token }
                    ]
                });
                console.log(result);

            } else {
                console.warn(`Channel not found`);
            }
        }
    });

    console.log('Ended Auth Callback.');
};

export default httpTrigger;