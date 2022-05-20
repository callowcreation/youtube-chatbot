import { getRequest, platform } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { CommandOutput } from "../Interfaces/command-output-interface";

export default async function (message_item: MessageItem): Promise<CommandOutput> {
        
    const result = await getRequest(endpoints.api.user_lookup.path(`${platform}|${message_item.authorDetails.channelId}?wallets=all`));
    console.log(result);
    
    return {
        name: 'commands',
        send: false,
        message: `link to commands help web page`,
    } as CommandOutput;
}