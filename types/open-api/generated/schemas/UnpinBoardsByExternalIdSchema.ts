import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const UnpinBoardsByExternalId404Schema = z.any();
export const UnpinBoardsByExternalId500Schema = z.any();
export const UnpinBoardsByExternalIdMutationResponseSchema = z.any();
export const UnpinBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The name of the board to unpin.`) });
export const UnpinBoardsByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UnpinBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);