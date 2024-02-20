import type { BaseBlock } from "./BaseBlock";

export type Type = "text";
export type TextBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type;
    /**
     * @type string
    */
    description: string;
});