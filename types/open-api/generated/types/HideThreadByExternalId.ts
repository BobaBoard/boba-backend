import type { GenericResponse } from "./GenericResponse";

export type HideThreadByExternalIdMutationResponse = any | null;

 export type HideThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to unhide.
     * @type string uuid
    */
    thread_id: string;
};

 export type HideThreadByExternalId401 = GenericResponse;

 export type HideThreadByExternalId403 = GenericResponse;

 export type HideThreadByExternalId404 = GenericResponse;
export type HideThreadByExternalIdMutation = {
    Response: HideThreadByExternalIdMutationResponse;
    PathParams: HideThreadByExternalIdPathParams;
    Errors: HideThreadByExternalId401 | HideThreadByExternalId403 | HideThreadByExternalId404;
};