
import { api, endpoints, platform } from "../APIAccess/api-request";

export async function tipCommand(issuer_id: string, params: string[]) {

    // tip {amount} {coin} {usd?}
    const name = params[0];
    const amount = params[1];
    const coin = params[2];
    const usd = params[3];

    const recipientId = ''; // make youtube request to get id from name

    const options = {
        method: 'POST',
        body: {
            token: 'Test',
            from: `${platform}|${issuer_id}`,
            to: `${platform}|${recipientId}`,
            amount: 0,
            platform: platform
        }
    };

    const result = await api<any>(endpoints.tip, options);
    console.log(result);

    return {
        message: `tip command executed`,
    };
}