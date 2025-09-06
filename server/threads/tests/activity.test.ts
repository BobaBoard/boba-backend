import {
  BOBATAN_USER_ID,
  JERSEY_DEVIL_USER_ID,
  ONCEST_USER_ID,
  SEXY_DADDY_USER_ID,
  ZODIAC_KILLER_USER_ID,
} from "test/data/auth.js";
import {
  FAVORITE_CHARACTER_THREAD_ID,
  FAVORITE_MURDER_THREAD_ID,
} from "test/data/threads.js";

import { getThreadByExternalId } from "../queries.js";

const extractActivityFromThread = (thread: any) => {
  return {
    thread_id: thread.thread_id,
    new_comments_amount: thread.thread_new_comments_amount,
    new_posts_amount: thread.thread_new_posts_amount,
    posts: thread.posts?.map((post: any) => ({
      post_id: post.post_id,
      is_new: post.is_new,
      new_comments_amount: post.new_comments_amount,
      comments: post.comments?.map((comment: any) => ({
        comment_id: comment.comment_id,
        is_new: comment.is_new,
      })),
    })),
  };
};

describe("threads activity queries", () => {
  test("gets correct amounts with no visit", async () => {
    // Since there was no visit we expect every post/comment to be marked as new
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_CHARACTER_THREAD_ID,
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: FAVORITE_CHARACTER_THREAD_ID,
      new_comments_amount: 3,
      new_posts_amount: 3,
      posts: [
        {
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: true,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: true,
          new_comments_amount: 0,
        },
        {
          comments: [
            {
              comment_id: "afc72387-20e9-459d-afca-33ae7c581510",
              is_new: true,
            },
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "550337cb-3590-4252-9307-b922d17b9084",
          is_new: true,
          new_comments_amount: 3,
        },
      ],
    });
  });
  test("gets correct amounts with new comments (self)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_CHARACTER_THREAD_ID,
      firebaseId: BOBATAN_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: FAVORITE_CHARACTER_THREAD_ID,
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: [
            {
              comment_id: "afc72387-20e9-459d-afca-33ae7c581510",
              is_new: false,
            },
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: false,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          post_id: "550337cb-3590-4252-9307-b922d17b9084",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
    });
  });

  test("gets correct amounts with new comments (not self)", async () => {
    // The new comments are not from the user itself
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_CHARACTER_THREAD_ID,
      firebaseId: ONCEST_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: FAVORITE_CHARACTER_THREAD_ID,
      new_comments_amount: 2,
      new_posts_amount: 0,
      posts: [
        {
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: [
            {
              comment_id: "afc72387-20e9-459d-afca-33ae7c581510",
              is_new: false,
            },
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "550337cb-3590-4252-9307-b922d17b9084",
          is_new: false,
          new_comments_amount: 2,
        },
      ],
    });
  });

  test("gets correct amounts with new posts (self)", async () => {
    // Since we made the last posts since the visit we expect no new ones
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_MURDER_THREAD_ID,
      firebaseId: JERSEY_DEVIL_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          comments: undefined,
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
      thread_id: FAVORITE_MURDER_THREAD_ID,
    });
  });

  test("gets correct amounts with new posts (not self)", async () => {
    // We expect new posts after the last visit
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_MURDER_THREAD_ID,
      firebaseId: ONCEST_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      new_comments_amount: 0,
      new_posts_amount: 1,
      posts: [
        {
          comments: undefined,
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: true,
          new_comments_amount: 0,
        },
      ],
      thread_id: FAVORITE_MURDER_THREAD_ID,
    });
  });

  test("gets correct amounts with no updates", async () => {
    // Since the last visit was after the last post we expect no updates
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_MURDER_THREAD_ID,
      firebaseId: BOBATAN_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          comments: undefined,
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
      thread_id: FAVORITE_MURDER_THREAD_ID,
    });
  });

  test("gets correct amounts (logged out)", async () => {
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_CHARACTER_THREAD_ID,
      firebaseId: undefined,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: FAVORITE_CHARACTER_THREAD_ID,
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: [
            {
              comment_id: "afc72387-20e9-459d-afca-33ae7c581510",
              is_new: false,
            },
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: false,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          post_id: "550337cb-3590-4252-9307-b922d17b9084",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
    });
  });

  test("gets correct amounts with dismiss notifications (new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByExternalId({
      threadExternalId: FAVORITE_CHARACTER_THREAD_ID,
      firebaseId: SEXY_DADDY_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: FAVORITE_CHARACTER_THREAD_ID,
      new_comments_amount: 3,
      new_posts_amount: 2,
      posts: [
        {
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          comments: undefined,
          is_new: false,
          new_comments_amount: 0,
        },
        {
          comments: undefined,
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: true,
          new_comments_amount: 0,
        },
        {
          comments: [
            {
              comment_id: "afc72387-20e9-459d-afca-33ae7c581510",
              is_new: true,
            },
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "550337cb-3590-4252-9307-b922d17b9084",
          is_new: true,
          new_comments_amount: 3,
        },
      ],
    });
  });

  test("gets correct amounts with dismiss notifications (no new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByExternalId({
      // Anime board
      threadExternalId: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
      firebaseId: SEXY_DADDY_USER_ID,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          post_id: "987f795b-d60d-4016-af82-8684411f7785",
          comments: [
            {
              comment_id: "caa8b54a-eb5e-4134-8ae2-a3946a428ec7",
              is_new: false,
            },
            {
              comment_id: "20354d7a-e4fe-47af-8ff6-187bca92f3f9",
              is_new: false,
            },
          ],
          is_new: false,
          new_comments_amount: 0,
        },
      ],
    });
  });

  describe("Test correct amounts with both dismiss and visit", () => {
    test("Visited earlier than dismiss", async () => {
      // The only new comments are from the user itself
      const thread = await getThreadByExternalId({
        // Visited earlier than dismiss
        threadExternalId: "32a0174b-091e-4fe6-82f3-bffd6c6026ae",
        firebaseId: ZODIAC_KILLER_USER_ID,
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).toEqual({
        thread_id: "32a0174b-091e-4fe6-82f3-bffd6c6026ae",
        new_comments_amount: 0,
        new_posts_amount: 0,
        posts: [
          {
            post_id: "bd6efcb5-1b0e-4ebc-bc48-4c9a23b14cdb",
            comments: undefined,
            is_new: false,
            new_comments_amount: 0,
          },
        ],
      });
    });

    test("Visited after dismiss", async () => {
      // The only new comments are from the user itself
      const thread = await getThreadByExternalId({
        // Visited after dismiss
        threadExternalId: "c55314b4-0b61-41c9-aa2f-b7fa28adf651",
        firebaseId: ZODIAC_KILLER_USER_ID,
      });
      expect(extractActivityFromThread(thread)).toEqual({
        thread_id: "c55314b4-0b61-41c9-aa2f-b7fa28adf651",
        new_comments_amount: 0,
        new_posts_amount: 0,
        posts: [
          {
            post_id: "6c698c20-754a-42d2-b60f-7f73ca2c6fa0",
            comments: undefined,
            is_new: false,
            new_comments_amount: 0,
          },
        ],
      });
    });

    test("Never visited, created before dismiss", async () => {
      // The only new comments are from the user itself
      const thread = await getThreadByExternalId({
        // Never visited, before dismiss
        threadExternalId: "dacfb175-0d47-4c5e-8ecc-7fbf176ad915",
        firebaseId: ZODIAC_KILLER_USER_ID,
      });
      expect(extractActivityFromThread(thread)).toEqual({
        thread_id: "dacfb175-0d47-4c5e-8ecc-7fbf176ad915",
        new_comments_amount: 0,
        new_posts_amount: 0,
        posts: [
          {
            post_id: "c137f3e9-8810-4807-9a1d-0ddd27ce52ca",
            comments: undefined,
            is_new: false,
            new_comments_amount: 0,
          },
        ],
      });
    });

    test("Never visited, created after dismiss", async () => {
      // The only new comments are from the user itself
      const thread = await getThreadByExternalId({
        // Never visited, after dismiss
        threadExternalId: "7d88a537-f23f-46de-970e-29ae392cd5f9",
        firebaseId: ZODIAC_KILLER_USER_ID,
      });
      expect(extractActivityFromThread(thread)).toEqual({
        thread_id: "7d88a537-f23f-46de-970e-29ae392cd5f9",
        new_comments_amount: 0,
        new_posts_amount: 1,
        posts: [
          {
            post_id: "995d80d3-d8b9-445d-9723-e39f7a682665",
            comments: undefined,
            is_new: true,
            new_comments_amount: 0,
          },
        ],
      });
    });
  });
});
