

export enum CommandErrorCode {
    Malformed = 1,
    CoinNotSupported = 2,
    IssuerIsRecipient = 3,
    RecipientNotFount = 4,
    RecipientNotSynced = 5,
    NoRecentChatters = 6,
    AirdropMaxUserCount = 7,
}
/**
 * https://stackoverflow.com/a/41429145 example
 */
export class CommandError extends Error {

    /** The command name where the error happened */
    readonly name: string;
    /** ErrorCode describing the error */
    readonly code: CommandErrorCode;
    /** Whether or not to send the error message to chat */
    readonly send: boolean;
    
    constructor(name: string, message: string, code: CommandErrorCode, send: boolean) {
        super(message);
        Object.setPrototypeOf(this, CommandError.prototype);
        this.name = name;
        this.code = code;
        this.send = send;
    }
}