import { z } from "zod";

/**
 * @description User was not found in request that requires authentication.
 */
export const UpdateCurrentUser401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const UpdateCurrentUser403Schema = z.any();

 /**
       * @description request body
       */
export const UpdateCurrentUserMutationRequestSchema = z.object({ "username": z.string().describe(`The username of the user.`), "avatarUrl": z.string().describe(`The avatar url of the user.`) });

 /**
       * @description The user data.
       */
export const UpdateCurrentUserMutationResponseSchema = z.object({ "username": z.string(), "avatar_url": z.string() });