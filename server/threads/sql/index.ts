import { QueryFile } from "pg-promise";
import path from "path";

const createThread = `
    INSERT INTO threads(string_id, parent_board)
    VALUES (
      $/thread_string_id/,
      (SELECT id FROM boards WHERE slug = $/board_slug/))
    RETURNING id`;

const createPost = `
    INSERT INTO posts(string_id, parent_post, parent_thread, 
      author, content, type, 
      whisper_tags, anonymity_type)
    VALUES
      ($/post_string_id/,
      NULL,
      $/parent_thread/,
      (SELECT id FROM users WHERE firebase_id = $/firebase_id/),
      $/content/, 
      'text', 
      NULL, 
      $/anonymity_type/) 
    RETURNING id`;

const getRandomIdentityId = `
    SELECT id FROM secret_identities ORDER BY RANDOM() LIMIT 1`;

const insertNewIdentity = `
    INSERT INTO user_thread_identities(thread_id, user_id, identity_id)
    VALUES(
      $/thread_id/,
      (SELECT id FROM users WHERE firebase_id = $/firebase_id/), 
      $/secret_identity_id/)`;

export default {
  threadIdByString: new QueryFile(
    path.join(__dirname, "thread-by-string-id.sql")
  ),
  threadIdentitiesByStringId: new QueryFile(
    path.join(__dirname, "thread-identities-by-string-id.sql")
  ),
  visitThreadByStringId: new QueryFile(
    path.join(__dirname, "visit-thread-by-string-id.sql")
  ),
  createThread,
  createPost,
  getRandomIdentityId,
  insertNewIdentity,
};
