import type { BoardActivitySummary } from "./BoardActivitySummary";

export type RealmActivity = {
    /**
     * @description The Realm id.
     * @type string | undefined uuid
    */
    id?: string;
    /**
     * @description The activity summary for each board in the realm. |
    Keys are the uuid of each board.
    
     * @type object | undefined
    */
    boards?: {
        [key: string]: ({
            /**
             * @type string | undefined uuid
            */
            id?: string;
        } & BoardActivitySummary);
    };
};