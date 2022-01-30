import fetch from 'node-fetch';
import { secretStore } from '../Common/secret-store';
import { ApiRequestError } from '../Errors/api-request-error';
import { RainRequest, TipRequest, UpdateTokenRequest, WithdrawRequest } from '../Interfaces/api-interfaces';

export const platform: string = 'youtube';

function Cached() {
    this.access_token = null;
    this.expires_in = 0;
    this.expires_time = 0;
};

const client_credentials = {
    url: process.env.api_url,
    client_id: process.env.api_client_id,
    client_secret: process.env.api_client_secret,
    audience: process.env.api_audience,
}

const cached = new Cached();

// Verify the header and the enclosed JWT.
function verifyAndDecode(jwt_token) {
    const jsonwebtoken = require('jsonwebtoken');
    const extension_secret = Buffer.from(process.env.client_secret, 'base64');
    return jsonwebtoken.verify(jwt_token, extension_secret, { algorithms: ['HS256'] });
}

function makeJwtToken(payload) {
    const jsonwebtoken = require('jsonwebtoken');
    const extension_secret = Buffer.from(process.env.client_secret, 'base64');
    return jsonwebtoken.sign(payload, extension_secret, { algorithm: 'HS256' });
}

async function getCachedToken(client_credentials) {
    const d = new Date();
    const seconds = Math.round(d.getTime() / 1000);
    const secondsOff = 60;

    try {
        const keyVaultSecret = await secretStore.getJwt('api-token');

        const payload = verifyAndDecode(keyVaultSecret.value);
        cached.access_token = payload.access_token;
        cached.expires_in = payload.expires_in;
        cached.expires_time = payload.expires_time;
    } catch (err) {
        console.log(err);
        if (err.statusCode !== 404) throw err;
    }

    if (seconds > cached.expires_time) {
        const result = await fetchToken(client_credentials);
        cached.access_token = result.access_token;
        cached.expires_in = result.expires_in;
        cached.expires_time = (seconds + cached.expires_in) - secondsOff;

        const payload = {
            expires_in: cached.expires_in,
            access_token: cached.access_token,
            expires_time: cached.expires_time,
        };
        const expiresOn = new Date();
        expiresOn.setSeconds(expiresOn.getSeconds() + cached.expires_in);

        const jwt = makeJwtToken(payload);
        await secretStore.setJwt('api-token', jwt, { expiresOn });
    }

    return { access_token: cached.access_token };
}

async function fetchToken(client_credentials) {

    const options = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: new URLSearchParams({
            client_id: client_credentials.client_id,
            client_secret: client_credentials.client_secret,
            audience: client_credentials.audience,
            grant_type: 'client_credentials'
        })
    };

    return fetch(client_credentials.url, options)
        .then(res => res.json())
        .catch(e => e);
}


function getHeaders(access_token, youtubeId) {

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        platform: null,
        id: null
    };

    if (youtubeId) {
        headers.platform = platform;
        headers.id = youtubeId;
    } else {
        delete headers.platform;
        delete headers.id;
    }

    return headers;
}

async function _request<T>(method: string, url: string, youtubeId: string, data?: any): Promise<T> {
    const { access_token } = await getCachedToken(client_credentials)
    const options = {
        method: method,
        headers: getHeaders(access_token, youtubeId),
        body: null
    };
    if (data) {
        options.body = JSON.stringify(data);
    } else {
        delete options.body;
    }
    return fetch(url, options)
        .then(async res => {
            if (!res.ok) {

                const contentType = res.headers.get('content-type');
                if(contentType && contentType.includes('json')) {
                    return res.json() as Promise<T>;
                }
                
                throw new ApiRequestError(await res.text(), res.status, res.statusText);
            }
            return res.json() as Promise<T>;
        });
}

export async function getRequest<T>(url): Promise<T> {
    return _request<T>('GET', url, null);
}

export async function postRequest<T>(url, youtubeId, data: WithdrawRequest | RainRequest | TipRequest | UpdateTokenRequest): Promise<T> {
    return _request<T>('POST', url, youtubeId, data);
}

/*export async function fetchAllUserItems() {
    const url = `${apiUrl}${userAllEndpoint}`;
    const options = {
        method: 'GET'
    };
    try {
        const result = fetch(url, options)
            .then(res => res.json());
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
}*/