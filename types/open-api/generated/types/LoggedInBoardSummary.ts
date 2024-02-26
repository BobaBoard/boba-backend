import type { BoardSummary } from "./BoardSummary";

export type LoggedInBoardSummary = (BoardSummary & {
    /**
     * @type boolean
    */
    muted: boolean;
    /**
     * @type boolean
    */
    pinned: boolean;
});