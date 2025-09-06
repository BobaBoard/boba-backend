import debug from "debug";
import { maybeAddIndexTags } from "../queries.js";
import { runWithinTransaction } from "utils/test-utils.js";

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

      expect(result.index_tags).toIncludeSameMembers([
        "leon kennedy",
        "resident evil",
      ]);
      expect(addedTags).toIncludeSameMembers(["resident evil", "leon kennedy"]);
    });
  });
});
