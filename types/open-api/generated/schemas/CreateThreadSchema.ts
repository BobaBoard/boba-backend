import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { ThreadSchema } from "./ThreadSchema";

export const CreateThreadSchema = z.object({"content": z.string().describe(`The content of the first post in the thread.`),"forceAnonymous": z.union([z.boolean(),z.null()]).optional(),"defaultView": z.enum([`thread`,`gallery`,`timeline`]).describe(`The default view that the thread will display as.`).optional(),"identityId": z.string().uuid().describe(`The identity the original poster will use to create the thread.`).optional(),"accessoryId": z.string().uuid().describe(`The accessory that the original poster will use in the thread.`).optional(),"whisper_tags": z.array(z.string()).describe(`The whisper tags associated with the thread.`).optional(),"index_tags": z.array(z.string()).describe(`The searchable tags associated with the thread.`).optional(),"content_warnings": z.array(z.string()).describe(`The content warnings associated with the thread.`).optional(),"category_tags": z.array(z.string()).describe(`The categories associated with the thread.`).optional()});
export const CreateThreadPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The id for the board in which the thread will be created.`) });
export const CreateThread401Schema = z.lazy(() => GenericResponseSchema);
export const CreateThread403Schema = z.lazy(() => GenericResponseSchema);
export const CreateThread404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description request body
       */
export const CreateThreadMutationRequestSchema = z.lazy(() => CreateThreadSchema);

 /**
       * @description Thread has been created.
       */
export const CreateThreadMutationResponseSchema = z.lazy(() => ThreadSchema);