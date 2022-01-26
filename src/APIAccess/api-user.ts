
export interface UserIdentity {
    userId: number,
    youtubeId: string,
    youtubeRefreshToken: string,
    youtubeUsername: string,
}

export interface ApiUser {
    userId: number,
    isBanned: boolean,
    userIdentity: UserIdentity
}
