
import { RainRequest } from "../APIAccess/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";
import { getAllChatterItems } from "../DataAccess/chatter-item-repository";

export default async function (message_item: MessageItem) {

    // {airdrop} {amount} {coin} {count}
    const regExp = RegExp(/(\$airdrop) (\d+) (\w+) (\d+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 5) throw new Error(`Airdrop command ${message_item.snippet.displayMessage} is malformed.`);
    const [, name, amount, coin, count] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    if (coin === undefined) throw new Error(`A coin is required`);
    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) throw new Error(`Coin ${coin} is not supported`);

    if(+count > 10) throw new Error(`Max airdrop users is ${10} input ${+count} is to high`)
    const chatters = await getAllChatterItems(issuerId, message_item.live_item.id, (+count <= 10 ? +count : 10));
    console.log({ chatters });

    if(chatters.length === 0) throw new Error(`No recent chatters for ${message_item.snippet.displayMessage}`);
    
    const platformIds = chatters.map(x => `${platform}|${x.id}`);
    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: platformIds,
        amount: +amount,
        platform: platform
    } as RainRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('rain'), issuerId, data);
    console.log(result);
    return {
        message: `rain command executed`,
    };
}