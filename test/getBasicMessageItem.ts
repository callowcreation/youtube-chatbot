import { Values } from '../Interfaces/local-settings-interface';
import * as localSettings from '../local.settings.json';

const localSettingsValues: Values = localSettings['Values'];

process.env.AzureWebJobsStorage = localSettingsValues.AzureWebJobsStorage;
process.env.FUNCTIONS_WORKER_RUNTIME = localSettingsValues.FUNCTIONS_WORKER_RUNTIME;
process.env.FUNCTIONS_EXTENSION_VERSION = localSettingsValues.FUNCTIONS_EXTENSION_VERSION;
process.env.APPINSIGHTS_INSTRUMENTATIONKEY = localSettingsValues.APPINSIGHTS_INSTRUMENTATIONKEY;
process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = localSettingsValues.APPLICATIONINSIGHTS_CONNECTION_STRING;
process.env.keyvault_account_name = localSettingsValues.keyvault_account_name;
process.env.gcp_client_id = localSettingsValues.gcp_client_id;
process.env.gcp_project_id = localSettingsValues.gcp_project_id;
process.env.gcp_auth_uri = localSettingsValues.gcp_auth_uri;
process.env.gcp_token_uri = localSettingsValues.gcp_token_uri;
process.env.gcp_auth_provider_x509_cert_url = localSettingsValues.gcp_auth_provider_x509_cert_url;
process.env.gcp_client_secret = localSettingsValues.gcp_client_secret;
process.env.redirect_uri = localSettingsValues.IS_DEV === '1' ? localSettingsValues.redirect_uri_dev : localSettingsValues.redirect_uri_prod;
process.env.bitcorn_api_url = localSettingsValues.bitcorn_api_url;
process.env.bitcorn_api_client_id = localSettingsValues.bitcorn_api_client_id;
process.env.bitcorn_api_client_secret = localSettingsValues.bitcorn_api_client_secret;
process.env.bitcorn_api_audience = localSettingsValues.bitcorn_api_audience;

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