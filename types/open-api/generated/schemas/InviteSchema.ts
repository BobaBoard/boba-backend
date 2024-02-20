import { z } from "zod";

export const InviteSchema = z.object({"realm_id": z.string().uuid(),"invite_url": z.string()});