import { DepositRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { CommandError, CommandErrorCode } from "../Errors/command-error";
import { CommandOutput } from "../Interfaces/command-output-interface";

export default async function (message_item: MessageItem): Promise<CommandOutput> {

    // {deposit} {amount} {coin}
    const regExp = RegExp(/\$(deposit) ((?:\d+(?:\.\d+)?)|(?:\d+)|(?:\.\d+)) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

	if(regExpSplit === null || regExpSplit.length !== 4) {
        const example = `Here is the format $deposit {amount} {type of coin}. Example: $deposit 10 RLY`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('deposit', message, CommandErrorCode.Malformed, true);
    }
	const [, name, amount, coin] = regExpSplit.map(x => x.trim());

    const issuerId = message_item.snippet.authorChannelId;

    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) {
        throw new CommandError(name, `This type of coin, ${coin}, is not supported.`, CommandErrorCode.CoinNotSupported, true);
    }

    const data = {
        token: coin,
        amount: +amount, //0.01,
        platform: platform
    } as DepositRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('deposit'), issuerId, data);
    //const result = await postRequest<any>('https://c79b4850dfad.ngrok.io/api/tx/deposit', issuerId, data);
    console.log(result);
    
    return {
        name: name,
        send: true,
        message: result ? `${name} successful.` : `deposit failed`,
    } as CommandOutput;
}