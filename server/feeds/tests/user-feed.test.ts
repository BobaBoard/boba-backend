import "mocha";
import { expect } from "chai";

import { getUserActivity } from "../queries";
import { extractActivity } from "./board-feed.test";

describe("feed activity queries", () => {
  it("updated: TRUE, own: TRUE", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: true,
      ownOnly: true,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).to.deep.equal([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.00Z",
        thread_last_activity_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  it("updated: FALSE, own: TRUE", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: true,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.00Z",
        thread_last_activity_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 0,
        created: "2020-04-24T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        thread_last_activity: "2020-05-03T09:47:00.00Z",
        thread_last_activity_micro: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  it("updated: TRUE, own: FALSE", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: true,
      ownOnly: false,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.activity.map(extractActivity)).to.deep.equal([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.00Z",
        thread_last_activity_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  it("updated: FALSE, own: FALSE", async () => {
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

    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.00Z",
        thread_last_activity_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 2,
        created: "2020-04-30T03:23:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        thread_last_activity: "2020-05-23T05:52:00.00Z",
        thread_last_activity_micro: "2020-05-23T05:52:00.000000",
        threads_amount: 2,
      },
      {
        comments_amount: 0,
        created: "2020-04-24T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        thread_last_activity: "2020-05-03T09:47:00.00Z",
        thread_last_activity_micro: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  it("updated: FALSE, own: FALSE WITH CURSOR", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
      pageSize: 1,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    expect(feed.cursor).to.equal(
      "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDUtMjNUMDU6NTI6MDAuMDAwMDAwIiwicGFnZV9zaXplIjoxfQ=="
    );
    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00.00Z",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.00Z",
        thread_last_activity_micro: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  it("updated: FALSE, own: FALSE WITH CURSOR (PAGE 2)", async () => {
    const feed = await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor:
        "eyJsYXN0X2FjdGl2aXR5X2N1cnNvciI6IjIwMjAtMDUtMjNUMDU6NTI6MDAuMDAwMDAwIiwicGFnZV9zaXplIjoxfQ==",
      updatedOnly: false,
      ownOnly: false,
      pageSize: 1,
    });

    if (feed === false) {
      throw Error("User feed fetching encountered an Error.");
    }

    console.log(feed.cursor);
    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-04-30T03:23:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        thread_last_activity: "2020-05-23T05:52:00.00Z",
        thread_last_activity_micro: "2020-05-23T05:52:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  describe("correctly considers board notifications dismissal", async () => {
    it("updated: FALSE, own: FALSE", async () => {
      const feed = await getUserActivity({
        // oncest5evah
        firebaseId: "fb3",
        cursor: null,
        updatedOnly: false,
        ownOnly: false,
        pageSize: 10,
      });

      if (feed === false) {
        throw Error("User feed fetching encountered an Error.");
      }

      expect(feed.cursor).to.equal(null);
      expect(feed.activity.length).to.eql(3);
      // Ensure that the post in !long with the dismissed board notifications
      // is counted when "updatedOnly" is false.
      expect(extractActivity(feed.activity[2])).to.eql({
        comments_amount: 2,
        created: "2020-04-01T05:20:00.00Z",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "f423a2f4-7a8a-4d3d-8858-c1c7602133da",
        posts_amount: 1,
        thread_id: "90119d99-359d-4a60-b5ab-9b6077d0dc39",
        thread_last_activity: "2020-04-01T05:22:00.00Z",
        thread_last_activity_micro: "2020-04-01T05:22:00.000000",
        threads_amount: 0,
      });
    });
  });

  describe("correctly considers board notifications dismissal", async () => {
    it("updated: true, own: FALSE", async () => {
      const feed = await getUserActivity({
        // oncest5evah
        firebaseId: "fb3",
        cursor: null,
        updatedOnly: true,
        ownOnly: false,
        pageSize: 10,
      });

      if (feed === false) {
        throw Error("User feed fetching encountered an Error.");
      }

      expect(feed.cursor).to.equal(null);
      // Ensure that the post in !long with the dismissed board notifications
      // is not counted in "updatedOnly".
      expect(feed.activity.length).to.eql(2);
    });
  });
});
