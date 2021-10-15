import chai, { expect } from "chai";

import debug from "debug";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { maybeAddIndexTags } from "../queries";
import { runWithinTransaction } from "utils/test-utils";

chai.use(deepEqualInAnyOrder);

const log = debug("bobaserver:posts:queries-test-log");

describe("Tests posts queries", () => {
  test("adds index tags to post (and database)", async () => {
    await runWithinTransaction(async (transaction) => {
      // Himbo & zombies post
      const postId = 6;
      const addedTags = await maybeAddIndexTags(transaction, {
        postId,
        indexTags: ["Resident Evil", "Leon Kennedy"],
      });

      // TODO: turn this into its own method
      const result = await transaction.one(
        `SELECT posts.*, array_to_json(array_agg(tags.tag)) as index_tags FROM posts LEFT JOIN post_tags ON post_id = posts.id LEFT JOIN tags ON tag_id = tags.id WHERE posts.id = $/post_id/ GROUP BY posts.id`,
        { post_id: postId }
      );

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
});
