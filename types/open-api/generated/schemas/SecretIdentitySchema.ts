import { z } from "zod";

export const SecretIdentitySchema = z.object({"name": z.string(),"avatar": z.string(),"color": z.union([z.string(),z.null()]).optional(),"accessory": z.union([z.string(),z.null()]).optional()});