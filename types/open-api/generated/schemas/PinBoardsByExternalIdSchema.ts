import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const PinBoardsByExternalId404Schema = z.any();
export const PinBoardsByExternalId500Schema = z.any();
export const PinBoardsByExternalIdMutationResponseSchema = z.any();
export const PinBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().describe(`The name of the board to pin.`) });
export const PinBoardsByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const PinBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);