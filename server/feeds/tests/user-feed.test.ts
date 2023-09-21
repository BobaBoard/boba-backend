import { BOBATAN_USER_ID, ONCEST_USER_ID } from "test/data/auth";
import {
  FAVORITE_CHARACTER_THREAD_ID,
  FAVORITE_MURDER_THREAD_ID,
} from "test/data/threads";

import { TWISTED_MINDS_REALM_EXTERNAL_ID } from "test/data/realms";
import { extractActivity } from "utils/test-utils";
import { getUserActivity } from "../queries";

describe("feed activity queries", () => {
  test("updated: TRUE, own: TRUE", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: true,
      ownOnly: true,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 2,
        created_at: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity_at: "2020-10-04T05:44:00.00Z",
        thread_last_activity_at_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  test("updated: FALSE, own: TRUE", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: true,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 2,
        created_at: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity_at: "2020-10-04T05:44:00.00Z",
        thread_last_activity_at_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 0,
        created_at: "2020-08-22T03:34:39.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "b2c57275-512e-4821-8cf8-b3ac76e1e044",
        posts_amount: 136,
        thread_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032", // Meme Thread Id
        thread_last_activity_at: "2020-08-22T03:36:55.00Z",
        thread_last_activity_at_micro: "2020-08-22T03:36:55.850000",
        threads_amount: 135,
      },
      {
        comments_amount: 0,
        created_at: "2020-04-24T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: FAVORITE_MURDER_THREAD_ID,
        thread_last_activity_at: "2020-05-03T09:47:00.00Z",
        thread_last_activity_at_micro: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  test("updated: TRUE, own: FALSE", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: true,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 2,
        created_at: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity_at: "2020-10-04T05:44:00.00Z",
        thread_last_activity_at_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  test("updated: FALSE, own: FALSE", async () => {
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

    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 2,
        created_at: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity_at: "2020-10-04T05:44:00.00Z",
        thread_last_activity_at_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 0,
        created_at: "2020-08-22T03:34:39.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "b2c57275-512e-4821-8cf8-b3ac76e1e044",
        posts_amount: 136,
        thread_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032", // Meme Thread Id
        thread_last_activity_at: "2020-08-22T03:36:55.00Z",
        thread_last_activity_at_micro: "2020-08-22T03:36:55.850000",
        threads_amount: 135,
      },
      {
        comments_amount: 2,
        created_at: "2020-04-30T03:23:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        thread_last_activity_at: "2020-05-23T05:52:00.00Z",
        thread_last_activity_at_micro: "2020-05-23T05:52:00.000000",
        threads_amount: 2,
      },
      {
        comments_amount: 0,
        created_at: "2020-04-24T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: FAVORITE_MURDER_THREAD_ID,
        thread_last_activity_at: "2020-05-03T09:47:00.00Z",
        thread_last_activity_at_micro: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  test("updated: FALSE, own: FALSE WITH CURSOR", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
      pageSize: 1,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.cursor).toBe(
      "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDgtMjJUMDM6MzY6NTUuODUwMDAwIiwicGFnZV9zaXplIjoxfQ=="
    );
    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 2,
        created_at: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity_at: "2020-10-04T05:44:00.00Z",
        thread_last_activity_at_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  test("updated: FALSE, own: FALSE WITH CURSOR (PAGE 2)", async () => {
    const feed = await getUserActivity({
      firebaseId: BOBATAN_USER_ID,
      realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
      cursor:
      "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDgtMjJUMDM6MzY6NTUuODUwMDAwIiwicGFnZV9zaXplIjoxfQ==",
      updatedOnly: false,
      ownOnly: false,
      pageSize: 1,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).toEqual([
      {
        comments_amount: 0,
        created_at: "2020-08-22T03:34:39.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "b2c57275-512e-4821-8cf8-b3ac76e1e044",
        posts_amount: 136,
        thread_id: "2765f36a-b4f9-4efe-96f2-cb34f055d032", // Meme Thread Id
        thread_last_activity_at: "2020-08-22T03:36:55.00Z",
        thread_last_activity_at_micro: "2020-08-22T03:36:55.850000",
        threads_amount: 135,
      },
    ]);
  });

  describe("correctly considers board notifications dismissal", () => {
    test("updated: FALSE, own: FALSE", async () => {
      const feed = await getUserActivity({
        firebaseId: ONCEST_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
        cursor: null,
        updatedOnly: false,
        ownOnly: false,
        pageSize: 10,
      });

      if (feed === false) {
        throw Error("User feed fetching encountered an Error.");
      }

      expect(feed.cursor).toBe(null);
      expect(feed.activity.length).toEqual(3);
      // Ensure that the post in !long with the dismissed board notifications
      // is counted when "updatedOnly" is false.
      expect(extractActivity(feed.activity[2])).toEqual({
        comments_amount: 2,
        created_at: "2020-04-01T05:20:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "f423a2f4-7a8a-4d3d-8858-c1c7602133da",
        posts_amount: 1,
        thread_id: "90119d99-359d-4a60-b5ab-9b6077d0dc39",
        thread_last_activity_at: "2020-04-01T05:22:00.00Z",
        thread_last_activity_at_micro: "2020-04-01T05:22:00.000000",
        threads_amount: 0,
      });
    });
  });

  describe("correctly considers board notifications dismissal", () => {
    test("updated: true, own: FALSE", async () => {
      const feed = await getUserActivity({
        firebaseId: ONCEST_USER_ID,
        realmExternalId: TWISTED_MINDS_REALM_EXTERNAL_ID,
        cursor: null,
        updatedOnly: true,
        ownOnly: false,
        pageSize: 10,
      });

      if (feed === false) {
        throw Error("User feed fetching encountered an Error.");
      }

      expect(feed.cursor).toBe(null);
      // Ensure that the post in !long with the dismissed board notifications
      // is not counted in "updatedOnly".
      expect(feed.activity.length).toEqual(2);
    });
  });

  test.todo("Does not display threads from another realm.");
});
