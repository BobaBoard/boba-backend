import { SecretIdentitySchema } from "./SecretIdentitySchema";
import { IdentitySchema } from "./IdentitySchema";
import { TagsSchema } from "./TagsSchema";
import { z } from "zod";

export const ContributionSchema = z.object({"id": z.string().uuid(),"parent_thread_id": z.string().uuid(),"parent_post_id": z.union([z.string(),z.null()]),"content": z.string(),"created_at": z.string().datetime(),"secret_identity": z.lazy(() => SecretIdentitySchema),"user_identity": z.union([z.lazy(() => IdentitySchema),z.null()]),"new": z.boolean(),"own": z.boolean(),"friend": z.boolean(),"total_comments_amount": z.number(),"new_comments_amount": z.number(),"tags": z.lazy(() => TagsSchema)}).describe(`A contribution to a thread.`);