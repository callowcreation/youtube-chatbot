
// "schedule": "*/10 * * * * *"
// "schedule": "0 */1 * * * *"
import { AzureFunction, Context } from "@azure/functions"
import { google } from 'googleapis';

import { deleteLiveItem, getAllLiveItems, updateLiveItem } from "../DataAccess/live-item-repository";
import { ChatPoller, ChatResponse, MessageItem } from "../Interfaces/chat-poller-interfaces";
import { LiveItemRecord } from "../Models/live-item-record";
import { LiveChatError } from '../Errors/live-chat-error';
import { readJwt, verifyJwt } from "../Common/secret-store";
import { executeCommand } from "../Commands/commander";
import { Credentials } from "../Interfaces/credentials-interface";
import { replaceManyChatterItems } from "../DataAccess/chatter-item-repository";
import { ChatterItemRecord } from "../Models/chatter-item-record";
import { getOmittedItem } from "../DataAccess/omitted-item-repository";
import { CommandError } from "../Errors/command-error";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');

const clientSecret = process.env.gcp_client_secret;
const clientId = process.env.gcp_client_id;
const redirectUri = process.env.IS_DEV === '1' ? process.env.redirect_uri_dev : process.env.redirect_uri_prod;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

async function waitMS(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getLiveCredentials(liveItem: LiveItemRecord): Promise<ChatPoller> {
    const keyVaultSecret = await readJwt(liveItem.rowKey)
        .catch(err => {
            if (err.statusCode !== 404)
                throw err;
            console.log(err);
            return { value: null };
        });

    if (keyVaultSecret.value !== null) {
        try {
            const payload = verifyJwt(keyVaultSecret.value) as Credentials;
            const credentials: Credentials = {
                ...payload
            };
            return {
                live_item: liveItem,
                credentials
            } as ChatPoller;
        } catch (err) {
            console.error({ error_message: `getLiveCredentials error for ${liveItem.rowKey} ${err.message}`, err });
            if (err.message === 'invalid signature') {
                return null;
            }
            throw err;
        }
    }
}

async function getLiveChatMessages(result: ChatPoller): Promise<ChatResponse> {
    try {
        oauth2Client.setCredentials(result.credentials);

        return service.liveChatMessages.list({
            auth: oauth2Client,
            part: ['snippet', 'authorDetails'],
            liveChatId: result.live_item.liveChatId,
            pageToken: result.live_item.pageToken
        }).then(json => ({
            credentials: result.credentials,
            live_item: result.live_item as LiveItemRecord,
            data: json.data
        }) as ChatResponse);
    } catch (err) {
        if (err.code === 403) {
            const reason = err.errors[0].reason;
            switch (reason) {
                case 'liveChatEnded': {
                    // remove item from db
                    console.log(`Live chat ended removing ${result.live_item.rowKey} item from database.`);
                    await deleteLiveItem(result.live_item.rowKey);
                } break;
                default: {
                    // log error to db
                    console.error({ error_message: `getLiveChatMessages channelId: ${result.live_item.rowKey}` }, err);
                } break;
            }
        }
    }
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        console.log({ log_message: 'Chat Poller is running late!' });
    }

    const liveItems = await getAllLiveItems();

    if (liveItems.length === 0) {
        console.log({ log_message: 'No Live Item Records' });
        return;
    }

    const promises = [];
    for (let i = 0; i < liveItems.length; i++) {
        const liveItem = liveItems[i] as LiveItemRecord;
        promises.push(getLiveCredentials(liveItem));
    }
    const results = (await Promise.all(promises)) as ChatPoller[];

    const liveChatResponses = [];
    for (let i = 0; i < results.length; i++) {
        const result = results[i] as ChatPoller;

        await waitMS(250);
        const messagePoll = await getLiveChatMessages(result);

        liveChatResponses.push(messagePoll);
    }

    const chatMessageItems = [] as MessageItem[];
    for (let i = 0; i < liveChatResponses.length; i++) {
        const { credentials, live_item, data } = liveChatResponses[i] as ChatResponse;

        try {

            if (data.offlineAt) {
                throw new LiveChatError(`Stream went offline: ${data.offlineAt}`);
            }
            if (data.items.length > 0) {
                //console.log(data.items);
                const messageItems = data.items.map(x => ({
                    credentials: credentials,
                    authorDetails: x.authorDetails,
                    snippet: x.snippet,
                    live_item: live_item
                })) as MessageItem[];
                chatMessageItems.push(...messageItems);
            }
            if (data.nextPageToken) {
                const liveItem = {
                    rowKey: live_item.rowKey,
                    liveChatId: live_item.liveChatId,
                    pageToken: data.nextPageToken
                } as LiveItemRecord;
                await updateLiveItem(liveItem);
            }
        } catch (err) {
            if (err instanceof LiveChatError) {
                console.error({ error_message: `Chat Poller LiveChatError channelId: ${live_item.rowKey}` }, err);
                await deleteLiveItem(live_item.rowKey);
            } else {
                // log error
                console.error({ error_message: `Chat Poller channelId: ${live_item.rowKey}` }, err);
            }
        }
    }

    const chatterItemRecords = chatMessageItems.map(x => {
        return {
            rowKey: x.snippet.authorChannelId,
            partitionKey: x.live_item.rowKey,
            liveChatId: x.live_item.liveChatId,
            displayName: x.authorDetails.displayName,
            displayMessage: x.snippet.displayMessage
        } as ChatterItemRecord;
    });

    if (chatterItemRecords.length > 0) {

        const promises: Promise<string>[] = [];
        for (let i = 0; i < chatterItemRecords.length; i++) {
            const { displayName, partitionKey: channelId } = chatterItemRecords[i];
            const promise = getOmittedItem(channelId, displayName)
                .then(x => x ? x.rowKey : '')
                .catch(e => {
                    if (e.statusCode !== 404) throw e;
                    return null;
                });
            promises.push(promise);
        }
        const omittedResults = await Promise.all(promises);

        const withoutOmittedItems: ChatterItemRecord[] = chatterItemRecords.filter(x => x && !omittedResults.includes(x.displayName));
        if (withoutOmittedItems.length > 0) {
                /*const result =*/ await replaceManyChatterItems(withoutOmittedItems);
            //console.log({ result });
        }
    }

    for (let i = 0; i < chatMessageItems.length; i++) {

        const chatMessageItem = chatMessageItems[i];
        const message = chatMessageItem.snippet.displayMessage;
        if (message.startsWith('$')) {
            try {
                const result = await executeCommand(chatMessageItem);
                //console.log(result);
                if (result.send === true) {
                    await waitMS(100);
                    oauth2Client.setCredentials(chatMessageItem.credentials);
                    const json = await service.liveChatMessages.insert({
                        auth: oauth2Client,
                        part: ['snippet'],
                        requestBody: {
                            snippet: {
                                liveChatId: chatMessageItem.live_item.liveChatId,
                                type: "textMessageEvent",
                                textMessageDetails: {
                                    messageText: `@${chatMessageItem.authorDetails.displayName} ${result.message}`
                                }
                            }
                        }
                    });
                    console.log({ json });
                }
            } catch (err) {
                if (err instanceof CommandError) {
                    console.error({ error_message: `CommandError chat message: ${chatMessageItem.snippet.displayMessage}` }, err);
                    if (err.send === true) {
                        await waitMS(100);
                        oauth2Client.setCredentials(chatMessageItem.credentials);
                        const json = await service.liveChatMessages.insert({
                            auth: oauth2Client,
                            part: ['snippet'],
                            requestBody: {
                                snippet: {
                                    liveChatId: chatMessageItem.live_item.liveChatId,
                                    type: "textMessageEvent",
                                    textMessageDetails: {
                                        messageText: `@${chatMessageItem.authorDetails.displayName} $${err.name} command failed.  ${err.message}`
                                    }
                                }
                            }
                        }).catch(e => {
                            console.error({ error_message: `CommandError liveChatMessages insert channelId: ${chatMessageItem.live_item.rowKey}` }, e);
                        });

                        console.log({ json });
                    }
                } else {
                    // log error
                    console.error({ error_message: `Error processing chat message: ${chatMessageItem.snippet.displayMessage}` }, err);
                }
            }
        } else {
            console.log({ log_message: `Just a message: ${message}` });
        }
    }
};

export default timerTrigger;
