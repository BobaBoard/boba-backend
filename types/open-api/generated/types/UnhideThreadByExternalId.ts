import type { GenericResponse } from "./GenericResponse";

export type UnhideThreadByExternalIdMutationResponse = any | null;

 export type UnhideThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to unhide.
     * @type string uuid
    */
    thread_id: string;
};

 export type UnhideThreadByExternalId401 = GenericResponse;

 export type UnhideThreadByExternalId403 = GenericResponse;

 export type UnhideThreadByExternalId404 = GenericResponse;
export type UnhideThreadByExternalIdMutation = {
    Response: UnhideThreadByExternalIdMutationResponse;
    PathParams: UnhideThreadByExternalIdPathParams;
    Errors: UnhideThreadByExternalId401 | UnhideThreadByExternalId403 | UnhideThreadByExternalId404;
};