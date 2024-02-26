import type { UiBlock } from "./UiBlock";
import type { RealmSettings } from "./RealmSettings";
import type { RealmPermissions } from "./RealmPermissions";
import type { BoardSummary } from "./BoardSummary";

export type Realm = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string
    */
    slug: string;
    /**
     * @type string uri
    */
    icon: string;
    /**
     * @description Settings for the Realm homepage.
     * @type object
    */
    homepage: {
        /**
         * @description List of UI Blocks that appear in the Realm homepage.
         * @type array
        */
        blocks: UiBlock[];
    };
    settings: RealmSettings;
    realm_permissions: RealmPermissions;
    /**
     * @type array
    */
    boards: BoardSummary[];
};