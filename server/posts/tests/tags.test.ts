import {
  getPostByExternalId,
  maybeAddCategoryTags,
  maybeAddContentWarningTags,
  maybeAddIndexTags,
  removeCategoryTags,
  removeContentWarningTags,
  removeIndexTags,
  updateWhisperTags,
} from "../queries";

import { REVOLVER_OCELOT_POST } from "test/data/posts";
import debug from "debug";
import { runWithinTransaction } from "utils/test-utils";

const log = debug("bobaserver:posts:queries-test-log");

const HIMBO_POST_ID = 6;
const REVOLVER_OCELOT_POST_ID = 2;
const VIDEO_GAME_MURDER_POST_ID = 4;
const VIDEO_GAME_MURDER_POST_EXTERNAL_ID =
  "3db477e0-57ed-491d-ba11-b3a0110b59b0";
const NO_HARASSMENT_POST_ID = 173;
const NO_HARASSMENT_POST_EXTERNAL_ID = "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb";
const HIMBO_POST_EXTERNAL_ID = "1f1ad4fa-f02a-48c0-a78a-51221a7db170";

describe("Tests tag-related queries", () => {
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

  test("removes index tags from post", async () => {
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

  test("removes category tags from post", async () => {
    await runWithinTransaction(async (transaction) => {
      const postExternalId = VIDEO_GAME_MURDER_POST_EXTERNAL_ID;

      await removeCategoryTags(transaction, {
        postId: VIDEO_GAME_MURDER_POST_ID,
        categoryTags: ["bruises"],
      });

      const result = await getPostByExternalId(transaction, {
        firebaseId: undefined,
        postExternalId: postExternalId,
      });

      expect(result.category_tags).toIncludeSameMembers(["blood"]);
    });
  });

  test("removes content warning tags from post", async () => {
    await runWithinTransaction(async (transaction) => {
      const postId = NO_HARASSMENT_POST_ID;
      const postExternalId = NO_HARASSMENT_POST_EXTERNAL_ID;

      // adding some content warnings to take them away; there is a known issue where the test will not take away the pre-existing content warning
      await maybeAddContentWarningTags(transaction, {
        postId,
        contentWarnings: ["proclamation", "important thing"],
      });

      await removeContentWarningTags(transaction, {
        postId,
        contentWarnings: ["important thing"],
      });

      const result = await getPostByExternalId(transaction, {
        firebaseId: undefined,
        postExternalId,
      });

      expect(result.content_warnings).toIncludeSameMembers([
        "harassment PSA",
        "proclamation",
      ]);
    });
  });

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
});

test("removes index tags from post", async () => {
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

test("removes category tags from post", async () => {
  await runWithinTransaction(async (transaction) => {
    const postExternalId = VIDEO_GAME_MURDER_POST_EXTERNAL_ID;

    await removeCategoryTags(transaction, {
      postId: VIDEO_GAME_MURDER_POST_ID,
      categoryTags: ["bruises"],
    });

    const result = await getPostByExternalId(transaction, {
      firebaseId: undefined,
      postExternalId: postExternalId,
    });

    expect(result.category_tags).toIncludeSameMembers(["blood"]);
  });
});

test("removes content warning tags from post", async () => {
  await runWithinTransaction(async (transaction) => {
    const postExternalId = NO_HARASSMENT_POST_EXTERNAL_ID;

    await removeContentWarningTags(transaction, {
      postId: NO_HARASSMENT_POST_ID,
      contentWarnings: ["harassment PSA"],
    });

    const result = await getPostByExternalId(transaction, {
      firebaseId: undefined,
      postExternalId: postExternalId,
    });

    console.log("**************************");
    console.log({ result });
    console.log("**************************");


    expect(result.content_warnings).toIncludeSameMembers([]);
  });
});

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
