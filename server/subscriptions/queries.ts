import { Internal500Error } from "types/errors/api";
import debug from "debug";
import pool from "server/db-pool";
import sql from "./sql";

const error = debug("bobaserver:subscriptions:queries-error");

export const getLatestSubscriptionData = async ({
  subscriptionExternalId,
}: {
  subscriptionExternalId: string;
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
      thread_external_id: string;
      latest_post_string_id: string | null;
    }[]
  | false
> => {
  try {
    return (await pool.manyOrNone(sql.getSubscriptionActivityByExternalId, {
      subscription_string_id: subscriptionExternalId,
      // we use page_size = 0 because the query returns always one more for the cursor
      page_size: 0,
      last_activity_cursor: null,
    })) as any;
  } catch (e) {
    throw new Internal500Error(
      `Error while getting webhooks for subscription ${subscriptionExternalId}`
    );
  }
};

export const getTriggeredThreadsSubscriptions = async ({
  threadExternalId,
  categoryNames,
}: {
  threadExternalId: string;
  categoryNames: string[];
}): Promise<
  {
    name: string;
    id: string;
  }[]
> => {
  try {
    return (
      await pool.manyOrNone(sql.getTriggeredThreadSubscriptions, {
        thread_external_id: threadExternalId,
        category_names: categoryNames,
      })
    )?.map((s) => ({
      name: s.name,
      id: s.string_id,
    }));
  } catch (e) {
    throw new Internal500Error(
      `Error while fetching triggered thread subscriptions.`
    );
  }
};

export const getTriggeredBoardSubscriptions = async ({
  boardExternalId,
  categories,
}: {
  boardExternalId: string;
  categories: string[];
}): Promise<
  {
    name: string;
    id: string;
  }[]
> => {
  try {
    return (
      await pool.manyOrNone(sql.getTriggeredBoardSubscriptions, {
        board_external_id: boardExternalId,
        category_names: categories,
      })
    )?.map((s) => ({
      name: s.name,
      id: s.string_id,
    }));
  } catch (e) {
    throw new Internal500Error(
      `Error while fetching triggered thread subscriptions.`
    );
  }
};

export const getWebhooksForSubscriptions = async ({
  subscriptionIds,
}: {
  subscriptionIds: string[];
}): Promise<
  | {
      webhook: string;
      webhookHandlerType: "rest" | "discord";
      subscriptionIds: string[];
    }[]
> => {
  try {
    return (
      await pool.manyOrNone(sql.getWebhooksForSubscription, {
        subscriptions_string_ids: subscriptionIds,
      })
    ).map((s) => ({
      webhook: s.webhook,
      webhookHandlerType: s.webhook_handler_type,
      subscriptionIds: s.subscription_ids,
    }));
  } catch (e) {
    throw new Internal500Error(
      `Error while getting webhooks for subscriptions ${subscriptionIds.join(
        ", "
      )}.`
    );
  }
};
