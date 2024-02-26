import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const MuteBoardsByExternalId404Schema = z.any();
export const MuteBoardsByExternalId500Schema = z.any();
export const MuteBoardsByExternalIdMutationResponseSchema = z.any();
export const MuteBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The external id of the board to mute.`) });
export const MuteBoardsByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const MuteBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);