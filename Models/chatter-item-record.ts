export interface ChatterItemRecord {
	/**
	 * The channel id the the message was sent from
	 */
	partitionKey: string;

	/**
	 * The user id that sent the chat mennage
	 */
	rowKey: string;
	liveChatId: string;
	displayName: string;
}