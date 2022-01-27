
import { platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";

export default async function (message_item: MessageItem) {

    const splits = message_item.snippet.displayMessage.split(' ');
    // {tip} {amount} {coin} {usd?}
    const commandName = splits[0];
    const amount = +splits[1];
    const coin = splits[2];
    const usd = splits[3];
    const issuerId = message_item.snippet.authorChannelId;
    //const recipientId = 'UCqAhGHG9d4KlOZUCUQc4-ww';
    const recipientId = message_item.live_item.id;

    if(isNaN(amount)) throw new Error(`Amount ${splits[1]} is not a number`);
    //if(issuerId === recipientId) throw new Error(`Issuer ${issuerId} and recipient ${recipientId} can not be the same`);

    /* //RAIN
    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: [`${platform}|${recipientId}`, `${platform}|${'UCqAhGHG9d4KlOZUCUQc4-ww'}`],
        amount: amount,
        platform: platform
    };

    const result = await postRequest<any>(endpoints.api.transaction.path('rain'), issuerId, data);
    console.log(result);*/
    /* //TIP
    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: `${platform}|${recipientId}`,
        amount: amount,
        platform: platform
    };

    const result = await postRequest<any>(endpoints.api.transaction.path('tip'), issuerId, data);
    console.log(result);
    */
     //WITHDRAW
    const data = {
        token: 'DTQ',
        amount: 0.01,
        platform: platform
    };

    const result = await postRequest<any>(endpoints.api.transaction.path('withdraw'), issuerId, data);
    console.log(result);
    
    return {
        message: `tip command executed`,
    };
}