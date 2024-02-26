import { BaseBlockSchema } from "./BaseBlockSchema";
import { z } from "zod";

export const RulesBlockSchema = z.lazy(() => BaseBlockSchema).and(z.object({"type": z.enum([`rules`]),"rules": z.array(z.object({"index": z.number(),"title": z.string(),"description": z.string(),"pinned": z.boolean()}))}));