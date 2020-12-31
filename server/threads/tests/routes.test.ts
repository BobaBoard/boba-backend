import "mocha";
import { expect } from "chai";
import request from "supertest";
import express, { Express } from "express";
import { Server } from "http";
import router from "../routes";

describe("Tests threads REST API", () => {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
  });
  afterEach(function (done) {
    listener.close(done);
  });

  it("should return threads data", async () => {
    const res = await request(app).get("/29d1b2da-3289-454a-9089-2ed47db4967b");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
      board_slug: "gore",
      thread_new_comments_amount: 0,
      thread_total_posts_amount: 3,
      thread_new_posts_amount: 0,
      thread_total_comments_amount: 2,
      thread_direct_threads_amount: 2,
      default_view: "thread",
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
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
          total_comments_amount: 0,
          type: "text",
          tags: {
            index_tags: ["evil", "bobapost"],
            whisper_tags: [],
            category_tags: ["bruises"],
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
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
          total_comments_amount: 0,
          type: "text",
          tags: {
            index_tags: ["evil", "oddly specific", "metal gear", "bobapost"],
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
              accessory_avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
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
              accessory_avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
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
          accessory_avatar:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
          total_comments_amount: 2,
          type: "text",
          tags: {
            index_tags: ["good", "oddly specific", "bobapost"],
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
