import pg, { QueryFile } from "pg-promise";

import path from "path";

const getRandomIdentity = `
    SELECT 
        secret_identities.id as secret_identity_id ,
        display_name as secret_identity_name,
        avatar_reference_id as secret_identity_avatar
    FROM secret_identities
    JOIN realms
      ON realms.id = (SELECT parent_realm_id FROM boards 
                      JOIN threads ON threads.parent_board = boards.id
                      WHERE threads.id = $/thread_id/)
    JOIN realm_bobadex_seasons
      ON realm_bobadex_seasons.realm_id = realms.id
    JOIN bobadex_season_secret_identities
      ON bobadex_season_secret_identities.secret_identity_id = secret_identities.id
        AND bobadex_season_secret_identities.bobadex_season_id = realm_bobadex_seasons.bobadex_season_id
    LEFT JOIN user_thread_identities as uti
        ON secret_identities.id = uti.identity_id AND uti.thread_id = $/thread_id/
    WHERE uti.user_id is NULL
        AND realm_bobadex_seasons.active IS TRUE
    ORDER BY RANDOM()
    LIMIT 1`;

const getRandomAccessory = `
    SELECT 
        id as accessory_id ,
        image_reference_id as accessory_avatar
    FROM accessories
    ORDER BY RANDOM()
    LIMIT 1`;

const getUserAccessories = `
    SELECT 
        id as id ,
        string_id as string_id ,
        image_reference_id as avatar
    FROM realm_accessories
    INNER JOIN accessories
      ON realm_accessories.accessory_id = accessories.id`;

const addIdentityToThread = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id, role_id)
    VALUES(
        $/thread_id/,
        $/user_id/, 
        $/secret_identity_id/,
        $/role_identity_id/
    ) RETURNING *`;

const addAccessoryToIdentity = `
    INSERT INTO identity_thread_accessories(thread_id, role_id, identity_id, accessory_id)
    VALUES(
        $/thread_id/,
        $/role_id/, 
        $/identity_id/,
        $/accessory_id/
    ) RETURNING *`;

const makePost = `
    INSERT INTO posts(string_id, parent_post, parent_thread, author, content, type, whisper_tags, anonymity_type, options)
    VALUES(
        $/post_external_id/,
        $/parent_post/,
        $/parent_thread/,
        $/user_id/,
        $/content/,
        'text',
        $/whisper_tags/,
        $/anonymity_type/,
        $/options/
    ) RETURNING *, TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS.00"Z"') as created_at
    `;

const makeComment = `
    INSERT INTO comments(string_id, parent_post, parent_thread, author, content, anonymity_type, chain_parent_comment, parent_comment)
    VALUES(
        $/comment_string_id/,
        $/parent_post_id/,
        $/parent_thread_id/,
        $/user_id/,
        $/content/,
        $/anonymity_type/,
        $/chain_parent_comment_id/,
        $/parent_comment_id/
    ) RETURNING *, TO_CHAR(comments.created, 'YYYY-MM-DD"T"HH24:MI:SS.00"Z"') as created_at`;

const pgInstance = pg();
const createAddTagsQuery = (tags: string[]) => {
  const tagsColumn = new pgInstance.helpers.ColumnSet(["tag"], {
    table: "tags",
  });
  const tagsValues = tags.map((tag) => ({ tag: tag }));
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
        tag: tag,
      },
    }))
  );
};

const deleteTagsFromPost = `
  DELETE FROM post_tags
  WHERE post_tags.post_id = $/post_id/
    AND post_tags.tag_id IN (SELECT id FROM tags WHERE tag = ANY($/tags/))
`;

const deleteCategoriesFromPost = `
  DELETE FROM post_categories
  WHERE post_categories.post_id = $/post_id/
    AND post_categories.category_id IN (SELECT id FROM categories WHERE category = ANY($/categories/))
`;

const deleteContentWarningsFromPost = `
  DELETE FROM post_warnings
  WHERE post_warnings.post_id = $/post_id/
    AND post_warnings.warning_id IN (SELECT id FROM content_warnings WHERE warning = ANY($/warnings/))
`;

const updatePostWhisperTags = `
  UPDATE posts
    SET whisper_tags = $/whisper_tags/
  WHERE posts.id = $/post_id/
`;

const createAddCategoriesQuery = (categories: string[]) => {
  const categoriesColumn = new pgInstance.helpers.ColumnSet(["category"], {
    table: "categories",
  });
  const categoriesValues = categories.map((category) => ({
    category: category,
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
        category: category,
      },
    }))
  );
};

const createAddContentWarningsQuery = (warnings: string[]) => {
  const warningsColumn = new pgInstance.helpers.ColumnSet(["warning"], {
    table: "content_warnings",
  });
  const warningsValues = warnings.map((warning) => ({
    warning: warning,
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
        warning: warning,
      },
    }))
  );
};

const getPostIdFromExternalId = `
  SELECT id FROM posts WHERE string_id = $/post_external_id/;
`;

const isPostOwner = `
    SELECT
      users.firebase_id = $/firebase_id/ as is_post_owner
    FROM posts
      LEFT JOIN users ON posts.author = users.id
    WHERE posts.string_id = $/post_external_id/
`;

export default {
  postByExternalId: new QueryFile(
    path.join(__dirname, "post-by-external-id.sql")
  ),
  getPostDetails: new QueryFile(path.join(__dirname, "get-post-details.sql")),
  getThreadDetails: new QueryFile(
    path.join(__dirname, "get-thread-details.sql")
  ),
  getRandomIdentity,
  getRandomAccessory,
  getUserAccessories,
  makePost,
  makeComment,
  addIdentityToThread,
  addAccessoryToIdentity,
  createAddTagsQuery,
  createAddCategoriesQuery,
  createAddTagsToPostQuery,
  createAddCategoriesToPostQuery,
  createAddContentWarningsQuery,
  createAddContentWarningsToPostQuery,
  deleteTagsFromPost,
  deleteCategoriesFromPost,
  deleteContentWarningsFromPost,
  updatePostWhisperTags,
  getPostIdFromExternalId,
  isPostOwner,
};
