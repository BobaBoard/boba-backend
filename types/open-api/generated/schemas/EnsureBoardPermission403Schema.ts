import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsureBoardPermission403Schema = z.lazy(() => GenericResponseSchema);