import { ApiUser, TipRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { CommandError, CommandErrorCode } from '../Errors/command-error';
import { CommandOutput } from "../Interfaces/command-output-interface";

export default async function (message_item: MessageItem): Promise<CommandOutput> {

    // {send} {username} {amount} {coin}
    const regExp = RegExp(/\$(send) @?([\w\s]+) ((?:\d+(?:\.\d+)?)|(?:\d+)|(?:\.\d+)) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 5) {
        const example = `Here is the format $send {username} {amount} {type of coin}. Example: $send d4rkcide 10 PLAY`;
        const message = `${message_item.snippet.displayMessage} is malformed. ${example}`;
        throw new CommandError('send', message, CommandErrorCode.Malformed, true);
    }
    const [, name, username, amount, coin] = regExpSplit;

    const issuerId = message_item.snippet.authorChannelId;

    const recipient: ApiUser = await getRequest(endpoints.api.user_lookup.path(`youtubeusername|${username}`));
    console.log(recipient);
    if(recipient.status === 404) {
        throw new CommandError(name, `Recipient ${username} not found. @${username} head here https://rallydataservice.azurewebsites.net/ to register.`, CommandErrorCode.RecipientNotFount, true);
    }

    if (recipient.userIdentity.youtubeId === null) {
        throw new CommandError(name, `Recipient ${username} not synced. @${username} head here https://rallydataservice.azurewebsites.net/ to register and sync with YouTube.`, CommandErrorCode.RecipientNotSynced, true);
    }
    const recipientId = recipient.userIdentity.youtubeId;

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
        message: `sent ${amount} ${coin} to ${username}.`,
    } as CommandOutput;
}