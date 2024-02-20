import { z } from "zod";

export const RealmRolesSchema = z.object({"roles": z.array(z.object({"user_id": z.string().uuid().optional(),"username": z.string().describe(`Username.`),"role_string_id": z.string().uuid().describe(`String id of role.`),"role_name": z.string().describe(`Name of role.`),"label": z.string().describe(`Label associated with role assignment`)})).optional()});