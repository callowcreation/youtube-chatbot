import { AzureFunction, Context } from "@azure/functions"
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

import { google } from 'googleapis';

import { deleteLiveItem, getAllLiveItems, getLiveItem, updateLiveItem } from "../DataAccess/live-item-repository";
import { getUserItem } from "../DataAccess/user-item-repository";
import { TokenItem } from "../Common/token-item";
import { ChatPoller, ChatResponse, Credentials } from "../Common/chat-poller";
import { LiveItemRecord } from "../Models/live-item-record";
import { LiveChatError } from '../Common/live-chat-error';

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

async function getLiveChatMessages(result: ChatPoller) {
    oauth2Client.setCredentials(result.credentials);
    return service.liveChatMessages.list({
        auth: oauth2Client,
        part: ['snippet'],
        liveChatId: result.live_item.liveChatId,
        pageToken: result.live_item.pageToken
    }).then(json => ({
        live_item: result.live_item as LiveItemRecord,
        data: json.data
    }) as ChatResponse)
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        console.log('Chat Poller is running late!');
    }
    console.log('Chat Poller function ran!', timeStamp);

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
                    .then(secret => ({
                        live_item: liveItem,
                        credentials: {
                            expiry_date: userItem.expiryDate,
                            refresh_token: userItem.refreshToken,
                            scope: userItem.scope,
                            token_type: userItem.tokenType,
                            access_token: secret.value
                        }
                    }) as ChatPoller)
                )
            );
        }
        const results = (await Promise.all(promises)) as ChatPoller[];

        const liveChatMessagesPromises = [];
        for (let i = 0; i < results.length; i++) {
            const result = results[i] as ChatPoller;
            liveChatMessagesPromises.push(getLiveChatMessages(result));
        }
        const liveChatResponses = (await Promise.all(liveChatMessagesPromises)) as ChatResponse[];

        for (let i = 0; i < liveChatResponses.length; i++) {
            const { live_item, data } = liveChatResponses[i] as ChatResponse;

            try {

                if (data.offlineAt) {
                    throw new LiveChatError(`Stream went offline: ${data.offlineAt}`);
                }
                if (data.items.length > 0) {
                    console.log(data.items);
                }
                if (data.nextPageToken) {
                    const liveItem = {
                        id: live_item.id,
                        liveChatId: live_item.liveChatId,
                        pageToken: data.nextPageToken
                    } as LiveItemRecord;
                    await updateLiveItem(live_item.id, liveItem);
                }
            } catch (err) {
                if (err instanceof LiveChatError) {
                    console.log(err.message);
                    await deleteLiveItem(live_item.id);
                } else if (err.code === 403) {
                    const reason = err.errors[0].reason;
                    switch (reason) {
                        case 'liveChatEnded': {
                            // remove item from db
                            console.log(`Live chat ended removing ${live_item.id} item from database.`);
                            await deleteLiveItem(live_item.id);
                        } break;
                        default: {
                            // log error to db
                            console.error(err);
                        } break;
                    }
                }
            }
        }
    } else {
        console.log('No Live Item Records');
    }

};

export default timerTrigger;
