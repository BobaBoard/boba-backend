import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

/**
 * @description Internal Server Error
 */
export const StarThreadByExternalId500Schema = z.any();
export const StarThreadByExternalIdMutationResponseSchema = z.any();
export const StarThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to star.`) });
export const StarThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const StarThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const StarThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);