import setProcessVars from "./setProcessVars";
setProcessVars();
import { getRequest, platform, postRequest } from "../APIAccess/api-request";

import { AUTHOR_ID, AUTHOR_NAME, CHANNEL_ID, BasicMessageArgs, getBasicMessageItem } from './getBasicMessageItem';
import { ApiUser, RainRequest, RainResponse } from "../Interfaces/api-interfaces";
import { endpoints } from "../APIAccess/endpoints";
import { ApiRequestError } from "../Errors/api-request-error";

test('api 500 from bad user get request', async () => {

    const userItems: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path('adam'))
        .catch(e => e);

    console.log(userItems);

    const convertedToUnknown = userItems as unknown;
    const result = convertedToUnknown as ApiRequestError;
    console.log(result);

    expect(result.status).toBe(500);
});

test('api 404 from no user provided get request for users', async () => {

    const userId = 'UCqAhGHG9d4KlOZUCUQc4-ww'; // clayman
    const userItems: ApiUser[] = await getRequest<ApiUser[]>(endpoints.api.user.path())
        .catch(e => e);

    console.log(userItems);

    const convertedToUnknown = userItems as unknown;
    const result = convertedToUnknown as ApiRequestError;
    console.log(result);

    expect(result.status).toBe(404);
});

test('api status 500 from bad platform post request', async () => {

    const amount = 0.01;
    const coin = 'DTQ';
    const count = 1;
    const issuerId = AUTHOR_ID;
    const recipientIds = [CHANNEL_ID];
    const data = {
        token: coin,
        from: `${platform}|${issuerId}`,
        to: recipientIds.map(x => `${'platform'}|${x}`),
        amount: +amount / +count,
        platform: platform
    } as RainRequest;

    const result = await postRequest<RainResponse[]>(endpoints.api.transaction.path('rain'), issuerId, data)
        .catch(e => e);
    console.log(result);

    expect(result.status).toBe(500);
});

// enableProjectDiagnostics