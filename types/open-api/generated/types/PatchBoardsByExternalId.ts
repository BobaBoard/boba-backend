import type { BoardDescription } from "./BoardDescription";
import type { LoggedInBoardMetadata } from "./LoggedInBoardMetadata";

export type PatchBoardsByExternalId401 = any | null;

 export type PatchBoardsByExternalId403 = any | null;

 export type PatchBoardsByExternalId404 = any | null;

 export type PatchBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to update metadata for.
     * @type string uuid
    */
    board_id: string;
};

 /**
 * @description request body
*/
export type PatchBoardsByExternalIdMutationRequest = BoardDescription;

 /**
 * @description The board metadata.
*/
export type PatchBoardsByExternalIdMutationResponse = LoggedInBoardMetadata;
export type PatchBoardsByExternalIdMutation = {
    Response: PatchBoardsByExternalIdMutationResponse;
    Request: PatchBoardsByExternalIdMutationRequest;
    PathParams: PatchBoardsByExternalIdPathParams;
    Errors: PatchBoardsByExternalId401 | PatchBoardsByExternalId403 | PatchBoardsByExternalId404;
};