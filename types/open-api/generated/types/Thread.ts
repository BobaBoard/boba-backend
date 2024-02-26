import type { Contribution } from "./Contribution";
import type { Comment } from "./Comment";
import type { ThreadSummary } from "./ThreadSummary";

export type Thread = ({
    /**
     * @type array
    */
    posts: Contribution[];
    /**
     * @description A map from post_id to its comments.
     * @type object
    */
    comments: {
        [key: string]: Comment[];
    };
} & ThreadSummary);