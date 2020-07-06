import { QueryFile } from "pg-promise";
import path from "path";

const getRandomIdentity = `
    SELECT 
        id as secret_identity_id 
    FROM secret_identities
    LEFT JOIN user_thread_identities as uti
        ON secret_identities.id = uti.identity_id AND uti.thread_id = $/thread_id/
    WHERE uti.user_id is NULL
    ORDER BY RANDOM()
    LIMIT 1`;

const addIdentityToThread = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES(
        $/thread_id/,
        $/user_id/, 
        $/secret_identity_id/
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
    ) RETURNING *`;

const makeComment = `
    INSERT INTO comments(string_id, parent_post, parent_thread, author, content, anonymity_type)
    VALUES(
        $/comment_string_id/,
        $/parent_post/,
        $/parent_thread/,
        $/user_id/,
        $/content/,
        $/anonymity_type/
    ) RETURNING *`;

export default {
  getThreadDetails: new QueryFile(
    path.join(__dirname, "get-thread-details.sql")
  ),
  getRandomIdentity,
  makePost,
  makeComment,
  addIdentityToThread,
};
