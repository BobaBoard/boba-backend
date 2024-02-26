import { z } from "zod";
import { RealmActivitySchema } from "./RealmActivitySchema";

/**
 * @description The realm was not found.
 */
export const GetRealmsActivityByExternalId404Schema = z.any();
export const GetRealmsActivityByExternalIdPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });

 /**
       * @description The realm activity summary.
       */
export const GetRealmsActivityByExternalIdQueryResponseSchema = z.lazy(() => RealmActivitySchema);