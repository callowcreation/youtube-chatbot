
import { RainRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { getAllChatterItems } from "../DataAccess/chatter-item-repository";
import { CommandError, CommandErrorCode } from "../Errors/command-error";

export default async function (message_item: MessageItem) {

    // {airdrop} {amount} {coin} {count}
    const regExp = RegExp(/\$(airdrop) (\d+) (\w+) (\d+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 5) {
        const example = `Here is the format $airdrop {amount} {type of coin} {number of people to airdrop on (max 10)}. Example: $airdrop 25 DTQ 5 (each person gets 5 DTQ)`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('airdrop', message, CommandErrorCode.Malformed, true);
    }
    const [, name, amount, coin, count] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    if(+count > 10) {
        throw new CommandError(name, `Max user count is ${10} input of ${+count} is to high`, CommandErrorCode.AirdropMaxUserCount, true);
    }
    const chatters = await getAllChatterItems(issuerId, message_item.live_item.id, (+count <= 10 ? +count : 10));
    console.log({ chatters });
    if(chatters.length === 0) {
        throw new CommandError(name, `No recent chatters for ${message_item.snippet.displayMessage}.`, CommandErrorCode.NoRecentChatters, true)
    }
    const recipientIds = chatters.map(x => `${platform}|${x.id}`);

    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) {
        throw new CommandError(name, `This type of coin, ${coin}, is not supported.`, CommandErrorCode.CoinNotSupported, true);
    }

    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: recipientIds.map(x => `${platform}|${x}`),
        amount: +amount,
        platform: platform
    } as RainRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('rain'), issuerId, data);
    console.log(result);
    return {
        message: `rain command executed`,
    };
}