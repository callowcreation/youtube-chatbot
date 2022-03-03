import setProcessVars from "./setProcessVars";
setProcessVars();
import rainCommand from "../Commands/rain-command";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";

import { CommandError, CommandErrorCode } from '../Errors/command-error';
import { AUTHOR_ID, AUTHOR_NAME, CHANNEL_ID, BasicMessageArgs, getBasicMessageItem } from './getBasicMessageItem';
import { ApiRequestError } from "../Errors/api-request-error";

test('rain message should indicate success', async () => {

    const amount = 1;
    const coin = 'DTQ';
    const count = 2;

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$airdrop ${amount} ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    expect(result.error).toBe(null);
});

test('rain throw error malformed command', async () => {

    const amount = 1; // malformed no amount
    const coin = 'DTQ';
    const count = 2;

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$airdrop ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    const error: CommandError = result.error as CommandError;
    expect(error.code).toBe(CommandErrorCode.Malformed);
});

test('rain throw error max user count greater than 10', async () => {

    const amount = 1; 
    const coin = 'DTQ';
    const count = 11; // max users greater than 10

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$airdrop ${amount} ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    const error: CommandError = result.error as CommandError;
    expect(error.code).toBe(CommandErrorCode.AirdropMaxUserCount);
});

test('rain throw error no recent chatters', async () => {
    
    const amount = 1; 
    const coin = 'DTQ';
    const count = 2;

    const basicMessageArgs: BasicMessageArgs = {
        channelId: 'CHANNEL_ID_WITH_NO_CHAT', // change channel to get zero chatters
        displayMessage: `$airdrop ${amount} ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    const error: CommandError = result.error as CommandError;
    expect(error.code).toBe(CommandErrorCode.NoRecentChatters);
});

test('rain throw error with bad coin name', async () => {

    const amount = 1;
    const coin = 'ooDTQoo'; // bad coin
    const count = 2;

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$airdrop ${amount} ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    const error: CommandError = result.error as CommandError;
    expect(error.code).toBe(CommandErrorCode.CoinNotSupported);
});

/*test('rain throw error from bad request', async () => {

    const amount = 1;
    const coin = 'DTQ'; // bad coin
    const count = 2;

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$airdrop ${amount} ${coin} ${count}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const { id: channelId } = message_item.live_item;
    const { authorChannelId, displayMessage } = message_item.snippet;
    
    const result = await rainCommand(channelId, displayMessage, authorChannelId);
    const error: ApiRequestError = result.error as ApiRequestError;
    expect(error.status).toBe(500);
});*/
