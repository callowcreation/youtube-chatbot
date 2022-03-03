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

export async function deleteChatterItems(username: string): Promise<any> {
    const container = getCosmosDbContainer();
    const querySpec = {
        query: `SELECT * from c WHERE c.displayName = '${username}'`
    };

    const { resources: chatterItems } = await container.items
        .query(querySpec)
        .fetchAll();

    const operations: OperationInput[] = chatterItems.map(item => {
        return {
            operationType: 'Delete',
            id: item.id,
            partitionKey: item.channelId
            
        } as OperationInput;
    }) as OperationInput[];

    const results = await container.items.bulk(operations);
    return results;
}
