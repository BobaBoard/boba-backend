import type { BoardMetadata } from "./BoardMetadata";
import type { LoggedInBoardMetadata } from "./LoggedInBoardMetadata";

/**
 * @description User was not found and board requires authentication.
*/
export type GetBoardsByExternalId401 = {
    /**
     * @type string | undefined
    */
    message?: string;
};

 /**
 * @description User is not authorized to fetch the metadata of this board.
*/
export type GetBoardsByExternalId403 = {
    /**
     * @type string | undefined
    */
    message?: string;
};

 export type GetBoardsByExternalId404 = any | null;

 export type GetBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to retrieve metadata for.
     * @type string uuid
    */
    board_id: string;
};

 /**
 * @description The board metadata.
*/
export type GetBoardsByExternalIdQueryResponse = (BoardMetadata | LoggedInBoardMetadata);
export type GetBoardsByExternalIdQuery = {
    Response: GetBoardsByExternalIdQueryResponse;
    PathParams: GetBoardsByExternalIdPathParams;
    Errors: GetBoardsByExternalId401 | GetBoardsByExternalId403 | GetBoardsByExternalId404;
};