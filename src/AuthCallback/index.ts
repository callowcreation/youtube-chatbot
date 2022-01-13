import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';
import * as crypto from 'crypto';

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = Buffer.from(clientId.substring(0, 16), 'utf-8');
// secret key generate 32 bytes of random data
const Securitykey = Buffer.from(clientSecret.substring(0, 32), 'utf-8');

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

            const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

            let encryptedData = cipher.update(JSON.stringify(token), "binary", "binary");

            encryptedData += cipher.final("binary");

            //storeToken(encryptedData);
            const json = await service.liveBroadcasts.list({
                auth: oauth2Client,
                part: ['snippet'],
                broadcastStatus: 'active',
            });

            if (json.data.items.length > 0) {
                const streamInfo = json.data.items[0];
                const liveChatId = streamInfo.snippet.liveChatId;
                /*if (!liveChatsInfos.find(x => x.liveChatId == liveChatId)) {
                    liveChatsInfos.push({ liveChatId, pageToken: null });
                }*/
                console.log({ streamInfo });
                //res.send('Welcome to my live stream');
            } else {
                //res.send('Stream is not live atm');
            }
        }
    });

    context.log('Ended Auth Callback.');
};

export default httpTrigger;