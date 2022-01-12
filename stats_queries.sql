--- TOTAL ACTIVITY ---
select count(*) from threads;
select count(*) from posts;
select count(*) from comments;

-- THREAD WITH MOST COMMENTS -- 
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) + COUNT(DISTINCT comments.id) as total_amount,
	threads.string_id
FROM threads
LEFT JOIN comments
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON posts.parent_thread = threads.id
GROUP BY threads.string_id
ORDER by comments_amount DESC;

-- THREAD WITH MOST CONTRIBUTIONS -- 
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) + COUNT(DISTINCT comments.id) as total_amount,
	threads.string_id
FROM threads
LEFT JOIN comments
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON posts.parent_thread = threads.id
GROUP BY threads.string_id
ORDER by contributions_amount DESC;

-- THREAD WITH MOST ACTIVITY -- 
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) + COUNT(DISTINCT comments.id) as total_amount,
	threads.string_id
FROM threads
LEFT JOIN comments
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON posts.parent_thread = threads.id
GROUP BY threads.string_id
ORDER by total_amount DESC;

-- COMMENT THREAD WITH MOST ACTIVITY --
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	posts.string_id as post_id,
	threads.string_id as thread_id
FROM comments
LEFT JOIN threads
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON comments.parent_post = posts.id
WHERE chain_parent_comment IS NULL
GROUP BY threads.string_id, posts.string_id
ORDER by comments_amount DESC;

-- BOARD WITH MOST ACTIVITY --
SELECT
	COUNT(DISTINCT threads.id) as threads_amount,
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) + COUNT(DISTINCT comments.id) as total_activity_amount,
	boards.slug
FROM boards
LEFT JOIN threads
	ON boards.id = threads.parent_board
LEFT JOIN comments
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON posts.parent_thread = threads.id
GROUP BY boards.slug
ORDER by total_activity_amount DESC;

-- MOST MUTED BOARD --
SELECT
	COUNT(DISTINCT user_id) as users_count,
	boards.slug
FROM boards
LEFT JOIN user_muted_boards
	ON boards.id = user_muted_boards.board_id
GROUP BY boards.slug
ORDER by users_count DESC;

-- MOST PINNED BOARD -- 
SELECT
	COUNT(DISTINCT user_id) as users_count,
	boards.slug
FROM boards
LEFT JOIN user_pinned_boards
	ON boards.id = user_pinned_boards.board_id
GROUP BY boards.slug
ORDER by users_count DESC;

-- MOST HIDDEN THREADS --
SELECT
	COUNT(DISTINCT user_id) as users_count,
	threads.string_id
FROM threads
LEFT JOIN user_hidden_threads
	ON threads.id = user_hidden_threads.thread_id
GROUP BY threads.string_id
ORDER by users_count DESC;

-- MOST MUTED THREADS --
SELECT
	COUNT(DISTINCT user_id) as users_count,
	threads.string_id
FROM threads
LEFT JOIN user_muted_threads
	ON threads.id = user_muted_threads.thread_id
GROUP BY threads.string_id
ORDER by users_count DESC;

-- HOW OFTEN CATEGORIES ARE USED -- 
SELECT
	COUNT(DISTINCT author) as users_count,
	COUNT(DISTINCT post_categories.post_id) as posts_count,
	categories.category
FROM post_categories
LEFT JOIN posts
	ON posts.id = post_categories.post_id
LEFT JOIN categories
	ON categories.id = post_categories.category_id
GROUP BY categories.category
ORDER by posts_count DESC;

-- HOW OFTEN CONTENT NOTICES ARE USED -- 
SELECT
	COUNT(DISTINCT author) as users_count,
	COUNT(DISTINCT post_warnings.post_id) as posts_count,
	content_warnings.warning
FROM post_warnings
LEFT JOIN posts
	ON posts.id = post_warnings.post_id
LEFT JOIN content_warnings
	ON content_warnings.id = post_warnings.warning_id
GROUP BY content_warnings.warning
ORDER by posts_count DESC;

-- HOW OFTEN TAGS ARE USED -- 
SELECT
	COUNT(DISTINCT author) as users_count,
	COUNT(DISTINCT post_tags.post_id) as posts_count,
	tags.tag
FROM post_tags
LEFT JOIN posts
	ON posts.id = post_tags.post_id
LEFT JOIN tags
	ON tags.id = post_tags.tag_id
GROUP BY tags.tag
ORDER by posts_count DESC;

-- HOW OFTEN WHISPER TAGS ARE USED --
SELECT
	unnested_whisper_tags,
	COUNT(DISTINCT posts.string_id) as posts_with_tag
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
GROUP BY unnested_whisper_tags
ORDER BY posts_with_tag DESC;

-- POSTS WITH MOST WHISPER TAGS --
SELECT
	posts.string_id,
	COUNT(DISTINCT unnested_whisper_tags) as tags_in_post
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
GROUP BY posts.string_id
ORDER BY tags_in_post DESC;

-- PERSON WITH MOST WHISPER TAGS -- 
SELECT
	posts.author,
	COUNT(DISTINCT unnested_whisper_tags) as tags_in_post
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
GROUP BY posts.author
ORDER BY tags_in_post DESC;

-- PERSON WITH MOST POSTS --
SELECT
	posts.author,
	COUNT(DISTINCT posts) as number_of_contributions
FROM posts
GROUP BY posts.author
ORDER BY number_of_contributions DESC;

-- PERSON WITH MOST THREADS --
SELECT
	posts.author,
	COUNT(DISTINCT posts) as number_of_contributions
FROM posts
WHERE posts.parent_post IS NULL
GROUP BY posts.author
ORDER BY number_of_contributions DESC;

-- PERSON WITH MOST COMMENTS (INCLUDING CHAINS) --
SELECT
	comments.author,
	COUNT(DISTINCT comments) as number_of_comments
FROM comments
GROUP BY comments.author
ORDER BY number_of_comments DESC;

-- PERSON WITH MOST COMMENTS (NO CHAINS) --
SELECT
	comments.author,
	COUNT(DISTINCT comments) as number_of_comments
FROM comments
WHERE chain_parent_comment IS NULL
GROUP BY comments.author
ORDER BY number_of_comments DESC;

-- PERSON WITH MOST TOTAL ACTIVITY (NO CHAINS)--
SELECT
	comments.author,
	COUNT(DISTINCT comments) as number_of_comments,
	COUNT(DISTINCT posts) as number_of_posts,
	COUNT(DISTINCT comments) + COUNT(DISTINCT posts) as total_activity
FROM comments
LEFT JOIN posts
	ON comments.author = posts.author
WHERE chain_parent_comment IS NULL
GROUP BY comments.author, posts.author
ORDER BY total_activity DESC;

-- MOST ASSIGNED IDENTITY -- 
SELECT 
    identity_id,
	display_name,
	COUNT(DISTINCT thread_id) as threads_count
FROM user_thread_identities uti
LEFT JOIN secret_identities
	ON uti.identity_id = secret_identities.id
WHERE uti.identity_id IS NOT NULL
GROUP BY identity_id, display_name
ORDER BY threads_count DESC;

-- USER WITH MOST IDENTITIES --
SELECT 
	user_id,
	COUNT(DISTINCT identity_id)	as identities_count
FROM user_thread_identities
WHERE user_thread_identities.identity_id IS NOT NULL
GROUP BY user_id
ORDER BY identities_count DESC;

--- TOP THREADS BY USERS COUNT ---
SELECT 
    slug, 
    threads.string_id, 
    COUNT(user_id) as users_count
FROM user_thread_identities 
LEFT JOIN threads 
    ON thread_id = threads.id 
LEFT JOIN boards on parent_board = boards.id 
GROUP BY threads.string_id, slug 
ORDER BY users_count DESC;

-- MOST USED ACCESSORIES --
SELECT 
    accessories.string_id,
	name,
	COUNT(DISTINCT thread_id) as threads_count
FROM identity_thread_accessories ita
LEFT JOIN accessories
	ON ita.accessory_id = accessories.id
GROUP BY accessories.string_id, name
ORDER BY threads_count DESC;

-- COMPLETED BOBADEXES --
SELECT 
    user_id,
	bobadex_season_id,
	season_identities_count.count,
    COUNT(DISTINCT uti.identity_id) as secret_identities_count,
	COUNT(DISTINCT uti.identity_id) = season_identities_count.count as completed_bobadex
FROM user_thread_identities uti
LEFT JOIN bobadex_season_secret_identities bssi
	ON secret_identity_id = uti.identity_id
LEFT JOIN LATERAL (
	SELECT COUNT(DISTINCT secret_identity_id)
	FROM bobadex_season_secret_identities
	WHERE bobadex_season_secret_identities.bobadex_season_id = bssi.bobadex_season_id) as season_identities_count
ON TRUE
WHERE uti.identity_id IS NOT NULL
GROUP BY user_id, bobadex_season_id, season_identities_count.count
ORDER BY secret_identities_count DESC;

-- POSTS BY MONTH/YEAR --
WITH post_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
),
thread_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
	WHERE parent_post IS NULL
),
comment_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM comments
	WHERE chain_parent_comment IS NULL
)
SELECT
	posts.month,
    posts.year,
	COALESCE(posts_count, 0) as posts_count,
	COALESCE(comments_count, 0) as comments_count,
	COALESCE(threads_count, 0) as threads_count,
	COALESCE(posts_count, 0) + COALESCE(comments_count, 0) as total_activity_count
FROM (
	SELECT
		month,
        year,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY month, year
) as posts
LEFT JOIN (
	SELECT
		month,
        year,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY month, year
) as comments
ON posts.month = comments.month AND posts.year = comments.year
LEFT JOIN (
	SELECT
		month,
		year,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY month, year
) as threads
ON posts.month = threads.month AND posts.year = threads.year
GROUP BY posts.month, posts.year, posts_count, comments_count, threads_count
ORDER BY total_activity_count DESC;

-- POSTS BY DAY OF YEAR --
WITH post_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
),
thread_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
	WHERE parent_post IS NULL
),
comment_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM comments
	WHERE chain_parent_comment IS NULL
)
SELECT
	posts.day_of_year,
	COALESCE(posts_count, 0) as posts_count,
	COALESCE(comments_count, 0) as comments_count,
	COALESCE(threads_count, 0) as threads_count,
	COALESCE(posts_count, 0) + COALESCE(comments_count, 0) as total_activity_count
FROM (
	SELECT
		day_of_year,
        year,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY day_of_year, year
) as posts
LEFT JOIN (
	SELECT
		day_of_year,
        year,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY day_of_year, year
) as comments
ON posts.day_of_year = comments.day_of_year AND posts.year = comments.year
LEFT JOIN (
	SELECT
		day_of_year,
		year,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY day_of_year, year
) as threads
ON posts.day_of_year = threads.day_of_year AND posts.year = threads.year
GROUP BY posts.day_of_year, posts.year, posts_count, comments_count, threads_count
ORDER BY total_activity_count DESC;

-- POSTS BY DAY OF WEEK --
WITH post_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
),
thread_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
	WHERE parent_post IS NULL
),
comment_timings AS (
	SELECT
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM comments
	WHERE chain_parent_comment IS NULL
)
SELECT
	posts.day_of_week,
	COALESCE(posts_count, 0) as posts_count,
	COALESCE(comments_count, 0) as comments_count,
	COALESCE(threads_count, 0) as threads_count,
	COALESCE(posts_count, 0) + COALESCE(comments_count, 0) as total_activity_count
FROM (
	SELECT
		day_of_week,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY day_of_week
) as posts
LEFT JOIN (
	SELECT
		day_of_week,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY day_of_week
) as comments
ON posts.day_of_week = comments.day_of_week
LEFT JOIN (
	SELECT
		day_of_week,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY day_of_week
) as threads
ON posts.day_of_week = threads.day_of_week
GROUP BY posts.day_of_week, posts_count, comments_count, threads_count
ORDER BY total_activity_count DESC;

-- POSTS (AND AUTHORS) BY HOUR --
WITH post_timings AS (
	SELECT
		author,
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
),
thread_timings AS (
	SELECT
		author,
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM posts
	WHERE parent_post IS NULL
),
comment_timings AS (
	SELECT
		author,
		extract(month from created) as month,
		extract(hour from created) as hour,
		extract(dow from created) as day_of_week,
		extract(doy from created) as day_of_year,
		extract(year from created) as year
	FROM comments
	WHERE chain_parent_comment IS NULL
)
SELECT
	posts.hour,
	COUNT(DISTINCT posts.author) as authors,
	SUM(COALESCE(posts_count, 0)) as posts_count,
	SUM(COALESCE(comments_count, 0)) as comments_count,
	SUM(COALESCE(threads_count, 0)) as threads_count,
	SUM(COALESCE(posts_count, 0)) + SUM(COALESCE(comments_count, 0)) as total_activity_count
FROM (
	SELECT
		author,
		hour,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY hour, author
) as posts
LEFT JOIN (
	SELECT
		author,
		hour,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY hour, author
) as comments
ON posts.hour = comments.hour AND posts.author = comments.author
LEFT JOIN (
	SELECT
		author,
		hour,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY hour, author
) as threads
ON posts.hour = threads.hour  AND posts.author = threads.author
GROUP BY posts.hour
ORDER BY total_activity_count DESC;