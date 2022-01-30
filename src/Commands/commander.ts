import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import botCommand from "./bot-command";
import helpCommand from "./help-command";
import rainCommand from "./rain-command";
import sendCommand from "./send-command";
import tipCommand from "./tip-command";

//$send d4rkcide 10 PLAY usd 
export async function executeCommand(message_item: MessageItem) {

    const name = message_item.snippet.displayMessage.trim().split(' ')[0];

    switch (name) {
        case '$send': {
            return sendCommand(message_item);
        };
        case '$donate': {
            return tipCommand(message_item);
        };
        case '$tip': {
            return tipCommand(message_item);
        };
        case '$airdrop': {
            return rainCommand(message_item);
        };
        case '$coin': {
            throw new Error(`${name} is not implemented`);
        };
        case '$bot': {
            return botCommand(message_item);
        };
        case '$commands': {
            return helpCommand(message_item);
        };
        default: {
            throw new Error(`${name} is not a command`);
        };
    }
}