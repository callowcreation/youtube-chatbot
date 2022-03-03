import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.IS_DEV === '1' ? process.env.redirect_uri_dev : process.env.redirect_uri_prod;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    console.log('Authorize User started');

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES
    });

    console.log('Authorize User ended');

    context.res.status(302)
        .set('location', authUrl)
        .send();
};

export default httpTrigger;