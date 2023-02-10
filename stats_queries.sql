--- TOTAL ACTIVITY ---
select count(*) from threads;
select count(*) from posts;
select count(*) from comments;
select count(*) from comments where chain_parent_comment is null;

-- THREAD WITH MOST COMMENTS/CONTRIBS/ACTIVITY -- 
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) + COUNT(DISTINCT comments.id) as total_amount,
	threads.external_id as thread_id,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', threads.external_id) as thread_url
FROM threads
LEFT JOIN boards
	ON threads.parent_board = boards.id
LEFT JOIN comments
	ON comments.parent_thread = threads.id
LEFT JOIN posts
	ON posts.parent_thread = threads.id
GROUP BY threads.external_id, boards.slug
ORDER by total_amount DESC;

-- COMMENT THREAD WITH MOST ACTIVITY --
SELECT
	COUNT(DISTINCT comments.id) as comments_amount,
	posts.string_id as post_id,
	threads.external_id as thread_id,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', 
		   threads.external_id, '/', posts.string_id) as post_url
FROM comments
LEFT JOIN threads
	ON comments.parent_thread = threads.id
LEFT JOIN boards
	ON threads.parent_board = boards.id
LEFT JOIN posts
	ON comments.parent_post = posts.id
WHERE chain_parent_comment IS NULL
GROUP BY threads.external_id, posts.string_id, boards.slug
ORDER by comments_amount DESC;

-- BOARD WITH MOST ACTIVITY --
SELECT
	COUNT(DISTINCT threads.id) as threads_amount,
	COUNT(DISTINCT comments.id) as comments_amount,
	COUNT(DISTINCT posts.id) as contributions_amount,
	COUNT(DISTINCT posts.id) - COUNT(DISTINCT threads.id) as replies_amount,
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
	threads.external_id,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', threads.external_id) as thread_url
FROM threads
LEFT JOIN boards
	ON threads.parent_board = boards.id
LEFT JOIN user_hidden_threads
	ON threads.id = user_hidden_threads.thread_id
GROUP BY threads.external_id, boards.slug
ORDER by users_count DESC;

-- MOST MUTED THREADS --
SELECT
	COUNT(DISTINCT user_id) as users_count,
	threads.external_id,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', threads.external_id) as thread_url
FROM threads
LEFT JOIN boards
	ON threads.parent_board = boards.id
LEFT JOIN user_muted_threads
	ON threads.id = user_muted_threads.thread_id
GROUP BY threads.external_id, boards.slug
ORDER by users_count DESC;

-- BOARDS WITH MOST MUTE ACTIONS TAKEN --
WITH muted_threads AS (
	SELECT
		COUNT(DISTINCT user_id) as users_count,
		threads.external_id,
		boards.slug
	FROM threads
	LEFT JOIN boards
		ON threads.parent_board = boards.id
	LEFT JOIN user_muted_threads
		ON threads.id = user_muted_threads.thread_id
	GROUP BY threads.external_id, boards.slug)
SELECT
	SUM(users_count) as muted_amount,
	slug
FROM muted_threads
GROUP BY slug
ORDER BY muted_amount DESC;

-- BOARDS WITH MOST MUTED THREADS --
WITH muted_threads AS (
	SELECT
		COUNT(DISTINCT user_id) as users_count,
		threads.external_id,
		boards.slug
	FROM threads
	LEFT JOIN boards
		ON threads.parent_board = boards.id
	LEFT JOIN user_muted_threads
		ON threads.id = user_muted_threads.thread_id
	GROUP BY threads.external_id, boards.slug)
SELECT
	COUNT(DISTINCT(string_id)) as muted_amount,
	slug
FROM muted_threads
WHERE users_count > 0
GROUP BY slug
ORDER BY muted_amount DESC;

-- BOARDS WITH MOST HIDE ACTIONS TAKEN --
WITH hidden_threads AS (
	SELECT
		COUNT(DISTINCT user_id) as users_count,
		threads.external_id,
		boards.slug
	FROM threads
	LEFT JOIN boards
		ON threads.parent_board = boards.id
	LEFT JOIN user_hidden_threads
		ON threads.id = user_hidden_threads.thread_id
	GROUP BY threads.external_id, boards.slug)
SELECT
	SUM(users_count) as hidden_amount,
	slug
FROM hidden_threads
WHERE users_count > 0
GROUP BY slug
ORDER BY hidden_amount DESC;

-- BOARDS WITH MOST HIDDEN THREADS --
WITH hidden_threads AS (
	SELECT
		COUNT(DISTINCT user_id) as users_count,
		threads.external_id,
		boards.slug
	FROM threads
	LEFT JOIN boards
		ON threads.parent_board = boards.id
	LEFT JOIN user_hidden_threads
		ON threads.id = user_hidden_threads.thread_id
	GROUP BY threads.external_id, boards.slug)
SELECT
	COUNT(DISTINCT(string_id)) as hidden_amount,
	slug
FROM hidden_threads
WHERE users_count > 0
GROUP BY slug
ORDER BY hidden_amount DESC;

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
	COUNT(DISTINCT author) as users_count,
	COUNT(DISTINCT posts.string_id) as posts_with_tag
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
GROUP BY unnested_whisper_tags
ORDER BY posts_with_tag DESC;

-- POSTS WITH MOST WHISPER TAGS --
SELECT
	posts.string_id,
	COUNT(DISTINCT unnested_whisper_tags) as tags_in_post,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', 
		   threads.external_id, '/', posts.string_id) as post_url
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
LEFT JOIN threads
	ON posts.parent_thread = threads.id
LEFT JOIN boards
	ON threads.parent_board = boards.id
GROUP BY posts.string_id, boards.slug, threads.external_id
ORDER BY tags_in_post DESC;

-- POSTS WITH MOST UNIQUE CONTENT NOTICES --
SELECT
	threads.external_id,
	COUNT(DISTINCT warning_id) as warnings_in_thread,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', 
		   threads.external_id) as thread_url
FROM posts
LEFT JOIN post_warnings
	ON posts.id = post_warnings.post_id
LEFT JOIN threads
	ON posts.parent_thread = threads.id
LEFT JOIN boards
	ON threads.parent_board = boards.id
GROUP BY  boards.slug, threads.external_id
ORDER BY warnings_in_thread DESC;

-- PERSON WITH MOST WHISPER TAGS -- 
SELECT
	posts.author,
	COUNT(DISTINCT unnested_whisper_tags) as tags_in_post
FROM posts
CROSS JOIN unnest(posts.whisper_tags) unnested_whisper_tags
GROUP BY posts.author
ORDER BY tags_in_post DESC;

-- PERSON WITH MOST UNIQUE CONTENT NOTICES --
SELECT
	posts.author,
	COUNT(DISTINCT warning_id) as warnings_by_author
FROM posts
LEFT JOIN post_warnings
	ON posts.id = post_warnings.post_id
GROUP BY posts.author
ORDER BY warnings_by_author DESC;

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
	COUNT(DISTINCT posts) as number_of_threads
FROM posts
WHERE posts.parent_post IS NULL
GROUP BY posts.author
ORDER BY number_of_threads DESC;

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

-- PERSON WITH MOST ACTIVITY (NO CHAINS)--
WITH threads_stats AS (
	SELECT
		posts.author,
		COUNT(DISTINCT posts.id) as number_of_threads
	FROM posts
	WHERE parent_post IS NULL
	GROUP BY posts.author),
posts_stats AS (
	SELECT
		posts.author,
		COUNT(DISTINCT posts.id) as number_of_posts
	FROM posts
	GROUP BY posts.author),
comments_stats AS(
	SELECT
		comments.author,
		COUNT(DISTINCT comments.id) as number_of_comments
	FROM comments
	WHERE chain_parent_comment IS NULL
	GROUP BY comments.author)
SELECT
	COALESCE(number_of_threads, 0) as number_of_threads,
	COALESCE(number_of_posts, 0) as number_of_posts,
	COALESCE(number_of_comments, 0) as number_of_comments,
	COALESCE(number_of_comments, 0) + COALESCE(number_of_posts, 0) as total_activity
FROM posts_stats
LEFT JOIN comments_stats
	ON posts_stats.author = comments_stats.author
LEFT JOIN threads_stats
	ON posts_stats.author = threads_stats.author
ORDER BY number_of_threads DESC;

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
    threads.external_id, 
    COUNT(user_id) as users_count,
	CONCAT('https://v0.boba.social/!', boards.slug, '/thread/', threads.external_id) as thread_url
FROM user_thread_identities 
LEFT JOIN threads 
    ON thread_id = threads.id 
LEFT JOIN boards on parent_board = boards.id 
GROUP BY threads.external_id, slug 
ORDER BY users_count DESC;

-- MOST USED ACCESSORIES --
SELECT 
    accessories.image_reference_id,
	name,
	COUNT(DISTINCT thread_id) as threads_count
FROM identity_thread_accessories ita
LEFT JOIN accessories
	ON ita.accessory_id = accessories.id
GROUP BY accessories.image_reference_id, name
ORDER BY threads_count DESC;

-- COMPLETED BOBADEXES --
WITH bobadex_data AS (
	SELECT 
		user_id,
		bobadex_seasons.id as season_id,
		bobadex_seasons.name as season_name,
		season_identities_count.count as total_identities_count,
		COUNT(DISTINCT uti.identity_id) as obtained_identities_count,
		COUNT(DISTINCT uti.identity_id) = season_identities_count.count as completed_bobadex
	FROM user_thread_identities uti
	LEFT JOIN bobadex_season_secret_identities bssi
		ON secret_identity_id = uti.identity_id
	LEFT JOIN bobadex_seasons
		ON bssi.bobadex_season_id = bobadex_seasons.id
	LEFT JOIN LATERAL (
		SELECT COUNT(DISTINCT secret_identity_id)
		FROM bobadex_season_secret_identities
		WHERE bobadex_season_secret_identities.bobadex_season_id = bssi.bobadex_season_id) as season_identities_count
	ON TRUE
	WHERE uti.identity_id IS NOT NULL
	GROUP BY user_id, bobadex_seasons.id, bobadex_seasons.name, season_identities_count.count
)
SELECT
	user_id,
	COALESCE((SELECT obtained_identities_count FROM bobadex_data bd2 WHERE season_id = 3 AND bd.user_id = bd2.user_id), 0) as season_1,
	COALESCE((SELECT obtained_identities_count FROM bobadex_data bd3 WHERE season_id = 4 AND bd.user_id = bd3.user_id), 0) as season_2,
	SUM(COALESCE(obtained_identities_count, 0)) as total_obtained
FROM bobadex_data bd
GROUP BY user_id
ORDER BY total_obtained desc;

-- POSTS BY MONTH/YEAR --
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
	posts.month,
    posts.year,
	COALESCE(users_count, 0) as users_count,
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
LEFT JOIN (
	SELECT
		month,
		year,
		COUNT(distinct author) as users_count
	FROM
		(SELECT
			author,
			month,
			year
		FROM post_timings 
	UNION 
		SELECT
			author,
			month,
			year
		FROM comment_timings) as unionized
	GROUP BY month, year
) as users
ON users.month = threads.month AND users.year = threads.year
GROUP BY posts.month, posts.year, posts_count, comments_count, threads_count, users_count
ORDER BY total_activity_count DESC;

-- POSTS BY DAY OF WEEK --
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
	posts.day_of_week,
	posts.month,
	posts.year,
	COALESCE(users_count, 0) as users_count,
	COALESCE(posts_count, 0) as posts_count,
	COALESCE(comments_count, 0) as comments_count,
	COALESCE(threads_count, 0) as threads_count,
	COALESCE(posts_count, 0) + COALESCE(comments_count, 0) as total_activity_count
FROM (
	SELECT
		day_of_week,
		month,
		year,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY day_of_week, month, year
) as posts
LEFT JOIN (
	SELECT
		day_of_week,
		month,
		year,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY day_of_week, month, year
) as comments
ON posts.day_of_week = comments.day_of_week AND posts.month = comments.month AND posts.year = comments.year
LEFT JOIN (
	SELECT
		day_of_week,
		month,
		year,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY day_of_week, month, year
) as threads
ON posts.day_of_week = threads.day_of_week AND posts.month = threads.month AND posts.year = threads.year
LEFT JOIN (
	SELECT
		day_of_week,
		month,
		year,
		COUNT(distinct author) as users_count
	FROM
		(SELECT
			author,
			month,
			year,
			day_of_week
		FROM post_timings 
	UNION 
		SELECT
			author,
			month,
			year,
			day_of_week
		FROM comment_timings) as unionized
	GROUP BY day_of_week, month, year
) as users
ON posts.day_of_week = users.day_of_week AND posts.month = users.month AND posts.year = users.year
GROUP BY posts.day_of_week, posts.month, posts.year, posts_count, comments_count, threads_count, users_count
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
	posts.month,
	posts.year,
	COALESCE(users_count, 0) as users_count,
	COALESCE(posts_count, 0) as posts_count,
	COALESCE(comments_count, 0) as comments_count,
	COALESCE(threads_count, 0) as threads_count,
	COALESCE(posts_count, 0) + COALESCE(comments_count, 0) as total_activity_count
FROM (
	SELECT
		hour,
		month,
		year,
		COUNT(*) AS posts_count
	FROM post_timings
	GROUP BY hour, month, year
) as posts
LEFT JOIN (
	SELECT
		hour,
		month,
		year,
		COUNT(*) AS comments_count
	FROM comment_timings
	GROUP BY hour, month, year
) as comments
ON posts.hour = comments.hour AND posts.month = comments.month AND posts.year = comments.year
LEFT JOIN (
	SELECT
		hour,
		month,
		year,
		COUNT(*) AS threads_count
	FROM thread_timings
	GROUP BY hour, month, year
) as threads
ON posts.hour = threads.hour AND posts.month = threads.month AND posts.year = threads.year
LEFT JOIN (
	SELECT
		hour,
		month,
		year,
		COUNT(distinct author) as users_count
	FROM
		(SELECT
			author,
			month,
			year,
			hour
		FROM post_timings 
	UNION 
		SELECT
			author,
			month,
			year,
			hour
		FROM comment_timings) as unionized
	GROUP BY hour, month, year
) as users
ON posts.hour = users.hour AND posts.month = users.month AND posts.year = users.year
GROUP BY posts.hour, posts.month, posts.year, posts_count, comments_count, threads_count, users_count
ORDER BY total_activity_count DESC;