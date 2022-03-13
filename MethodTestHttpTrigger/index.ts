import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getStorageQueueClient } from "../DataAccess/storage-helper";

async function handleQueuedItems(queueClient) {
    let receivedMessagesResponse = await queueClient.receiveMessages({ numberOfMessages: 1 });

    while (receivedMessagesResponse.receivedMessageItems.length > 0) {

        console.log("Messages received, requestId:", receivedMessagesResponse.requestId);

        const receivedMessageItem = receivedMessagesResponse.receivedMessageItems[0];

        //'Process' the message
        console.log("\tProcessing:", receivedMessageItem.messageText);

        // Delete the message
        const deleteMessageResponse = await queueClient.deleteMessage(
            receivedMessageItem.messageId,
            receivedMessageItem.popReceipt
        );
        console.log("\tMessage deleted, requestId:", deleteMessageResponse.requestId);

        await new Promise(resolve => setTimeout(resolve, 250));

        receivedMessagesResponse = await queueClient.receiveMessages({ numberOfMessages: 1 });
    }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));

    const queueClient = await getStorageQueueClient();

    await handleQueuedItems(queueClient);

    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;
