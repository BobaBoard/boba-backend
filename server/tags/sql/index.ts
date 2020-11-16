const getPostsWithTags = `
    select posts_with_tags.post_info, posts_with_tags.parent_post_info FROM (  
        select
            posts.id as post_id,
            ARRAY_AGG (DISTINCT tags.tag) as index_tags,
            row_to_json(parent_thread.*) as parent_thread,
            json_build_object(
              'post_id', posts.string_id,
              'author', posts.author,
              'created', TO_CHAR(posts.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
              'content', posts.content,
              'options', posts.options,
              'type', posts.type,
              'username', posts_user.username,
              'user_avatar', posts_user.avatar_reference_id,
              'secret_identity_name', post_secret_identity.display_name,
              'secret_identity_avatar', post_secret_identity.avatar_reference_id,
              'self', COALESCE(logged_in_user.id = posts.author, FALSE),
              'friend', COALESCE(is_friend.friend, FALSE),
              'index_tags',  ARRAY_AGG (DISTINCT tags.tag),
              'category_tags', ARRAY_AGG (DISTINCT content_warnings.warning),
              'child_posts_count', COUNT (DISTINCT child_posts.id),
              'child_comments_count', COUNT (DISTINCT comments.id)
            ) as post_info,
            
            json_build_object(
              'post_id', first_post_in_thread.string_id,
              'author', first_post_in_thread.author,
              'created', TO_CHAR(first_post_in_thread.created, 'YYYY-MM-DD"T"HH24:MI:SS'),
              'content', first_post_in_thread.content,
              'options', first_post_in_thread.options,
              'type', first_post_in_thread.type,
              'username', first_post_in_thread_user.username,
              'user_avatar', first_post_in_thread_user.avatar_reference_id,
              'secret_identity_name', first_post_secret_identity.display_name,
              'secret_identity_avatar', first_post_secret_identity.avatar_reference_id,
              'self', COALESCE(logged_in_user.id = first_post_in_thread.author, FALSE),
              'friend', COALESCE(first_post_in_thread_is_friend.friend, FALSE),
              'index_tags',  ARRAY_AGG (DISTINCT first_post_tags.tag),
              'category_tags', ARRAY_AGG (DISTINCT first_post_content_warnings.warning),
              'child_posts_count', COUNT (DISTINCT first_post_child_posts.id),
              'child_comments_count', COUNT (DISTINCT first_post_comments.id)
            ) as parent_post_info           

        from posts
            LEFT JOIN users as logged_in_user on logged_in_user.firebase_id  = $/firebase_id/
            LEFT JOIN LATERAL (
               SELECT true as friend 
               FROM friends 
               WHERE friends.user_id = (SELECT id FROM users WHERE users.id = logged_in_user.id ) 
               AND friends.friend_id = posts.author 
               LIMIT 1) as is_friend ON 1=1 


            LEFT JOIN users as posts_user on posts.author = posts_user.id
            LEFT JOIN post_tags on posts.id = post_tags.post_id
            LEFT JOIN tags on post_tags.tag_id = tags.id
            LEFT JOIN threads as parent_thread on parent_thread.id = posts.parent_thread
            LEFT JOIN user_thread_identities as post_identity on post_identity.user_id = posts.author and post_identity.thread_id = posts.parent_thread
            LEFT JOIN secret_identities as post_secret_identity on post_identity.identity_id = post_secret_identity.id
            LEFT JOIN posts as child_posts on child_posts.parent_post = posts.id
            LEFT JOIN comments on comments.parent_post = posts.id
            LEFT JOIN post_warnings on posts.id = post_warnings.post_id
            LEFT JOIN content_warnings on post_warnings.warning_id = content_warnings.id
            
            LEFT JOIN posts as first_post_in_thread on first_post_in_thread.parent_post is NULL AND first_post_in_thread.parent_thread = posts.parent_thread AND first_post_in_thread.id != posts.id
            LEFT JOIN users as first_post_in_thread_user on first_post_in_thread.author = first_post_in_thread_user.id
            LEFT JOIN post_tags as first_post_post_tags on first_post_in_thread.id = first_post_post_tags.post_id
            LEFT JOIN tags as first_post_tags on first_post_post_tags.tag_id = first_post_tags.id 
            LEFT JOIN posts as first_post_child_posts on first_post_child_posts.parent_post = first_post_in_thread.id 
            LEFT JOIN comments as first_post_comments on first_post_comments.parent_post = first_post_in_thread.id
            LEFT JOIN user_thread_identities as first_post_identity on first_post_identity.user_id = first_post_in_thread.author and first_post_identity.thread_id = first_post_in_thread.parent_thread
            LEFT JOIN secret_identities as first_post_secret_identity on first_post_identity.identity_id = first_post_secret_identity.id
            LEFT JOIN post_warnings as first_post_post_warnings on first_post_in_thread.id = first_post_post_warnings.post_id
            LEFT JOIN content_warnings as first_post_content_warnings on first_post_post_warnings.warning_id = first_post_content_warnings.id

            LEFT JOIN LATERAL (
               SELECT true as friend 
               FROM friends 
               WHERE friends.user_id = (SELECT id FROM users WHERE users.id = logged_in_user.id ) 
               AND friends.friend_id = first_post_in_thread.author 
               LIMIT 1) as first_post_in_thread_is_friend ON 1=1 

        GROUP BY
            is_friend.friend,
            logged_in_user.id,
            parent_thread.id,
            posts.id,
            posts_user.username,
            posts_user.avatar_reference_id,
            post_secret_identity.display_name,
            post_secret_identity.avatar_reference_id,
            first_post_in_thread_is_friend.friend,
            first_post_in_thread.id,
            first_post_in_thread_user.username,
            first_post_in_thread_user.avatar_reference_id,
            first_post_secret_identity.display_name,
            first_post_secret_identity.avatar_reference_id
            
      ) as posts_with_tags    
    WHERE
      index_tags @> $/includeTags/ AND
      NOT index_tags && $/excludeTags/
`

export default {
  getPostsWithTags
}
