export interface UserIdentity {
    userId: number;
    youtubeId: string;
    youtubeRefreshToken: string;
    youtubeUsername: string;
}

export interface ApiUser {
    userId: number;
    isBanned: boolean;
    userIdentity: UserIdentity;
}

export interface WithdrawRequest {
    token: string;
    amount: number;
    platform: string;
}

export interface FromRequest extends WithdrawRequest {
    from: string;
}

export interface TipRequest extends FromRequest {
    to: string;
}

export interface RainRequest extends FromRequest {
    to: string[];
}

export interface UpdateTokenItem {
    youtubeId: string;
    youtubeRefreshToken: string;
}

export interface UpdateTokenRequest {
    tokens: UpdateTokenItem[];
}


