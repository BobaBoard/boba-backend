import type { LoggedInBoardSummary } from "./LoggedInBoardSummary";
import type { BoardMetadata } from "./BoardMetadata";
import type { Accessory } from "./Accessory";
import type { Permissions } from "./Permissions";
import type { PostingIdentity } from "./PostingIdentity";

export type LoggedInBoardMetadata = (LoggedInBoardSummary & BoardMetadata & {
    /**
     * @type array
    */
    accessories: Accessory[];
    permissions: Permissions;
    /**
     * @type array
    */
    posting_identities: PostingIdentity[];
});