import type { BoardPermissions } from "./BoardPermissions";
import type { PostPermissions } from "./PostPermissions";
import type { ThreadPermission } from "./ThreadPermission";

export type Permissions = {
    /**
     * @type array
    */
    board_permissions: BoardPermissions[];
    /**
     * @type array
    */
    post_permissions: PostPermissions[];
    /**
     * @type array
    */
    thread_permissions: ThreadPermission[];
};