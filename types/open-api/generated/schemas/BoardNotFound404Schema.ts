import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const BoardNotFound404Schema = z.lazy(() => GenericResponseSchema);