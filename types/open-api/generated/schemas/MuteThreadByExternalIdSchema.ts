import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const MuteThreadByExternalIdMutationResponseSchema = z.any();
export const MuteThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to mute.`) });
export const MuteThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const MuteThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const MuteThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);