
import { WithdrawRequest } from "../APIAccess/api-interfaces";
import { platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";

export default async function (message_item: MessageItem) {

    const splits = message_item.snippet.displayMessage.split(' ');
    // {widthdraw} {amount} {coin}
    const commandName = splits[0];
    const amount = +splits[1];
    const coin = splits[2];
    const usd = splits[3];
    const issuerId = message_item.snippet.authorChannelId;
    //const recipientId = 'UCqAhGHG9d4KlOZUCUQc4-ww';
    const recipientId = message_item.live_item.id;

    if(isNaN(amount)) throw new Error(`Amount ${splits[1]} is not a number`);

    const data = {
        token: 'DTQ',
        amount: 0.0, //0.01,
        platform: platform
    } as WithdrawRequest;

    const result = await postRequest<any>(endpoints.api.transaction.path('withdraw'), issuerId, data);
    console.log(result);
    
    return {
        message: `withdraw command executed`,
    };
}