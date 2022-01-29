import { LiveItemRecord } from "../Models/live-item-record";
import { Credentials } from "./token-item";


export interface ChatPoller {
	credentials: Credentials;
	live_item: LiveItemRecord;
}

export interface ChatSnippet {
	authorChannelId: string;
	displayMessage: string;
	liveChatId: string;
	publishedAt: string;
}

export interface ChatAuthorDetails {
	channelId: string;
	displayName: string;
}

export interface ChatItem {
	id: string;
	snippet: ChatSnippet;
	authorDetails: ChatAuthorDetails;
}

export interface ChatResponse {
	live_item: LiveItemRecord;
	data: {
		nextPageToken: string;
		offlineAt?: string;
		items: ChatItem[];
	}
}

export interface MessageItem {
	live_item: LiveItemRecord;
	snippet: ChatSnippet;
	authorDetails: ChatAuthorDetails;
}
