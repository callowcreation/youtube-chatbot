import { AzureFunction, Context } from "@azure/functions"

import { google } from 'googleapis';
import fetch from 'node-fetch';

import { Credentials } from "../Interfaces/credentials-interface";
import { createLiveItem, deleteLiveItem, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { LiveItemRecord } from "../Models/live-item-record";
import { getRequest } from "../APIAccess/api-request";
import { ApiUser } from "../Interfaces/api-interfaces";
import { makeJwtToken, secretStore, verifyAndDecodeJwt } from "../Common/secret-store";
import { endpoints } from '../APIAccess/endpoints';

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
];
const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.IS_DEV === '1' ? process.env.redirect_uri_dev : process.env.redirect_uri_prod;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);


async function getCredentials(youtubeId: string, youtubeRefreshToken: string): Promise<Credentials> {

    const keyVaultSecret = await secretStore.getJwt(youtubeId)
        .catch(err => {
            if (err.statusCode !== 404)
                throw err;
            console.log(err);
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

        const result = await fetch('https://accounts.google.com/o/oauth2/token', {
            method: 'POST',
            headers: {
                'Host': 'accounts.google.com',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'refresh_token',
                refresh_token: youtubeRefreshToken
            })
        });

        const json = (await result.json()) as Credentials;

        credentials.refresh_token = youtubeRefreshToken;
        credentials.access_token = json.access_token;
        credentials.scope = json.scope;
        credentials.token_type = json.token_type;
        credentials.expires_in = json.expires_in;

        const expiresOn = new Date();
        expiresOn.setSeconds(expiresOn.getSeconds() + credentials.expires_in);

        const payload = makeJwtToken(credentials);
        await secretStore.setJwt(youtubeId, payload, { expiresOn });
    } else {
        const payload = verifyAndDecodeJwt(keyVaultSecret.value) as Credentials;

        credentials.refresh_token = payload.refresh_token;
        credentials.access_token = payload.access_token;
        credentials.scope = payload.scope;
        credentials.token_type = payload.token_type;
        credentials.expires_in = payload.expires_in;
    }

    return credentials;
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        console.log('Live Poller is running late!');
    }
    console.log('Live Poller function ran!', timeStamp);

    const userItems: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path('all'));

    //console.log(userItems);

    if (userItems && userItems.length > 0) {

        const promises = [];
        for (let i = 0; i < userItems.length; i++) {

            const { userId, userIdentity: { youtubeId, youtubeRefreshToken } } = userItems[i];
            if (youtubeId === null || youtubeId === undefined) continue;

            if (youtubeId && youtubeRefreshToken) {
                try {
                    promises.push(getCredentials(youtubeId, youtubeRefreshToken));
                } catch (err) {
                    if (err.statusCode !== 404) throw err;
                    console.log(err);
                }
            } else {
                console.log(`User ${userId} has no youtube id or youtube refresh token`);
                return;
            }

        }
        const results = (await Promise.all(promises)) as Credentials[];

        for (let i = 0; i < results.length; i++) {
            const credentials = results[i];
            if (credentials === undefined) continue;
            oauth2Client.setCredentials(credentials);

            try {
                const item = await getLiveItem(credentials.id);

                const json = await service.liveBroadcasts.list({
                    auth: oauth2Client,
                    part: ['snippet'],
                    broadcastStatus: 'active',
                });

                if (json.data.items.length > 0) {
                    const streamInfo = json.data.items[0];
                    const { channelId, liveChatId } = streamInfo.snippet;

                    const liveItem = {
                        id: channelId,
                        liveChatId: liveChatId
                    } as LiveItemRecord;
                    
                    if (item === null) {
                        await createLiveItem(liveItem);
                        console.log(`Created new ${credentials.id} is live`);
                    } else {
                        liveItem.pageToken = item.pageToken;
                        await updateLiveItem(liveItem.id, liveItem);
                        console.log(`Update live item for ${credentials.id}`);
                    }
                } else { // stream may be offline
                    if (item !== null) {
                        await deleteLiveItem(item.id);
                        console.log(`Removed ${item.id} not live`);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        console.log('No user items');
    }

};

export default timerTrigger;


