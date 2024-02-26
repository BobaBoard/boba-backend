import { z } from "zod";
import { BoardDescriptionSchema } from "./BoardDescriptionSchema";
import { LoggedInBoardMetadataSchema } from "./LoggedInBoardMetadataSchema";

export const PatchBoardsByExternalId401Schema = z.any();
export const PatchBoardsByExternalId403Schema = z.any();
export const PatchBoardsByExternalId404Schema = z.any();
export const PatchBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The external id of the board to update metadata for.`) });

 /**
       * @description request body
       */
export const PatchBoardsByExternalIdMutationRequestSchema = z.lazy(() => BoardDescriptionSchema);

 /**
       * @description The board metadata.
       */
export const PatchBoardsByExternalIdMutationResponseSchema = z.lazy(() => LoggedInBoardMetadataSchema);