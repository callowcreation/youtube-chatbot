import { AzureFunction, Context } from "@azure/functions"

import { google } from 'googleapis';

import { TokenItem } from "../Common/token-item";
import { createLiveItem, deleteLiveItem, getLiveItem } from "../DataAccess/live-item-repository";
import { LiveItemRecord } from "../Models/live-item-record";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { ApiUser } from "../APIAccess/api-user";
import { secretStore } from "../Common/secret-store";
import { endpoints } from '../APIAccess/endpoints';

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
];
const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

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
            
            /*const result = await postRequest(endpoints.api.user.path('updatetokens'), youtubeId, {
                tokens:[
                    {youtubeId, youtubeRefreshToken: '1//06zpNYi3ndyOiCgYIARAAGAYSNwF-L9IrJ0p_9a8omGv3nxPdsULrSvs-1P5c0ncaYPg1MTDmLAGykMBH77K5C21lRgJjNVShBBk'}
                ]
            });
            console.log(result);*/
            
            /*if(youtubeId) {
                const item: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path(`${platform}|${youtubeId}`));
                console.log({ item });
            } else {
                console.log(`User ${userId} has no youtube id`);
            }*/


            promises.push(
                secretStore.get(youtubeId)
                    .then(secret => {
                        // check for expired access token (secret value) and refersh if needed
                        return ({
                            id: youtubeId,
                            refresh_token: youtubeRefreshToken,
                            scope: SCOPES.join(' '),
                            token_type: 'Bearer',
                            access_token: secret.value,
                        })
                    }).catch(err => {
                        if(err.statusCode !== 404) throw err;
                        console.log(err);
                    })
            );
        }
        const results = await Promise.all(promises);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if(result === undefined) continue;
            const token = {
                refresh_token: result.refresh_token,
                scope: result.scope,
                token_type: result.token_type,
                access_token: result.value,
            } as TokenItem;
            oauth2Client.setCredentials(token);

            try {
                const item = await getLiveItem(result.id);

                const json = await service.liveBroadcasts.list({
                    auth: oauth2Client,
                    part: ['snippet'],
                    broadcastStatus: 'active',
                });

                if (json.data.items.length > 0) {
                    if (item === null) {
                        const streamInfo = json.data.items[0];
                        const { channelId, liveChatId } = streamInfo.snippet;
                        const liveItem = {
                            id: channelId,
                            liveChatId: liveChatId
                        } as LiveItemRecord;
                        await createLiveItem(liveItem);
                        console.log(`Created new ${result.id} is live`);
                    } else {
                        console.log(`Live item exists for ${result.id}`);
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
