INSERT INTO user_thread_last_visits(user_id, thread_id) VALUES (
    (SELECT id FROM users WHERE users.firebase_id = ${firebase_id}),
    (SELECT id from threads WHERE threads.string_id = ${thread_string_id}))
ON CONFLICT(user_id, thread_id) DO UPDATE 
    SET last_visit_time = DEFAULT
    WHERE user_thread_last_visits.user_id = (
        SELECT id FROM users WHERE users.firebase_id = ${firebase_id})
    AND user_thread_last_visits.thread_id = (
        SELECT id from threads WHERE threads.string_id = ${thread_string_id})