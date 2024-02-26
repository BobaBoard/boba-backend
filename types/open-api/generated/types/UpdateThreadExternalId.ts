import type { GenericResponse } from "./GenericResponse";

export type UpdateThreadExternalIdMutationRequestDefaultView = "thread" | "gallery" | "timeline";
/**
 * @description request body
*/
export type UpdateThreadExternalIdMutationRequest = {
    /**
     * @description The default view that the thread should use.
     * @type string | undefined
    */
    defaultView?: UpdateThreadExternalIdMutationRequestDefaultView;
    /**
     * @description The id of the board that the thread should be moved to.
     * @type string | undefined uuid
    */
    parentBoardId?: string;
};

 export type UpdateThreadExternalIdMutationResponse = any | null;

 export type UpdateThreadExternalIdPathParams = {
    /**
     * @description The id of the thread whose properties should be updated.
     * @type string uuid
    */
    thread_id: string;
};

 export type UpdateThreadExternalId401 = GenericResponse;

 export type UpdateThreadExternalId403 = GenericResponse;

 export type UpdateThreadExternalId404 = GenericResponse;
export type UpdateThreadExternalIdMutation = {
    Response: UpdateThreadExternalIdMutationResponse;
    Request: UpdateThreadExternalIdMutationRequest;
    PathParams: UpdateThreadExternalIdPathParams;
    Errors: UpdateThreadExternalId401 | UpdateThreadExternalId403 | UpdateThreadExternalId404;
};