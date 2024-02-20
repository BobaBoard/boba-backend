import type { Setting } from "./Setting";

export type RealmSettings = {
    /**
     * @type object
    */
    root: {
        /**
         * @type object | undefined
        */
        cursor?: object;
    };
    /**
     * @type array
    */
    index_page: Setting[];
    /**
     * @type array
    */
    board_page: Setting[];
    /**
     * @type array
    */
    thread_page: Setting[];
};