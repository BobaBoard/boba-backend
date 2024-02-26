import { BoardPermissionsSchema } from "./BoardPermissionsSchema";
import { PostPermissionsSchema } from "./PostPermissionsSchema";
import { ThreadPermissionSchema } from "./ThreadPermissionSchema";
import { z } from "zod";

export const PermissionsSchema = z.object({"board_permissions": z.array(z.lazy(() => BoardPermissionsSchema)),"post_permissions": z.array(z.lazy(() => PostPermissionsSchema)),"thread_permissions": z.array(z.lazy(() => ThreadPermissionSchema))});