import { z } from "zod";
import { CommentRequestBodySchema } from "./CommentRequestBodySchema";
import { IdentityParamsSchema } from "./IdentityParamsSchema";
import { CommentSchema } from "./CommentSchema";

/**
 * @description User was not found in request that requires authentication.
 */
export const PostComment401Schema = z.any();

 /**
       * @description User is not authorized to perform the action.
       */
export const PostComment403Schema = z.any();
export const PostCommentPathParamsSchema = z.object({ "post_id": z.string().uuid().describe(`The uuid of the contribution to reply to.`) });

 /**
       * @description The comments were successfully created.
       */
export const PostCommentMutationResponseSchema = z.object({ "comments": z.array(z.lazy(() => CommentSchema)).describe(`Finalized details of the comments just posted.`).optional() });

 /**
       * @description The details of the comment to post.
       */
export const PostCommentMutationRequestSchema = z.lazy(() => CommentRequestBodySchema).and(z.lazy(() => IdentityParamsSchema));