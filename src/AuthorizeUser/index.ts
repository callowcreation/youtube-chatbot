import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
const SCOPES = [
    'https://www.googleapis.com/auth/youtube',
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Authorize User started');

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    context.log('Authorize User ended');

    context.res.status(302)
        .set('location', authUrl)
        .send();
};

export default httpTrigger;