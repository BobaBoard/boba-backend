import debug from "debug";
import pool from "../pool";
import sql from "./sql";

const log = debug("bobaserver:tags:queries-log");
const error = debug("bobaserver:tags:queries-error");

export const getPostsWithTags = async ({
  includeTags,
  excludeTags
}: {
  includeTags: string[],
  excludeTags: string[]
}): Promise<any> => {
  try {
    return await pool.many(sql.getPostsWithTags, { 
      includeTags: includeTags,
      excludeTags: excludeTags});

  } catch (e) {
    error(`Error while fetching posts by tags. includeTags: (${includeTags}) excludeTags:(${excludeTags})`);
    error(e);
  }
};
