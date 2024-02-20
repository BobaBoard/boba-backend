import type { SubscriptionActivity } from "./SubscriptionActivity";

/**
 * @description The subscription was not found.
*/
export type GetSubscription404 = any | null;

 export type GetSubscriptionPathParams = {
    /**
     * @description The external id of the subscription.
     * @type string uuid
    */
    subscription_id: string;
};

 /**
 * @description The subscription data.
*/
export type GetSubscriptionQueryResponse = SubscriptionActivity;
export type GetSubscriptionQuery = {
    Response: GetSubscriptionQueryResponse;
    PathParams: GetSubscriptionPathParams;
    Errors: GetSubscription404;
};