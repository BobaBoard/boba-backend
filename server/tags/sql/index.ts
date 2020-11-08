const getPostsWithTags = `
    select posts_with_tags.* FROM (
        select
            posts.*,
            ARRAY_AGG (tags.tag) as all_tags 
        from posts
            LEFT JOIN post_tags on posts.id = post_tags.post_id
            LEFT JOIN tags on post_tags.tag_id = tags.id
        GROUP BY
            posts.id
      ) posts_with_tags
    WHERE
      all_tags @> $/includeTags/ AND
      NOT all_tags @> $/excludeTags/
`


export default {
    getPostsWithTags
}
