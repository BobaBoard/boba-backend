import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { InviteSchema } from "./InviteSchema";

/**
 * @description The invite data.
 */
export const CreateInviteByRealmIdMutationRequestSchema = z.object({ "email": z.string().email().optional(), "label": z.string().optional() });
export const CreateInviteByRealmIdPathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`) });
export const CreateInviteByRealmId401Schema = z.lazy(() => GenericResponseSchema);
export const CreateInviteByRealmId403Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The realm was not found.
       */
export const CreateInviteByRealmId404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The invite metadata.
       */
export const CreateInviteByRealmIdMutationResponseSchema = z.lazy(() => InviteSchema);