import type { BaseDescription } from "./BaseDescription";

export type Type4 = "text";
export type TextDescription = (BaseDescription & {
    /**
     * @type string
    */
    type: Type4;
    /**
     * @type string
    */
    description: string;
});