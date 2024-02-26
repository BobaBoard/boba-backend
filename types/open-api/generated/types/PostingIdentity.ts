export type PostingIdentity = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string
    */
    name: string;
    /**
     * @type string | undefined uri-reference
    */
    avatar_url?: string;
    color?: (string | null);
    accessory?: (string | null);
};