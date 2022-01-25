/**
 * NOTE: property case is important here
 */
export interface TokenItem {
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expiry_date: number;
}