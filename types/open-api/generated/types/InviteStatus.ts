export type InviteStatusInviteStatus = "pending" | "used" | "expired";
export type InviteStatus = {
    /**
     * @type string uuid
    */
    realm_id: string;
    /**
     * @type string
    */
    realm_slug: string;
    /**
     * @type string
    */
    invite_status: InviteStatusInviteStatus;
    /**
     * @type boolean
    */
    requires_email: boolean;
};