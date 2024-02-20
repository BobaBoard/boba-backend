import type { Realm } from "./Realm";

/**
 * @description The realm was not found.
*/
export type GetRealmsBySlug404 = any | null;

 export type GetRealmsBySlugPathParams = {
    /**
     * @description The slug of the realm.
     * @type string
    */
    realm_slug: string;
};

 /**
 * @description The realm metadata.
*/
export type GetRealmsBySlugQueryResponse = Realm;
export type GetRealmsBySlugQuery = {
    Response: GetRealmsBySlugQueryResponse;
    PathParams: GetRealmsBySlugPathParams;
    Errors: GetRealmsBySlug404;
};