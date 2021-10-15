import { DbFeedType, DbThreadSummaryType } from "Types";

import { getUserActivity } from "../queries";

export const extractTags = (thread: DbThreadSummaryType | null | undefined) => {
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
  threadId: string,
  activity: DbFeedType
) => {
  return activity.activity.find((thread) => thread.thread_id == threadId);
};

describe("feed activity tags", () => {
  test("correctly fetches tags", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(
        getThreadFromActivity("29d1b2da-3289-454a-9089-2ed47db4967b", feed)
      ).tags
    ).toEqual(["evil", "bobapost"]);
  });

  test("correctly fetches categories", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(
      extractTags(
        getThreadFromActivity("a5c903df-35e8-43b2-a41a-208c43154671", feed)
      ).categories
    ).toEqual(["blood", "bruises"]);
  });

  test("correctly fetches whisper tags", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
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
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
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
