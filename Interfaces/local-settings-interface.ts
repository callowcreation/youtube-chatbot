
export interface Values {
    AzureWebJobsStorage: string;
    FUNCTIONS_WORKER_RUNTIME: string;
    FUNCTIONS_EXTENSION_VERSION: string;
    APPINSIGHTS_INSTRUMENTATIONKEY: string;
    APPLICATIONINSIGHTS_CONNECTION_STRING: string;
    AZURE_CLIENT_ID: string;
    AZURE_TENANT_ID: string;
    AZURE_CLIENT_SECRET: string;
    keyvault_account_name: string;
    storage_account_name: string;
    storage_access_key: string;
    storage_table_sas: string;
    gcp_client_id: string;
    gcp_project_id: string;
    gcp_auth_uri: string;
    gcp_token_uri: string;
    gcp_auth_provider_x509_cert_url: string;
    gcp_client_secret: string;
    bitcorn_api_url: string;
    bitcorn_api_client_id: string;
    bitcorn_api_client_secret: string;
    bitcorn_api_audience: string;
    redirect_uri_dev: string;
    redirect_uri_prod: string;
    generated_secret_for_jwt_token: string;
    IS_DEV: string;
}

export interface LocalSettings {
    IsEncrypted: boolean;
    Values: Values;
    ConnectionStrings: any;
}