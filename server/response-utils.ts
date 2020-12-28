import debug from "debug";
import {
  DbPostType,
  DbThreadType,
  ServerThreadType,
  ServerCommentType,
  ServerPostType,
  DbCommentType,
  DbBoardMetadata,
  restriction_types,
} from "../Types";
import { transformPermissions } from "./permissions-utils";

const info = debug("bobaserver:response-utils-info");
const log = debug("bobaserver::response-utils-log");

const TRANSFORM_DICT: { [key: string]: string } = {
  avatar_reference_id: "avatarUrl",
  avatar: "avatar",
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
    friend: boolean;
    self: boolean;
  }
): T & {
  secret_identity: {
    name: string;
    avatar: string;
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
  });

  return {
    ...rest,
    user_identity,
    secret_identity,
  } as any;
};

export const makeServerThread = (thread: DbThreadType): ServerThreadType => {
  return {
    ...thread,
    posts: thread.posts?.map((post: DbPostType) => makeServerPost(post)),
  };
};

export const makeServerPost = (post: DbPostType): ServerPostType => {
  const serverPost = {
    ...mergeObjectIdentity<DbPostType>(post),
    comments: post.comments?.map(makeServerComment) || null,
    tags: {
      whisper_tags: post.whisper_tags || [],
      index_tags: post.index_tags || [],
      category_tags: post.category_tags || [],
      content_warnings: post.content_warnings || [],
    },
  };
  delete serverPost.whisper_tags;
  delete serverPost.index_tags;
  delete serverPost.category_tags;
  delete serverPost.content_warnings;

  return serverPost;
};

export const makeServerComment = (
  comment: DbCommentType
): ServerCommentType => {
  return mergeObjectIdentity<DbCommentType>(comment);
};

export const ensureNoIdentityLeakage = (post: any) => {
  if (!post.friend && !post.self && post.user_identity) {
    throw Error("Identity leakage detected.");
  }
  if (post.author || post.user_id || post.username || post.user_avatar) {
    throw Error("Identity leakage detected.");
  }
  post.comments?.forEach((comment: any) => ensureNoIdentityLeakage(comment));
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
    ...metadata,
    permissions: transformPermissions(metadata.permissions),
    postingIdentities: metadata.posting_identities.map((identity: any) =>
      transformImageUrls(identity)
    ),
    delisted:
      metadata.logged_out_restrictions.includes(restriction_types.DELIST) ||
      metadata.logged_in_base_restrictions.includes(restriction_types.DELIST),
    loggedInOnly: metadata.logged_out_restrictions.includes(
      restriction_types.LOCK_ACCESS
    ),
    // TODO: remove this cast
  } as any;
  // Remove details from list if the board is locked and the user doesn't have access
  // (right now we keep only avatar, color & description)
  if (!isLoggedIn && finalMetadata.loggedInOnly) {
    finalMetadata = extractLockedBoardMetadata(finalMetadata);
  }

  delete finalMetadata.logged_out_restrictions;
  delete finalMetadata.logged_in_base_restrictions;
  delete finalMetadata.posting_identities;

  return transformImageUrls(finalMetadata);
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
