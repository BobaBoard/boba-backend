import { z } from "zod";
import { RealmSchema } from "./RealmSchema";

/**
 * @description The realm was not found.
 */
export const GetRealmsBySlug404Schema = z.any();
export const GetRealmsBySlugPathParamsSchema = z.object({ "realm_slug": z.string().describe(`The slug of the realm.`) });

 /**
       * @description The realm metadata.
       */
export const GetRealmsBySlugQueryResponseSchema = z.lazy(() => RealmSchema);