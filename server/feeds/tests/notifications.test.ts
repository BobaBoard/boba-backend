import { ANIME_BOARD_ID, GORE_BOARD_ID, LONG_BOARD_ID } from "test/data/boards";
import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth";
import { FAVORITE_CHARACTER_THREAD_ID, FAVORITE_MURDER_THREAD_ID } from "test/data/threads";

import { getBoardActivityByExternalId } from "../queries";

describe("Tests notifications", () => {
  test("gets correct amounts with no visit", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: JERSEY_DEVIL_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_CHARACTER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        is_new: true,
        new_comments_amount: 2,
        new_posts_amount: 3,
      },
    ]);
  });
  test("gets correct amounts with new comments (self)", async () => {
    // The only new comments are from the user itself
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: BOBATAN_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_CHARACTER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  test("gets correct amounts with new comments (not self)", async () => {
    // The new comments are not from the user itself
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: ONCEST_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_CHARACTER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        is_new: false,
        new_comments_amount: 2,
        new_posts_amount: 0,
      },
    ]);
  });

  test("gets correct amounts with new posts (self)", async () => {
    // Since we made the last posts since the visit we expect no new ones
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: JERSEY_DEVIL_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_MURDER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_MURDER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  test("gets correct amounts with new posts (not self)", async () => {
    // We expect new posts after the last visit
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: ONCEST_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_MURDER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_MURDER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 1,
      },
    ]);
  });

  test("gets correct amounts with no updates", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: BOBATAN_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.thread_new_comments_amount,
          new_posts_amount: activity.thread_new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            activity.thread_id == FAVORITE_MURDER_THREAD_ID
        )
    ).toEqual([
      {
        thread_id: FAVORITE_MURDER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });
  test("gets correct amounts (logged out)", async () => {
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: undefined,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.thread_new_comments_amount,
        new_posts_amount: activity.thread_new_posts_amount,
        is_new: activity.is_new,
      }))
    ).toEqual([
      {
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
      {
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
      {
        thread_id: FAVORITE_MURDER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  test("gets correct amounts with dismissed notifs (new entries)", async () => {
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: GORE_BOARD_ID,
      firebaseId: SEXY_DADDY_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.thread_new_comments_amount,
        new_posts_amount: activity.thread_new_posts_amount,
        is_new: activity.is_new,
      }))
    ).toEqual([
      {
        thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
        is_new: true,
        new_comments_amount: 2,
        new_posts_amount: 1,
      },
      {
        thread_id: FAVORITE_CHARACTER_THREAD_ID,
        is_new: false,
        new_comments_amount: 2,
        new_posts_amount: 2,
      },
      {
        thread_id: FAVORITE_MURDER_THREAD_ID,
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 1,
      },
    ]);
  });

  test("gets correct amounts with dismissed notifs (no new entries)", async () => {
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: ANIME_BOARD_ID,
      firebaseId: SEXY_DADDY_USER_ID,
      cursor: null,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.thread_new_comments_amount,
        new_posts_amount: activity.thread_new_posts_amount,
        is_new: activity.is_new,
      }))
    ).toEqual([
      {
        thread_id: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  test("gets correct amounts with dismissed notifs (mixed visits and dismiss)", async () => {
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: LONG_BOARD_ID,
      firebaseId: ZODIAC_KILLER_USER_ID,
      cursor: null,
      pageSize: 50,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(boardActivity.activity.length).toEqual(26);
    expect(
      boardActivity.activity.filter((thread: any) => !thread.is_new).length
    ).toEqual(21);
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        last_activity: activity.thread_last_activity,
        last_activity_micro: activity.thread_last_activity_at_micro,
        new_comments_amount: activity.thread_new_comments_amount,
        new_posts_amount: activity.thread_new_posts_amount,
        is_new: activity.is_new,
      }))
    ).toEqual([
      {
        is_new: true,
        last_activity: "2020-04-25T05:42:00.00Z",
        last_activity_micro: "2020-04-25T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "7d88a537-f23f-46de-970e-29ae392cd5f9",
      },
      {
        is_new: true,
        last_activity: "2020-04-24T05:42:00.00Z",
        last_activity_micro: "2020-04-24T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "d1ec7d2a-c237-41f7-bc67-77727a61a501",
      },
      {
        is_new: false,
        last_activity: "2020-04-23T05:42:00.00Z",
        last_activity_micro: "2020-04-23T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "c55314b4-0b61-41c9-aa2f-b7fa28adf651",
      },
      {
        is_new: true,
        last_activity: "2020-04-22T05:42:00.00Z",
        last_activity_micro: "2020-04-22T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "031cd7f4-cbaa-46d0-aaa4-911df0e097b5",
      },
      {
        is_new: true,
        last_activity: "2020-04-21T05:42:00.00Z",
        last_activity_micro: "2020-04-21T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "00174331-d4c5-4254-8178-afbd46f45275",
      },
      {
        is_new: true,
        last_activity: "2020-04-20T05:42:00.00Z",
        last_activity_micro: "2020-04-20T05:42:00.000065",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "23e35e53-57dd-4fa2-8911-89276a99af59",
      },
      {
        is_new: false,
        last_activity: "2020-04-19T05:42:00.00Z",
        last_activity_micro: "2020-04-19T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8799b916-0837-4bfb-b972-5e7fb0b3d68b",
      },
      {
        is_new: false,
        last_activity: "2020-04-18T05:42:00.00Z",
        last_activity_micro: "2020-04-18T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "32a0174b-091e-4fe6-82f3-bffd6c6026ae",
      },
      {
        is_new: false,
        last_activity: "2020-04-17T05:42:00.00Z",
        last_activity_micro: "2020-04-17T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "43784970-31f1-4e09-99d6-2b6526b353fe",
      },
      {
        is_new: false,
        last_activity: "2020-04-16T05:42:00.00Z",
        last_activity_micro: "2020-04-16T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "7f46031b-cc9d-4729-99f0-fcd8302eea0b",
      },
      {
        is_new: false,
        last_activity: "2020-04-15T05:42:00.00Z",
        last_activity_micro: "2020-04-15T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "78d98a6a-c24b-4b7a-8e06-4a30862afa2d",
      },
      {
        is_new: false,
        last_activity: "2020-04-14T05:42:00.00Z",
        last_activity_micro: "2020-04-14T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "c5004e2b-4358-43df-8078-905b608e9ceb",
      },
      {
        is_new: false,
        last_activity: "2020-04-13T05:42:00.00Z",
        last_activity_micro: "2020-04-13T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8d0be581-5cc7-47c1-947c-f8242898682d",
      },
      {
        is_new: false,
        last_activity: "2020-04-12T05:42:00.00Z",
        last_activity_micro: "2020-04-12T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "1c92ab43-4309-454f-be27-d85d3fd78808",
      },
      {
        is_new: false,
        last_activity: "2020-04-11T05:42:00.00Z",
        last_activity_micro: "2020-04-11T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "3e9a317f-2bcd-4db3-abbb-619fa7c03f24",
      },
      {
        is_new: false,
        last_activity: "2020-04-10T05:42:00.00Z",
        last_activity_micro: "2020-04-10T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "7006e0dc-7c7b-4cc5-8c08-61362e8d288b",
      },
      {
        is_new: false,
        last_activity: "2020-04-09T05:42:00.00Z",
        last_activity_micro: "2020-04-09T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "72470830-7984-4bf6-a0bf-dc5af7d4779b",
      },
      {
        is_new: false,
        last_activity: "2020-04-08T05:42:00.00Z",
        last_activity_micro: "2020-04-08T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "06ba998d-82d8-4e0b-8bbb-a3b3455c4167",
      },
      {
        is_new: false,
        last_activity: "2020-04-07T05:42:00.00Z",
        last_activity_micro: "2020-04-07T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8d227983-7649-49c9-9fa4-b3c398f4648c",
      },
      {
        is_new: false,
        last_activity: "2020-04-06T05:42:00.00Z",
        last_activity_micro: "2020-04-06T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "bcbde425-7f84-4e68-acd5-65aaae95714c",
      },
      {
        is_new: false,
        last_activity: "2020-04-05T05:42:00.00Z",
        last_activity_micro: "2020-04-05T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "38ee861a-fec4-4877-a603-f1ff9f96b4c7",
      },
      {
        is_new: false,
        last_activity: "2020-04-04T05:42:00.00Z",
        last_activity_micro: "2020-04-04T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "9c60fdd5-0b9c-4e14-bf0d-417f2ab36ff1",
      },
      {
        is_new: false,
        last_activity: "2020-04-03T05:42:00.00Z",
        last_activity_micro: "2020-04-03T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "e26976bf-e61a-4dc3-8c0e-60e16d5d4b31",
      },
      {
        is_new: false,
        last_activity: "2020-04-02T05:42:00.00Z",
        last_activity_micro: "2020-04-02T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "d6369940-6415-4de8-b8fd-393cfe3013dd",
      },
      {
        is_new: false,
        last_activity: "2020-04-01T05:42:00.00Z",
        last_activity_micro: "2020-04-01T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "dacfb175-0d47-4c5e-8ecc-7fbf176ad915",
      },
      {
        is_new: false,
        last_activity: "2020-04-01T05:22:00.00Z",
        last_activity_micro: "2020-04-01T05:22:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "90119d99-359d-4a60-b5ab-9b6077d0dc39",
      },
    ]);
  });

  test("gets correct amounts with dismissed BOARD notifs (only dismiss)", async () => {
    const boardActivity = await getBoardActivityByExternalId({
      boardExternalId: LONG_BOARD_ID,
      firebaseId: ONCEST_USER_ID,
      cursor: null,
      pageSize: 50,
    });

    if (boardActivity === false) {
      throw Error("Board activity fetching encountered an Error.");
    }

    // get only activity-related values
    expect(boardActivity.activity.length).toEqual(26);
    // expect(
    //   boardActivity.activity.filter((thread: any) => !thread.is_new).length
    // ).to.eql(21);
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        last_activity: activity.thread_last_activity,
        last_activity_micro: activity.thread_last_activity_at_micro,
        new_comments_amount: activity.thread_new_comments_amount,
        new_posts_amount: activity.thread_new_posts_amount,
        is_new: activity.is_new,
      }))
    ).toEqual([
      {
        is_new: true,
        last_activity: "2020-04-25T05:42:00.00Z",
        last_activity_micro: "2020-04-25T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "7d88a537-f23f-46de-970e-29ae392cd5f9",
      },
      {
        is_new: true,
        last_activity: "2020-04-24T05:42:00.00Z",
        last_activity_micro: "2020-04-24T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "d1ec7d2a-c237-41f7-bc67-77727a61a501",
      },
      {
        is_new: true,
        last_activity: "2020-04-23T05:42:00.00Z",
        last_activity_micro: "2020-04-23T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "c55314b4-0b61-41c9-aa2f-b7fa28adf651",
      },
      {
        is_new: true,
        last_activity: "2020-04-22T05:42:00.00Z",
        last_activity_micro: "2020-04-22T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "031cd7f4-cbaa-46d0-aaa4-911df0e097b5",
      },
      {
        is_new: true,
        last_activity: "2020-04-21T05:42:00.00Z",
        last_activity_micro: "2020-04-21T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "00174331-d4c5-4254-8178-afbd46f45275",
      },
      {
        is_new: true,
        last_activity: "2020-04-20T05:42:00.00Z",
        last_activity_micro: "2020-04-20T05:42:00.000065",
        new_comments_amount: 0,
        new_posts_amount: 1,
        thread_id: "23e35e53-57dd-4fa2-8911-89276a99af59",
      },
      {
        is_new: false,
        last_activity: "2020-04-19T05:42:00.00Z",
        last_activity_micro: "2020-04-19T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8799b916-0837-4bfb-b972-5e7fb0b3d68b",
      },
      {
        is_new: false,
        last_activity: "2020-04-18T05:42:00.00Z",
        last_activity_micro: "2020-04-18T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "32a0174b-091e-4fe6-82f3-bffd6c6026ae",
      },
      {
        is_new: false,
        last_activity: "2020-04-17T05:42:00.00Z",
        last_activity_micro: "2020-04-17T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "43784970-31f1-4e09-99d6-2b6526b353fe",
      },
      {
        is_new: false,
        last_activity: "2020-04-16T05:42:00.00Z",
        last_activity_micro: "2020-04-16T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "7f46031b-cc9d-4729-99f0-fcd8302eea0b",
      },
      {
        is_new: false,
        last_activity: "2020-04-15T05:42:00.00Z",
        last_activity_micro: "2020-04-15T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "78d98a6a-c24b-4b7a-8e06-4a30862afa2d",
      },
      {
        is_new: false,
        last_activity: "2020-04-14T05:42:00.00Z",
        last_activity_micro: "2020-04-14T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "c5004e2b-4358-43df-8078-905b608e9ceb",
      },
      {
        is_new: false,
        last_activity: "2020-04-13T05:42:00.00Z",
        last_activity_micro: "2020-04-13T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8d0be581-5cc7-47c1-947c-f8242898682d",
      },
      {
        is_new: false,
        last_activity: "2020-04-12T05:42:00.00Z",
        last_activity_micro: "2020-04-12T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "1c92ab43-4309-454f-be27-d85d3fd78808",
      },
      {
        is_new: false,
        last_activity: "2020-04-11T05:42:00.00Z",
        last_activity_micro: "2020-04-11T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "3e9a317f-2bcd-4db3-abbb-619fa7c03f24",
      },
      {
        is_new: false,
        last_activity: "2020-04-10T05:42:00.00Z",
        last_activity_micro: "2020-04-10T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "7006e0dc-7c7b-4cc5-8c08-61362e8d288b",
      },
      {
        is_new: false,
        last_activity: "2020-04-09T05:42:00.00Z",
        last_activity_micro: "2020-04-09T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "72470830-7984-4bf6-a0bf-dc5af7d4779b",
      },
      {
        is_new: false,
        last_activity: "2020-04-08T05:42:00.00Z",
        last_activity_micro: "2020-04-08T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "06ba998d-82d8-4e0b-8bbb-a3b3455c4167",
      },
      {
        is_new: false,
        last_activity: "2020-04-07T05:42:00.00Z",
        last_activity_micro: "2020-04-07T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "8d227983-7649-49c9-9fa4-b3c398f4648c",
      },
      {
        is_new: false,
        last_activity: "2020-04-06T05:42:00.00Z",
        last_activity_micro: "2020-04-06T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "bcbde425-7f84-4e68-acd5-65aaae95714c",
      },
      {
        is_new: false,
        last_activity: "2020-04-05T05:42:00.00Z",
        last_activity_micro: "2020-04-05T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "38ee861a-fec4-4877-a603-f1ff9f96b4c7",
      },
      {
        is_new: false,
        last_activity: "2020-04-04T05:42:00.00Z",
        last_activity_micro: "2020-04-04T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "9c60fdd5-0b9c-4e14-bf0d-417f2ab36ff1",
      },
      {
        is_new: false,
        last_activity: "2020-04-03T05:42:00.00Z",
        last_activity_micro: "2020-04-03T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "e26976bf-e61a-4dc3-8c0e-60e16d5d4b31",
      },
      {
        is_new: false,
        last_activity: "2020-04-02T05:42:00.00Z",
        last_activity_micro: "2020-04-02T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "d6369940-6415-4de8-b8fd-393cfe3013dd",
      },
      {
        is_new: false,
        last_activity: "2020-04-01T05:42:00.00Z",
        last_activity_micro: "2020-04-01T05:42:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "dacfb175-0d47-4c5e-8ecc-7fbf176ad915",
      },
      {
        is_new: false,
        last_activity: "2020-04-01T05:22:00.00Z",
        last_activity_micro: "2020-04-01T05:22:00.000000",
        new_comments_amount: 0,
        new_posts_amount: 0,
        thread_id: "90119d99-359d-4a60-b5ab-9b6077d0dc39",
      },
    ]);
  });
});
