import "mocha";
import { expect } from "chai";

import { getUserActivity, getUserFromFirebaseId } from "../queries";
import { DbActivityThreadType } from "../../../Types";
import { extractActivity } from "../../boards/tests/activity.test";

describe("Test users query", () => {
  it("gets user from id", async () => {
    const user = await getUserFromFirebaseId({ firebaseId: "fb2" });

    expect(user).to.eql({
      avatar_reference_id: "hannibal.png",
      created_on: null,
      firebase_id: "fb2",
      id: "2",
      invited_by: "1",
      username: "jersey_devil_69",
    });
  });
});

describe("feed activity queries", () => {
  it("updated: TRUE, own: TRUE", async () => {
    const feed = (await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: true,
      ownOnly: true,
    })) as {
      // TODO: turn this into a type.
      cursor: string | null;
      activity: DbActivityThreadType[];
    };

    expect(feed.activity.map(extractActivity)).to.deep.equal([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  it("updated: FALSE, own: TRUE", async () => {
    const feed = (await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: true,
    })) as {
      // TODO: turn this into a type.
      cursor: string | null;
      activity: DbActivityThreadType[];
    };

    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 0,
        created: "2020-04-24T05:42:00",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        thread_last_activity: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });

  it("updated: TRUE, own: FALSE", async () => {
    const feed = (await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: true,
      ownOnly: false,
    })) as {
      // TODO: turn this into a type.
      cursor: string | null;
      activity: DbActivityThreadType[];
    };

    expect(feed.activity.map(extractActivity)).to.deep.equal([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
    ]);
  });

  it("updated: FALSE, own: FALSE", async () => {
    const feed = (await getUserActivity({
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
      updatedOnly: false,
      ownOnly: false,
    })) as {
      // TODO: turn this into a type.
      cursor: string | null;
      activity: DbActivityThreadType[];
    };

    expect(feed.activity.map(extractActivity)).to.eql([
      {
        comments_amount: 2,
        created: "2020-09-25T05:42:00",
        is_new: false,
        new_comments_amount: 1,
        new_posts_amount: 0,
        post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
        posts_amount: 1,
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        thread_last_activity: "2020-10-04T05:44:00.000000",
        threads_amount: 0,
      },
      {
        comments_amount: 2,
        created: "2020-04-30T03:23:00",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
        posts_amount: 3,
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        thread_last_activity: "2020-05-23T05:52:00.000000",
        threads_amount: 2,
      },
      {
        comments_amount: 0,
        created: "2020-04-24T05:42:00",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
        post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
        posts_amount: 3,
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        thread_last_activity: "2020-05-03T09:47:00.000000",
        threads_amount: 2,
      },
    ]);
  });
});
