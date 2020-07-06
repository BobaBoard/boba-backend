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
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      threads_count: "2",
      avatarUrl: "/gore.png",
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
      new_comments_amount: 0,
      new_posts_amount: 0,
      posts: [
        {
          anonymity_type: "strangers",
          comments: null,
          content: '[{"insert":"Favorite character to maim?"}]',
          created: "2020-04-30T03:23:00",
          post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          is_new: false,
          is_own: false,
          new_comments_amount: 0,
          parent_post_id: null,
          parent_thread_id: 1,
          secret_identity: {
            avatar:
              "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
            name: "DragonFucker",
          },
          total_comments_amount: 0,
          type: "text",
          whisper_tags: null,
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
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: 1,
          secret_identity: {
            avatar:
              "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
            name: "Old Time-y Anon",
          },
          total_comments_amount: 0,
          type: "text",
          whisper_tags: ["fight me on this"],
          options: {},
        },
        {
          anonymity_type: "everyone",
          comments: [
            {
              anonymity_type: "strangers",
              content: '[{"insert":"OMG ME TOO"}]',
              created: "2020-05-22T00:22:00",
              id: "46a16199-33d1-48c2-bb79-4d4095014688",
              is_new: false,
              is_own: false,
              parent_post: "29d1b2da-3289-454a-9089-2ed47db4967b",
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
              id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
              is_new: false,
              is_own: false,
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
          new_comments_amount: 0,
          parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
          parent_thread_id: 1,
          secret_identity: {
            avatar:
              "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
            name: "DragonFucker",
          },
          total_comments_amount: 2,
          type: "text",
          whisper_tags: [
            "Im too ashamed to admit this ok",
            "sorry mom",
            "YOU WILL NEVER KNOW WHO I AM",
          ],
          options: {},
        },
      ],
      string_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      total_comments_amount: 2,
    });
  });
});
