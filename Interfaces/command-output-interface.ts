import { CommandError } from "../Errors/command-error";

export interface CommandOutput {
	name: string,
	send: boolean;
	message: string;
	error?: CommandError | Error
}