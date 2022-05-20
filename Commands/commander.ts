import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import botCommand from "./bot-command";
import coinCommand from "./coin-command";
import helpCommand from "./help-command";
import rainCommand from "./rain-command";
import sendCommand from "./send-command";
import tipCommand from "./tip-command";
import withdrawCommand from "./withdraw-command";
import depositCommand from "./deposit-command";

export async function executeCommand(message_item: MessageItem) {

    const name = message_item.snippet.displayMessage.trim().split(' ')[0];

    const { rowKey: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
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
            return rainCommand(channelId, displayMessage, authorChannelId);
        };
        case '$withdraw': {
            return withdrawCommand(message_item);
        };
        case '$coin': {
            return coinCommand(message_item);
        };
        case '$bot': {
            return botCommand(message_item);
        };
        case '$commands': {
            return helpCommand(message_item);
        };
        case '$deposit': {
            return depositCommand(message_item);
        };
        default: {
            throw new Error(`${name} is not a command`);
        };
    }
}