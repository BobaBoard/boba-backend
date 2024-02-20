import { z } from "zod";

export const BooleanSettingSchema = z.object({"name": z.string(),"type": z.enum([`BOOLEAN`]),"value": z.boolean()});