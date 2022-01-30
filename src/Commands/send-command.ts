
import { google } from 'googleapis';

import { ApiUser, TipRequest } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { MessageItem } from "../Interfaces/chat-poller-interfaces";
import { secretStore, verifyAndDecodeJwt } from "../Common/secret-store";
import { Credentials } from "../Interfaces/credentials-interface";
import { CommandError, CommandErrorCode } from '../Errors/command-error';

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

async function lookupUserByName(username: string): Promise<ApiUser> {
    try {
        const recipientResult: ApiUser = await getRequest(endpoints.api.user_lookup.path(`youtubeusername|${username}`));
        console.log(recipientResult);
        return recipientResult;
    } catch (err) {
        console.log(err);
        if(err.message === 'Not Found') return null;
        throw err;
    }
}

export default async function (message_item: MessageItem) {

    // {send} {username} {amount} {coin}
    const regExp = RegExp(/(\$send) @?([\w\s]+) (\d+) (\w+)/);
    const regExpSplit = regExp.exec(message_item.snippet.displayMessage);

    if (regExpSplit === null || regExpSplit.length !== 5) {
        const message = `Send command ${message_item.snippet.displayMessage} is malformed. Here is the format $send {username} {amount} {type of coin}. Example: $send d4rkcide 10 PLAY`;
        throw new CommandError(message, CommandErrorCode.Malformed, true);
    }
    const [, name, username, amount, coin] = regExpSplit;

    const issuerId = message_item.snippet.authorChannelId;

    const recipient = await lookupUserByName(username);
    if (recipient === null) throw new Error(`Recipient ${username} not found`);
    if (recipient.userIdentity.youtubeId === null) throw new Error(`Recipient ${username} not synced`);
    const recipientId = recipient.userIdentity.youtubeId;

    if (issuerId === recipientId) throw new Error(`Issuer ${issuerId} and recipient ${recipientId} can not be the same`);

    if (coin === undefined) throw new Error(`A coin is required`);
    const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
    const coins = coinList.map(x => x.toLowerCase());
    if (coins.includes(coin.toLowerCase()) === false) throw new Error(`Coin ${coin} is not supported`);

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