import { z } from "zod";

export const PostPermissionsSchema = z.enum([`edit_content`,`edit_whisper_tags`,`edit_category_tags`,`edit_index_tags`,`edit_content_notices`]);