


class Endpoint {
    
    readonly apiUrl: string = 'https://rallydataservice.azurewebsites.net';
    readonly base: string;

    constructor(base: string) {
        this.base = base;
    }

    path(param) {
        return `${this.apiUrl}/${this.base}/${param}`;
    }
    
}

class User extends Endpoint {
    constructor(base: string) {
        super(base);
        Object.setPrototypeOf(this, User.prototype);
    }
}

class Transaction extends Endpoint {
    constructor() {
        super('api/tx');
        Object.setPrototypeOf(this, User.prototype);
    }
}

class Api {
    transaction: Transaction = new Transaction();
    user: User = new User('api/user');
}

class Endpoints {
    api: Api = new Api();
    user: User = new User('user');
}

export const endpoints: Endpoints = new Endpoints();