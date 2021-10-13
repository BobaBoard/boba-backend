import "mocha";

import { ServerCommentType, ServerPostType } from "../../../../Types";
import express, { Express } from "express";
import {
  runWithinTransaction,
  wrapWithTransaction,
} from "../../../../utils/test-utils";

import { Server } from "http";
import bodyParser from "body-parser";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import request from "supertest";
import router from "../../routes";

chai.use(chaiAsPromised);
const { expect } = chai;

const CHARACTER_TO_MAIM_POST: ServerPostType = {
  id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
  content: '[{"insert":"Favorite character to maim?"}]',
  created_at: "2020-04-30T03:23:00",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: null,
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar:
      "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
    name: "DragonFucker",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
    color: null,
  },
  total_comments_amount: 0,
  tags: {
    index_tags: ["evil", "bobapost"],
    whisper_tags: [],
    category_tags: ["bruises"],
    content_warnings: [],
  },
};

const REVOLVER_OCELOT_POST: ServerPostType = {
  id: "619adf62-833f-4bea-b591-03e807338a8e",
  content: '[{"insert":"Revolver Ocelot"}]',
  created_at: "2020-05-01T05:42:00",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar: "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
    name: "Old Time-y Anon",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
    color: null,
  },
  total_comments_amount: 0,
  tags: {
    index_tags: ["evil", "oddly specific", "metal gear", "bobapost"],
    whisper_tags: ["fight me on this"],
    category_tags: [],
    content_warnings: [],
  },
};

const KERMIT_POST: ServerPostType = {
  content: '[{"insert":"Kermit the Frog"}]',
  created_at: "2020-05-02T06:04:00",
  id: "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
  new: false,
  own: false,
  friend: false,
  new_comments_amount: 0,
  parent_post_id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
  parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  secret_identity: {
    avatar:
      "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
    name: "DragonFucker",
    accessory:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
    color: null,
  },
  total_comments_amount: 2,
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
};

const KERMIT_COMMENTS: ServerCommentType[] = [
  {
    content: '[{"insert":"OMG ME TOO"}]',
    created_at: "2020-05-22T00:22:00",
    id: "46a16199-33d1-48c2-bb79-4d4095014688",
    chain_parent_id: null,
    new: false,
    own: false,
    friend: false,
    parent_post_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
    parent_comment_id: null,
    secret_identity: {
      avatar:
        "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
      name: "Old Time-y Anon",
      accessory:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
      color: null,
    },
  },
  {
    content: '[{"insert":"friends!!!!!"}]',
    created_at: "2020-05-23T05:52:00",
    id: "89fc3682-cb74-43f9-9a63-bd97d0f59bb9",
    chain_parent_id: "46a16199-33d1-48c2-bb79-4d4095014688",
    new: false,
    own: false,
    friend: false,
    parent_comment_id: null,
    parent_post_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
    secret_identity: {
      avatar:
        "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
      name: "Old Time-y Anon",
      accessory:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F9b7a5d90-4885-43bf-a5f5-e861b7b87505.png?alt=media&token=83ae88ca-5c81-4d1b-9208-0a936017c485",
      color: null,
    },
  },
];

const CHARACTER_TO_MAIM_THREAD = {
  id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  parent_board_slug: "gore",
  default_view: "thread",
  hidden: false,
  muted: false,
  starter: CHARACTER_TO_MAIM_POST,
  posts: [CHARACTER_TO_MAIM_POST, REVOLVER_OCELOT_POST, KERMIT_POST],
  comments: {
    [KERMIT_POST.id]: KERMIT_COMMENTS,
  },
  new_comments_amount: 0,
  total_posts_amount: 3,
  new_posts_amount: 0,
  total_comments_amount: 2,
  direct_threads_amount: 2,
};

describe("Tests update view REST API", () => {
  let app: Express;
  let listener: Server;
  beforeEach(function (done) {
    app = express();
    app.use(bodyParser.json());

    // @ts-expect-error
    app.use((err, req, res, next) => {
      console.log(err);
      next();
    });
    app.use((req, res, next) => {
      // @ts-ignore
      req.currentUser = { uid: "fb3" };
      next();
    });
    app.use(router);
    listener = app.listen(4000, () => {
      done();
    });
    process.on("uncaughtException", function (err) {
      console.log("uncaughtException caught the error");
    });
  });
  afterEach(function (done) {
    listener.close(done);
  });

  it("should update view data", async () => {
    console.log("*************");
    console.log("*************");
    console.log("*************");
    return wrapWithTransaction(async () => {
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      const threadRes2 = await request(app).get(
        "/29d1b2da-3289-454a-9089-2ed47db4967b"
      );
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log(threadRes2.status);
      console.log(threadRes2.body.default_view);

      await expect(threadRes2.status).to.equal(200);
      console.log(threadRes2.status);
      console.log(threadRes2.body.default_view);
      await expect(threadRes2.body.default_view).to.eql("thread");
      console.log(threadRes2.status);
      console.log(threadRes2.body.default_view);
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");

      const res = await request(app)
        .post(`/${CHARACTER_TO_MAIM_THREAD.id}/update/view`)
        .send({
          defaultView: "gallery",
        });

      await expect(res.status).to.equal(200);

      const threadRes = await request(app).get(
        "/29d1b2da-3289-454a-9089-2ed47db4967b"
      );
      console.log(threadRes.body);

      await expect(threadRes.status).to.equal(200);
      //expect(threadRes.body.default_view).to.eql("gallery");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
      console.log("&&&&&&&&&&&&&&&&");
    });
  }).timeout(60000);
});
