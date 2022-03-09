import * as localSettings from '../local.settings.json';
process.env.AzureWebJobsStorage = localSettings.Values.AzureWebJobsStorage;
process.env.FUNCTIONS_WORKER_RUNTIME = localSettings.Values.FUNCTIONS_WORKER_RUNTIME;
process.env.ytchatbot_KEYSTORE = localSettings.Values.ytchatbot_KEYSTORE;
process.env.client_id = localSettings.Values.client_id;
process.env.project_id = localSettings.Values.project_id;
process.env.auth_uri = localSettings.Values.auth_uri;
process.env.token_uri = localSettings.Values.token_uri;
process.env.auth_provider_x509_cert_url = localSettings.Values.auth_provider_x509_cert_url;
process.env.client_secret = localSettings.Values.client_secret;
process.env.redirect_uri = localSettings.Values.IS_DEV === '1' ? localSettings.Values.redirect_uri_dev : localSettings.Values.redirect_uri_prod;
process.env.FUNCTIONS_EXTENSION_VERSION = localSettings.Values.FUNCTIONS_EXTENSION_VERSION;
process.env.APPINSIGHTS_INSTRUMENTATIONKEY = localSettings.Values.APPINSIGHTS_INSTRUMENTATIONKEY;
process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = localSettings.Values.APPLICATIONINSIGHTS_CONNECTION_STRING;
process.env.api_url = localSettings.Values.api_url;
process.env.api_client_id = localSettings.Values.api_client_id;
process.env.api_client_secret = localSettings.Values.api_client_secret;
process.env.api_audience = localSettings.Values.api_audience; 

import { MessageItem } from "../Interfaces/chat-poller-interfaces";

export const CHANNEL_ID = 'UC9C8ChGYhoVcsVBa61yWa-g'; // caLLowCreation
export const AUTHOR_ID = 'UCPYqEtho6phUwdbwZahIhKg'; // Jones Cropper
export const AUTHOR_NAME = 'Jones Cropper';

export interface BasicMessageArgs {
    channelId: string,
    displayMessage: string,
    authorId: string,
    authorName: string
}

export function getBasicMessageItem(basicMessageArgs: BasicMessageArgs): MessageItem {
    return {
        authorDetails: {
            channelId: basicMessageArgs.authorId,
            displayName: basicMessageArgs.authorName
        },
        live_item: {
            rowKey: basicMessageArgs.channelId,
            liveChatId: 'KicKGFVDOUM4Q2hHWWhvVmNzVkJhNjF5V2EtZxILTDJvdGpZODJJblU',
            pageToken: null
        },
        snippet: {
            authorChannelId: basicMessageArgs.authorId,
            displayMessage: basicMessageArgs.displayMessage,
            liveChatId: 'KicKGFVDOUM4Q2hHWWhvVmNzVkJhNjF5V2EtZxILTDJvdGpZODJJblU',
            publishedAt: ''
        }
    };
}