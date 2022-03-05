
import { RainRequest, RainResponse } from "../Interfaces/api-interfaces";
import { getRequest, platform, postRequest } from "../APIAccess/api-request";
import { endpoints } from "../APIAccess/endpoints";
import { getAllChatterItems } from "../DataAccess/chatter-item-repository";
import { CommandError, CommandErrorCode } from "../Errors/command-error";
import { CommandOutput } from "../Interfaces/command-output-interface";
import { ApiRequestError } from "../Errors/api-request-error";

/**
 * Sends coins to the last x number of chatters in twitch chat
 * @description $airdrop {amount} {type of coin} {number of people to airdrop on (max 10)}
 * @example $airdrop 25 DTQ 5
 * @param {string} channelId the id of the channel where the message originated
 * @param {string} displayMessage the content of the message
 * @param {string} authorChannelId the id of the user that posted the message
 * @returns {CommandOutput} object with details of the execution
 * @throws {CommandError | ApiRequestError | Error} on execption
 */
export default async function (channelId: string, displayMessage: string, authorChannelId: string): Promise<CommandOutput> {

    const output: CommandOutput = {
        name: null,
        message: null,
        send: true,
        error: null
    };
    try {
        // {airdrop} {amount} {coin} {count}
        const regExp = RegExp(/\$(airdrop) ((?:\d+(?:\.\d+)?)|(?:\d+)|(?:\.\d+)) (\w+) (\d+)/);
        const regExpSplit = regExp.exec(displayMessage);

        if (regExpSplit === null || regExpSplit.length !== 5) {
            const example = `Here is the format $airdrop {amount} {type of coin} {number of people to airdrop on (max 10)}. Example: $airdrop 25 DTQ 5 (each person gets 5 DTQ)`;
            const message = `${displayMessage} is malformed. ${example}`;
            throw new CommandError('airdrop', message, CommandErrorCode.Malformed, true);
        }
        const [, name, amount, coin, count] = regExpSplit.map(x => x.trim());
        output.name = name;
        
        const issuerId = authorChannelId;

        if (+count > 10) {
            throw new CommandError(output.name, `Max user count is ${10} input of ${+count} is to high`, CommandErrorCode.AirdropMaxUserCount, true);
        }
        const chatters = await getAllChatterItems(channelId, issuerId, (+count <= 10 ? +count : 10));
        //console.log({ chatters });
        if (chatters.length === 0) {
            throw new CommandError(output.name, `No recent chatters for ${displayMessage}.`, CommandErrorCode.NoRecentChatters, true)
        }
        const recipientIds = chatters.map(x => x.rowKey);

        const coinList = (await getRequest(endpoints.api.coin_list.path())) as string[];
        const coins = coinList.map(x => x.toLowerCase());
        if (coins.includes(coin.toLowerCase()) === false) {
            throw new CommandError(output.name, `This type of coin, ${coin}, is not supported.`, CommandErrorCode.CoinNotSupported, true);
        }

        const data = {
            token: coin,
            from: `${platform}|${issuerId}`,
            to: recipientIds.map(x => `${platform}|${x}`),
            amount: +amount / +count,
            platform: platform
        } as RainRequest;

        const result = await postRequest<RainResponse[]>(endpoints.api.transaction.path('rain'), issuerId, data);
        //console.log(result);

        const successResults = result
            .map(x => x.to ? x.to.useridentity.youtubeUsername : null)
            .filter(x => x);
        const failedResults = chatters.map(x => x.displayName).filter(x => !successResults.includes(x));

        const successMessage = `airdropped ${+amount / +count} ${coin} on ${successResults.map(x => `@${x}`).join(' ')}.`;
        const failedMessage = `Head here https://rallydataservice.azurewebsites.net/ to register and sync with YouTube to join the fun ${failedResults.map(x => `@${x}`).join(' ')}.`;
        
        output.message = (successResults.length > 0 ? successMessage : '') + (failedResults.length > 0 ? `  ${failedMessage}` : '');

    } catch (error) {
        output.error = error;
        if(error instanceof CommandError) {
            output.message = `a command execution error happend.`;
        } else if(error instanceof ApiRequestError) {
            output.message = `there was an api error.`;
        } else {
            output.message = `an error occured.`;
        }
    }

    return output;
}