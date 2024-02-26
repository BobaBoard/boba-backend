import type { GenericResponse } from "./GenericResponse";

export type MuteBoardsByExternalId404 = any | null;

 export type MuteBoardsByExternalId500 = any | null;

 export type MuteBoardsByExternalIdMutationResponse = any | null;

 export type MuteBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to mute.
     * @type string uuid
    */
    board_id: string;
};

 export type MuteBoardsByExternalId401 = GenericResponse;

 export type MuteBoardsByExternalId403 = GenericResponse;
export type MuteBoardsByExternalIdMutation = {
    Response: MuteBoardsByExternalIdMutationResponse;
    PathParams: MuteBoardsByExternalIdPathParams;
    Errors: MuteBoardsByExternalId401 | MuteBoardsByExternalId403 | MuteBoardsByExternalId404 | MuteBoardsByExternalId500;
};