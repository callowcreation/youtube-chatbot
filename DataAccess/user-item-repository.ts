import { CosmosClient } from "@azure/cosmos";
import { UserItemRecord } from "../Models/user-item-record";

function getCosmosDbContainer() {
    const cosmosDbConnectionString = process.env["ytchatbotdbdev_DOCUMENTDB"];

    const client = new CosmosClient(cosmosDbConnectionString);
    const database = client.database("usercontainer");
    const container = database.container("userItems");

    return container;
}

export async function getAllUserItems(): Promise<UserItemRecord[]> {
    const querySpec = {
        query: `SELECT * from c`
    };

    const container = getCosmosDbContainer();
    const { resources: userItems } = await container.items
        .query(querySpec)
        .fetchAll();

    return userItems.map(item => {
        return {
            id: item.id,
            channel_id: item.channel_id,
            expiry_date: item.expiry_date,
            refresh_token: item.refresh_token,
            access_token: item.access_token
        } as UserItemRecord;
    });
}

export async function getUserItem(channel_id: string): Promise<UserItemRecord> {
    const querySpec = {
        query: `SELECT * from c WHERE c.channel_id = '${channel_id}'`
    };

    const container = getCosmosDbContainer();
    const { resources: userItems } = await container.items
        .query(querySpec)
        .fetchAll();

    const item = userItems[0];
    return {
        id: item.id,
        channel_id: item.channel_id,
        expiry_date: item.expiry_date,
        refresh_token: item.refresh_token,
        access_token: item.access_token
    } as UserItemRecord;
}

export async function deleteUserItem(id: string, channel_id: string): Promise<any> {
    const container = getCosmosDbContainer();
    const { resource: result } = await container.item(id, channel_id).delete();
    return result;
}

export async function editUserItem(id: string, channel_id: string, userItem: UserItemRecord): Promise<UserItemRecord> {
    const container = getCosmosDbContainer();
    const { resource: updatedItem } = await container
        .item(id, channel_id)
        .replace(userItem);
    return updatedItem;
}

export async function createUserItem(userItem: UserItemRecord) {
    const container = getCosmosDbContainer();
    const { resource: createdItem } = await container.items.create(userItem);
    return createdItem;
}