import { z } from "zod";
import { GenericResponseSchema } from "./GenericResponseSchema";
import { RealmRolesSchema } from "./RealmRolesSchema";

/**
 * @description There was an error fetching board roles.
 */
export const GetBoardRolesByExternalId500Schema = z.any();
export const GetBoardRolesByExternalIdPathParamsSchema = z.object({ "board_id": z.string().uuid().describe(`The id of the board.`) });
export const GetBoardRolesByExternalId401Schema = z.lazy(() => GenericResponseSchema);
export const GetBoardRolesByExternalId403Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The board was not found.
       */
export const GetBoardRolesByExternalId404Schema = z.lazy(() => GenericResponseSchema);

 /**
       * @description The board roles summary.
       */
export const GetBoardRolesByExternalIdQueryResponseSchema = z.lazy(() => RealmRolesSchema);