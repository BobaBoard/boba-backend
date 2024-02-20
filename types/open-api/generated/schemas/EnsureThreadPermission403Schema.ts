import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsureThreadPermission403Schema = z.lazy(() => GenericResponseSchema);