import { z } from "zod";

export const BaseBlockSchema = z.object({"id": z.string().uuid(),"index": z.number(),"title": z.string()});