import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const HideThreadByExternalIdMutationResponseSchema = z.any();
export const HideThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to unhide.`) });
export const HideThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const HideThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const HideThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);