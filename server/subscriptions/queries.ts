import { Internal500Error } from "types/errors/api";
import debug from "debug";
import pool from "server/db-pool";
import sql from "./sql";

const error = debug("bobaserver:subscriptions:queries-error");

export const getLatestSubscriptionData = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}): Promise<
  | {
      subscription_id: number;
      subscription_name: string;
      subscription_string_id: string;
      last_updated_at: string;
      secret_identity_name: string | null;
      secret_identity_avatar: string | null;
      secret_identity_color: string | null;
      secret_identity_accessory: string | null;
      post_content: string;
      thread_string_id: string;
      latest_post_string_id: string | null;
    }[]
  | false
> => {
  try {
    return (await pool.manyOrNone(sql.getSubscriptionActivityByStringId, {
      subscription_string_id: subscriptionId,
      // we use page_size = 0 because the query returns always one more for the cursor
      page_size: 0,
      last_activity_cursor: null,
    })) as any;
  } catch (e) {
    throw new Internal500Error(
      `Error while getting webhooks for subscription ${subscriptionId}`
    );
  }
};

export const getTriggeredThreadsSubscriptions = async ({
  threadId,
  categoryNames,
}: {
  threadId: string;
  categoryNames: string[];
}): Promise<
  {
    name: string;
    string_id: string;
  }[]
> => {
  try {
    return await pool.manyOrNone(sql.getTriggeredThreadSubscriptions, {
      thread_string_id: threadId,
      category_names: categoryNames,
    });
  } catch (e) {
    throw new Internal500Error(
      `Error while fetching triggered thread subscriptions.`
    );
  }
};

export const getTriggeredBVSubscriptions = async ({}) => {};

export const getWebhooksForSubscriptions = async ({
  subscriptions,
}: {
  subscriptions: string[];
}): Promise<
  | {
      webhook: string;
      subscription_ids: string[];
    }[]
  | false
> => {
  try {
    return (
      await pool.manyOrNone(sql.getSubscriptionsWebhooks, {
        subscriptions_string_ids: subscriptions,
      })
    )?.filter((result: any) => result.webhook != null);
  } catch (e) {
    throw new Internal500Error(
      `Error while getting webhooks for subscriptions ${subscriptions.join(
        ", "
      )}.`
    );
  }
};

export const getTriggeredThreadCreatedWebhooks = async ({
  slug,
  categories,
}: {
  slug: string;
  categories: string[];
}): Promise<
  | {
      webhook: string;
      webhook_handler_type: "discord" | "rest";
      subscriptionNames: string[];
      triggeredCategories: string[];
      subscriptionIds: string[];
    }[]
  | false
> => {
  try {
    const result = await pool.manyOrNone(sql.getTriggeredWebhooks, {
      board_slug: slug,
      category_names: categories.map((category) =>
        category.toLowerCase().trim()
      ),
    });
    return result.map((result) => ({
      webhook: result.webhook,
      webhook_handler_type: result.webhook_handler_type,
      subscriptionNames: result.subscription_names,
      triggeredCategories: result.triggered_categories,
      subscriptionIds: result.subscription_ids,
    }));
  } catch (e) {
    throw new Internal500Error(`Error while fetching triggered webhooks.`);
  }
};
