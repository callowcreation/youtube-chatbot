import { LiveItemRecord } from "../Models/live-item-record";

export interface Credentials {
	access_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
	expiry_date: number;
}

export interface ChatPoller {
	credentials: Credentials,
	live_item: LiveItemRecord
}

export interface ChatResponse {
	live_item: LiveItemRecord,
	data: {
		nextPageToken: string,
		offlineAt?: string,
		items: any[] // try to find the google type and use it here
	}
}