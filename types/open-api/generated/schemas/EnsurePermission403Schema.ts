import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsurePermission403Schema = z.lazy(() => GenericResponseSchema);