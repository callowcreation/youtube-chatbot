import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
	console.log('HTTP trigger function processed a request.');
	const name = (req.query.name || (req.body && req.body.name));
	const responseMessage = name
		? "Hello, " + name + ". This HTTP triggered function executed successfully."
		: "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";


	const userItemRecord = {
		id: "dummy-id",
		expiryDate: 29839048239048,
		refreshToken: 'dummy-token',
		access_token: 'secret-code-do-not-look',
		scope: 'http://youtube-api-scope',
		tokenType: 'Bearer'
	} /*as UserItemRecord*/;

	context.bindings.userItemRecord = userItemRecord;

	context.res = {
		// status: 200, /* Defaults to 200 */
		body: responseMessage
	};

};

export default httpTrigger;