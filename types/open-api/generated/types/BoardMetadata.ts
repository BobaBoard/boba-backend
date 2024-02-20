import type { BoardSummary } from "./BoardSummary";
import type { Description } from "./Description";

export type BoardMetadata = (BoardSummary & {
    /**
     * @type array
    */
    descriptions: Description[];
});