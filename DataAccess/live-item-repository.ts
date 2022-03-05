import { LiveItemRecord } from "../Models/live-item-record";
import { getStorageTableClient } from "./storage-helper";

const partitionKey = 'liveItems';
const tableName = 'livecontainer';
const client = getStorageTableClient(tableName);

function makeLiveItemEntity(liveItem: LiveItemRecord) {
    return {
        partitionKey: "liveItems",
        timestamp: Date.now(),
        ...liveItem
    };
}

export async function getAllLiveItems(): Promise<LiveItemRecord[]> {
    return [];
}

export async function getLiveItem(rowKey: string): Promise<LiveItemRecord> {
    return client.getEntity(partitionKey, rowKey);
}

export async function deleteLiveItem(rowKey: string) {
    await client.deleteEntity(partitionKey, rowKey);
}

export async function updateLiveItem(liveItem: LiveItemRecord) { 
    const entity = makeLiveItemEntity(liveItem);
    await client.updateEntity(entity, 'Merge');
}

export async function createLiveItem(liveItem: LiveItemRecord) {
    const entity = makeLiveItemEntity(liveItem);
    await client.createEntity(entity);
}