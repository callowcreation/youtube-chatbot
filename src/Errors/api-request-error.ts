/**
 * https://stackoverflow.com/a/41429145 example
 */
export class ApiRequestError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, ApiRequestError.prototype);
    }
}