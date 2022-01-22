import { AzureFunction, Context } from "@azure/functions"
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

import { google } from 'googleapis';

import { getAllLiveItems, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { getUserItem } from "../DataAccess/user-item-repository";
import { TokenItem } from "../Common/token-item";
import { ChatPoller, Credentials } from "../Common/chat-poller";
import { LiveItemRecord } from "../Models/live-item-record";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('Chat Poller is running late!');
    }
    context.log('Chat Poller function ran!', timeStamp);

    const liveItems = await getAllLiveItems();

    if (liveItems && liveItems.length > 0) {

        const credential = new DefaultAzureCredential();

        const keyVaultName = process.env["ytchatbot_KEYSTORE"];
        const url = "https://" + keyVaultName + ".vault.azure.net";

        const client = new SecretClient(url, credential);

        const promises = [];
        for (let i = 0; i < liveItems.length; i++) {
            const liveItem = liveItems[i] as LiveItemRecord;

            promises.push(getUserItem(liveItem.id)
                .then(userItem => client.getSecret(liveItem.id)
                    .then(secret => {
                        return {
                            live_item: liveItem,
                            credentials: {
                                expiry_date: userItem.expiry_date,
                                refresh_token: userItem.refresh_token,
                                scope: userItem.scope,
                                token_type: userItem.token_type,
                                access_token: secret.value
                            }
                        } as ChatPoller;
                    })));
        }
        const results = await Promise.all(promises);

        for (let i = 0; i < results.length; i++) {

            const result = results[i] as ChatPoller;

            oauth2Client.setCredentials(result.credentials);

            const json = await service.liveChatMessages.list({
                auth: oauth2Client,
                part: ['snippet'],
                liveChatId: result.live_item.live_chat_id,
                pageToken: result.live_item.page_token
            });
            if(json.data.items.length > 0) {
                console.log(json.data.items);
            }
            if (json.data.nextPageToken) {
                const liveItem = {
                    id: result.live_item.id,
                    live_chat_id: result.live_item.live_chat_id,
                    page_token: json.data.nextPageToken
                } as LiveItemRecord;
                await updateLiveItem(result.live_item.id, liveItem);
            }
        }
    } else {
        console.log('No Live Item Records');
    }

};

export default timerTrigger;
