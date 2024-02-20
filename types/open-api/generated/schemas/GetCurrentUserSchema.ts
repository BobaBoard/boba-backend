import { z } from "zod";

/**
 * @description User was not found in request that requires authentication.
 */
export const GetCurrentUser401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const GetCurrentUser403Schema = z.any();

 /**
       * @description The user data.
       */
export const GetCurrentUserQueryResponseSchema = z.object({ "username": z.string().optional(), "avatar_url": z.string().optional() });