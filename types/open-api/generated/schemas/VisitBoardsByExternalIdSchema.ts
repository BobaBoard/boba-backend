import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

/**
 * @description User was not found.
 */
export const VisitBoardsByExternalId401Schema = z.object({ "message": z.string().optional() });
export const VisitBoardsByExternalId500Schema = z.any();
export const VisitBoardsByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The external id of the board to mark as visited.`) });
export const VisitBoardsByExternalIdQueryResponseSchema = z.any();
export const VisitBoardsByExternalId403Schema = z.lazy(() => GenericResponseSchema);