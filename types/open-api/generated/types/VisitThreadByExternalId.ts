import type { GenericResponse } from "./GenericResponse";

export type VisitThreadByExternalIdMutationResponse = any | null;

 export type VisitThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread that is being visited.
     * @type string uuid
    */
    thread_id: string;
};

 export type VisitThreadByExternalId401 = GenericResponse;

 export type VisitThreadByExternalId403 = GenericResponse;

 export type VisitThreadByExternalId404 = GenericResponse;
export type VisitThreadByExternalIdMutation = {
    Response: VisitThreadByExternalIdMutationResponse;
    PathParams: VisitThreadByExternalIdPathParams;
    Errors: VisitThreadByExternalId401 | VisitThreadByExternalId403 | VisitThreadByExternalId404;
};