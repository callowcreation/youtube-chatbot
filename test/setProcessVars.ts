import * as localSettings from '../local.settings.json';

export default function () {
    process.env.AzureWebJobsStorage = localSettings.Values.AzureWebJobsStorage;
    process.env.FUNCTIONS_WORKER_RUNTIME = localSettings.Values.FUNCTIONS_WORKER_RUNTIME;
    process.env.keyvault_account_name = localSettings.Values.keyvault_account_name;
    process.env.gcp_client_id = localSettings.Values.gcp_client_id;
    process.env.gcp_project_id = localSettings.Values.gcp_project_id;
    process.env.gcp_auth_uri = localSettings.Values.gcp_auth_uri;
    process.env.gcp_token_uri = localSettings.Values.gcp_token_uri;
    process.env.gcp_auth_provider_x509_cert_url = localSettings.Values.gcp_auth_provider_x509_cert_url;
    process.env.gcp_client_secret = localSettings.Values.gcp_client_secret;
    process.env.redirect_uri = localSettings.Values.IS_DEV === '1' ? localSettings.Values.redirect_uri_dev : localSettings.Values.redirect_uri_prod;
    process.env.FUNCTIONS_EXTENSION_VERSION = localSettings.Values.FUNCTIONS_EXTENSION_VERSION;
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY = localSettings.Values.APPINSIGHTS_INSTRUMENTATIONKEY;
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = localSettings.Values.APPLICATIONINSIGHTS_CONNECTION_STRING;
    process.env.bitcorn_api_url = localSettings.Values.bitcorn_api_url;
    process.env.bitcorn_api_client_id = localSettings.Values.bitcorn_api_client_id;
    process.env.bitcorn_api_client_secret = localSettings.Values.bitcorn_api_client_secret;
    process.env.bitcorn_api_audience = localSettings.Values.bitcorn_api_audience;    
}