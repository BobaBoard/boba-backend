import { z } from "zod";

export const GetRealmBySlugDbSchema = z.object({
  realm_id: z.string(),
  realm_slug: z.string(),
  realm_icon_url: z.string(),
  realm_favicon_url: z.string().nullable(),
  realm_title: z.string().nullable(),
  realm_description: z.string().nullable(),
  realm_feedback_form_url: z.string().nullable(),
  homepage_blocks: z.any(),
});
