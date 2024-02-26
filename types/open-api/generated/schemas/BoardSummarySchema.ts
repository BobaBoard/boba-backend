import { z } from "zod";

export const BoardSummarySchema = z.object({"id": z.string().uuid(),"realm_id": z.string(),"slug": z.string(),"avatar_url": z.string(),"tagline": z.string(),"accent_color": z.string(),"logged_in_only": z.boolean(),"delisted": z.boolean()});