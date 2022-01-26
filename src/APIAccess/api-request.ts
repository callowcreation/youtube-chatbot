import fetch from 'node-fetch';


const apiUrl = 'https://rallydataservice.azurewebsites.net/api';

export const endpoints = {
    user_all: '/user/all'
}

// https://stackoverflow.com/a/49471725 example
export async function api<T>(endpoint: string, options = null): Promise<T> {
    const url = `${apiUrl}${endpoint}`;
    if (options === null) {
        options = { method: 'GET' };
    }
    return fetch(url, options)
        .then(res => {
            if (!res.ok) {
                throw new Error(res.statusText)
            }
            return res.json() as Promise<T>
        });
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