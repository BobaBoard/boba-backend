import type { SecretIdentity } from "./SecretIdentity";
import type { Identity } from "./Identity";
import type { Tags } from "./Tags";

export type Contribution = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string uuid
    */
    parent_thread_id: string;
    parent_post_id: (string | null);
    /**
     * @type string quill-delta
    */
    content: string;
    /**
     * @type string date-time
    */
    created_at: string;
    /**
     * @description The public-facing identity associated with the contribution.
    */
    secret_identity: SecretIdentity;
    /**
     * @description The identity of the original poster, if visible to the requester.
    */
    user_identity: (Identity | null);
    /**
     * @type boolean
    */
    new: boolean;
    /**
     * @type boolean
    */
    own: boolean;
    /**
     * @type boolean
    */
    friend: boolean;
    /**
     * @type number
    */
    total_comments_amount: number;
    /**
     * @type number
    */
    new_comments_amount: number;
    /**
     * @type object
    */
    tags: Tags;
};