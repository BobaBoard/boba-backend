import { z } from "zod";
import { UserSettingsSchema } from "./UserSettingsSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const UpdateUserSettings401Schema = z.any();

 /**
       * @description request body
       */
export const UpdateUserSettingsMutationRequestSchema = z.object({ "name": z.string(), "value": z.union([z.string(), z.boolean()]) });

 /**
       * @description The updated user settings data.
       */
export const UpdateUserSettingsMutationResponseSchema = z.lazy(() => UserSettingsSchema);