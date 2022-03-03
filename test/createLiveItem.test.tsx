import setProcessVars from "./setProcessVars";
setProcessVars();
import botCommand from "../Commands/bot-command";
import coinCommand from "../Commands/coin-command";
import helpCommand from "../Commands/help-command";
import tipCommand from "../Commands/tip-command";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";

import { AUTHOR_ID, AUTHOR_NAME, CHANNEL_ID, BasicMessageArgs, getBasicMessageItem } from './getBasicMessageItem';

test('bot command message should indicate success', async () => {

    const username = 'naivebot';

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$bot ${username}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const result = await botCommand(message_item);
    expect(result.message).toMatch(new RegExp(`the ${username} is (now|already) omitted from transactions.`));
});

test('coin command message return link to register', async () => {

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$coin`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const result = await coinCommand(message_item);
    expect(result.message).toBe(`head here https://rallydataservice.azurewebsites.net/ to register and sync with YouTube.`);
});

test('help command message return link to help page', async () => {

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$commands`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const result = await helpCommand(message_item);
    expect(result.message).toBe(`link to commands help web page`);
});

test('tip command message should indicate success', async () => {

    const amount = 0.01;
    const coin = 'DTQ';

    const basicMessageArgs: BasicMessageArgs = {
        channelId: CHANNEL_ID,
        displayMessage: `$tip ${amount} ${coin}`,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME
    };
    const message_item: MessageItem = getBasicMessageItem(basicMessageArgs);

    const result = await tipCommand(message_item);
    expect(result.message).toBe(`tipped the broadcaster ${amount} ${coin}.`);
});

