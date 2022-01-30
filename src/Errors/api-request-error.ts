
/**
 * https://stackoverflow.com/a/41429145 example
 */
export class ApiRequestError extends Error {
    readonly status: number;
    readonly statusText: string;
    
    constructor(message: string, status: number, statusText: string) {
        super(message);
        Object.setPrototypeOf(this, ApiRequestError.prototype);
        this.status = status;
        this.statusText = statusText;
    }
}