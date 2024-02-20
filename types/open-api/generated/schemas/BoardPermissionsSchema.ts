import { z } from "zod";

export const BoardPermissionsSchema = z.enum([`edit_board_details`,`view_roles_on_board`]);