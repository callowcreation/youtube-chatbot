import { AzureFunction, Context } from "@azure/functions"
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

import { google } from 'googleapis';

import { deleteUserItem, getAllUserItems, updateUserItem } from "../DataAccess/user-item-repository";
import { TokenItem } from "../Common/token-item";
import { createLiveItem, deleteLiveItem, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { LiveItemRecord } from "../Models/live-item-record";
import { api, endpoints } from "../APIAccess/api-request";
import { ApiUser } from "../APIAccess/api-user";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const SCOPES = [
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

    const fetchUserItems: ApiUser[] = await api<ApiUser[]>(endpoints.user_all);

    console.log(fetchUserItems);

    const userItems = await getAllUserItems();

    if (userItems && userItems.length > 0) {

        const credential = new DefaultAzureCredential();

        const keyVaultName = process.env["ytchatbot_KEYSTORE"];
        const url = "https://" + keyVaultName + ".vault.azure.net";

        const client = new SecretClient(url, credential);

        const promises = [];
        for (let i = 0; i < userItems.length; i++) {
            const userItem = userItems[i];

            promises.push(client.getSecret(userItem.id)
                .then(secret => {
                    // check for expired access token (secret value) and refersh if needed
                    return ({
                        id: userItem.id,
                        expiry_date: userItem.expiryDate,
                        refresh_token: userItem.refreshToken,
                        scope: userItem.scope,
                        token_type: userItem.tokenType,
                        access_token: secret.value,
                    })
                }
                ));
        }
        const results = await Promise.all(promises);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const token = {
                expiry_date: result.expiry_date,
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
