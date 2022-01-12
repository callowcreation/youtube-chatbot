import { AzureFunction, Context, HttpRequest } from "@azure/functions"

import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Starting Auth Callback.');

    context.res = { };

    const { code } = req.query;

    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error('Error while trying to retrieve access token', err);
            context.res.status(500);
            context.res.body = { error: { code: err.code, name: err.name, message: err.message } };
        } else {
            oauth2Client.setCredentials(token);
            //storeToken(token);
        }
    });
    
    context.log('Ended Auth Callback.');
};

export default httpTrigger;