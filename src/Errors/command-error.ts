

export enum CommandErrorCode {
    Malformed = 1,
}
/**
 * https://stackoverflow.com/a/41429145 example
 */
export class CommandError extends Error {

    /** ErrorCode describing the error */
    readonly code: CommandErrorCode;
    /** Whether or not to send the error message to chat */
    readonly send: boolean;
    
    constructor(message: string, code: CommandErrorCode, send: boolean) {
        super(message);
        Object.setPrototypeOf(this, CommandError.prototype);
        this.code = code;
        this.send = send;
    }
}