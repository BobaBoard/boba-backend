import { QueryFile } from "pg-promise";
import path from "path";

export const getTriggeredThreadSubscriptions = `
    SELECT DISTINCT 
        subscriptions.name,
        subscriptions.string_id 
    FROM subscriptions
        INNER JOIN thread_category_subscriptions tcs ON tcs.subscription_id = subscriptions.id
        INNER JOIN threads ON threads.id = tcs.thread_id
        INNER JOIN posts ON posts.parent_thread = tcs.thread_id
        INNER JOIN post_categories ON posts.id = post_categories.post_id AND tcs.category_id = post_categories.category_id 
        INNER JOIN categories ON post_categories.category_id = categories.id
    WHERE threads.string_id = $/thread_string_id/ AND categories.category = ANY($/category_names/)`;

export const getSubscriptionsWebhooks = `
    SELECT 
        webhook,
        handler_type AS webhook_handler_type,
        array_agg(DISTINCT subscriptions.string_id) AS subscription_ids
    FROM subscriptions
    LEFT JOIN subscription_webhooks sw ON subscriptions.id = sw.subscription_id
    LEFT JOIN webhooks ON sw.webhook_id = webhooks.id
    WHERE subscriptions.string_id = ANY($/subscriptions_string_ids/)
    GROUP BY webhook, webhook_handler_type
`;

const getTriggeredWebhooks = `
    SELECT
        webhook,
        handler_type AS webhook_handler_type,
        array_agg(DISTINCT subscriptions.string_id) AS subscription_ids,
        array_agg(DISTINCT subscriptions.name) AS subscription_names,
        array_agg(DISTINCT categories.category) AS triggered_categories
    FROM subscriptions
        LEFT JOIN board_category_subscriptions bcs ON bcs.subscription_id = subscriptions.id
        LEFT JOIN boards ON bcs.board_id = boards.id
        LEFT JOIN categories ON bcs.category_id = categories.id
        LEFT JOIN subscription_webhooks sw ON subscriptions.id = sw.subscription_id
        LEFT JOIN webhooks ON sw.webhook_id = webhooks.id
    WHERE boards.slug = $/board_slug/ AND categories.category = ANY($/category_names/)
    GROUP BY webhook, webhook_handler_type
`;

export default {
  getSubscriptionActivityByStringId: new QueryFile(
    path.join(__dirname, "subscription-activity-by-string-id.sql")
  ),
  getTriggeredThreadSubscriptions,
  getSubscriptionsWebhooks,
  getTriggeredWebhooks,
};
