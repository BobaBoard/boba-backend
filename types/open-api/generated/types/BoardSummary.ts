export type BoardSummary = {
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
    slug: string;
    /**
     * @type string uri-reference
    */
    avatar_url: string;
    /**
     * @type string
    */
    tagline: string;
    /**
     * @type string
    */
    accent_color: string;
    /**
     * @type boolean
    */
    logged_in_only: boolean;
    /**
     * @type boolean
    */
    delisted: boolean;
};