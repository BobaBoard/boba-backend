import "mocha";
import { expect } from "chai";

import { getThreadByStringId, getThreadIdentitiesByStringId } from "../queries";

describe("threads queries", () => {
  it("fetches threads by string id (with comments)", async () => {
    const thread = await getThreadByStringId({
      threadId: "29d1b2da-3289-454a-9089-2ed47db4967b",
      // Bobatan
      firebaseId: "c6HimTlg2RhVH3fC1psXZORdLcx2",
    });

    expect(thread).to.eql({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      board_slug: "gore",
      thread_total_comments_amount: 2,
      thread_new_comments_amount: 0,
      thread_total_posts_amount: 3,
      thread_new_posts_amount: 0,
      thread_direct_threads_amount: 2,
      default_view: "thread",
      posts: [
        {
          anonymity_type: "strangers",
          author: 3,
          friend: true,
          self: false,
          username: "oncest5evah",
          user_avatar: "greedler.jpg",
          secret_identity_name: "DragonFucker",
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_color: null,
          comments: null,
          content: '[{"insert":"Favorite character to maim?"}]',
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
          created: "2020-04-30T03:23:00",
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          is_new: false,
          is_own: false,
          new_comments_amount: 0,
          parent_post_id: null,
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          total_comments_amount: 0,
          type: "text",
          index_tags: ["evil", "bobapost"],
          whisper_tags: [],
          category_tags: ["bruises"],
          content_warnings: [],
          options: {},
        },
        {
          anonymity_type: "strangers",
          author: 1,
          user_avatar: "bobatan.png",
          username: "bobatan",
          secret_identity_name: "Old Time-y Anon",
          secret_identity_avatar:
            "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
          secret_identity_color: null,
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
          friend: false,
          self: true,
          comments: null,
          content: '[{"insert":"Revolver Ocelot"}]',
          created: "2020-05-01T05:42:00",
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          is_own: true,
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          total_comments_amount: 0,
          type: "text",
          index_tags: ["evil", "oddly specific", "metal gear", "bobapost"],
          whisper_tags: ["fight me on this"],
          category_tags: [],
          content_warnings: [],
          options: {},
        },
        {
          anonymity_type: "everyone",
          author: 3,
          friend: true,
          self: false,
          username: "oncest5evah",
          user_avatar: "greedler.jpg",
          secret_identity_name: "DragonFucker",
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_color: null,
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
          comments: [
            {
              anonymity_type: "strangers",
              author: 1,
              user_avatar: "bobatan.png",
              username: "bobatan",
              secret_identity_name: "Old Time-y Anon",
              secret_identity_avatar:
                "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
              secret_identity_color: null,
              accessory_avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
              friend: false,
              self: true,
              content: '[{"insert":"OMG ME TOO"}]',
              parent_comment: null,
              chain_parent_id: null,
              created: "2020-05-22T00:22:00",
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
              is_own: true,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
            },
            {
              anonymity_type: "strangers",
              author: 1,
              user_avatar: "bobatan.png",
              username: "bobatan",
              secret_identity_name: "Old Time-y Anon",
              secret_identity_avatar:
                "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
              secret_identity_color: null,
              accessory_avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
              friend: false,
              self: true,
              content: '[{"insert":"friends!!!!!"}]',
              parent_comment: null,
              chain_parent_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              created: "2020-05-23T05:52:00",
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
              is_own: true,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
            },
          ],
          content: '[{"insert":"Kermit the Frog"}]',
          created: "2020-05-02T06:04:00",
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          is_own: false,
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          total_comments_amount: 2,
          type: "text",
          index_tags: ["good", "oddly specific", "bobapost"],
          whisper_tags: [
            "Im too ashamed to admit this ok",
            "sorry mom",
            "YOU WILL NEVER KNOW WHO I AM",
          ],
          category_tags: [],
          content_warnings: [],
          options: {},
        },
      ],
    });
  });

  it("fetches threads by string id (no comments)", async () => {
    const thread = await getThreadByStringId({
      threadId: "a5c903df-35e8-43b2-a41a-208c43154671",
      // Oncest
      firebaseId: "fb3",
    });
    expect(thread).to.eql({
      posts: [
        {
          anonymity_type: "strangers",
          author: 1,
          user_avatar: "bobatan.png",
          username: "bobatan",
          secret_identity_name: "DragonFucker",
          secret_identity_avatar:
            "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
          secret_identity_color: null,
          accessory_avatar: null,
          friend: true,
          self: false,
          comments: null,
          content: '[{"insert":"Favorite murder scene in videogames?"}]',
          created: "2020-04-24T05:42:00",
          post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          is_new: false,
          is_own: false,
          new_comments_amount: 0,
          parent_post_id: null,
          parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          total_comments_amount: 0,
          type: "text",
          index_tags: [],
          whisper_tags: ["mwehehehehe"],
          category_tags: ["blood", "bruises"],
          content_warnings: [],
          options: {},
        },
        {
          anonymity_type: "strangers",
          author: 3,
          friend: false,
          self: true,
          username: "oncest5evah",
          user_avatar: "greedler.jpg",
          secret_identity_avatar: "outdated-meme.png",
          secret_identity_name: "Outdated Meme",
          secret_identity_color: null,
          accessory_avatar: null,
          comments: null,
          content: '[{"insert":"Everything in The Evil Within tbh"}]',
          created: "2020-04-30T08:22:00",
          post_id: "08f25ef1-82dc-4202-a410-c0723ef76789",
          is_new: false,
          is_own: true,
          new_comments_amount: 0,
          parent_post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          total_comments_amount: 0,
          type: "text",
          index_tags: [],
          whisper_tags: ["joseph oda is love", "joseph oda is life"],
          category_tags: [],
          content_warnings: [],
          options: {},
        },
        {
          anonymity_type: "strangers",
          author: 2,
          username: "jersey_devil_69",
          user_avatar: "hannibal.png",
          secret_identity_name: "Old Time-y Anon",
          secret_identity_avatar:
            "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
          secret_identity_color: null,
          accessory_avatar: null,
          friend: false,
          self: false,
          comments: null,
          content:
            '[{"insert":"(chants) Leon Kennedy! Leon Kennedy! Leon Kennedy!)"}]',
          created: "2020-05-03T09:47:00",
          post_id: "1f1ad4fa-f02a-48c0-a78a-51221a7db170",
          is_new: true,
          is_own: false,
          new_comments_amount: 0,
          parent_post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
          parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          total_comments_amount: 0,
          type: "text",
          index_tags: [],
          whisper_tags: [
            "nothing beats a himbo getting gangbanged by a herd of hungry hungry zombies",
          ],
          category_tags: [],
          content_warnings: [],
          options: {},
        },
      ],
      thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
      board_slug: "gore",
      thread_total_comments_amount: 0,
      thread_new_comments_amount: 0,
      thread_total_posts_amount: 3,
      thread_new_posts_amount: 1,
      thread_direct_threads_amount: 2,
      default_view: "thread",
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

    if (identities === false) {
      throw Error("Thread identities fetching encountered an Error.");
    }

    expect(identities.length).to.eql(2);
    expect(identities[0]).to.eql({
      display_name: "Old Time-y Anon",
      friend: null,
      id: "1",
      self: true,
      secret_identity_avatar_reference_id:
        "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
      user_avatar_reference_id: "bobatan.png",
      accessory_avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
      username: "bobatan",
    });
    expect(identities[1]).to.eql({
      display_name: "DragonFucker",
      friend: true,
      id: "3",
      secret_identity_avatar_reference_id:
        "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
      self: false,
      accessory_avatar:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
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
});
