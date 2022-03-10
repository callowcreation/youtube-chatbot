import { AzureFunction, Context } from "@azure/functions"

import { google } from 'googleapis';
import fetch from 'node-fetch';

import { Credentials } from "../Interfaces/credentials-interface";
import { createLiveItem, deleteLiveItem, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { LiveItemRecord } from "../Models/live-item-record";
import { getRequest } from "../APIAccess/api-request";
import { ApiUser } from "../Interfaces/api-interfaces";
import { secretStore, jwtToken } from "../Common/secret-store";
import { endpoints } from '../APIAccess/endpoints';

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
];
const clientSecret = process.env.gcp_client_secret;
const clientId = process.env.gcp_client_id;
const redirectUri = process.env.IS_DEV === '1' ? process.env.redirect_uri_dev : process.env.redirect_uri_prod;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);


function setCredentials(credentials: Credentials, youtubeRefreshToken: string, json: Credentials) {
    credentials.refresh_token = youtubeRefreshToken;
    credentials.access_token = json.access_token;
    credentials.scope = json.scope;
    credentials.token_type = json.token_type;
    credentials.expires_in = json.expires_in;
}

async function fetchCredentialsJWT(youtubeRefreshToken: string, credentials: Credentials) {
    const json = await fetchCredentials(youtubeRefreshToken);

    setCredentials(credentials, youtubeRefreshToken, json);

    const expiresOn = new Date();
    expiresOn.setSeconds(expiresOn.getSeconds() + credentials.expires_in);

    const jwttoken = jwtToken.sign(credentials);
    return { jwttoken, expiresOn };
}

async function fetchCredentials(youtubeRefreshToken: string): Promise<Credentials> {
    const result = await fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        headers: {
            'Host': 'accounts.google.com',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            gcp_client_id: clientId,
            gcp_client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: youtubeRefreshToken
        })
    });

    const json = (await result.json()) as Credentials;
    return json;
}

async function getCredentials(youtubeId: string, youtubeRefreshToken: string): Promise<Credentials> {

    const keyVaultSecret = await secretStore.getJwt(youtubeId)
        .catch(err => {
            if (err.statusCode !== 404) {
                console.error({ error_message: `getCredentials youtubeId: ${youtubeId} youtubeRefreshToken: ${youtubeRefreshToken}` }, err);
                throw err;
            }
            return { value: null };
        });

    const credentials: Credentials = {
        id: youtubeId,
        refresh_token: youtubeRefreshToken,
        scope: SCOPES.join(' '),
        token_type: 'Bearer',
        access_token: '',
        expires_in: 0
    };

    if (keyVaultSecret.value === null) {
        const { jwttoken, expiresOn } = await fetchCredentialsJWT(youtubeRefreshToken, credentials);
        await secretStore.setJwt(youtubeId, jwttoken, { expiresOn });
    } else {
        const payload = jwtToken.verify(keyVaultSecret.value) as Credentials;

        if (payload.access_token === null || payload.access_token === undefined) {
            const { jwttoken, expiresOn } = await fetchCredentialsJWT(youtubeRefreshToken, credentials);        
            await secretStore.setJwt(youtubeId, jwttoken, { expiresOn });
        } else {
            /*credentials.refresh_token = payload.refresh_token;
            credentials.access_token = payload.access_token;
            credentials.scope = payload.scope;
            credentials.token_type = payload.token_type;
            credentials.expires_in = payload.expires_in;*/   
            
            setCredentials(credentials, payload.refresh_token, payload);

        }
    }

    return credentials;
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        console.log('Live Poller is running late!');
    }
    console.log({ log_message: 'Live Poller function ran, timestamp: ' + timeStamp });

    const userItems: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path('all'));

    console.log({ log_message: `Got ${userItems.length} ApiUsers` });

    if (userItems && userItems.length > 0) {

        const promises = [];
        for (let i = 0; i < userItems.length; i++) {

            const { userId, userIdentity: { youtubeId, youtubeUsername, youtubeRefreshToken } } = userItems[i];
            if (youtubeId === null || youtubeId === undefined) continue;

            if (youtubeId && youtubeRefreshToken) {
                try {
                    promises.push(getCredentials(youtubeId, youtubeRefreshToken));
                } catch (err) {
                    if (err.statusCode !== 404) {
                        console.error({ error_message: `${youtubeUsername} id ${userId} youtubeRefreshToken: ${youtubeRefreshToken}` }, err);
                        throw err;
                    }
                }
            } else {
                console.warn({ warn_message: `User ${youtubeUsername} id ${userId} has no youtube id or youtube refresh token` });
            }

        }
        const results = (await Promise.all(promises)) as Credentials[];

        for (let i = 0; i < results.length; i++) {
            const credentials = results[i];
            if (credentials === undefined) continue;
            if (credentials.access_token === null || credentials.access_token === undefined) {
                console.log({ log_message: `User not sync'd`, credentials });
                continue;
            }
            oauth2Client.setCredentials(credentials);

            try {
                const item = await getLiveItem(credentials.id).catch(e => {
                    if (e.statusCode !== 404) {
                        console.error({ error_message: `getLiveItem ${credentials.id}` }, e);
                        throw e;
                    }
                    return null;
                });

                const json = await service.liveBroadcasts.list({
                    auth: oauth2Client,
                    part: ['snippet'],
                    broadcastStatus: 'active',
                });

                if (json.data.items.length > 0) {
                    const streamInfo = json.data.items[0];
                    const { channelId, liveChatId } = streamInfo.snippet;

                    const liveItem = {
                        rowKey: channelId,
                        liveChatId: liveChatId
                    } as LiveItemRecord;

                    if (item === null) {
                        await createLiveItem(liveItem);
                        console.log({ log_message: `Created new ${credentials.id} is live` });
                    } else {
                        liveItem.pageToken = item.pageToken;
                        await updateLiveItem(liveItem);
                        console.log({ log_message: `Update live item for ${credentials.id}` });
                    }
                } else { // stream may be offline
                    if (item !== null) {
                        await deleteLiveItem(item.rowKey);
                        console.log({ log_message: `Removed ${item.rowKey} not live` });
                    }
                }
            } catch (err) {
                console.error({ error_message: 'invalid_grant' }, err);
            }
        }
    } else {
        console.log({ log_message: 'No user items' });
    }

};

export default timerTrigger;