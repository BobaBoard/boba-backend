import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { AcceptedInviteResponseSchema } from "./AcceptedInviteResponseSchema";

/**
 * @description The user data for the invite. Only required if the user does not already have an account.
 */
export const AcceptInviteByNonceMutationRequestSchema = z.object({ "email": z.string().email(), "password": z.string() });
export const AcceptInviteByNoncePathParamsSchema = z.object({ "realm_id": z.string().uuid().describe(`The id of the realm.`), "nonce": z.string().describe(`The invite code.`) });

 /**
       * @description Request does not contain email and password require to create new user account.
       */
export const AcceptInviteByNonce400Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The invite is not valid anymore, or the user's email does not correspond to the invited one.
       */
export const AcceptInviteByNonce403Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The invite with the given code was not found, or the requested realm does not exist.
       */
export const AcceptInviteByNonce404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The user is already a member of the requested realm.
       */
export const AcceptInviteByNonce409Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The invite was successfully accepted.
       */
export const AcceptInviteByNonceMutationResponseSchema = z.lazy(() => AcceptedInviteResponseSchema);