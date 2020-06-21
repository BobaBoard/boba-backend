import "mocha";
import { expect } from "chai";

import { getBoardActivityBySlug } from "../queries";

describe("Tests notifications", async () => {
  it("gets correct amounts with no visit", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Jersey Devil
      firebaseId: "fb2",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite character
            activity.thread_id == "29d1b2da-3289-454a-9089-2ed47db4967b"
        )
    ).to.eql([
      {
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        is_new: true,
        new_comments_amount: 2,
        new_posts_amount: 3,
      },
    ]);
  });
  it("gets correct amounts with new comments (self)", async () => {
    // The only new comments are from the user itself
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite character
            activity.thread_id == "29d1b2da-3289-454a-9089-2ed47db4967b"
        )
    ).to.eql([
      {
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  it("gets correct amounts with new comments (not self)", async () => {
    // The new comments are not from the user itself
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Oncest
      firebaseId: "fb3",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite character
            activity.thread_id == "29d1b2da-3289-454a-9089-2ed47db4967b"
        )
    ).to.eql([
      {
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        is_new: false,
        new_comments_amount: 2,
        new_posts_amount: 0,
      },
    ]);
  });

  it("gets correct amounts with new posts (self)", async () => {
    // Since we made the last posts since the visit we expect no new ones
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Jersey Devil
      firebaseId: "fb2",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite murder
            activity.thread_id == "a5c903df-35e8-43b2-a41a-208c43154671"
        )
    ).to.eql([
      {
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  it("gets correct amounts with new posts (not self)", async () => {
    // We expect new posts after the last visit
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Oncest
      firebaseId: "fb3",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite murder
            activity.thread_id == "a5c903df-35e8-43b2-a41a-208c43154671"
        )
    ).to.eql([
      {
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 1,
      },
    ]);
  });

  it("gets correct amounts with no updates", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity
        .map((activity: any) => ({
          thread_id: activity.thread_id,
          new_comments_amount: activity.new_comments_amount,
          new_posts_amount: activity.new_posts_amount,
          is_new: activity.is_new,
        }))
        .filter(
          (activity: any) =>
            // Favorite murder
            activity.thread_id == "a5c903df-35e8-43b2-a41a-208c43154671"
        )
    ).to.eql([
      {
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });
  it("gets correct amounts (logged out)", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      firebaseId: undefined,
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.new_comments_amount,
        new_posts_amount: activity.new_posts_amount,
        is_new: activity.is_new,
      }))
    ).to.eql([
      {
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
      {
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });

  it("gets correct amounts with dismissed notifs (new entries)", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "gore",
      // SexyDaddy69
      firebaseId: "fb4",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.new_comments_amount,
        new_posts_amount: activity.new_posts_amount,
        is_new: activity.is_new,
      }))
    ).to.eql([
      {
        thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        is_new: false,
        new_comments_amount: 2,
        new_posts_amount: 2,
      },
      {
        thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 1,
      },
    ]);
  });

  it("gets correct amounts with dismissed notifs (no new entries)", async () => {
    const boardActivity = await getBoardActivityBySlug({
      slug: "anime",
      // SexyDaddy69
      firebaseId: "fb4",
      cursor: null,
    });

    // get only activity-related values
    expect(
      boardActivity.activity.map((activity: any) => ({
        thread_id: activity.thread_id,
        new_comments_amount: activity.new_comments_amount,
        new_posts_amount: activity.new_posts_amount,
        is_new: activity.is_new,
      }))
    ).to.eql([
      {
        thread_id: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
        is_new: false,
        new_comments_amount: 0,
        new_posts_amount: 0,
      },
    ]);
  });
});
