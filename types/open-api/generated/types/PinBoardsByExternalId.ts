import type { GenericResponse } from "./GenericResponse";

export type PinBoardsByExternalId404 = any | null;

 export type PinBoardsByExternalId500 = any | null;

 export type PinBoardsByExternalIdMutationResponse = any | null;

 export type PinBoardsByExternalIdPathParams = {
    /**
     * @description The name of the board to pin.
     * @type string
    */
    board_id: string;
};

 export type PinBoardsByExternalId401 = GenericResponse;

 export type PinBoardsByExternalId403 = GenericResponse;
export type PinBoardsByExternalIdMutation = {
    Response: PinBoardsByExternalIdMutationResponse;
    PathParams: PinBoardsByExternalIdPathParams;
    Errors: PinBoardsByExternalId401 | PinBoardsByExternalId403 | PinBoardsByExternalId404 | PinBoardsByExternalId500;
};