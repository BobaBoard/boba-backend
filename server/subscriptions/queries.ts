import debug from "debug";
import pool from "../pool";
import sql from "./sql";

const error = debug("bobaserver:subscriptions:queries-error");

export const getLatestSubscriptionData = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}): Promise<any> => {
  try {
    return await pool.many(sql.getSubscriptionActivityByStringId, {
      subscription_string_id: subscriptionId,
      // we use page_size = 0 because the query returns always one more for the cursor
      page_size: 0,
      last_activity_cursor: null,
    });
  } catch (e) {
    error(`Error while fetching subscription activity.`);
    error(e);
    return false;
  }
};

export const getTriggeredThreadsSubscriptions = async ({
  threadId,
  categoryNames,
}: {
  threadId: string;
  categoryNames: string[];
}): Promise<
  | false
  | {
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
    error(`Error while fetching triggered thread subscriptions.`);
    error(e);
    return false;
  }
};

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
    error(
      `Error while getting webhooks for subscriptions ${subscriptions.join(
        ", "
      )}.`
    );
    error(e);
    return false;
  }
};
