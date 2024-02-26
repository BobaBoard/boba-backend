import type { SecretIdentity } from "./SecretIdentity";
import type { Identity } from "./Identity";

export type Comment = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string uuid
    */
    parent_post_id: string;
    parent_comment_id: (string | null);
    chain_parent_id: (string | null);
    /**
     * @type string quill-delta
    */
    content: string;
    /**
     * @description The public-facing identity associated with the comment.
    */
    secret_identity: SecretIdentity;
    /**
     * @description The identity of the original poster, if visible to the requester.
    */
    user_identity: (Identity | null);
    /**
     * @type string date-time
    */
    created_at: string;
    /**
     * @type boolean
    */
    own: boolean;
    /**
     * @type boolean
    */
    new: boolean;
    /**
     * @type boolean
    */
    friend: boolean;
};