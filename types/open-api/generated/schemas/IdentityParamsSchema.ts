import { z } from "zod";

export const IdentityParamsSchema = z.object({"accessory_id": z.union([z.string(),z.null()]).optional(),"identity_id": z.union([z.string(),z.null()]).optional(),"forceAnonymous": z.union([z.boolean(),z.null()]).optional()}).optional();