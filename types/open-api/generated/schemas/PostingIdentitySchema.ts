import { z } from "zod";

export const PostingIdentitySchema = z.object({"id": z.string().uuid(),"name": z.string(),"avatar_url": z.string().optional(),"color": z.union([z.string(),z.null()]).optional(),"accessory": z.union([z.string(),z.null()]).optional()});