import {
  DbBoardMetadata,
  DbCommentType,
  DbPostType,
  DbThreadSummaryType,
  DbThreadType,
  ServerCommentType,
  ServerPostType,
  ServerThreadSummaryType,
  ServerThreadType,
  restriction_types,
} from "Types";

import debug from "debug";
import { transformPermissions } from "./permissions-utils";

const info = debug("bobaserver:response-utils-info");
const log = debug("bobaserver::response-utils-log");

const TRANSFORM_DICT: { [key: string]: string } = {
  avatar_reference_id: "avatarUrl",
  avatar: "avatar",
  avatar_url: "avatar_url",
};
/* Uses TRANSFORM_DICT to look up which keys in an object
 * should have their urls transformed into full paths, and
 * what should be the destination key in the resulting object.
 *
 * Removes the original key from the dict (if different).
 */
export const transformImageUrls = (obj: any) => {
  Object.keys(TRANSFORM_DICT).forEach((key) => {
    if (obj[key]) {
      if (obj[key].startsWith("http")) {
        obj[TRANSFORM_DICT[key]] = obj[key];
      } else {
        obj[TRANSFORM_DICT[key]] = `/${obj[key]}`;
      }
    }
    if (key != TRANSFORM_DICT[key]) {
      delete obj[key];
    }
  });
  return obj;
};

// Merges the identity contain within a single object (rather than a map).
export const mergeObjectIdentity = <T>(
  object: T & {
    author: number;
    username: string;
    user_avatar: string;
    secret_identity_name: string;
    secret_identity_avatar: string;
    secret_identity_color?: string;
    accessory_avatar?: string;
    friend: boolean;
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
    name: string;
    avatar: string;
  };
} => {
  info(`Merging activity of object:`);
  info(object);

  const {
    author,
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
  let secret_identity = transformImageUrls({
    name: secret_identity_name,
    avatar: secret_identity_avatar,
    color: secret_identity_color,
    accessory: accessory_avatar,
  });

  return {
    ...rest,
    user_identity,
    secret_identity,
  } as any;
};

export const makeServerThreadSummary = (
  thread: DbThreadType | DbThreadSummaryType
): ServerThreadSummaryType => {
  const starter =
    "posts" in thread
      ? makeServerPost(thread.posts[0])
      : makeServerPost(thread);
  // TODO[realms]: remove comments from post in db
  delete starter.comments;
  return {
    id: thread.thread_id,
    parent_board_slug: thread.board_slug,
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
    last_activity_at: thread.thread_last_activity,
    direct_threads_amount: thread.thread_direct_threads_amount,
  };
};

export const makeServerThread = (thread: DbThreadType): ServerThreadType => {
  const posts = thread.posts?.map(makeServerPost) || [];
  // TODO[realms]: remove this
  const postsWithoutComments = posts.map((post) => {
    const { comments, ...rest } = post;
    return rest;
  });
  return {
    ...makeServerThreadSummary(thread),
    posts: postsWithoutComments,
    comments: posts.reduce(
      (agg: Record<string, ServerCommentType[]>, post: ServerPostType) => {
        log(post.comments);
        if (post.comments) {
          agg[post.id] = post.comments;
        }
        return agg;
      },
      {}
    ),
  };
};

export const makeServerPost = (
  post: DbPostType | DbThreadSummaryType
): ServerPostType => {
  const oldPost = mergeObjectIdentity<DbPostType | DbThreadSummaryType>(post);
  const serverPost = {
    id: post.post_id,
    parent_thread_id: post.parent_thread_id,
    parent_post_id: post.parent_post_id,
    created_at: post.created,
    content: post.content,
    secret_identity: oldPost.secret_identity,
    user_identity: oldPost.user_identity,
    friend: post.friend,
    own: post.is_own,
    new: post.is_new,
    comments:
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

export const makeServerComment = (
  comment: DbCommentType
): ServerCommentType => {
  const identityPost = mergeObjectIdentity<DbCommentType>(comment);
  return {
    id: comment.comment_id,
    parent_comment_id: comment.parent_comment,
    chain_parent_id: comment.chain_parent_id,
    parent_post_id: comment.parent_post,
    created_at: comment.created,
    content: comment.content,
    secret_identity: identityPost.secret_identity,
    user_identity: identityPost.user_identity,
    friend: comment.friend,
    own: comment.is_own,
    new: comment.is_new,
  };
};

export const ensureNoIdentityLeakage = (post: any) => {
  if (!post.friend && !post.own && post.user_identity) {
    log(post);
    throw Error("Identity leakage detected.");
  }
  if (post.author || post.user_id || post.username || post.user_avatar) {
    throw Error("Identity leakage detected.");
  }
  if (Array.isArray(post.comments)) {
    post.comments?.forEach((comment: any) => ensureNoIdentityLeakage(comment));
  } else if (post.comments) {
    Object.values(post.comments).forEach((comment: any) =>
      ensureNoIdentityLeakage(comment)
    );
  }
};

const extractLockedBoardMetadata = (metadata: any) => {
  return {
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
}: {
  metadata: DbBoardMetadata;
  isLoggedIn: boolean;
}) => {
  let finalMetadata = {
    id: metadata.slug,
    slug: metadata.slug,
    avatar_url: metadata.avatar_url,
    descriptions: metadata.descriptions || [],
    permissions: transformPermissions(metadata.permissions),
    posting_identities: metadata.posting_identities.map((identity: any) =>
      transformImageUrls(identity)
    ),
    accessories: metadata.accessories,
  };

  if (!isLoggedIn) {
    delete finalMetadata.permissions;
    delete finalMetadata.posting_identities;
    delete finalMetadata.accessories;
  }

  // @ts-expect-error
  if (!isLoggedIn && metadata.loggedInOnly) {
    finalMetadata.descriptions = [];
  }

  return finalMetadata;
};

export const processBoardsMetadata = ({
  boards,
  isLoggedIn,
}: {
  boards: any[];
  isLoggedIn: boolean;
}) => {
  const result = boards.map((board: any) => {
    let boardResult = board;

    // Remove from list if the board shouldn't be visible in the sidebar
    boardResult.delisted =
      (!isLoggedIn &&
        board.logged_out_restrictions.includes(restriction_types.DELIST)) ||
      (isLoggedIn &&
        board.logged_in_base_restrictions.includes(restriction_types.DELIST));
    // Pinned boards should still return their value here, even if delisted.
    // Note that the existence of a pinned order implies that the user is
    // logged in.
    if (boardResult.delisted && !board.pinned_order) {
      return null;
    }

    boardResult.loggedInOnly = board.logged_out_restrictions.includes(
      restriction_types.LOCK_ACCESS
    );

    // Remove details from list if the board is locked and the user doesn't have access
    // (right now we keep only avatar, color & description)
    if (!isLoggedIn && boardResult.loggedInOnly) {
      boardResult = extractLockedBoardMetadata(board);
    }

    delete board.logged_out_restrictions;
    delete board.logged_in_base_restrictions;
    return transformImageUrls(boardResult);
  });

  return result.filter((board) => board != null);
};

export const processBoardsSummary = ({
  boards,
  isLoggedIn,
}: {
  boards: any[];
  isLoggedIn: boolean;
}) => {
  const result = processBoardsMetadata({ boards, isLoggedIn });

  // TODO[cleanup]: get correct format from db
  return result.map((result) => ({
    id: result.slug,
    realm_id: "v0-fake-id",
    slug: result.slug,
    tagline: result.tagline,
    avatar_url: result.avatarUrl,
    accent_color: result.settings.accentColor,
    delisted: !!result.delisted,
    logged_in_only: !!result.loggedInOnly,
    muted: isLoggedIn ? !!result.muted : undefined,
    pinned: isLoggedIn ? result.pinned_order !== null : undefined,
  }));
};

export const processBoardsNotifications = ({ boards }: { boards: any[] }) => {
  return boards.map((board) => ({
    id: board.slug,
    has_updates: board.has_updates,
    is_outdated:
      (board.last_activity_from_others &&
        board.last_visit &&
        new Date(board.last_visit) >=
          new Date(board.last_activity_from_others)) ||
      false,
    last_activity_at: board.last_activity,
    last_activity_from_others_at: board.last_activity_from_others,
    last_visited_at: board.last_visit,
  }));
};
