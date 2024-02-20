import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const UnmuteThreadByExternalIdMutationResponseSchema = z.any();
export const UnmuteThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to unmute.`) });
export const UnmuteThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UnmuteThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const UnmuteThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);