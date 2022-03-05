import { OmittedItemRecord } from "../Models/omitted-item-record";
import { getStorageTableClient } from "./storage-helper";

const tableName = 'omittedcontainer';
const client = getStorageTableClient(tableName);


function makeOmittedItemEntity(omittedItem: OmittedItemRecord) {
    return {
        ...omittedItem
    };
}

/**
 * 
 * @param partitionKey the channel id
 * @param rowKey the username
 */
export async function getOmittedItem(partitionKey: string, rowKey: string): Promise<OmittedItemRecord> {
    return client.getEntity(partitionKey, rowKey);
}

export async function createOmittedItem(omittedItem: OmittedItemRecord) {
    const entity = makeOmittedItemEntity(omittedItem);
    await client.createEntity(entity);
}

/**
 * 
 * @param partitionKey the channel id
 * @param rowKey the username
 */
export async function deleteOmittedItem(partitionKey: string, rowKey: string) {
    await client.deleteEntity(partitionKey, rowKey);
}
