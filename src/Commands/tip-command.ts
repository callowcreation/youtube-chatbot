
import { TipRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { CommandError, CommandErrorCode } from "../Errors/command-error";
import { CommandOutput } from "../Interfaces/command-output-interface";

export default async function (message_item: MessageItem): Promise<CommandOutput> {

    // {tip} {amount} {coin}
	const regExp = RegExp(/\$(tip|donate) ((?:\d+(?:\.\d+)?)|(?:\d+)|(?:\.\d+)) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

	if(regExpSplit === null || regExpSplit.length !== 4) {
        const example = `Here is the format $tip/$donate {amount} {type of coin}. Example: $tip 10 RLY`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('tip/donate', message, CommandErrorCode.Malformed, true);
    }
	const [, name, amount, coin] = regExpSplit.map(x => x.trim());
    
    const issuerId = message_item.snippet.authorChannelId;

    const recipientId = message_item.live_item.id;

    if (issuerId === recipientId) {
        throw new CommandError(name, `Issuer ${message_item.authorDetails.displayName} and recipient ${message_item.authorDetails.displayName} can not be the same.`, CommandErrorCode.IssuerIsRecipient, true);
    }

    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) {
        throw new CommandError(name, `This type of coin, ${coin}, is not supported.`, CommandErrorCode.CoinNotSupported, true);
    }

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
        name: name,
        send: true,
        message: `tipped the broadcaster ${amount} ${coin}.`,
     } as CommandOutput;
}