import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';
import { secretStore } from "../Common/secret-store";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
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

                /*const userItemRecord = {
                    id: channelId,
                    expiryDate: token.expiry_date,
                    refreshToken: token.refresh_token,
                    scope: token.scope,
                    tokenType: token.token_type
                } as UserItemRecord;

                try {
                    await secretStore.set(channelId, token.access_token);

                    const item = await getUserItem(channelId);
                    if(item === null) {
                        await createUserItem(userItemRecord);
                    } else {
                        await updateUserItem(channelId, userItemRecord);
                    }
                } catch (err) {
                    console.error(err);
                }*/
            } else {
                console.warn(`Channel not found`);
            }
        }
    });

    console.log('Ended Auth Callback.');
};

export default httpTrigger;