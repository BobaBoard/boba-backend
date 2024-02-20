import type { BobaDex } from "./BobaDex";

/**
 * @description User was not found in request that requires authentication.
*/
export type GetCurrentUserBobadex401 = any | null;

 /**
 * @description The bobadex data.
*/
export type GetCurrentUserBobadexQueryResponse = BobaDex;
export type GetCurrentUserBobadexQuery = {
    Response: GetCurrentUserBobadexQueryResponse;
    Errors: GetCurrentUserBobadex401;
};