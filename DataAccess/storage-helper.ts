import { TableClient } from "@azure/data-tables";

export function getStorageTableClient(tableName: string): TableClient {
    return new TableClient(process.env.storage_table_url, tableName);
}