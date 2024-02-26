import { z } from "zod";
import { LoggedInBoardSummarySchema } from "./LoggedInBoardSummarySchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const GetCurrentUserPinnedBoardsForRealm401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const GetCurrentUserPinnedBoardsForRealm403Schema = z.any();
export const GetCurrentUserPinnedBoardsForRealmPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });

 /**
       * @description The user data.
       */
export const GetCurrentUserPinnedBoardsForRealmQueryResponseSchema = z.object({ "pinned_boards": z.object({}).catchall(z.lazy(() => LoggedInBoardSummarySchema).and(z.object({ "index": z.number() }))).describe(`A map from board id to its LoggedInSummary for each pinned board. `) });