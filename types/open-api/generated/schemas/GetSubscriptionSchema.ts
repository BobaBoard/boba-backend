import { z } from "zod";
import { SubscriptionActivitySchema } from "./SubscriptionActivitySchema";

/**
 * @description The subscription was not found.
 */
export const GetSubscription404Schema = z.any();
export const GetSubscriptionPathParamsSchema = z.object({ "subscription_id": z.string().uuid().describe(`The external id of the subscription.`) });

 /**
       * @description The subscription data.
       */
export const GetSubscriptionQueryResponseSchema = z.lazy(() => SubscriptionActivitySchema);