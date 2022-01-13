import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';

import * as crypto from 'crypto';

const OAuth2 = google.auth.OAuth2;

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
const SCOPES = [
    'https://www.googleapis.com/auth/youtube',
];

const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = Buffer.from(clientId.substring(0, 16), 'utf-8');
// secret key generate 32 bytes of random data
const Securitykey = Buffer.from(clientSecret.substring(0, 32), 'utf-8');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Authorize User started');

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES
    });

    context.log('Authorize User ended');

    context.res.status(302)
        .set('location', authUrl)
        .send();
};

export default httpTrigger;