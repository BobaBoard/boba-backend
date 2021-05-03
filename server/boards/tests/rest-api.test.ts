import "mocha";
import { expect } from "chai";
import request from "supertest";
import express, { Express } from "express";
import router from "../routes";
import { Server } from "http";

import debug from "debug";
const log = debug("bobaserver:board:routes");

describe("Tests boards REST API", () => {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    app = express();
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
    process.env.FORCED_USER = undefined;
  });
  afterEach(function (done) {
    listener.close(done);
    process.env.FORCED_USER = undefined;
  });
  it("should return board data", async () => {
    const res = await request(app).get("/gore");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      descriptions: [
        {
          categories: ["blood", "bruises"],
          description: null,
          id: "id1",
          index: 2,
          title: "Gore Categories",
          type: "category_filter",
        },
        {
          categories: null,
          description: '[{"insert": "pls b nice"}]',
          id: "id2",
          index: 1,
          title: "Gore description",
          type: "text",
        },
      ],
      settings: {
        accentColor: "#f96680",
      },
      muted: false,
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      postingIdentities: [],
      pinned_order: null,
      permissions: {
        canEditBoardData: false,
        postsPermissions: [],
      },
      accessories: [
        {
          accessory: "/420accessories/weed_hands.png",
          id: 4,
          name: "Rolling",
        },
        {
          accessory: "/420accessories/joint.png",
          id: 5,
          name: "Joint",
        },
      ],
      avatarUrl: "/gore.png",
      delisted: false,
      loggedInOnly: false,
    });
  });

  it("should return activity data", async () => {
    const res = await request(app).get("/gore/activity/latest");

    expect(res.status).to.equal(200);
    expect(res.body).to.eql({
      next_page_cursor: null,
      activity: [
        {
          posts: [
            {
              content:
                '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
              created: "2020-09-25T05:42:00",
              friend: false,
              is_new: false,
              new_comments_amount: 0,
              options: {},
              parent_post_id: null,
              parent_thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
              post_id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
              secret_identity: {
                avatar:
                  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
                name: "GoreMaster5000",
                accessory: null,
                color: "red",
              },
              self: false,
              tags: {
                category_tags: [],
                content_warnings: [],
                index_tags: [],
                whisper_tags: ["An announcement from your headmaster!"],
              },
              total_comments_amount: 2,
            },
          ],
          thread_direct_threads_amount: 0,
          thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
          board_slug: "gore",
          thread_last_activity: "2020-10-04T05:44:00.000000",
          thread_new_comments_amount: 0,
          thread_new_posts_amount: 0,
          thread_total_comments_amount: 2,
          thread_total_posts_amount: 1,
          muted: false,
          hidden: false,
          default_view: "thread",
        },
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
                accessory:
                  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
                color: null,
              },
              self: false,
              friend: false,
              created: "2020-04-30T03:23:00",
              content: '[{"insert":"Favorite character to maim?"}]',
              options: {},
              tags: {
                index_tags: ["evil", "bobapost"],
                whisper_tags: [],
                category_tags: ["bruises"],
                content_warnings: [],
              },
              total_comments_amount: 2,
              new_comments_amount: 0,
              is_new: false,
            },
          ],
          thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
          board_slug: "gore",
          thread_new_posts_amount: 0,
          thread_new_comments_amount: 0,
          thread_total_comments_amount: 2,
          thread_total_posts_amount: 3,
          thread_last_activity: "2020-05-23T05:52:00.000000",
          thread_direct_threads_amount: 2,
          muted: false,
          hidden: false,
          default_view: "thread",
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
                accessory: null,
                color: null,
              },
              self: false,
              friend: false,
              created: "2020-04-24T05:42:00",
              content: '[{"insert":"Favorite murder scene in videogames?"}]',
              options: {},
              tags: {
                index_tags: [],
                whisper_tags: ["mwehehehehe"],
                category_tags: ["blood", "bruises"],
                content_warnings: [],
              },
              total_comments_amount: 0,
              new_comments_amount: 0,
              is_new: false,
            },
          ],
          thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
          board_slug: "gore",
          thread_new_posts_amount: 0,
          thread_new_comments_amount: 0,
          thread_total_comments_amount: 0,
          thread_total_posts_amount: 3,
          thread_last_activity: "2020-05-03T09:47:00.000000",
          thread_direct_threads_amount: 2,
          muted: false,
          hidden: false,
          default_view: "thread",
        },
      ],
    });
  });
});
