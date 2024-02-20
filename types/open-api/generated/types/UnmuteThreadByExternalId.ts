import type { GenericResponse } from "./GenericResponse";

export type UnmuteThreadByExternalIdMutationResponse = any | null;

 export type UnmuteThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to unmute.
     * @type string uuid
    */
    thread_id: string;
};

 export type UnmuteThreadByExternalId401 = GenericResponse;

 export type UnmuteThreadByExternalId403 = GenericResponse;

 export type UnmuteThreadByExternalId404 = GenericResponse;
export type UnmuteThreadByExternalIdMutation = {
    Response: UnmuteThreadByExternalIdMutationResponse;
    PathParams: UnmuteThreadByExternalIdPathParams;
    Errors: UnmuteThreadByExternalId401 | UnmuteThreadByExternalId403 | UnmuteThreadByExternalId404;
};