import { z } from "zod";
import { FeedActivitySchema } from "./FeedActivitySchema";

/**
 * @description The board was not found.
 */
export const GetUserFeed404Schema = z.any();
export const GetUserFeedQueryParamsSchema = z.object({ "cursor": z.string().describe(`The cursor to start feeding the activity of the board from.`).optional(), "showRead": z.boolean().describe(`Whether to show read threads.`).optional(), "ownOnly": z.boolean().describe(`Whether to only show threads started by the user.`).optional(), "realmId": z.string().describe(`The realm id to filter by.`).optional() }).optional();

 /**
       * @description The board activity.
       */
export const GetUserFeedQueryResponseSchema = z.lazy(() => FeedActivitySchema);