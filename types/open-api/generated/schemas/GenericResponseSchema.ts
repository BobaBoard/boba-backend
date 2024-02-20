import { z } from "zod";

export const GenericResponseSchema = z.object({"message": z.string().optional()}).describe(`Generic response object`);