import { z } from "zod";
import { BoardMetadataSchema } from "./BoardMetadataSchema";
import { LoggedInBoardMetadataSchema } from "./LoggedInBoardMetadataSchema";

/**
 * @description User was not found and board requires authentication.
 */
export const GetBoardsByExternalId401Schema = z.object({ "message": z.string().optional() });

 /**
       * @description User is not authorized to fetch the metadata of this board.
       */
export const GetBoardsByExternalId403Schema = z.object({ "message": z.string().optional() });
export const GetBoardsByExternalId404Schema = z.any();
export const GetBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The external id of the board to retrieve metadata for.`) });

 /**
       * @description The board metadata.
       */
export const GetBoardsByExternalIdQueryResponseSchema = z.union([z.lazy(() => BoardMetadataSchema), z.lazy(() => LoggedInBoardMetadataSchema)]);