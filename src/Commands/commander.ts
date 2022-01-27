import { MessageItem } from "../Common/chat-poller";
import helpCommand from "./help-command";
import tipCommand from "./tip-command";

//$send d4rkcide 10 PLAY usd 
export async function executeCommand(message_item: MessageItem) {
    const rawMessage = message_item.snippet.displayMessage.trim();

    const splits = rawMessage.split(' ');

    const commandName = splits[0];
    switch (commandName) {
        case '$send': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$donate': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$tip': {
            return tipCommand(message_item);
        } break;
        case '$airdrop': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$coin': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$bot': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$commands': {
            return helpCommand(message_item);
        } break;

        default: {
            throw new Error(`${commandName} is not a command`);
        } break;
    }
}