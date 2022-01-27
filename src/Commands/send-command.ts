
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { ApiUser } from "../APIAccess/api-user";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";

export default async function (message_item: MessageItem) {

    const splits = message_item.snippet.displayMessage.split(' ');
    // {send} {username} {amount} {coin} {usd?}
    const commandName = splits[0];
    const userName = splits[1];
    const amount = +splits[2];
    const coin = splits[3];
    const usd = splits[4];
    const issuerId = message_item.snippet.authorChannelId;
    //const recipientId = 'UCqAhGHG9d4KlOZUCUQc4-ww';
    const recipientId = message_item.live_item.id;

    const item: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path('all'));
    console.log({ item });

    /*oauth2Client.setCredentials(token);

    const json = await service.channels.list({
        auth: oauth2Client,
        part: ['snippet'],
        mine: true
    });*/


    if(isNaN(amount)) throw new Error(`Amount ${splits[1]} is not a number`);
    if(issuerId === recipientId) throw new Error(`Issuer ${issuerId} and recipient ${recipientId} can not be the same`);

    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: `${platform}|${recipientId}`,
        amount: amount,
        platform: platform
    };

    const result = await postRequest<any>(endpoints.api.transaction.path('tip'), issuerId, data);
    console.log(result);

    return {
        message: `tip command executed`,
    };
}