import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { ThreadSchema } from "./ThreadSchema";

export const GetThreadByExternalIdPathParamsSchema = z.object({ "thread_id": z.string().uuid().describe(`The id of the thread to fetch.`) });
export const GetThreadByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const GetThreadByExternalId403Schema = z.lazy(() => GenericResponseSchema);
export const GetThreadByExternalId404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The thread data.
       */
export const GetThreadByExternalIdQueryResponseSchema = z.lazy(() => ThreadSchema);