import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const ThreadNotFound404Schema = z.lazy(() => GenericResponseSchema);