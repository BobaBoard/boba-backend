import "mocha";
import { expect } from "chai";

import { getThreadByStringId, getThreadIdentitiesByStringId } from "../queries";

const extractActivityFromThread = (thread: any) => {
  return {
    string_id: thread.string_id,
    new_comments: thread.new_comments,
    new_posts: thread.new_posts,
    posts: thread.posts?.map((post: any) => ({
      id: post.id,
      is_new: post.is_new,
      new_comments: post.new_comments,
      comments: post.comments?.map((comment: any) => ({
        id: comment.id,
        is_new: comment.is_new,
      })),
    })),
  };
};

describe("threads queries", () => {
  it("fetches threads by string id (with comments)", async () => {
    const thread = await getThreadByStringId({
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(thread).to.eql({
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      posts: [
        {
          anonymity_type: "strangers",
          author: 3,
          comments: null,
          content: '[{"insert":"Favorite character to maim?"}]',
          created: "2020-04-30T03:23:00",
          id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          is_new: false,
          is_own: false,
          new_comments: 0,
          parent_post_id: null,
          parent_thread_id: 1,
          total_comments: 0,
          type: "text",
          whisper_tags: null,
        },
        {
          anonymity_type: "strangers",
          author: 1,
          comments: null,
          content: '[{"insert":"Revolver Ocelot"}]',
          created: "2020-05-01T05:42:00",
          id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          is_own: true,
          new_comments: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: 1,
          total_comments: 0,
          type: "text",
          whisper_tags: ["fight me on this"],
        },
        {
          anonymity_type: "everyone",
          author: 3,
          comments: [
            {
              anonymity_type: "strangers",
              author: 1,
              content: '[{"insert":"OMG ME TOO"}]',
              created: "2020-05-22T00:22:00",
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
              is_own: true,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
            },
            {
              anonymity_type: "strangers",
              author: 1,
              content: '[{"insert":"friends!!!!!"}]',
              created: "2020-05-23T05:52:00",
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
              is_own: true,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
            },
          ],
          content: '[{"insert":"Kermit the Frog"}]',
          created: "2020-05-02T06:04:00",
          id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          is_own: false,
          new_comments: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: 1,
          total_comments: 2,
          type: "text",
          whisper_tags: [
            "Im too ashamed to admit this ok",
            "sorry mom",
            "YOU WILL NEVER KNOW WHO I AM",
          ],
        },
      ],
      total_comments: 2,
      new_comments: 0,
      new_posts: 0,
    });
  });

  it("fetches threads by string id (no comments)", async () => {
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Oncest
      firebaseId: "fb3",
    });
    expect(thread).to.eql({
      new_comments: 0,
      new_posts: 1,
      posts: [
        {
          anonymity_type: "strangers",
          author: 1,
          comments: null,
          content: '[{"insert":"Favorite murder scene in videogames?"}]',
          created: "2020-04-24T05:42:00",
          id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          is_own: false,
          new_comments: 0,
          parent_post_id: null,
          parent_thread_id: 2,
          total_comments: 0,
          type: "text",
          whisper_tags: ["mwehehehehe"],
        },
        {
          anonymity_type: "strangers",
          author: 3,
          comments: null,
          content: '[{"insert":"Everything in The Evil Within tbh"}]',
          created: "2020-04-30T08:22:00",
          id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          is_own: true,
          new_comments: 0,
          parent_post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_thread_id: 2,
          total_comments: 0,
          type: "text",
          whisper_tags: ["joseph oda is love", "joseph oda is life"],
        },
        {
          anonymity_type: "strangers",
          author: 2,
          comments: null,
          content:
            '[{"insert":"(chants) Leon Kennedy! Leon Kennedy! Leon Kennedy!)"}]',
          created: "2020-05-03T09:47:00",
          id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: true,
          is_own: false,
          new_comments: 0,
          parent_post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_thread_id: 2,
          total_comments: 0,
          type: "text",
          whisper_tags: [
            "nothing beats a himbo getting gangbanged by a herd of hungry hungry zombies",
          ],
        },
      ],
      string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      total_comments: 0,
    });
  });

  it("fetches threads by string id (logged out)", async () => {
    // TODO
  });

  it("returns null thread when id not found", async () => {
    const thread = await getThreadByStringId({
      threadId: "this_will_not_be_in_the_db",
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(thread).to.be.null;
  });

  it("fetches thread identities by string id", async () => {
    const identities = await getThreadIdentitiesByStringId({
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });
    expect(identities.length).to.eql(2);
    expect(identities[0]).to.eql({
      display_name: "Old Time-y Anon",
      friend: null,
      id: "1",
      self: true,
      secret_identity_avatar_reference_id:
        "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
      user_avatar_reference_id: "bobatan.png",
      username: "bobatan",
    });
    expect(identities[1]).to.eql({
      display_name: "DragonFucker",
      friend: true,
      id: "3",
      secret_identity_avatar_reference_id:
        "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
      self: false,
      user_avatar_reference_id: "greedler.jpg",
      username: "oncest5evah",
    });
  });

  it("return false for thread identities when thread not found", async () => {
    const thread = await getThreadIdentitiesByStringId({
      threadId: "this_will_not_be_in_the_db",
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(thread).to.be.false;
  });

  describe("Tests activity", async () => {
    it("gets correct amounts with no visit", async () => {
      // Since there was no visit we expect every post/comment to be marked as new
      const thread = await getThreadByStringId({
        // Favorite character
        threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
        // Jersey Devil
        firebaseId: "fb2",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        new_comments: 2,
        new_posts: 3,
        posts: [
          {
            id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
            comments: undefined,
            is_new: true,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "619adf62-833f-4bea-b591-03e807338a8e",
            is_new: true,
            new_comments: 0,
          },
          {
            comments: [
              {
                id: "46a16199-33d1-48c2-bb79-4d4095014688",
                is_new: true,
              },
              {
                id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
                is_new: true,
              },
            ],
            id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
            is_new: true,
            new_comments: 2,
          },
        ],
      });
    });
    it("gets correct amounts with new comments (self)", async () => {
      // The only new comments are from the user itself
      const thread = await getThreadByStringId({
        // Favorite character
        threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        new_comments: 0,
        new_posts: 0,
        posts: [
          {
            id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
            comments: undefined,
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "619adf62-833f-4bea-b591-03e807338a8e",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: [
              {
                id: "46a16199-33d1-48c2-bb79-4d4095014688",
                is_new: false,
              },
              {
                id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
                is_new: false,
              },
            ],
            id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
            is_new: false,
            new_comments: 0,
          },
        ],
      });
    });

    it("gets correct amounts with new comments (not self)", async () => {
      // The new comments are not from the user itself
      const thread = await getThreadByStringId({
        // Favorite character
        threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
        // Oncest
        firebaseId: "fb3",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        new_comments: 2,
        new_posts: 0,
        posts: [
          {
            id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
            comments: undefined,
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "619adf62-833f-4bea-b591-03e807338a8e",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: [
              {
                id: "46a16199-33d1-48c2-bb79-4d4095014688",
                is_new: true,
              },
              {
                id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
                is_new: true,
              },
            ],
            id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
            is_new: false,
            new_comments: 2,
          },
        ],
      });
    });

    it("gets correct amounts with new posts (self)", async () => {
      // Since we made the last posts since the visit we expect no new ones
      const thread = await getThreadByStringId({
        threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
        // Jersey Devil
        firebaseId: "fb2",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        new_comments: 0,
        new_posts: 0,
        posts: [
          {
            comments: undefined,
            id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "08f25ef1-82dc-4202-a410-c0723ef76789",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
            is_new: false,
            new_comments: 0,
          },
        ],
        string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      });
    });

    it("gets correct amounts with new posts (not self)", async () => {
      // We expect new posts after the last visit
      const thread = await getThreadByStringId({
        threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
        // Oncest
        firebaseId: "fb3",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        new_comments: 0,
        new_posts: 1,
        posts: [
          {
            comments: undefined,
            id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "08f25ef1-82dc-4202-a410-c0723ef76789",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
            is_new: true,
            new_comments: 0,
          },
        ],
        string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      });
    });

    it("gets correct amounts with no updates", async () => {
      // Since the last visit was after the last post we expect no updates
      const thread = await getThreadByStringId({
        threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
        // Bobatan
        firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        new_comments: 0,
        new_posts: 0,
        posts: [
          {
            comments: undefined,
            id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "08f25ef1-82dc-4202-a410-c0723ef76789",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
            is_new: false,
            new_comments: 0,
          },
        ],
        string_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      });
    });

    it("gets correct amounts (logged out)", async () => {
      const thread = await getThreadByStringId({
        // Favorite character
        threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
        firebaseId: undefined,
      });

      // get only activity-related values
      expect(extractActivityFromThread(thread)).to.eql({
        string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
        new_comments: 0,
        new_posts: 0,
        posts: [
          {
            id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
            comments: undefined,
            is_new: false,
            new_comments: 0,
          },
          {
            comments: undefined,
            id: "619adf62-833f-4bea-b591-03e807338a8e",
            is_new: false,
            new_comments: 0,
          },
          {
            comments: [
              {
                id: "46a16199-33d1-48c2-bb79-4d4095014688",
                is_new: false,
              },
              {
                id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
                is_new: false,
              },
            ],
            id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
            is_new: false,
            new_comments: 0,
          },
        ],
      });
    });
  });
});
