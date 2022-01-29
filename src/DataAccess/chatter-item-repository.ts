import { CosmosClient, OperationInput } from "@azure/cosmos";
import { ChatterItemRecord } from "../Models/chatter-item-record";

function getCosmosDbContainer() {
    const cosmosDbConnectionString = process.env["ytchatbotdbdev_DOCUMENTDB"];

    const client = new CosmosClient(cosmosDbConnectionString);
    const database = client.database("chattercontainer");
    const container = database.container("chatterItems");

    return container;
}

export async function getAllChatterItems(issuerId: string, channelId: string, limit: number): Promise<ChatterItemRecord[]> {
    // Limit = 11 is one more that 10 which is max
    // this is to remove the person sending the command and have a max of 10 chatters
    const querySpec = {
        query: `SELECT * from c WHERE c.channelId = '${channelId}' AND c.id != '${issuerId}' ORDER BY c._ts DESC OFFSET 0 LIMIT ${limit}`
    };

    const container = getCosmosDbContainer();
    const { resources: chatterItems } = await container.items
        .query(querySpec)
        .fetchAll();

    return chatterItems.map(item => {
        return {
            id: item.id,
            channelId: item.channelId,
            liveChatId: item.liveChatId,
            displayName: item.displayName,
            displayMessage: item.displayMessage,
            _ts: new Date(+item._ts * 1000).toTimeString()
        } as ChatterItemRecord;
    }) as ChatterItemRecord[];
}

export async function getChatterItem(id: string): Promise<ChatterItemRecord> {
    const querySpec = {
        query: `SELECT * from c WHERE c.id = '${id}'`
    };

    const container = getCosmosDbContainer();
    const { resources: chatterItems } = await container.items
        .query(querySpec)
        .fetchAll();

    if (chatterItems.length === 1) {
        const item = chatterItems[0];
        return {
            id: item.id,
            channelId: item.channelId,
            liveChatId: item.liveChatId,
            displayName: item.displayName,
            displayMessage: item.displayMessage
        } as ChatterItemRecord;
    } else {
        return null;
    }
}

export async function deleteChatterItem(id: string): Promise<any> {
    const container = getCosmosDbContainer();
    const item = container.item(id, id);
    const result = await item.delete().catch(e => {
        console.log(e);
    });
    return result;
}

export async function updateChatterItem(id: string, chatterItem: ChatterItemRecord): Promise<ChatterItemRecord> {
    const container = getCosmosDbContainer();

    try {
        const { resource: updatedItem } = await container
            .item(id)
            .replace(chatterItem);
        return updatedItem;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function createChatterItem(chatterItem: ChatterItemRecord) {
    const container = getCosmosDbContainer();
    const { resource: createdItem } = await container.items.create(chatterItem);
    return createdItem;
}

export async function createManyChatterItems(chatterItems: ChatterItemRecord[]) {
    const container = getCosmosDbContainer();

    const operations: OperationInput[] = chatterItems.map(x => {
        return {
            operationType: 'Upsert',
            resourceBody: {
                id: x.id,
                channelId: x.channelId,
                liveChatId: x.liveChatId,
                displayName: x.displayName,
                displayMessage: x.displayMessage
            }
        } as OperationInput;
    }) as OperationInput[];

    

    const results = await container.items.bulk(operations);
    return results;
}