import "mocha";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import chai, { expect } from "chai";
chai.use(deepEqualInAnyOrder);

import { runWithinTransaction } from "../../test-utils";

import {
  getPostFromStringId,
  maybeAddCategoryTags,
  maybeAddContentWarningTags,
  maybeAddIndexTags,
  postNewComment,
  removeIndexTags,
  updateWhisperTags,
} from "../queries";

import debug from "debug";
const log = debug("bobaserver:posts:queries-test-log");

//const GET_POST_STRING_ID = `SELECT string_id FROM posts WHERE id = $/post_id/`;
describe("Tests posts queries", () => {
  it("adds index tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      // Himbo & zombies post
      const postId = 6;
      const postStringId = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";
      const addedTags = await maybeAddIndexTags(transaction, {
        postId,
        indexTags: ["Resident Evil", "Leon Kennedy"],
      });

      const result = await getPostFromStringId(transaction, {
        firebaseId: undefined,
        postId: postStringId,
      });

      expect(result.index_tags).to.deep.equalInAnyOrder([
        "leon kennedy",
        "resident evil",
      ]);
      expect(addedTags).to.deep.equalInAnyOrder([
        "resident evil",
        "leon kennedy",
      ]);
    });
  });

  it("adds content warnings tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      // Himbo & zombies post
      const postId = 6;
      const postStringId = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";
      const addedTags = await maybeAddContentWarningTags(transaction, {
        postId,
        contentWarnings: ["zombies", "vore"],
      });

      const result = await getPostFromStringId(transaction, {
        firebaseId: undefined,
        postId: postStringId,
      });

      expect(result.content_warnings).to.deep.equalInAnyOrder([
        "zombies",
        "vore",
      ]);
      expect(addedTags).to.deep.equalInAnyOrder(["zombies", "vore"]);
    });
  });

  it("adds category tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      // Himbo & zombies post
      const postId = 6;
      const postStringId = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";
      const addedTags = await maybeAddCategoryTags(transaction, {
        postId,
        categoryTags: ["thirst"],
      });

      const result = await getPostFromStringId(transaction, {
        firebaseId: undefined,
        postId: postStringId,
      });

      expect(result.category_tags).to.deep.equalInAnyOrder(["thirst"]);
      expect(addedTags).to.deep.equalInAnyOrder(["thirst"]);
    });
  });

  it("removes tags from post", async () => {
    await runWithinTransaction(async (transaction) => {
      // Revolver Ocelot post
      const postId = 2;
      const postStringId = "619adf62-833f-4bea-b591-03e807338a8e";
      await removeIndexTags(transaction, {
        postId,
        indexTags: ["EVIL", "   metal gear      "],
      });

      const result = await getPostFromStringId(transaction, {
        firebaseId: undefined,
        postId: postStringId,
      });

      expect(result.index_tags).to.deep.equalInAnyOrder([
        "bobapost",
        "oddly specific",
      ]);
    });
  });

  // TODO: do the same for categories and content warnings

  it("updates whisper tags", async () => {
    await runWithinTransaction(async (transaction) => {
      // Himbo & zombies post
      const postId = 6;
      const postStringId = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";
      await updateWhisperTags(transaction, {
        postId,
        whisperTags: ["whisper whisper", "babble babble"],
      });

      const result = await getPostFromStringId(transaction, {
        firebaseId: undefined,
        postId: postStringId,
      });

      expect(result.whisper_tags).to.deep.equalInAnyOrder([
        "babble babble",
        "whisper whisper",
      ]);
    });
  });
});
