import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    console.info('Get all user items started.');

    const userItems = [];

    if (userItems && userItems.length > 0) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: userItems
        };
    } else {
        context.res = {
            status: 204
        };
    }

    console.info('Get all user items completed.');
};

export default httpTrigger;