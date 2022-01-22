import { AzureFunction, Context } from "@azure/functions"
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

import { google } from 'googleapis';

import { getAllUserItems, updateUserItem } from "../DataAccess/user-item-repository";
import { TokenItem } from "../Common/token-item";
import { createLiveItem, deleteLiveItem, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { LiveItemRecord } from "../Models/live-item-record";

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
        context.log('Live Poller is running late!');
    }
    context.log('Live Poller function ran!', timeStamp);

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
                .then(secret => ({
                    id: userItem.id,
                    expiry_date: userItem.expiry_date,
                    refresh_token: userItem.refresh_token,
                    scope: userItem.scope,
                    token_type: userItem.token_type,
                    access_token: secret.value,
                })
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

            const json = await service.liveBroadcasts.list({
                auth: oauth2Client,
                part: ['snippet'],
                broadcastStatus: 'active',
            });

            if (json.data.items.length > 0) {
                const streamInfo = json.data.items[0];
                const { channelId, liveChatId } = streamInfo.snippet;
                const item = await getLiveItem(channelId);
                if(item === null) {
                    const liveItem = {
                        id: channelId,
                        live_chat_id: liveChatId
                    } as LiveItemRecord;
                    await createLiveItem(liveItem);
                }
            } else {
                await deleteLiveItem(result.id);
            }
        }
    } else {

    }

};

export default timerTrigger;
