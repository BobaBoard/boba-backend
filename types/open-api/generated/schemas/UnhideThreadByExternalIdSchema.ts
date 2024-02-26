import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const UnhideThreadByExternalIdMutationResponseSchema = z.any();
export const UnhideThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to unhide.`) });
export const UnhideThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const UnhideThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const UnhideThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);