import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

/**
 * @description Internal Server Error
 */
export const UnstarThreadByExternalId500Schema = z.any();
export const UnstarThreadByExternalIdMutationResponseSchema = z.any();
export const UnstarThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().describe(`The id of the thread to fetch.`) });
export const UnstarThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UnstarThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const UnstarThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);