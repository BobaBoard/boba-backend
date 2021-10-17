import { getThreadByStringId } from "../queries";

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
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Jersey Devil
      firebaseId: "fb2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments_amount: 2,
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
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: true,
          new_comments_amount: 2,
        },
      ],
    });
  });
  test("gets correct amounts with new comments (self)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
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
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
    });
  });

  test("gets correct amounts with new comments (not self)", async () => {
    // The new comments are not from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Oncest
      firebaseId: "fb3",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
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
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments_amount: 2,
        },
      ],
    });
  });

  test("gets correct amounts with new posts (self)", async () => {
    // Since we made the last posts since the visit we expect no new ones
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Jersey Devil
      firebaseId: "fb2",
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
      thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  test("gets correct amounts with new posts (not self)", async () => {
    // We expect new posts after the last visit
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Oncest
      firebaseId: "fb3",
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
      thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  test("gets correct amounts with no updates", async () => {
    // Since the last visit was after the last post we expect no updates
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
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
      thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
    });
  });

  test("gets correct amounts (logged out)", async () => {
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      firebaseId: undefined,
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
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
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
            },
          ],
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          new_comments_amount: 0,
        },
      ],
    });
  });

  test("gets correct amounts with dismiss notifications (new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Favorite character
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // SexyDaddy69
      firebaseId: "fb4",
    });

    // get only activity-related values
    expect(extractActivityFromThread(thread)).toEqual({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      new_comments_amount: 2,
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
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: true,
            },
            {
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: true,
            },
          ],
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: true,
          new_comments_amount: 2,
        },
      ],
    });
  });

  test("gets correct amounts with dismiss notifications (no new)", async () => {
    // The only new comments are from the user itself
    const thread = await getThreadByStringId({
      // Anime board
      threadId: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
      // SexyDaddy69
      firebaseId: "fb4",
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
              comment_id: "21b16199-33d1-48c2-bb79-4d4095014avd",
              is_new: false,
            },
            {
              comment_id: "ad3c3682-cb74-43f9-9a63-bd97d0f59z87",
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
      const thread = await getThreadByStringId({
        // Visited earlier than dismiss
        threadId: "32a0174b-091e-4fe6-82f3-bffd6c6026ae",
        // Zodiac Killer
        firebaseId: "fb5",
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
      const thread = await getThreadByStringId({
        // Visited after dismiss
        threadId: "c55314b4-0b61-41c9-aa2f-b7fa28adf651",
        // Zodiac Killer
        firebaseId: "fb5",
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
      const thread = await getThreadByStringId({
        // Never visited, before dismiss
        threadId: "dacfb175-0d47-4c5e-8ecc-7fbf176ad915",
        // Zodiac Killer
        firebaseId: "fb5",
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
      const thread = await getThreadByStringId({
        // Never visited, after dismiss
        threadId: "7d88a537-f23f-46de-970e-29ae392cd5f9",
        // Zodiac Killer
        firebaseId: "fb5",
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
