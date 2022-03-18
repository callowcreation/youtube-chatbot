
export interface ClientCredentials {
    url: string | undefined,
    client_id: string,
    client_secret: string,
    audience: string,
}

export interface Cached {
    access_token: string;
    expires_in: number;
    expires_time: number;
}

export interface UserIdentity {
    userId: number;
    youtubeId: string;
    youtubeRefreshToken: string;
    youtubeUsername: string;
}

export interface ApiNotFound {
    status: number;
}

export interface ApiUser extends ApiNotFound {
    userId: number;
    isBanned: boolean;
    userIdentity: UserIdentity;
}

export interface WithdrawRequest {
    token: string;
    amount: number;
    platform: string;
}

export interface DepositRequest extends WithdrawRequest {}

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

// API Responses
interface Useridentity {
    rallyId: string | null;
    rallyUsername: string | null;
    twitchId: string | null;
    twitchUsername: string | null;
    userId: number | null;
    youtubeId: string | null;
    youtubeRefreshToken: string | null;
    youtubeUsername: string | null;
}

export interface Wallet {
    balance: number;
    token: string;
}

export interface FromResponse {
    userid: number;
    useridentity: Useridentity;
    wallet: Wallet;
}

export interface ToResponse {
    userid: number;
    useridentity: Useridentity;
    wallet: Wallet;
}

export interface TX {
    amount: number;
    platform: string;
    rallyTxId: string | null;
    receiverId: number;
    senderId: number;
    timestamp: string;
    token: string;
    totalUsdtValue: number;
    txGroupId: string;
    txId: number;
    txType: string;
    usdtPrice: number;
}

export interface RainResponse {
    from: FromResponse;
    to: ToResponse;
    tx: TX | null;
    txId: number | null;
}

