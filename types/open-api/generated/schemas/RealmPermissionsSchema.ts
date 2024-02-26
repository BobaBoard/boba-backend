import { z } from "zod";

export const RealmPermissionsSchema = z.enum([`create_realm_invite`,`post_on_realm`,`comment_on_realm`,`create_thread_on_realm`,`access_locked_boards_on_realm`,`view_roles_on_realm`]);