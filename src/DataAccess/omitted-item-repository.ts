import { CosmosClient } from "@azure/cosmos";
import { OmittedItemRecord } from "../Models/omitted-item-record";

function getCosmosDbContainer() {
    const cosmosDbConnectionString = process.env["ytchatbotdbdev_DOCUMENTDB"];

    const client = new CosmosClient(cosmosDbConnectionString);
    const database = client.database("omittedcontainer");
    const container = database.container("omittedItems");

    return container;
}

export async function getAllOmittedItems(): Promise<OmittedItemRecord[]> {
    const querySpec = {
        query: `SELECT * from c`
    };

    const container = getCosmosDbContainer();
    const { resources: omittedItems } = await container.items
        .query(querySpec)
        .fetchAll();

    return omittedItems.map(item => {
        return {
            id: item.id, // username
            channelId: item.channelId,
            issuerId: item.issuerId
        } as OmittedItemRecord;
    }) as OmittedItemRecord[];
}

export async function getOmittedItem(username: string, channelId: string): Promise<OmittedItemRecord> {
    const querySpec = {
        query: `SELECT * from c WHERE c.channelId = '${channelId}' AND c.id = '${username}'`
    };

    const container = getCosmosDbContainer();
    const { resources: omittedItems } = await container.items
        .query(querySpec)
        .fetchAll();

    if(omittedItems.length === 1) {
        const item = omittedItems[0];
        return {
            id: item.id, // username
            channelId: item.channelId,
            issuerId: item.issuerId
        } as OmittedItemRecord;
    }
    return null;
}

export async function getOmittedItems(channelId: string): Promise<OmittedItemRecord[]> {
    const querySpec = {
        query: `SELECT * from c WHERE c.channelId = '${channelId}'`
    };

    const container = getCosmosDbContainer();
    const { resources: omittedItems } = await container.items
        .query(querySpec)
        .fetchAll();

        return omittedItems.map(item => {
            return {
                id: item.id, // username
                channelId: item.channelId,
                issuerId: item.issuerId
            } as OmittedItemRecord;
        }) as OmittedItemRecord[];
}

export async function createOmittedItem(omittedItem: OmittedItemRecord) {
    const container = getCosmosDbContainer();
    const { resource: createdItem } = await container.items.create(omittedItem);
    return createdItem;
}