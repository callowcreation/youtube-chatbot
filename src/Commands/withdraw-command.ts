
import { WithdrawRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { CommandError, CommandErrorCode } from "../Errors/command-error";

export default async function (message_item: MessageItem) {

    // {widthdraw} {amount} {coin}
    const regExp = RegExp(/(\$withdraw) (\d+) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

	if(regExpSplit === null || regExpSplit.length !== 4) {
        const message = `Withdraw command ${message_item.snippet.displayMessage} is malformed. Here is the format $withdraw {amount} {type of coin}. Example: $withdraw 10 RLY`;
        throw new CommandError(message, CommandErrorCode.Malformed, true);
    }
	const [, name, amount, coin] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    if(coin === undefined) throw new Error(`A coin is required`);
    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if(coins.includes(coin.toLowerCase()) === false) throw new Error(`Coin ${coin} is not supported`);

    const data = {
        token: coin,
        amount: +amount, //0.01,
        platform: platform
    } as WithdrawRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('withdraw'), issuerId, data);
    console.log(result);
    
    return {
        message: `withdraw command executed`,
    };
}