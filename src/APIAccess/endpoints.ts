


class Endpoint {
              
    readonly apiUrl: string = 'https://rallydataservice.azurewebsites.net';
    readonly base: string;

    constructor(base: string) {
        this.base = base;
    }

    path(param?: string) {
        const endpoint = param ? `/${param}` : ``;
        return `${this.apiUrl}/${this.base}${endpoint}`;
    }
    
}

class Api {
    transaction: Endpoint = new Endpoint('api/tx');
    user: Endpoint = new Endpoint('api/user');
    coin_list: Endpoint = new Endpoint('api/coin/list');
    user_lookup: Endpoint = new Endpoint('api/user/lookup');
}

class Endpoints {
    api: Api = new Api();
    user: Endpoint = new Endpoint('user');
}

export const endpoints: Endpoints = new Endpoints();