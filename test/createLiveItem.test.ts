import tipCommand from "../src/Commands/tip-command";
import { MessageItem } from "../src/Interfaces/chat-poller-interfaces";

import * as localSettings from '../src/local.settings.json';
process.env.client_secret = localSettings.Values.client_secret;

test("first jest test", () => {
    const sum = 1 + 2;
    expect(sum).toBe(3);
});

test('tip command message should indicate success', async () => {

    console.log(localSettings);
    const amount = 1;
    const coin = 'DTQ';

    const message_item: MessageItem = {
        authorDetails: {
            channelId: '2',
            displayName: 'woLLac'
        },
        live_item: {
            id: '1',
            liveChatId: '',
            pageToken: null
        },
        snippet: {
            authorChannelId: '',
            displayMessage: `$tip ${amount} ${coin}`,
            liveChatId: '',
            publishedAt: ''
        }
    };
    const result = await tipCommand(message_item);
    expect(result.message === `tipped the broadcaster ${amount} ${coin}.`);
});