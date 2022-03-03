/**
 * https://stackoverflow.com/a/41429145 example
 */
export class LiveChatError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, LiveChatError.prototype);
    }
}