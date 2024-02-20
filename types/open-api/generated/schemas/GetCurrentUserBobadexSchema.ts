import { z } from "zod";
import { BobaDexSchema } from "./BobaDexSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const GetCurrentUserBobadex401Schema = z.any();

 /**
       * @description The bobadex data.
       */
export const GetCurrentUserBobadexQueryResponseSchema = z.lazy(() => BobaDexSchema);