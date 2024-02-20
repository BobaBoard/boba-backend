import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const DismissBoardsByExternalId401Schema = z.any();
export const DismissBoardsByExternalId404Schema = z.any();
export const DismissBoardsByExternalId500Schema = z.any();
export const DismissBoardsByExternalIdMutationResponseSchema = z.any();
export const DismissBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The external id of the board to dismiss notifications for.`) });
export const DismissBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);