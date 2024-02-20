import { SecretIdentitySchema } from "./SecretIdentitySchema";
import { IdentitySchema } from "./IdentitySchema";
import { z } from "zod";

export const CommentSchema = z.object({"id": z.string().uuid(),"parent_post_id": z.string().uuid(),"parent_comment_id": z.union([z.string(),z.null()]),"chain_parent_id": z.union([z.string(),z.null()]),"content": z.string(),"secret_identity": z.lazy(() => SecretIdentitySchema),"user_identity": z.union([z.lazy(() => IdentitySchema),z.null()]),"created_at": z.string().datetime(),"own": z.boolean(),"new": z.boolean(),"friend": z.boolean()});