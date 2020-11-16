import debug from "debug";
import pool from "../pool";
import sql from "./sql";

const log = debug("bobaserver:tags:queries-log");
const error = debug("bobaserver:tags:queries-error");

function jsStringArrayToPsStringArray(jsStringArray: string[]): string {
  return 
}

export const getPostsWithTags = async ({
  firebase_id,
  includeTags,
  excludeTags
}: {
  firebase_id: string,
  includeTags: string[],
  excludeTags: string[]
}): Promise<any> => {
  try {
    return await pool.many(sql.getPostsWithTags, {firebase_id, includeTags, excludeTags});

  } catch (e) {
    error(`Error while fetching posts by tags. includeTags: (${includeTags}) excludeTags:(${excludeTags})`);
    error(e);
  }
};
