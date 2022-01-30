import { getRequest, platform } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";


export default async function (message_item: MessageItem) {
        
    const result = await getRequest(endpoints.api.user_lookup.path(`${platform}|${message_item.authorDetails.channelId}?wallets=all`));
    console.log(result);
    
    return {
        message: `link to commands help web page`,
    };
}