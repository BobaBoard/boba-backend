import { DescriptionSchema } from "./DescriptionSchema";
import { z } from "zod";

export const BoardDescriptionSchema = z.object({"descriptions": z.array(z.lazy(() => DescriptionSchema)).describe(`Array of updated description objects.`).optional(),"accentColor": z.string().describe(`Board accent color.`).optional(),"tagline": z.string().describe(`Board tagline.`).optional()});