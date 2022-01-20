import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserItemRecord } from "../Models/user-item-record";
import { getChannelId } from "../Common/Utils";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
	context.log('HTTP trigger function processed a request.');
	const name = (req.query.name || (req.body && req.body.name));
	const responseMessage = name
		? "Hello, " + name + ". This HTTP triggered function executed successfully."
		: "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";


	const userItemRecord = {
		id: "dummy-id",
		expiry_date: 29839048239048,
		refresh_token: 'dummy-token',
		access_token: 'secret-code-do-not-look',
		scope: 'http://youtube-api-scope',
		token_type: 'Bearer'
	} as UserItemRecord;

	context.bindings.userItemRecord = userItemRecord;

	context.res = {
		// status: 200, /* Defaults to 200 */
		body: responseMessage
	};

};

export default httpTrigger;