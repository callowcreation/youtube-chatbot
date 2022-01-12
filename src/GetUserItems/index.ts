import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getAllUserItems } from "../DataAccess/user-item-repository";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log.info('Get all user items started.');

    const userItems = await getAllUserItems();

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

    context.log.info('Get all user items completed.');
};

export default httpTrigger;