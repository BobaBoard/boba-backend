import type { BaseDescription } from "./BaseDescription";

export type Type5 = "category_filter";
export type CategoryFilterDescription = (BaseDescription & {
    /**
     * @type string
    */
    type: Type5;
    /**
     * @type array
    */
    categories: string[];
});