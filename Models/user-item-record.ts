export interface UserItemRecord {
	id: string;
	channel_id: string;
	expiry_date: number;
	refresh_token: string;
	access_token: string; // encrypt
}