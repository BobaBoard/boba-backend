import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { InviteWithDetailsSchema } from "./InviteWithDetailsSchema";

export const GetInvitesByRealmIdPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });
export const GetInvitesByRealmId401Schema = z.lazy(() => GenericResponseSchema);
export const GetInvitesByRealmId403Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The realm was not found.
       */
export const GetInvitesByRealmId404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The metadata of all pending invites for the current realm.
       */
export const GetInvitesByRealmIdQueryResponseSchema = z.object({ "invites": z.array(z.lazy(() => InviteWithDetailsSchema)).optional() });