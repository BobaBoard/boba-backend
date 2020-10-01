import "mocha";
import { expect } from "chai";
import request from "supertest";

import app from "../server";

describe("Tests boards REST API", () => {
  it("should return board data", async () => {
    const res = await request(app).get("/boards/gore");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      settings: {
        accentColor: "#f96680",
      },
      muted: false,
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      postingIdentities: [],
      permissions: {
        canEditBoardData: false,
      },
      avatarUrl: "/gore.png",
    });
  });

  it("should return activity data", async () => {
    const res = await request(app).get("/boards/gore/activity/latest");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      next_page_cursor: null,
      activity: [
        {
          posts: [
            {
              post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
              parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
              parent_post_id: null,
              secret_identity: {
                name: "DragonFucker",
                avatar:
                  "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
              },
              self: false,
              friend: false,
              created: "2020-04-30T03:23:00",
              content: '[{"insert":"Favorite character to maim?"}]',
              options: {},
              tags: {
                index_tags: [],
                whisper_tags: [],
                category_tags: [],
                content_warnings: [],
              },
              total_comments_amount: 2,
              new_comments_amount: 0,
              is_new: false,
            },
          ],
          thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          thread_new_posts_amount: 0,
          thread_new_comments_amount: 0,
          thread_total_comments_amount: 2,
          thread_total_posts_amount: 3,
          thread_last_activity: "2020-05-23T05:52:00.000000",
          thread_direct_threads_amount: 2,
          muted: false,
          hidden: false,
        },
        {
          posts: [
            {
              post_id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
              parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
              parent_post_id: null,
              secret_identity: {
                name: "DragonFucker",
                avatar:
                  "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
              },
              self: false,
              friend: false,
              created: "2020-04-24T05:42:00",
              content: '[{"insert":"Favorite murder scene in videogames?"}]',
              options: {},
              tags: {
                index_tags: [],
                whisper_tags: ["mwehehehehe"],
                category_tags: [],
                content_warnings: [],
              },
              total_comments_amount: 0,
              new_comments_amount: 0,
              is_new: false,
            },
          ],
          thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          thread_new_posts_amount: 0,
          thread_new_comments_amount: 0,
          thread_total_comments_amount: 0,
          thread_total_posts_amount: 3,
          thread_last_activity: "2020-05-03T09:47:00.000000",
          thread_direct_threads_amount: 2,
          muted: false,
          hidden: false,
        },
      ],
    });
  });
});

describe("Tests threads REST API", () => {
  it("should return threads data", async () => {
    const res = await request(app).get(
      "/threads/29d1b2da-3289-454a-9089-2ed47db4967b"
    );

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      thread_new_comments_amount: 0,
      thread_total_posts_amount: 3,
      thread_new_posts_amount: 0,
      thread_total_comments_amount: 2,
      thread_direct_threads_amount: 2,
      posts: [
        {
          anonymity_type: "strangers",
          comments: null,
          content: '[{"insert":"Favorite character to maim?"}]',
          created: "2020-04-30T03:23:00",
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          is_new: false,
          is_own: false,
          friend: false,
          self: false,
          new_comments_amount: 0,
          parent_post_id: null,
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          secret_identity: {
            avatar:
              "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
            name: "DragonFucker",
          },
          total_comments_amount: 0,
          type: "text",
          tags: {
            index_tags: [],
            whisper_tags: [],
            category_tags: [],
            content_warnings: [],
          },
          options: {},
        },
        {
          anonymity_type: "strangers",
          comments: null,
          content: '[{"insert":"Revolver Ocelot"}]',
          created: "2020-05-01T05:42:00",
          post_id: "619adf62-833f-4bea-b591-03e807338a8e",
          is_new: false,
          is_own: false,
          friend: false,
          self: false,
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          secret_identity: {
            avatar:
              "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
            name: "Old Time-y Anon",
          },
          total_comments_amount: 0,
          type: "text",
          tags: {
            index_tags: [],
            whisper_tags: ["fight me on this"],
            category_tags: [],
            content_warnings: [],
          },
          options: {},
        },
        {
          anonymity_type: "everyone",
          comments: [
            {
              anonymity_type: "strangers",
              content: '[{"insert":"OMG ME TOO"}]',
              created: "2020-05-22T00:22:00",
              comment_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              chain_parent_id: null,
              is_new: false,
              is_own: false,
              friend: false,
              self: false,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
              parent_comment: null,
              secret_identity: {
                avatar:
                  "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
                name: "Old Time-y Anon",
              },
            },
            {
              anonymity_type: "strangers",
              content: '[{"insert":"friends!!!!!"}]',
              created: "2020-05-23T05:52:00",
              comment_id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              chain_parent_id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
              is_own: false,
              friend: false,
              self: false,
              parent_comment: null,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
              secret_identity: {
                avatar:
                  "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
                name: "Old Time-y Anon",
              },
            },
          ],
          content: '[{"insert":"Kermit the Frog"}]',
          created: "2020-05-02T06:04:00",
          post_id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
          is_new: false,
          is_own: false,
          friend: false,
          self: false,
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          secret_identity: {
            avatar:
              "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
            name: "DragonFucker",
          },
          total_comments_amount: 2,
          type: "text",
          tags: {
            index_tags: [],
            whisper_tags: [
              "Im too ashamed to admit this ok",
              "sorry mom",
              "YOU WILL NEVER KNOW WHO I AM",
            ],
            category_tags: [],
            content_warnings: [],
          },
          options: {},
        },
      ],
    });
  });
});
