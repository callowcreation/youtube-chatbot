import { AzureFunction, Context } from "@azure/functions"

import { google } from 'googleapis';

import { deleteLiveItem, getAllLiveItems, updateLiveItem } from "../DataAccess/live-item-repository";
import { ChatPoller, ChatResponse, Credentials, MessageItem } from "../Common/chat-poller";
import { LiveItemRecord } from "../Models/live-item-record";
import { LiveChatError } from '../Common/live-chat-error';
import { secretStore } from "../Common/secret-store";
import { executeCommand } from "../Commands/commander";
import { getRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";

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

        const promises = [];
        for (let i = 0; i < liveItems.length; i++) {
            const liveItem = liveItems[i] as LiveItemRecord;

            promises.push(secretStore.get(liveItem.id)
                .then(secret => ({
                    live_item: liveItem,
                    credentials: {
                        refresh_token: '1//06zpNYi3ndyOiCgYIARAAGAYSNwF-L9IrJ0p_9a8omGv3nxPdsULrSvs-1P5c0ncaYPg1MTDmLAGykMBH77K5C21lRgJjNVShBBk',
                        scope: SCOPES.join(' '),
                        token_type: 'Bearer',
                        access_token: secret.value
                    }
                }) as ChatPoller)
            );
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
                    }));
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
