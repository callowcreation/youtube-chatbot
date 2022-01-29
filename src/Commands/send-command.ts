
import { google } from 'googleapis';

import { TipRequest } from "../APIAccess/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Common/chat-poller";
import { secretStore, verifyAndDecodeJwt } from "../Common/secret-store";
import { Credentials } from "../Common/token-item";

const OAuth2 = google.auth.OAuth2;
const service = google.youtube('v3');
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
];
const clientSecret = process.env.client_secret;
const clientId = process.env.client_id;
const redirectUri = process.env.redirect_uri;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

export default async function (message_item: MessageItem) {

    // {send} {username} {amount} {coin}
	const regExp = RegExp(/(\$send) @?([\w\s]+) (\d+) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

	if(regExpSplit === null || regExpSplit.length !== 5) throw new Error(`Send command ${message_item.snippet.displayMessage} is malformed.`);
	const [, name, username, amount, coin] = regExpSplit;

    const issuerId = message_item.snippet.authorChannelId;
    //const recipientId = 'UCqAhGHG9d4KlOZUCUQc4-ww';
    const recipientId = 'get from youtube api request';

    if (isNaN(+amount)) throw new Error(`Amount ${amount} is not a number`);
    if (issuerId === recipientId) throw new Error(`Issuer ${issuerId} and recipient ${recipientId} can not be the same`);

    if (coin === undefined) throw new Error(`A coin is required`);
    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) throw new Error(`Coin ${coin} is not supported`);

    const keyVaultSecret = await secretStore.getJwt(message_item.live_item.id);
    const payload = verifyAndDecodeJwt(keyVaultSecret.value) as Credentials;

    const credentials: Credentials = payload;

    oauth2Client.setCredentials(credentials);

    const json = await service.channels.list({
        auth: oauth2Client,
        part: ['snippet'],
        forUsername: username
    });

    console.log({ json });
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
        message: `send command executed`,
    };
}