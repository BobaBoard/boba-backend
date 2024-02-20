import type { BaseBlock } from "./BaseBlock";

export type Type2 = "rules";
export type RulesBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type2;
    /**
     * @type array
    */
    rules: {
        /**
         * @type number
        */
        index: number;
        /**
         * @type string
        */
        title: string;
        /**
         * @type string
        */
        description: string;
        /**
         * @type boolean
        */
        pinned: boolean;
    }[];
});