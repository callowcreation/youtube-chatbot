import { AzureFunction, Context } from "@azure/functions"

import { google } from 'googleapis';

import { deleteLiveItem, getAllLiveItems, updateLiveItem } from "../DataAccess/live-item-repository";
import { ChatPoller, ChatResponse, MessageItem } from "../Common/chat-poller";
import { LiveItemRecord } from "../Models/live-item-record";
import { LiveChatError } from '../Common/live-chat-error';
import { secretStore, verifyAndDecodeJwt } from "../Common/secret-store";
import { executeCommand } from "../Commands/commander";
import { getRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { Credentials } from "../Common/token-item";

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

async function getLiveCredentials(liveItem: LiveItemRecord): Promise<ChatPoller> {
    const keyVaultSecret = await secretStore.getJwt(liveItem.id)
        .catch(err => {
            if (err.statusCode !== 404)
                throw err;
            console.log(err);
            return { value: null };
        });

    if (keyVaultSecret.value !== null) {
        const payload = verifyAndDecodeJwt(keyVaultSecret.value) as Credentials;
        const credentials: Credentials = {
            ...payload
        };
        return {
            live_item: liveItem,
            credentials
        } as ChatPoller;
    }
}

async function getLiveChatMessages(result: ChatPoller): Promise<ChatResponse> {
    oauth2Client.setCredentials(result.credentials);
    try {

        return service.liveChatMessages.list({
            auth: oauth2Client,
            part: ['snippet'],
            liveChatId: result.live_item.liveChatId,
            pageToken: result.live_item.pageToken
        }).then(json => ({
            live_item: result.live_item as LiveItemRecord,
            data: json.data
        }) as ChatResponse);
    } catch (err) {
        if (err.code === 403) {
            const reason = err.errors[0].reason;
            switch (reason) {
                case 'liveChatEnded': {
                    // remove item from db
                    console.log(`Live chat ended removing ${result.live_item.id} item from database.`);
                    await deleteLiveItem(result.live_item.id);
                } break;
                default: {
                    // log error to db
                    console.error(err);
                } break;
            }
        }
    }
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        console.log('Chat Poller is running late!');
    }
    console.log('Chat Poller function ran!', timeStamp);

    const liveItems = await getAllLiveItems();

    if (liveItems && liveItems.length > 0) {

        const promises = [];
        for (let i = 0; i < liveItems.length; i++) {
            const liveItem = liveItems[i] as LiveItemRecord;
            promises.push(getLiveCredentials(liveItem));
        }
        const results = (await Promise.all(promises)) as ChatPoller[];

        const liveChatMessagesPromises = [];
        for (let i = 0; i < results.length; i++) {
            const result = results[i] as ChatPoller;
            liveChatMessagesPromises.push(getLiveChatMessages(result));
        }
        const liveChatResponses = (await Promise.all(liveChatMessagesPromises)) as ChatResponse[];

        const chatMessageItems = [] as MessageItem[];
        for (let i = 0; i < liveChatResponses.length; i++) {
            const { live_item, data } = liveChatResponses[i] as ChatResponse;

            try {

                if (data.offlineAt) {
                    throw new LiveChatError(`Stream went offline: ${data.offlineAt}`);
                }
                if (data.items.length > 0) {
                    console.log(data.items);
                    const messageItems = data.items.map(x => ({
                        snippet: x.snippet,
                        live_item: live_item
                    })) as MessageItem[];
                    chatMessageItems.push(...messageItems);
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
                } else {
                    // log error
                }
            }
        }

        //getRequest('http://rallydataservice.azurewebsites.net/api/coin/list')
        for (let i = 0; i < chatMessageItems.length; i++) {
            const chatMessageItem = chatMessageItems[i];
            const message = chatMessageItem.snippet.displayMessage;
            if (message.startsWith('$')) {
                try {
                    const result = await executeCommand(chatMessageItem);
                    console.log(result);
                } catch (err) {
                    console.log(err);
                    // log error
                }
            } else {
                console.log(`Just a message: ${message}`);
            }
        }
    } else {
        console.log('No Live Item Records');
    }

};

export default timerTrigger;

