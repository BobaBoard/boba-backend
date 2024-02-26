import { z } from "zod";
import { FeedActivitySchema } from "./FeedActivitySchema";

/**
 * @description The realm was not found.
 */
export const GetRealmActivity404Schema = z.any();
export const GetRealmActivityPathParamsSchema = z.object({ "realm_id": z.string().describe(`The external id of the realm to fetch the activity of.`) });
export const GetRealmActivityQueryParamsSchema = z.object({ "cursor": z.string().describe(`The cursor to start feeding the activity of the board from.`).optional() }).optional();

 /**
       * @description The realm's activity.
       */
export const GetRealmActivityQueryResponseSchema = z.lazy(() => FeedActivitySchema);