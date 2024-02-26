import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { InviteStatusSchema } from "./InviteStatusSchema";

export const GetInviteByNoncePathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`), "nonce": z.string().describe(`The invite code.`) });

 /**
       * @description The invite with the given code was not found.
       */
export const GetInviteByNonce404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The realm amd status of the requested invite.
       */
export const GetInviteByNonceQueryResponseSchema = z.lazy(() => InviteStatusSchema);