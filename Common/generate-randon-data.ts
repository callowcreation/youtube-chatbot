import { ChatterItemRecord } from "../Models/chatter-item-record";

const messageCounters = {};
// https://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export async function generateRandomChatItemRecords(amount: number): Promise<ChatterItemRecord[]> {
    const partitionKey = 'channel-id-1';
    const rowKeys = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8', 'user-9', 'user-10', 'user-11', 'user-12', 'user-13', 'user-14', 'user-15'];
    const chatId = 'no-chat-1';
    shuffle(rowKeys);
    const getDisplayMessage = rowKey => {
        if (!messageCounters[rowKey]) messageCounters[rowKey] = 0;
        return (messageCounters[rowKey]++) + ' this is text :)'
    }

    const chatterItemRecords: ChatterItemRecord[] = [];
    let counter = 0;
    while (counter < amount) {

        shuffle(rowKeys);
        const rowKey = rowKeys[0];
        const item = {
            partitionKey: partitionKey, //'channel-id-1'
            rowKey: rowKey,
            displayMessage: getDisplayMessage(rowKey),
            displayName: rowKey,
            liveChatId: chatId
        } as ChatterItemRecord;
        chatterItemRecords.push(item);

        counter++;
    }

    //await replaceManyChatterItems(chatterItemRecords);

    //const chatterItems = await getAllChatterItems(partitionKey, 'user-1', 5);
    return chatterItemRecords;
}