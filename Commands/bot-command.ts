import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { createOmittedItem } from "../DataAccess/omitted-item-repository";
import { OmittedItemRecord } from "../Models/omitted-item-record";
import { CommandError, CommandErrorCode } from "../Errors/command-error";
import { deleteChatterItems } from "../DataAccess/chatter-item-repository";
import { CommandOutput } from "../Interfaces/command-output-interface";

export default async function (message_item: MessageItem): Promise<CommandOutput> {

    // {bot} {username}
    const regExp = RegExp(/\$(bot) @?([\w\s]+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 3) {
        const example = `Here is the format $bot {username}. Example: $bot Nightbot`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('bot', message, CommandErrorCode.Malformed, true);
    }
    const [, name, username] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    try {
        const omitItem: OmittedItemRecord = {
            partitionKey: message_item.live_item.rowKey,
            rowKey: username,
            issuerId: issuerId
        } as OmittedItemRecord;

        const result = await createOmittedItem(omitItem);
        console.log({ result });

        const delResult = await deleteChatterItems(omitItem.partitionKey, omitItem.rowKey)
            .catch(e => {
                if (e.statusCode !== 404) {
                    console.error({ error_message: `deleteChatterItems ${name}` }, e);
                    throw e;
                }
            });
        console.log({ delResult });
        return {
            name: name,
            send: true,
            message: `the ${username} is now omitted from transactions.`,
        } as CommandOutput;
    } catch (err) {
        console.error({ error_message: `Command error ${name} - ${message_item.snippet.displayMessage}` }, err);

        return {
            name: name,
            send: false,
            message: err.code && err.code === 409 ? `the ${username} is already omitted from transactions.` : `an error occurred.`,
            error: err,
        } as CommandOutput;
    }

}