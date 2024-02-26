import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

/**
 * @description request body
 */
export const UpdateThreadExternalIdMutationRequestSchema = z.object({ "defaultView": z.enum([`thread`, `gallery`, `timeline`]).describe(`The default view that the thread should use.`).optional(), "parentBoardId": z.string().uuid().describe(`The id of the board that the thread should be moved to.`).optional() });
export const UpdateThreadExternalIdMutationResponseSchema = z.any();
export const UpdateThreadExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread whose properties should be updated.`) });
export const UpdateThreadExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UpdateThreadExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const UpdateThreadExternalId404Schema = z.lazy(() => GenericResponseSchema);