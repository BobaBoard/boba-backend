export type ThreadActivitySummary = {
    /**
     * @type number
    */
    new_posts_amount: number;
    /**
     * @type number
    */
    new_comments_amount: number;
    /**
     * @type number
    */
    total_comments_amount: number;
    /**
     * @type number
    */
    total_posts_amount: number;
    /**
     * @type number
    */
    direct_threads_amount: number;
    /**
     * @type string date-time
    */
    last_activity_at: string;
};