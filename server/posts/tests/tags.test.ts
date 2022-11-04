import {
  getPostByExternalId,
  maybeAddCategoryTags,
  maybeAddContentWarningTags,
  maybeAddIndexTags,
  removeIndexTags,
  updateWhisperTags,
} from "../queries";

import { REVOLVER_OCELOT_POST } from "test/data/posts";
import debug from "debug";
import { runWithinTransaction } from "utils/test-utils";

const log = debug("bobaserver:posts:queries-test-log");

const HIMBO_POST_ID = 6;
const REVOLVER_OCELOT_POST_ID = 2;
const HIMBO_POST_EXTERNAL_ID = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";
describe("Tests posts queries", () => {
  test("adds index tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      const postId = HIMBO_POST_ID;

      const addedTags = await maybeAddIndexTags(transaction, {
        postId,
        indexTags: ["Resident Evil", "Leon Kennedy"],
      });
      expect(addedTags).toIncludeSameMembers(["resident evil", "leon kennedy"]);

      const result = await getPostByExternalId(transaction, {
        firebaseId: undefined,
        postExternalId: HIMBO_POST_EXTERNAL_ID,
      });

      expect(result.index_tags).toIncludeSameMembers([
        "leon kennedy",
        "resident evil",
      ]);
    });
  });

  test("adds content warnings tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      const postId = HIMBO_POST_ID;

      const addedTags = await maybeAddContentWarningTags(transaction, {
        postId,
        contentWarnings: ["zombies", "vore"],
      });
      expect(addedTags).toIncludeSameMembers(["zombies", "vore"]);

      const result = await getPostByExternalId(transaction, {
        firebaseId: undefined,
        postExternalId: HIMBO_POST_EXTERNAL_ID,
      });

      expect(result.content_warnings).toIncludeSameMembers(["zombies", "vore"]);
    });
  });

  // TODO: I have no idea why but sometimes tests decide they should not
  // pass on CI.
  // Periodically, try to remove this cause sometimes they start passing again.
  describe("ci-disable", () => {
    test("adds category tags to post (and database)", async () => {
      await runWithinTransaction(async (transaction) => {
        const postId = HIMBO_POST_ID;
        const addedTags = await maybeAddCategoryTags(transaction, {
          postId,
          categoryTags: ["thirst"],
        });
        expect(addedTags).toIncludeSameMembers(["thirst"]);

        const result = await getPostByExternalId(transaction, {
          firebaseId: undefined,
          postExternalId: HIMBO_POST_EXTERNAL_ID,
        });

        expect(result.category_tags).toIncludeSameMembers(["thirst"]);
      });
    });
  });
});

test("removes tags from post", async () => {
  await runWithinTransaction(async (transaction) => {
    const postExternalId = REVOLVER_OCELOT_POST.id;
    await removeIndexTags(transaction, {
      postId: REVOLVER_OCELOT_POST_ID,
      indexTags: ["EVIL", "   metal gear      "],
    });

    const result = await getPostByExternalId(transaction, {
      firebaseId: undefined,
      postExternalId: postExternalId,
    });

    expect(result.index_tags).toIncludeSameMembers([
      "bobapost",
      "oddly specific",
    ]);
  });
});

// TODO: do the same for categories and content warnings

test("updates whisper tags", async () => {
  await runWithinTransaction(async (transaction) => {
    const postId = HIMBO_POST_ID;
    await updateWhisperTags(transaction, {
      postId,
      whisperTags: ["whisper whisper", "babble babble"],
    });

    const result = await getPostByExternalId(transaction, {
      firebaseId: undefined,
      postExternalId: HIMBO_POST_EXTERNAL_ID,
    });

    expect(result.whisper_tags).toIncludeSameMembers([
      "babble babble",
      "whisper whisper",
    ]);
  });
});
