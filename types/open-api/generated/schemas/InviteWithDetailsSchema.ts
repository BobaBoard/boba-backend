import { z } from "zod";

export const InviteWithDetailsSchema = z.object({"realm_id": z.string().uuid(),"invite_url": z.string(),"invitee_email": z.string().email().optional(),"own": z.boolean(),"issued_at": z.string().datetime(),"expires_at": z.string().datetime(),"label": z.string().optional()});