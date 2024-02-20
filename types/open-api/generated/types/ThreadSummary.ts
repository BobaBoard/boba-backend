import type { Contribution } from "./Contribution";
import type { ThreadActivitySummary } from "./ThreadActivitySummary";

export type DefaultView = "thread" | "gallery" | "timeline";
export type ThreadSummary = ({
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string
    */
    parent_board_slug: string;
    /**
     * @type string
    */
    parent_board_id: string;
    /**
     * @type string
    */
    parent_realm_slug: string;
    /**
     * @type string
    */
    parent_realm_id: string;
    /**
     * @description The contribution that starts the thread.
    */
    starter: Contribution;
    /**
     * @type string
    */
    default_view: DefaultView;
    /**
     * @description Whether the thread is new. False when the user is logged out.
     * @type boolean
    */
    new: boolean;
    /**
     * @description Whether the thread is muted. False when the user is logged out.
     * @type boolean
    */
    muted: boolean;
    /**
     * @description Whether the thread is hidden. False when the user is logged out.
     * @type boolean
    */
    hidden: boolean;
    /**
     * @description Whether the thread is starred.
     * @type boolean
    */
    starred: boolean;
} & ThreadActivitySummary);