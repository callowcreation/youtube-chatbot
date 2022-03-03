import * as localSettings from '../local.settings.json';

export default function () {
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
    process.env.redirect_uri = localSettings.Values.IS_DEV === '1' ? localSettings.Values.redirect_uri_dev : localSettings.Values.redirect_uri_prod;
    process.env.FUNCTIONS_EXTENSION_VERSION = localSettings.Values.FUNCTIONS_EXTENSION_VERSION;
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY = localSettings.Values.APPINSIGHTS_INSTRUMENTATIONKEY;
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = localSettings.Values.APPLICATIONINSIGHTS_CONNECTION_STRING;
    process.env.api_url = localSettings.Values.api_url;
    process.env.api_client_id = localSettings.Values.api_client_id;
    process.env.api_client_secret = localSettings.Values.api_client_secret;
    process.env.api_audience = localSettings.Values.api_audience;    
}