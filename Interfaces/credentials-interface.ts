
export interface Credentials {
	id?: string,
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expires_in: number;
	error?: string;
	error_description?: string;
}

export interface APICredentials {
	access_token: string;
	expires_in: number;
	expires_time: number;
}