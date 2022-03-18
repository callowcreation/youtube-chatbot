import { TableClient } from "@azure/data-tables";
import { QueueClient } from "@azure/storage-queue";

const storageUrl = `https://${process.env.storage_account_name}.table.core.windows.net`;
const sasToken = process.env.storage_table_sas;
const connectionString = process.env.storage_connection_string;

export function getStorageTableClient(tableName: string): TableClient {
    return new TableClient(`${storageUrl}${sasToken}`, tableName);;
}

export async function getStorageQueueClient() {
    // Create a unique name for the queue
    const queueName = "quickstart";

    console.log("\nCreating queue...");
    console.log("\t", queueName);

    // Instantiate a QueueClient which will be used to create and manipulate a queue
    const queueClient = new QueueClient(connectionString, queueName);

    const exists = await queueClient.exists();
    if(!exists) {
        // Create the queue
        const createQueueResponse = await queueClient.create();
        console.log("Queue created, requestId:", createQueueResponse.requestId);
    }

    console.log("\nAdding messages to the queue...");

    // Send several messages to the queue
    for (let i = 0; i < 10; i++) {       
        await queueClient.sendMessage(`First message ${i}`);
        await queueClient.sendMessage(`Second message ${i}`);
        await queueClient.sendMessage(`Third message ${i}`);
    }
    
    return queueClient;
}