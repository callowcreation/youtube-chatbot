/**
 * rowKey is a unique identifier in this case the channelId/userId is used
 */
export interface LiveItemRecord {
	rowKey: string;
	liveChatId: string;
	pageToken: string;
}