import type { Description } from "./Description";

export type BoardDescription = {
    /**
     * @description Array of updated description objects.
     * @type array | undefined
    */
    descriptions?: Description[];
    /**
     * @description Board accent color.
     * @type string | undefined
    */
    accentColor?: string;
    /**
     * @description Board tagline.
     * @type string | undefined
    */
    tagline?: string;
};