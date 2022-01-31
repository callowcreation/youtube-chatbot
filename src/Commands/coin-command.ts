
import { CommandError, CommandErrorCode } from "../Errors/command-error";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";

export default async function (message_item: MessageItem) {

    // {coin}    
    const regExp = RegExp(/\$(coin)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 2) {
        const example = `Here is an example: $coin`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('coin', message, CommandErrorCode.Malformed, true);
    }
    const [, name] = regExpSplit.map(x => x.trim());

    return {
        name: name,
        send: true,
        message: `head here https://rallydataservice.azurewebsites.net/ to register and sync with YouTube.`,
    };
}