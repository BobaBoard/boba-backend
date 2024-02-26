import type { UserSettings } from "./UserSettings";

/**
 * @description User was not found in request that requires authentication.
*/
export type GetUserSettings401 = any | null;

 /**
 * @description The user settings data.
*/
export type GetUserSettingsQueryResponse = UserSettings;
export type GetUserSettingsQuery = {
    Response: GetUserSettingsQueryResponse;
    Errors: GetUserSettings401;
};