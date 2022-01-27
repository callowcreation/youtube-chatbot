
import { platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";

export async function tipCommand(issuer_id: string, params: string[]) {

    // tip {amount} {coin} {usd?}
    const name = params[0];
    const amount = params[1];
    const coin = params[2];
    const usd = params[3];

    const recipientId = 'UCqAhGHG9d4KlOZUCUQc4-ww'; // make youtube request to get id from name

    const data = {
        token: 'GEO',
        from: `${platform}|${issuer_id}`,
        to: `${platform}|${recipientId}`,
        amount: 0,
        platform: platform
    };

    const result = await postRequest<any>(endpoints.api.transaction.path('tip'), issuer_id, data);
    console.log(result);

    return {
        message: `tip command executed`,
    };
}