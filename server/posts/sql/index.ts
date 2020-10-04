import pg, { QueryFile } from "pg-promise";
import path from "path";

const getRandomIdentity = `
    SELECT 
        id as secret_identity_id ,
        display_name as secret_identity_name,
        avatar_reference_id as secret_identity_avatar
    FROM secret_identities
    LEFT JOIN user_thread_identities as uti
        ON secret_identities.id = uti.identity_id AND uti.thread_id = $/thread_id/
    WHERE uti.user_id is NULL
    ORDER BY RANDOM()
    LIMIT 1`;

const addIdentityToThread = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id, role_id)
    VALUES(
        $/thread_id/,
        $/user_id/, 
        $/secret_identity_id/,
        $/role_identity_id/
    ) RETURNING *`;

const makePost = `
    INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, options)
    VALUES(
        $/post_string_id/,
        $/parent_post/,
        $/parent_thread/,
        $/user_id/,
        $/content/,
        'text',
        $/whisper_tags/,
        $/anonymity_type/,
        $/options/
    ) RETURNING *, TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created_string
    `;

const makeComment = `
    INSERT INTO comments(string_id, parent_post, parent_thread, author, content, anonymity_type, chain_parent_comment, parent_comment)
    VALUES(
        $/comment_string_id/,
        $/parent_post/,
        $/parent_thread/,
        $/user_id/,
        $/content/,
        $/anonymity_type/,
        $/chain_parent_comment/,
        $/parent_comment/
    ) RETURNING *, TO_CHAR(comments.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created_string`;

const pgInstance = pg();
const createAddTagsQuery = (tags: string[]) => {
  const tagsColumn = new pgInstance.helpers.ColumnSet(["tag"], {
    table: "tags",
  });
  const tagsValues = tags.map((tag) => ({ tag: tag.toLowerCase() }));
  // NOTE: ON CONFLICT DO NOTHING DOESN'T WORK WITH RETURNING
  // this means unfortunately that we have to always call select to get
  // back the tag id.
  return (
    pgInstance.helpers.insert(tagsValues, tagsColumn) +
    " ON CONFLICT DO NOTHING RETURNING id, tag"
  );
};

const createAddTagsToPostQuery = (postId: number, tags: string[]) => {
  const insertTagQuery = `INSERT INTO post_tags(post_id, tag_id) VALUES($/post_id/, (SELECT id FROM tags WHERE tag = $/tag/)) RETURNING $/tag/;`;
  return pgInstance.helpers.concat(
    tags.map((tag) => ({
      query: insertTagQuery,
      values: {
        post_id: postId,
        tag: tag.toLowerCase(),
      },
    }))
  );
};

const createAddCategoriesQuery = (categories: string[]) => {
  const categoriesColumn = new pgInstance.helpers.ColumnSet(["category"], {
    table: "categories",
  });
  const categoriesValues = categories.map((category) => ({
    category: category.toLowerCase(),
  }));
  // NOTE: ON CONFLICT DO NOTHING DOESN'T WORK WITH RETURNING
  // this means unfortunately that we have to always call select to get
  // back the tag id.
  return (
    pgInstance.helpers.insert(categoriesValues, categoriesColumn) +
    " ON CONFLICT DO NOTHING RETURNING id, category"
  );
};

const createAddCategoriesToPostQuery = (
  postId: number,
  categories: string[]
) => {
  const insertCategoryQuery = `
    INSERT INTO post_categories(post_id, category_id) 
    VALUES($/post_id/, (SELECT id FROM categories WHERE category = $/category/)) 
    RETURNING $/category/;`;
  return pgInstance.helpers.concat(
    categories.map((category) => ({
      query: insertCategoryQuery,
      values: {
        post_id: postId,
        category: category.toLowerCase(),
      },
    }))
  );
};

const createAddContentWarningsQuery = (warnings: string[]) => {
  const warningsColumn = new pgInstance.helpers.ColumnSet(["warning"], {
    table: "content_warnings",
  });
  const warningsValues = warnings.map((warning) => ({
    warning: warning.toLowerCase(),
  }));
  // NOTE: ON CONFLICT DO NOTHING DOESN'T WORK WITH RETURNING
  // this means unfortunately that we have to always call select to get
  // back the tag id.
  return (
    pgInstance.helpers.insert(warningsValues, warningsColumn) +
    " ON CONFLICT DO NOTHING RETURNING id, warning"
  );
};

const createAddContentWarningsToPostQuery = (
  postId: number,
  warnings: string[]
) => {
  const insertWarningQuery = `
    INSERT INTO post_warnings(post_id, warning_id) 
    VALUES($/post_id/, (SELECT id FROM content_warnings WHERE warning = $/warning/)) 
    RETURNING $/warning/;`;
  return pgInstance.helpers.concat(
    warnings.map((warning) => ({
      query: insertWarningQuery,
      values: {
        post_id: postId,
        warning: warning.toLowerCase(),
      },
    }))
  );
};

export default {
  getThreadDetails: new QueryFile(
    path.join(__dirname, "get-thread-details.sql")
  ),
  getRandomIdentity,
  makePost,
  makeComment,
  addIdentityToThread,
  createAddTagsQuery,
  createAddCategoriesQuery,
  createAddTagsToPostQuery,
  createAddCategoriesToPostQuery,
  createAddContentWarningsQuery,
  createAddContentWarningsToPostQuery,
};
