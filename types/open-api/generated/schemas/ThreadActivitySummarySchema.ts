import { z } from "zod";

export const ThreadActivitySummarySchema = z.object({"new_posts_amount": z.number(),"new_comments_amount": z.number(),"total_comments_amount": z.number(),"total_posts_amount": z.number(),"direct_threads_amount": z.number(),"last_activity_at": z.string().datetime()});