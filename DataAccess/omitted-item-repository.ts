import { CosmosClient } from "@azure/cosmos";
import { OmittedItemRecord } from "../Models/omitted-item-record";

function getCosmosDbservice() {

    return null;
}

export async function getAllOmittedItems(): Promise<OmittedItemRecord[]> {
    const querySpec = {
        query: `SELECT * from c`
    };

    const service = getCosmosDbservice();
    const { resources: omittedItems } = await service.items
        .query(querySpec)
        .fetchAll();

    return null;
}

export async function getOmittedItem(username: string, channelId: string): Promise<OmittedItemRecord> {
    const querySpec = {
        query: `SELECT * from c WHERE c.channelId = '${channelId}' AND c.id = '${username}'`
    };

    const service = getCosmosDbservice();
    const { resources: omittedItems } = await service.items
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

    const service = getCosmosDbservice();
    const { resources: omittedItems } = await service.items
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
    const service = getCosmosDbservice();
    const { resource: createdItem } = await service.items.create(omittedItem);
    return createdItem;
}