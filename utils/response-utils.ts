import {
  type BoardByExternalId,
  type DbRealmBoardType,
} from "server/boards/sql/types.js";
import {
  type BoardMetadata,
  type Comment,
  type Contribution,
  type LoggedInBoardMetadata,
} from "types/open-api/generated/types.js";
import {
  ThreadSchema,
  ThreadSummarySchema,
} from "types/open-api/generated/schemas.js";
import {
  type ZodDbCommentType,
  type ZodDbPostType,
  type ZodDbThreadSummaryType,
  type ZodDbThreadType,
} from "types/db/schemas.js";

import { BoardRestrictions } from "types/permissions.js";
import debug from "debug";
import { getUserPermissionsForBoard } from "./permissions-utils.js";

const info = debug("bobaserver:response-utils-info");

const TRANSFORM_DICT: { [key: string]: string } = {
  avatar_reference_id: "avatar_url",
  avatar: "avatar",
  avatar_url: "avatar_url",
};
/* Uses TRANSFORM_DICT to look up which keys in an object
 * should have their urls transformed into full paths, and
 * what should be the destination key in the resulting object.
 *
 * Removes the original key from the dict (if different).
 */
export const transformImageUrls = <T extends Record<string, unknown>>(
  obj: T | null
): T & Record<"avatar_url", string> => {
  if (!obj) {
    throw new Error("Attempted to transform image urls of a null object");
  }
  Object.keys(TRANSFORM_DICT).forEach((key) => {
    if (obj[key] && TRANSFORM_DICT[key] && typeof obj[key] === "string") {
      if (obj[key].startsWith("http")) {
        // @ts-expect-error cannot write this when it's a generic
        obj[TRANSFORM_DICT[key]] = obj[key];
      } else if (!obj[key].startsWith("/")) {
        // @ts-expect-error cannot write this when it's a generic
        obj[TRANSFORM_DICT[key]] = `/${obj[key]}`;
      }
    }
    if (key != TRANSFORM_DICT[key]) {
      delete obj[key];
    }
  });
  return obj as T & Record<"avatar_url", string>;
};

// Merges the identity contain within a single object (rather than a map).
export const mergeObjectIdentity = <T>(
  object: T & {
    author: number;
    username: string | null;
    user_avatar: string | null;
    secret_identity_name: string;
    secret_identity_avatar: string;
    secret_identity_color: string | null;
    accessory_avatar: string | null;
    friend: boolean | null;
    self: boolean;
  }
): T & {
  secret_identity: {
    name: string;
    avatar: string;
    color?: string;
    accessory?: string;
  };
  user_identity?: {
    name: string | null;
    avatar: string | null;
  };
} => {
  info(`Merging activity of object:`);
  info(object);

  const {
    username,
    user_avatar,
    secret_identity_name,
    secret_identity_avatar,
    secret_identity_color,
    accessory_avatar,
    ...rest
  } = object;
  let user_identity;
  if (object.friend || object.self) {
    user_identity = transformImageUrls({
      name: username,
      avatar: user_avatar,
    });
  }
  const secret_identity = transformImageUrls({
    name: secret_identity_name,
    avatar: secret_identity_avatar,
    color: secret_identity_color || null,
    accessory: accessory_avatar,
  });

  return {
    ...rest,
    user_identity,
    secret_identity,
  } as T & {
    user_identity: {
      name: string;
      avatar: string;
    };
    secret_identity: {
      name: string;
      avatar: string;
    };
  };
};

export const makeServerThreadSummary = (
  thread: ZodDbThreadType | ZodDbThreadSummaryType
) => {
  const starter =
    "posts" in thread
      ? makeServerPost(thread.posts[0])
      : makeServerPost(thread);
  // @ts-expect-error TODO: remove comments from post in db
  delete starter.comments;

  return ThreadSummarySchema.parse({
    id: thread.thread_id,
    parent_board_slug: thread.board_slug,
    parent_board_id: thread.board_id,
    parent_realm_slug: thread.realm_slug,
    parent_realm_id: thread.realm_id,
    starter: starter,
    default_view: thread.default_view,
    muted: thread.muted,
    hidden: thread.hidden,
    starred: thread.starred,
    new: starter.new,
    new_posts_amount: thread.thread_new_posts_amount,
    new_comments_amount: thread.thread_new_comments_amount,
    total_comments_amount: thread.thread_total_comments_amount,
    total_posts_amount: thread.thread_total_posts_amount,
    last_activity_at: thread.thread_last_activity_at,
    direct_threads_amount: thread.thread_direct_threads_amount,
  });
};

// TODO: finish type safeing this
export const makeServerThread = (thread: ZodDbThreadType) => {
  const posts = thread.posts?.map(makeServerPost) || [];
  // Some queries end up having comments within posts when coming out of the DB, althogh
  // that's theoretically wrong
  // TODO[realms]: remove this
  const postsWithoutComments = posts.map((post) => {
    // @ts-expect-error - comments property exists but shouldn't be in posts
    const { comments: _comments, ...rest } = post;
    return rest;
  });

  return ThreadSchema.parse({
    ...makeServerThreadSummary(thread),
    posts: postsWithoutComments,
    comments: posts.reduce(
      (agg: { [contribution_id: string]: Comment[] }, post: Contribution) => {
        // @ts-expect-error We moved comments to its own object so remove it from the post object...
        if (post.comments) {
          // @ts-expect-error ...and instead move it there
          agg[post.id] = post.comments;
        }
        return agg;
      },
      {} as { [contribution_id: string]: Comment[] }
    ),
  });
};

export const makeServerPost = (
  post: ZodDbPostType | ZodDbThreadSummaryType
): Contribution => {
  const oldPost = mergeObjectIdentity<ZodDbPostType | ZodDbThreadSummaryType>(
    post
  );

  const serverPost = {
    id: post.post_id,
    parent_thread_id: post.parent_thread_id,
    parent_post_id: post.parent_post_id,
    created_at: post.created_at,
    content: post.content,
    secret_identity: oldPost.secret_identity ?? null,
    user_identity: oldPost.user_identity ?? null,
    friend: post.friend,
    own: post.is_own,
    new: post.is_new,
    comments:
      // @ts-expect-error [zodding]
      ("comments" in post && post.comments?.map(makeServerComment)) || [],
    tags: {
      whisper_tags: post.whisper_tags || [],
      index_tags: post.index_tags || [],
      category_tags: post.category_tags || [],
      content_warnings: post.content_warnings || [],
    },
    total_comments_amount:
      "total_comments_amount" in post ? post.total_comments_amount : 0,
    new_comments_amount:
      "new_comments_amount" in post ? post.new_comments_amount : 0,
  };

  return serverPost;
};

export const makeServerComment = (comment: ZodDbCommentType): Comment => {
  const identityPost = mergeObjectIdentity<ZodDbCommentType>(comment);
  return {
    id: comment.comment_id,
    parent_comment_id: comment.parent_comment_id,
    chain_parent_id: comment.chain_parent_id,
    parent_post_id: comment.parent_post_id,
    created_at: comment.created_at,
    content: comment.content,
    secret_identity: identityPost.secret_identity ?? null,
    user_identity: identityPost.user_identity ?? null,
    friend: comment.friend,
    own: comment.is_own,
    new: comment.is_new,
  };
};

export const ensureNoIdentityLeakage = <T extends Record<string, unknown>>(
  post: T
) => {
  if (!post.friend && !post.own && post.user_identity) {
    throw Error("Identity leakage detected.");
  }
  if (post.author || post.user_id || post.username || post.user_avatar) {
    throw Error("Identity leakage detected.");
  }
  if (Array.isArray(post.comments)) {
    post.comments?.forEach((comment: T) => ensureNoIdentityLeakage(comment));
  } else if (post.comments) {
    Object.values(post.comments).forEach((comment) =>
      ensureNoIdentityLeakage(comment)
    );
  }
};

const extractLockedBoardMetadata = (
  metadata: Pick<
    DbRealmBoardType,
    | "string_id"
    | "realm_external_id"
    | "slug"
    | "avatar_reference_id"
    | "tagline"
    | "settings"
  > & { loggedInOnly: boolean }
) => {
  return {
    external_id: metadata.string_id,
    realm_external_id: metadata.realm_external_id,
    slug: metadata.slug,
    avatar_reference_id: metadata.avatar_reference_id,
    tagline: metadata.tagline,
    settings: metadata.settings,
    loggedInOnly: metadata.loggedInOnly,
  };
};

export const processBoardMetadata = ({
  metadata,
  isLoggedIn,
  hasBoardAccess,
}: {
  metadata: BoardByExternalId;
  isLoggedIn: boolean;
  hasBoardAccess: boolean;
}) => {
  const finalMetadata: Partial<BoardMetadata> | Partial<LoggedInBoardMetadata> =
    {
      id: metadata.external_id,
      slug: metadata.slug,
      avatar_url: metadata.avatar_url,
      descriptions: metadata.descriptions.map((description) => {
        switch (description.type) {
          case "text":
            return {
              ...description,
              // The DB returns null for categories, so we need to remove it
              categories: undefined,
            };
          case "category_filter":
            return {
              ...description,
              // The DB returns null for description, so we need to remove it
              description: undefined,
            };
        }
      }),
      // @ts-expect-error TODO: remove permission enums and use schema permissions
      permissions: getUserPermissionsForBoard(metadata.permissions),
      posting_identities: metadata.posting_identities.map((identity) =>
        transformImageUrls(identity)
      ),
      accessories: metadata.accessories,
    };

  if (!isLoggedIn) {
    // @ts-expect-error TODO: do this without deleting the properties
    delete finalMetadata.permissions;
    // @ts-expect-error TODO: do this without deleting the properties
    delete finalMetadata.posting_identities;
    // @ts-expect-error TODO: do this without deleting the properties
    delete finalMetadata.accessories;
  }

  if (!hasBoardAccess && "loggedInOnly" in metadata && metadata.loggedInOnly) {
    finalMetadata.descriptions = [];
  }

  return transformImageUrls(finalMetadata);
};

const processBoardsMetadata = ({
  boards,
  isLoggedIn,
  hasRealmMemberAccess,
}: {
  boards: (DbRealmBoardType | BoardByExternalId)[];
  isLoggedIn: boolean;
  hasRealmMemberAccess: boolean;
}) => {
  const result = boards.map((board) => {
    const delisted = isLoggedIn
      ? board.logged_in_base_restrictions.includes(BoardRestrictions.DELIST)
      : board.logged_out_restrictions.includes(BoardRestrictions.DELIST);

    // When a board is delisted, it should not be returned if it is not pinned
    // by a user (which implies they are logged in and know the board exists).
    if (delisted && !board.pinned_order) {
      return null;
    }

    const { logged_out_restrictions, logged_in_base_restrictions, ...rest } =
      board;
    let boardResult: Partial<BoardByExternalId> & {
      loggedInOnly: boolean;
      delisted: boolean;
    } = {
      ...rest,
      external_id: "string_id" in board ? board.string_id : board.external_id,
      delisted,
      loggedInOnly: logged_out_restrictions.includes(
        BoardRestrictions.LOCK_ACCESS
      ),
    };

    // Remove details from list if the board is locked and the user doesn't have access
    // (right now we keep only avatar, color & description)
    if (!hasRealmMemberAccess && boardResult.loggedInOnly) {
      // @ts-expect-error TODO: this is a mess and needs to be cleaned up
      boardResult = extractLockedBoardMetadata(boardResult);
    }

    return transformImageUrls(boardResult) as BoardByExternalId & {
      loggedInOnly: boolean;
      delisted: boolean;
    };
  });

  return result.filter((board) => board != null);
};

export const processBoardsSummary = ({
  boards,
  isLoggedIn,
  hasRealmMemberAccess,
}: {
  boards: (DbRealmBoardType | BoardByExternalId)[];
  isLoggedIn: boolean;
  hasRealmMemberAccess: boolean;
}) => {
  const result = processBoardsMetadata({
    boards,
    isLoggedIn,
    hasRealmMemberAccess,
  });

  // TODO[cleanup]: get correct format from db
  return result.map((result) => ({
    id: result.external_id,
    realm_id:
      result.realm_external_id || "76ef4cc3-1603-4278-95d7-99c59f481d2e",
    slug: result.slug,
    tagline: result.tagline,
    avatar_url: result.avatar_url,
    accent_color: result.settings.accentColor,
    delisted: !!result.delisted,
    logged_in_only: !!result.loggedInOnly,
    muted: hasRealmMemberAccess ? !!result.muted : undefined,
    pinned: hasRealmMemberAccess ? result.pinned_order !== null : undefined,
  }));
};

export const processBoardsNotifications = ({
  boards,
}: {
  boards: DbRealmBoardType[];
}) => {
  return boards.map((board) => ({
    id: board.string_id,
    has_updates: board.has_updates,
    is_outdated:
      (board.last_activity_from_others_at &&
        board.last_visit_at &&
        new Date(board.last_visit_at) >=
          new Date(board.last_activity_from_others_at)) ||
      false,
    last_activity_at: board.last_activity_at,
    last_activity_from_others_at: board.last_activity_from_others_at,
    last_visited_at: board.last_visit_at,
  }));
};

export const reduceById = <T extends { id: string }>(
  result: Record<string, T>,
  current: T
): Record<string, T> => {
  result[current.id] = {
    ...current,
  };
  return result;
};
