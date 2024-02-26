import { z } from "zod";
import { UserSettingsSchema } from "./UserSettingsSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const GetUserSettings401Schema = z.any();

 /**
       * @description The user settings data.
       */
export const GetUserSettingsQueryResponseSchema = z.lazy(() => UserSettingsSchema);