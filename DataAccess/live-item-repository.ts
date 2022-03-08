import { odata } from "@azure/data-tables";
import { LiveItemRecord } from "../Models/live-item-record";
import { getStorageTableClient } from "./storage-helper";

const partitionKey = 'liveItems';
const tableName = 'livecontainer';

const client = getStorageTableClient(tableName);

function makeLiveItemEntity(liveItem: LiveItemRecord) {
    return {
        partitionKey: partitionKey,
        ...liveItem
    };
}

export async function getAllLiveItems(): Promise<LiveItemRecord[]> {
    const listResults = client.listEntities({
        queryOptions: {
            filter: odata`PartitionKey eq ${partitionKey}`,
            select: ['rowKey', 'liveChatId', 'pageToken']
        }
    });
    
    const liveEntities: LiveItemRecord[] = [];
    try {
        const iterator = listResults.byPage({ maxPageSize: 10 });

        for await (const page of iterator) {
            const liveItemRecord = page.map(x => {
                return {
                    rowKey: x.rowKey,
                    liveChatId: x.liveChatId,
                    pageToken: x.pageToken
                } as LiveItemRecord;
            });
            liveEntities.push(...liveItemRecord);
        }
    } catch (err) {
        console.error(err);
    }

    return liveEntities;
}

export async function getLiveItem(rowKey: string): Promise<LiveItemRecord> {
    return client.getEntity(partitionKey, rowKey);
}

export async function updateLiveItem(liveItem: LiveItemRecord) { 
    const entity = makeLiveItemEntity(liveItem);
    await client.updateEntity(entity, 'Merge');
}

export async function createLiveItem(liveItem: LiveItemRecord) {
    const entity = makeLiveItemEntity(liveItem);
    await client.createEntity(entity);
}

export async function deleteLiveItem(rowKey: string) {
    await client.deleteEntity(partitionKey, rowKey);
}
