import { TableClient } from "@azure/data-tables";

const storageUrl = `https://${process.env.storage_account_name}.table.core.windows.net`; //process.env["TABLES_URL"] || "";
const sasToken = process.env.storage_table_sas;

export function getStorageTableClient(tableName: string): TableClient {
    const client = new TableClient(`${storageUrl}${sasToken}`, tableName);
    return client;
}