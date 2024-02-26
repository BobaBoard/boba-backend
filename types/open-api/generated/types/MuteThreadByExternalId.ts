import type { GenericResponse } from "./GenericResponse";

export type MuteThreadByExternalIdMutationResponse = any | null;

 export type MuteThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to mute.
     * @type string uuid
    */
    thread_id: string;
};

 export type MuteThreadByExternalId401 = GenericResponse;

 export type MuteThreadByExternalId403 = GenericResponse;

 export type MuteThreadByExternalId404 = GenericResponse;
export type MuteThreadByExternalIdMutation = {
    Response: MuteThreadByExternalIdMutationResponse;
    PathParams: MuteThreadByExternalIdPathParams;
    Errors: MuteThreadByExternalId401 | MuteThreadByExternalId403 | MuteThreadByExternalId404;
};