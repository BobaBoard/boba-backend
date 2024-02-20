export type IdentityParams = {
    /**
     * @description The accessory to associate with the attached entity.
    */
    accessory_id?: (string | null);
    /**
     * @description The identity to associate with the attached entity, if fixed.
    */
    identity_id?: (string | null);
    /**
     * @description Force anonymity even among friends.
     * @deprecated
    */
    forceAnonymous?: (boolean | null);
} | undefined;