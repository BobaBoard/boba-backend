import { z } from "zod";
import { FeedActivitySchema } from "./FeedActivitySchema";

export const GetUserStarFeedQueryParamsSchema = z.object({ "cursor": z.string().describe(`The cursor to start feeding the activity of the user star feed from.`).optional() }).optional();

 /**
       * @description Star Feed activity
       */
export const GetUserStarFeedQueryResponseSchema = z.lazy(() => FeedActivitySchema);