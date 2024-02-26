import type { BaseBlock } from "./BaseBlock";

export type Type3 = "subscription";
export type SubscriptionBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type3;
    /**
     * @type string uuid
    */
    subscription_id: string;
});