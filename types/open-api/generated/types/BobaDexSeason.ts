import type { PostingIdentity } from "./PostingIdentity";

export type BobaDexSeason = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string
    */
    realm_id: string;
    /**
     * @type string
    */
    name: string;
    /**
     * @description How many identities are in this season. Note that just the array of identities isn't enough, cause it doesn't tell us how many identities are in total in the BobaDex season.
    
     * @type number
    */
    identities_count: number;
    /**
     * @type array
    */
    caught_identities: {
        /**
         * @type number
        */
        index: number;
        identity: PostingIdentity;
    }[];
};