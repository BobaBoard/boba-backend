export type InviteWithDetails = {
    /**
     * @type string uuid
    */
    realm_id: string;
    /**
     * @type string uri-reference
    */
    invite_url: string;
    /**
     * @type string | undefined email
    */
    invitee_email?: string;
    /**
     * @type boolean
    */
    own: boolean;
    /**
     * @type string date-time
    */
    issued_at: string;
    /**
     * @type string date-time
    */
    expires_at: string;
    /**
     * @type string | undefined
    */
    label?: string;
};