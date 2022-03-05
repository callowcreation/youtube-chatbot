import { CosmosClient, OperationInput } from "@azure/cosmos";
import { ChatterItemRecord } from "../Models/chatter-item-record";

function getCosmosDbservice() {
    return null;
}

export async function getAllChatterItems(issuerId: string, channelId: string, limit: number): Promise<ChatterItemRecord[]> {
    const service = getCosmosDbservice();

    return null;
}

export async function createManyChatterItems(chatterItems: ChatterItemRecord[]) {
    const service = getCosmosDbservice();

    return null;
}

export async function deleteChatterItems(username: string): Promise<any> {
    const service = getCosmosDbservice();

    return null;
}
