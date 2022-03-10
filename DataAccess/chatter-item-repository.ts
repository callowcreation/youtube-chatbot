import { odata } from "@azure/data-tables";

import { ChatterItemRecord } from "../Models/chatter-item-record";
import { getStorageTableClient } from "./storage-helper";

const tableName = 'chattercontainer';
const client = getStorageTableClient(tableName);

function makeChatterItemEntity(chatterItems: ChatterItemRecord) {
    return {
        ...chatterItems
    };
}

/**
 * 
 * @param partitionKey channel id
 * @param issuerId the user id invoking the command
 * @param limit amount of chatters to return
 * @returns array of ChatterItemRecord
 */
export async function getAllChatterItems(partitionKey: string, issuerId: string, limit: number): Promise<ChatterItemRecord[]> {
    const listResults = client.listEntities({
        queryOptions: {
            filter: odata`PartitionKey eq ${partitionKey} and RowKey ne ${issuerId}`,
            select: ['partitionKey', 'rowKey', 'liveChatId', 'displayName', 'timestamp']
        }
    });

    let topEntities = [];
    const iterator = listResults.byPage({ maxPageSize: 10 });

    for await (const page of iterator) {
        topEntities.push(...page);
    }

    topEntities = topEntities.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
    });

    if (topEntities.length > 10) {
        const entities = topEntities.splice(10) as ChatterItemRecord[];
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i] as ChatterItemRecord;
            await deleteChatterItems(entity.partitionKey, entity.rowKey)
                .catch(e => {
                    if (e.statusCode !== 404) {
                        console.error({ error_message: `topEntities deleteChatterItems ${entity.rowKey}` }, e);
                        throw e;
                    }
                });;
        }
    }

    const limitedEntities = topEntities.slice(0, limit) as ChatterItemRecord[];

    return limitedEntities;
}

export async function replaceManyChatterItems(chatterItems: ChatterItemRecord[]) {
    for (let i = 0; i < chatterItems.length; i++) {
        const chatterItem = chatterItems[i];
        const chatterEnitiy = makeChatterItemEntity(chatterItem);

        try {
            const item = (await client.getEntity(chatterItem.partitionKey, chatterItem.rowKey)) as ChatterItemRecord;

            if (item.rowKey && item.rowKey == chatterItem.rowKey) {
                await client.deleteEntity(chatterItem.partitionKey, chatterItem.rowKey);
            }
        } catch (err) {
            if (err.statusCode !== 404) {
                console.log(err);
            }
        }
        await client.createEntity(chatterEnitiy);
    }
}

export async function deleteChatterItems(partitionKey: string, rowKey: string): Promise<any> {
    return client.deleteEntity(partitionKey, rowKey);
}
