import type { UserSettings } from "./UserSettings";

/**
 * @description User was not found in request that requires authentication.
*/
export type UpdateUserSettings401 = any | null;

 /**
 * @description request body
*/
export type UpdateUserSettingsMutationRequest = {
    /**
     * @type string
    */
    name: string;
    value: (string | boolean);
};

 /**
 * @description The updated user settings data.
*/
export type UpdateUserSettingsMutationResponse = UserSettings;
export type UpdateUserSettingsMutation = {
    Response: UpdateUserSettingsMutationResponse;
    Request: UpdateUserSettingsMutationRequest;
    Errors: UpdateUserSettings401;
};