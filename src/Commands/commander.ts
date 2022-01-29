import { MessageItem } from "../Common/chat-poller";
import botCommand from "./bot-command";
import helpCommand from "./help-command";
import rainCommand from "./rain-command";
import sendCommand from "./send-command";
import tipCommand from "./tip-command";

//$send d4rkcide 10 PLAY usd 
export async function executeCommand(message_item: MessageItem) {
    const rawMessage = message_item.snippet.displayMessage.trim();

    const splits = rawMessage.split(' ');

    const commandName = splits[0];
    switch (commandName) {
        case '$send': {
            return sendCommand(message_item);
        } break;
        case '$donate': {
            return tipCommand(message_item);
        } break;
        case '$tip': {
            return tipCommand(message_item);
        } break;
        case '$airdrop': {
            return rainCommand(message_item);
        } break;
        case '$coin': {
            throw new Error(`${commandName} is not implemented`);
        } break;
        case '$bot': {
            return botCommand(message_item);
        } break;
        case '$commands': {
            throw new Error(`${commandName} is not implemented`);
            //return helpCommand(message_item);
        } break;

        default: {
            throw new Error(`${commandName} is not a command`);
        } break;
    }
}