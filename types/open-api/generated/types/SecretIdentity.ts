export type SecretIdentity = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string uri-reference
    */
    avatar: string;
    color?: (string | null);
    accessory?: (string | null);
};