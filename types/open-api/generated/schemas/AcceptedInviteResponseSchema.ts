import { z } from "zod";

export const AcceptedInviteResponseSchema = z.object({"realm_id": z.string().uuid(),"realm_slug": z.string()});