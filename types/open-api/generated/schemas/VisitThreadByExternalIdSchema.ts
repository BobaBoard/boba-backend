import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";

export const VisitThreadByExternalIdMutationResponseSchema = z.any();
export const VisitThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread that is being visited.`) });
export const VisitThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const VisitThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const VisitThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);