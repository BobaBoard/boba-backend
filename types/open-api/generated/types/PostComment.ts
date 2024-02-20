import type { CommentRequestBody } from "./CommentRequestBody";
import type { IdentityParams } from "./IdentityParams";
import type { Comment } from "./Comment";

/**
 * @description User was not found in request that requires authentication.
*/
export type PostComment401 = any | null;

 /**
 * @description User is not authorized to perform the action.
*/
export type PostComment403 = any | null;

 export type PostCommentPathParams = {
    /**
     * @description The uuid of the contribution to reply to.
     * @type string uuid
    */
    post_id: string;
};

 /**
 * @description The comments were successfully created.
*/
export type PostCommentMutationResponse = {
    /**
     * @description Finalized details of the comments just posted.
     * @type array | undefined
    */
    comments?: Comment[];
};

 /**
 * @description The details of the comment to post.
*/
export type PostCommentMutationRequest = (CommentRequestBody & IdentityParams);
export type PostCommentMutation = {
    Response: PostCommentMutationResponse;
    Request: PostCommentMutationRequest;
    PathParams: PostCommentPathParams;
    Errors: PostComment401 | PostComment403;
};