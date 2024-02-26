import { z } from "zod";
import { FeedActivitySchema } from "./FeedActivitySchema";

/**
 * @description The board was not found.
 */
export const GetBoardsFeedByExternalId404Schema = z.any();
export const GetBoardsFeedByExternalIdPathParamsSchema = z.object({ "board_id": z.string().describe(`The id of the board to fetch the activity of.`) });
export const GetBoardsFeedByExternalIdQueryParamsSchema = z.object({ "cursor": z.string().describe(`The cursor to start feeding the activity of the board from.`).optional(), "categoryFilter": z.string().describe(`A category to filter the feed by.`).optional() }).optional();

 /**
       * @description The board activity.
       */
export const GetBoardsFeedByExternalIdQueryResponseSchema = z.lazy(() => FeedActivitySchema);