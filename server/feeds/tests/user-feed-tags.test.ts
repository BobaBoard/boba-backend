import {
  FAVORITE_CHARACTER_THREAD_ID,
  FAVORITE_MURDER_THREAD_ID,
} from "test/data/threads";
import { ZodDbFeedType, ZodDbThreadSummaryType } from "types/db/schemas";

import { BOBATAN_USER_ID } from "test/data/auth";
import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import { getUserActivity } from "../queries";

export const extractTags = (
  thread: ZodDbThreadSummaryType | null | undefined
) => {
  if (!thread) {
    throw new Error("Extracting tags from null thread");
  }
  return {
    thread_id: thread.thread_id,
    tags: thread.index_tags,
    categories: thread.category_tags,
    content_warnings: thread.content_warnings,
    whisper_tags: thread.whisper_tags,
  };
};

export const getThreadFromActivity = (
  threadExternalId: string,
  activity: ZodDbFeedType
) => {
  return activity.activity.find(
    (thread) => thread.thread_id == threadExternalId
  );
};

describe("feed activity tags", () => {
  test("correctly fetches tags", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(getThreadFromActivity(FAVORITE_CHARACTER_THREAD_ID, feed))
        .tags
    ).toEqual(["evil", "bobapost"]);
  });

  test("correctly fetches categories", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(getThreadFromActivity(FAVORITE_MURDER_THREAD_ID, feed))
        .categories
    ).toEqual(["blood", "bruises"]);
  });

  test("correctly fetches whisper tags", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(
        getThreadFromActivity("8b2646af-2778-487e-8e44-7ae530c2549c", feed)
      ).whisper_tags
    ).toEqual(["An announcement from your headmaster!"]);
  });

  test("correctly fetches content warnings", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(
        getThreadFromActivity("8b2646af-2778-487e-8e44-7ae530c2549c", feed)
      ).content_warnings
    ).toEqual(["harassment PSA"]);
  });
});
