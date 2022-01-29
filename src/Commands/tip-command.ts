
import { TipRequest } from "../APIAccess/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";

export default async function (message_item: MessageItem) {

    // {tip} {amount} {coin}
	const regExp = RegExp(/(\$tip|\$donate) (\d+) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

	if(regExpSplit === null || regExpSplit.length !== 4) throw new Error(`Tip command ${message_item.snippet.displayMessage} is malformed.`);
	const [, name, amount, coin] = regExpSplit.map(x => x.trim());
    
    const issuerId = message_item.snippet.authorChannelId;
    const recipientId = message_item.live_item.id;

    if(issuerId === recipientId) throw new Error(`Issuer ${issuerId} and recipient ${recipientId} can not be the same`);
    
    if(coin === undefined) throw new Error(`A coin is required`);
    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if(coins.includes(coin.toLowerCase()) === false) throw new Error(`Coin ${coin} is not supported`);

    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: `${platform}|${recipientId}`,
        amount: +amount,
        platform: platform
    } as TipRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('tip'), issuerId, data);
    console.log(result);
    return {
        message: `tip command executed`,
    };
}