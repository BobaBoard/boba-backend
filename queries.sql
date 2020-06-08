"29d1b2da-3289-454a-9089-2ed47db4967b",
  "posts": [
    {
      "id": "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "parent_thread_id": 1,
      "parent_post_id": null,
      "created": "2020-04-30T03:23:00",
      "content": "[{\"insert\":\"Favorite character to maim?\"}]",
      "type": "text",
      "whisper_tags": null,
      "anonymity_type": "strangers",
      "comments": null,
      "secret_identity": {
        "name": "Evil Moth",
        "avatar": null
      }
    },

    https://board-test.boba.social/gore.png


INSERT INTO Boards(slug, tagline, avatar_reference_id, settings)
VALUES
    ('main_street', 'For BobaBoard-related discussions.', 'https://board-test.boba.social/villains.png', '{ "accentColor": "#ff5252" }'),
    ('gore', 'Blood! Blood! Blood!', 'https://board-test.boba.social/gore.png', '{ "accentColor": "#f96680" }'),
    ('anime', 'I wish I had a funny one for this.', 'https://board-test.boba.social/anime.png', '{ "accentColor": "#24d282"}');


INSERT INTO Users(firebase_id, username, avatar_reference_id, invited_by)
VALUES
    ('9shqqrXpFpNVXy4lkN4MZIlU2ZG3', 'panpinecone', 'https://pbs.twimg.com/profile_images/627424894293278720/ygGnmr8J_400x400.png', NULL);

    SELECT 
       users.id as user_id,
       identity_id
     FROM users
     LEFT JOIN user_thread_identities as uti
      ON users.id = uti.user_id AND uti.thread_id = 3
     LEFT JOIN secret_identities 
      ON secret_identities.id = uti.identity_id
     WHERE 
      firebase_id = 'c6HimTlg2RhVH3fC1psXZORdLcx2'
     LIMIT 1

     SELECT 
          id as secret_identity_id 
         FROM secret_identities
         LEFT JOIN user_thread_identities as uti
         ON secret_identities.id = uti.user_id AND uti.thread_id = 3
         WHERE uti.thread_id = NULL
         ORDER BY RANDOM()
         LIMIT 1

SELECT
    user_id as id,
    username,
    users.avatar_reference_id as user_avatar_reference_id,
    display_name,
    secret_identities.avatar_reference_id as secret_identity_avatar_reference_id,
    is_friend.friend,
    user_id = 1 as self
FROM user_thread_identities AS uti 
    LEFT JOIN users ON uti.user_id = users.id 
    LEFT JOIN secret_identities ON secret_identities.id = uti.identity_id 
    LEFT JOIN threads ON threads.id = uti.thread_id
    LEFT JOIN LATERAL (SELECT true as friend FROM friends WHERE friends.user_id = 1 AND friends.friend_id = users.id limit 1) as is_friend ON 1=1 
WHERE threads.string_id = 'a5c903df-35e8-43b2-a41a-208c43154671';

WITH 
        thread_identities AS
            (SELECT
              uti.thread_id as thread_id,
              uti.user_id as user_id,
              users.username as username,
              users.avatar_reference_id as user_avatar,
              secret_identities.display_name as secret_identity,
              secret_identities.avatar_reference_id as secret_avatar
             FROM user_thread_identities AS uti 
             INNER JOIN users 
                  ON uti.user_id = users.id 
             INNER JOIN secret_identities 
                  ON secret_identities.id = uti.identity_id)
    SELECT
      *
    FROM
      (SELECT
           threads.string_id as threads_string_id,
           threads.id as threads_id,
           MIN(posts.created) as first_post,
           MAX(posts.created) as last_post,
           MAX(comments.created) as last_comments,
           COUNT(DISTINCT posts.id) as posts_amount
       FROM boards 
       LEFT JOIN threads
           ON boards.id = threads.parent_board
       LEFT JOIN posts
          ON posts.parent_thread = threads.id
       LEFT JOIN comments
           ON comments.parent_thread = threads.id
       WHERE boards.slug = 'gore'
       GROUP BY
         threads.id, boards.id) as thread_updates
    LEFT JOIN posts as outer_posts
      ON thread_updates.threads_id = outer_posts.parent_thread AND outer_posts.created = thread_updates.first_post
    LEFT JOIN thread_identities
      ON thread_identities.user_id = outer_posts.author AND thread_identities.thread_id = outer_posts.parent_thread
    LEFT JOIN LATERAL (SELECT true as friends FROM friends WHERE friends.user_id = 1 AND friends.friend_id = author limit 1) as is_friend 
        ON true;

        SELECT 
              thread_comments.parent_post, 
              json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type
              )) as comments 
              FROM (
                SELECT 
                  comments.*,
                  thread.string_id as parent_thread_string_id
                FROM comments 
                LEFT JOIN threads as thread
                  ON comments.parent_thread = thread.id
                WHERE thread.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'
                ORDER BY comments.created ASC) as thread_comments
              GROUP BY thread_comments.parent_post;
        WITH
              last_visited AS
            (SELECT
              CASE WHEN last_visit_time IS NOT NULL THEN last_visit_time ELSE to_timestamp(0) END as last_visit_time
             FROM user_thread_last_visits
             LEFT JOIN users
              ON users.id = user_thread_last_visits.user_id
            LEFT JOIN threads
              ON threads.id = user_thread_last_visits.thread_id
            WHERE users.firebase_id = 'c6HimTlg2RhVH3fC1psXZORdLcx2' AND threads.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b')
          SELECT * FROM last_visited;
          SELECT 
              thread_comments.parent_post, 
              SUM(CASE WHEN last_visit_time < thread_comments.created THEN 1 ELSE 0 END) as new_comments,
              json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type,
                'is_new', last_visit_time < thread_comments.created
              )) as comments 
              FROM (
                SELECT 
                  comments.*,
                  thread.string_id as parent_thread_string_id,
                  last_visited.last_visit_time
                FROM comments 
                LEFT JOIN threads as thread
                  ON comments.parent_thread = thread.id
                LEFT JOIN last_visited
                  ON 1=1
                WHERE thread.string_id = 'a5c903df-35e8-43b2-a41a-208c43154671'
                ORDER BY comments.created ASC) as thread_comments
              GROUP BY thread_comments.parent_post)
              SELECT
              CASE WHEN last_visit_time IS NOT NULL THEN last_visit_time ELSE to_timestamp(0) END as last_visit_time
             FROM user_thread_last_visits
             LEFT JOIN users
              ON users.id = user_thread_last_visits.user_id
            LEFT JOIN threads
              ON threads.id = user_thread_last_visits.thread_id
            WHERE users.firebase_id = 'c6HimTlg2RhVH3fC1psXZORdLcx2' AND threads.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'



      (SELECT
           threads.string_id as threads_string_id,
           threads.id as threads_id,
           MIN(posts.created) as first_post,
           MAX(posts.created) as last_post,
           COUNT(DISTINCT posts.id) as posts_amount,              
           SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < posts.created THEN 1 ELSE 0 END) as new_posts_amount,
       FROM boards 
       LEFT JOIN threads
           ON boards.id = threads.parent_board
       LEFT JOIN posts
          ON posts.parent_thread = threads.id
       LEFT JOIN comments
           ON comments.parent_thread = threads.id AND comments.parent_post = posts.id
       LEFT JOIN user_thread_last_visits
           ON threads.id = user_thread_last_visits.thread_id
              AND user_thread_last_visits.user_id = $2
       WHERE boards.slug = $1
       GROUP BY
         threads.id, boards.id) as thread_updates


MAX(comments.created) as last_comments,
SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < comments.created THEN 1 ELSE 0 END) as new_comments_amount

WITH thread_posts_updates AS
(SELECT
           threads.string_id as threads_string_id,
           threads.id as threads_id,
           MIN(posts.created) as first_post,
           MAX(posts.created) as last_post,
           COUNT(posts.id) as posts_amount,              
           SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < posts.created THEN 1 ELSE 0 END) as new_posts_amount       FROM boards 
       LEFT JOIN threads
           ON boards.id = threads.parent_board
       LEFT JOIN posts
          ON posts.parent_thread = threads.id
       LEFT JOIN user_thread_last_visits
           ON threads.id = user_thread_last_visits.thread_id
              AND user_thread_last_visits.user_id = 1
       WHERE boards.slug = 'gore'
       GROUP BY
         threads.id, boards.id)
SELECT * 
FROM (SELECT
        thread_posts_updates.threads_id,
        MAX(comments.created) as last_comments,
        COUNT(comments.id) as comments_amount,  
        SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < comments.created THEN 1 ELSE 0 END) as new_comments_amount
      FROM thread_posts_updates 
      INNER JOIN comments
        ON thread_posts_updates.threads_id = comments.parent_thread 
      LEFT JOIN user_thread_last_visits
          ON thread_posts_updates.threads_id = user_thread_last_visits.thread_id
              AND user_thread_last_visits.user_id = 1
      GROUP BY thread_posts_updates.threads_id
      ) as thread_comments_updates;

       WITH
        last_visited AS
            (SELECT
              last_visit_time
             FROM user_thread_last_visits
             LEFT JOIN users
              ON users.id = user_thread_last_visits.user_id
            LEFT JOIN threads
              ON threads.id = user_thread_last_visits.thread_id
            WHERE users.firebase_id = 'c6HimTlg2RhVH3fC1psXZORdLcx2' AND threads.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
        thread_comments AS
            (SELECT 
              thread_comments.parent_post,
              SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < thread_comments.created THEN 1 ELSE 0 END) as new_comments,
              COUNT(*) as total_comments,
              json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type,
                'is_new', last_visit_time < thread_comments.created OR last_visit_time IS NULL
              )) as comments 
              FROM (
                SELECT 
                  comments.*,
                  thread.string_id as parent_thread_string_id,
                  last_visited.last_visit_time
                FROM comments 
                LEFT JOIN threads as thread
                  ON comments.parent_thread = thread.id
                LEFT JOIN last_visited
                  ON 1=1
                WHERE thread.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'
                ORDER BY comments.created ASC) as thread_comments
              GROUP BY thread_comments.parent_post),
        thread_posts AS
            (SELECT 
              posts.string_id as id,
              posts.parent_thread as parent_thread_id,
              parent.string_id as parent_post_id,
              posts.author,
              TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS') as created,
              posts.content,
              posts.type,
              posts.whisper_tags,
              posts.anonymity_type,
              thread_comments.comments,
              thread_comments.new_comments,
              last_visited.last_visit_time < posts.created OR last_visited.last_visit_time IS NULL as is_new
             FROM posts
             LEFT JOIN posts as parent
              ON posts.parent_post = parent.id
            LEFT JOIN posts as child
              ON child.parent_post = posts.id
             LEFT JOIN thread_comments 
              ON posts.id = thread_comments.parent_post
             LEFT JOIN last_visited
              ON 1=1
             ORDER BY posts.created DESC)
    SELECT 
        threads.string_id, 
        json_agg(row_to_json(thread_posts)) as posts,
        SUM(thread_posts.new_comments) as new_comments,
        SUM(CASE WHEN thread_posts.is_new IS NULL OR thread_posts.is_new THEN 1 ELSE 0 END) as new_posts
    FROM threads
    LEFT JOIN thread_posts
        ON threads.id = thread_posts.parent_thread_id
    WHERE threads.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'
    GROUP BY threads.id

       WITH
        last_visited AS
            (SELECT
              last_visit_time
             FROM user_thread_last_visits
             LEFT JOIN users
              ON users.id = user_thread_last_visits.user_id
            LEFT JOIN threads
              ON threads.id = user_thread_last_visits.thread_id
            WHERE users.firebase_id = 'c6HimTlg2RhVH3fC1psXZORdLcx2' AND threads.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'),
        thread_comments AS
            (SELECT 
              thread_comments.parent_post,
              SUM(CASE WHEN last_visit_time IS NULL OR last_visit_time < thread_comments.created THEN 1 ELSE 0 END) as new_comments,
              COUNT(*) as total_comments,
              json_agg(json_build_object(
                'id', thread_comments.string_id,
                'parent_post', thread_comments.parent_thread_string_id,
                'author', thread_comments.author,
                'content', thread_comments.content,
                'created',  TO_CHAR(thread_comments.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
                'anonymity_type', thread_comments.anonymity_type,
                'is_new', last_visit_time < thread_comments.created OR last_visit_time IS NULL
              )) as comments 
              FROM (
                SELECT 
                  comments.*,
                  thread.string_id as parent_thread_string_id,
                  last_visited.last_visit_time
                FROM comments 
                LEFT JOIN threads as thread
                  ON comments.parent_thread = thread.id
                LEFT JOIN last_visited
                  ON 1=1
                WHERE thread.string_id = '29d1b2da-3289-454a-9089-2ed47db4967b'
                ORDER BY comments.created ASC) as thread_comments
              GROUP BY thread_comments.parent_post)
            (SELECT 
              posts.string_id as id,
              posts.parent_thread as parent_thread_id,
              parent.string_id as parent_post_id,
              posts.content,
              thread_comments.total_comments,
              thread_comments.new_comments,
              last_visited.last_visit_time < posts.created OR last_visited.last_visit_time IS NULL as is_new
             FROM posts
             LEFT JOIN posts as parent
              ON posts.parent_post = parent.id
            LEFT JOIN posts as child
              ON child.parent_post = posts.id
             LEFT JOIN thread_comments 
              ON posts.id = thread_comments.parent_post
             LEFT JOIN last_visited
              ON 1=1
             ORDER BY posts.created DESC)