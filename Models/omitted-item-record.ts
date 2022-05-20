export interface OmittedItemRecord {
	partitionKey: string; // channel id
	rowKey: string; // username for the id
	issuerId: string;
}