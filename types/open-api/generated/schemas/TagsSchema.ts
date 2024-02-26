import { z } from "zod";

export const TagsSchema = z.object({"whisper_tags": z.array(z.string()),"index_tags": z.array(z.string()),"category_tags": z.array(z.string()),"content_warnings": z.array(z.string())}).describe(`Types of tags associated to a contribution.`);