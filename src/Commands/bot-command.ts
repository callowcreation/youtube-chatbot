
import { RainRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { getAllChatterItems } from "../DataAccess/chatter-item-repository";
import { createOmittedItem } from "../DataAccess/omitted-item-repository";
import { OmittedItemRecord } from "../Models/omitted-item-record";
import { CommandError, CommandErrorCode } from "../Errors/command-error";

export default async function (message_item: MessageItem) {

    // {bot} {username}
    const regExp = RegExp(/(\$bot) @?([\w\s]+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 3) {
        const message = `Bot command ${message_item.snippet.displayMessage} is malformed. Here is the format $bot {username}. Example: $bot Nightbot`;
        throw new CommandError(message, CommandErrorCode.Malformed, true);
    }
    const [, name, username] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    try {
        const omitItem: OmittedItemRecord = {
            id: username,
            channelId: message_item.live_item.id,
            issuerId: issuerId
        } as OmittedItemRecord;

        const result = await createOmittedItem(omitItem);
        console.log({ result });
    } catch (err) {
        console.log(err);
    }

    return {
        message: `bot command executed`,
    };
}