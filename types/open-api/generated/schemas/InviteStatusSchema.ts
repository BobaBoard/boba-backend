import { z } from "zod";

export const InviteStatusSchema = z.object({"realm_id": z.string().uuid(),"realm_slug": z.string(),"invite_status": z.enum([`pending`,`used`,`expired`]),"requires_email": z.boolean()});