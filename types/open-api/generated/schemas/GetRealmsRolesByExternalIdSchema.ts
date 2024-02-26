import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { RealmRolesSchema } from "./RealmRolesSchema";

/**
 * @description There was an error fetching realm roles.
 */
export const GetRealmsRolesByExternalId500Schema = z.any();
export const GetRealmsRolesByExternalIdPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });
export const GetRealmsRolesByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const GetRealmsRolesByExternalId403Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The realm was not found.
       */
export const GetRealmsRolesByExternalId404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The realm roles summary.
       */
export const GetRealmsRolesByExternalIdQueryResponseSchema = z.lazy(() => RealmRolesSchema);