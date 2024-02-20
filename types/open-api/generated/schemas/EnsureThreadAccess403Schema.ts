import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsureThreadAccess403Schema = z.lazy(() => GenericResponseSchema);