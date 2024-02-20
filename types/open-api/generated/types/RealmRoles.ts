export type RealmRoles = {
    /**
     * @type array | undefined
    */
    roles?: {
        /**
         * @type string | undefined uuid
        */
        user_id?: string;
        /**
         * @description Username.
         * @type string
        */
        username: string;
        /**
         * @description String id of role.
         * @type string uuid
        */
        role_string_id: string;
        /**
         * @description Name of role.
         * @type string
        */
        role_name: string;
        /**
         * @description Label associated with role assignment
         * @type string
        */
        label: string;
    }[];
};