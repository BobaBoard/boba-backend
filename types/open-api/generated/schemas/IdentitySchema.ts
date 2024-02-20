import { z } from "zod";

export const IdentitySchema = z.object({"name": z.union([z.string(),z.null()]),"avatar": z.union([z.string(),z.null()])});