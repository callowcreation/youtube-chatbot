import { helpCommand } from "./help-command";
import { tipCommand } from "./tip-command";

//$send d4rkcide 10 PLAY usd 
export async function executeCommand(message: string) {
    const rawMessage = message.trim();

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
            return tipCommand('', splits);
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
            return helpCommand();
        } break;

        default: {
            throw new Error(`${commandName} is not a command`);
        } break;
    }
}