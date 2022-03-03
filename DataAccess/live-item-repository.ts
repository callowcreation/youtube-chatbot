import { CosmosClient } from "@azure/cosmos";
import { LiveItemRecord } from "../Models/live-item-record";

function getCosmosDbContainer() {
    const cosmosDbConnectionString = process.env["ytchatbotdbdev_DOCUMENTDB"];

    const client = new CosmosClient(cosmosDbConnectionString);
    const database = client.database("livecontainer");
    const container = database.container("liveItems");

    return container;
}

export async function getAllLiveItems(): Promise<LiveItemRecord[]> {
    const querySpec = {
        query: `SELECT * from c`
    };

    const container = getCosmosDbContainer();
    const { resources: liveItems } = await container.items
        .query(querySpec)
        .fetchAll();

    return liveItems.map(item => {
        return {
            id: item.id,
            liveChatId: item.liveChatId,
            pageToken: item.pageToken
        } as LiveItemRecord;
    }) as LiveItemRecord[];
}

export async function getLiveItem(id: string): Promise<LiveItemRecord> {
    const querySpec = {
        query: `SELECT * from c WHERE c.id = '${id}'`
    };

    const container = getCosmosDbContainer();
    const { resources: liveItems } = await container.items
        .query(querySpec)
        .fetchAll();

    if (liveItems.length === 1) {
        const item = liveItems[0];
        return {
            id: item.id,
            liveChatId: item.liveChatId,
            pageToken: item.pageToken
        } as LiveItemRecord;
    } else {
        return null;
    }
}

export async function deleteLiveItem(id: string): Promise<any> {
    const container = getCosmosDbContainer();
    const item = container.item(id, id);
    const result = await item.delete().catch(e => {
        console.log(e);
    });
    return result;
}

export async function updateLiveItem(id: string, liveItem: LiveItemRecord): Promise<LiveItemRecord> {
    const container = getCosmosDbContainer();

        try {
            const { resource: updatedItem } = await container
            .item(id)
            .replace(liveItem);
            return updatedItem;
        } catch (err) {
            console.log(err);
            throw err;
        }
}

export async function createLiveItem(liveItem: LiveItemRecord) {
    const container = getCosmosDbContainer();
    const { resource: createdItem } = await container.items.create(liveItem);
    return createdItem;
}