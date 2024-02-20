import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const UnmuteBoardsByExternalId404Schema = z.any();
export const UnmuteBoardsByExternalId500Schema = z.any();
export const UnmuteBoardsByExternalIdMutationResponseSchema = z.any();
export const UnmuteBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().describe(`The name of the board to unmute.`) });
export const UnmuteBoardsByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UnmuteBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);