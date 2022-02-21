import * as localSettings from '../src/local.settings.json';
process.env.AzureWebJobsStorage = localSettings.Values.AzureWebJobsStorage;
process.env.FUNCTIONS_WORKER_RUNTIME = localSettings.Values.FUNCTIONS_WORKER_RUNTIME;
process.env.ytchatbotdbdev_DOCUMENTDB = localSettings.Values.ytchatbotdbdev_DOCUMENTDB;
process.env.ytchatbot_KEYSTORE = localSettings.Values.ytchatbot_KEYSTORE;
process.env.client_id = localSettings.Values.client_id;
process.env.project_id = localSettings.Values.project_id;
process.env.auth_uri = localSettings.Values.auth_uri;
process.env.token_uri = localSettings.Values.token_uri;
process.env.auth_provider_x509_cert_url = localSettings.Values.auth_provider_x509_cert_url;
process.env.client_secret = localSettings.Values.client_secret;
process.env.redirect_uri = localSettings.Values.redirect_uri;
process.env.FUNCTIONS_EXTENSION_VERSION = localSettings.Values.FUNCTIONS_EXTENSION_VERSION;
process.env.APPINSIGHTS_INSTRUMENTATIONKEY = localSettings.Values.APPINSIGHTS_INSTRUMENTATIONKEY;
process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = localSettings.Values.APPLICATIONINSIGHTS_CONNECTION_STRING;
process.env.api_url = localSettings.Values.api_url;
process.env.api_client_id = localSettings.Values.api_client_id;
process.env.api_client_secret = localSettings.Values.api_client_secret;
process.env.api_audience = localSettings.Values.api_audience;

import botCommand from "../src/Commands/bot-command";
import tipCommand from "../src/Commands/tip-command";
import { MessageItem } from "../src/Interfaces/chat-poller-interfaces";

function getBasicMessageItem(): MessageItem {
    return {
        authorDetails: {
            channelId: 'UC9C8ChGYhoVcsVBa61yWa-g',
            displayName: 'Jones Cropper'
        },
        live_item: {
            id: 'UCPYqEtho6phUwdbwZahIhKg',
            liveChatId: 'KicKGFVDOUM4Q2hHWWhvVmNzVkJhNjF5V2EtZxILTDJvdGpZODJJblU',
            pageToken: null
        },
        snippet: {
            authorChannelId: 'UC9C8ChGYhoVcsVBa61yWa-g',
            displayMessage: ``,
            liveChatId: 'KicKGFVDOUM4Q2hHWWhvVmNzVkJhNjF5V2EtZxILTDJvdGpZODJJblU',
            publishedAt: ''
        }
    };
}

test('bot command message should indicate success', async () => {

    const username = 'naivebot';

    const message_item: MessageItem = getBasicMessageItem();  
    message_item.snippet.displayMessage = `$bot ${username}`;

    const result = await botCommand(message_item);
    expect(result.message === `the bot ${username} is now omitted from transactions.`);
});

test('tip command message should indicate success', async () => {

    const amount = 1;
    const coin = 'DTQ';

    const message_item: MessageItem = getBasicMessageItem();  
    message_item.snippet.displayMessage = `$tip ${amount} ${coin}`;

    const result = await tipCommand(message_item);
    expect(result.message === `tipped the broadcaster ${amount} ${coin}.`);
});

