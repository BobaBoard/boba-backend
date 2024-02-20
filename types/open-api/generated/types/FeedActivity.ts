import type { Cursor } from "./Cursor";
import type { ThreadSummary } from "./ThreadSummary";

export type FeedActivity = {
    cursor: Cursor;
    /**
     * @type array
    */
    activity: ThreadSummary[];
};