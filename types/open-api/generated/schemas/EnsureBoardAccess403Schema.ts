import { GenericResponseSchema } from "./GenericResponseSchema";
import { z } from "zod";

export const EnsureBoardAccess403Schema = z.lazy(() => GenericResponseSchema);