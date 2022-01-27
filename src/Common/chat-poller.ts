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

export interface ChatSnippet {
	authorChannelId: string,
	displayMessage: string,
	liveChatId: string,
	publishedAt: string
}

export interface ChatItem {
	id: string,
	snippet: ChatSnippet
}

export interface ChatResponse {
	live_item: LiveItemRecord,
	data: {
		nextPageToken: string,
		offlineAt?: string,
		items: ChatItem[]
	}
}

export interface MessageItem {
	live_item: LiveItemRecord,
	snippet: ChatSnippet
}
