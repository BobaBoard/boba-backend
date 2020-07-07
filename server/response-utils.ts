import debug from "debug";
import { ServerPostType, DbIdentityType, DbThreadType } from "./types/Types";

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

export const mergeCommentsAndIdentities = (
  comment: any,
  identitiesMap: Map<string, DbIdentityType>
) => {
  const authorIdentity = identitiesMap.get(comment.author.toString());
  delete comment.author;
  info(`Adding identity to comment made by ${authorIdentity.username}.`);
  comment.secret_identity = transformImageUrls({
    name: authorIdentity.display_name,
    avatar: authorIdentity.secret_identity_avatar_reference_id,
  });
  if (authorIdentity.friend || authorIdentity.self) {
    info(`...who is our friend (or us).`);
    comment.user_identity = transformImageUrls({
      name: authorIdentity.username,
      avatar: authorIdentity.user_avatar_reference_id,
    });
  }
};

export const mergePostAndIdentities = (
  post: any,
  identitiesMap: Map<string, DbIdentityType>
) => {
  info(`Getting identity for post author: ${post.author}`);
  const authorIdentity = identitiesMap.get(post.author.toString());
  info(authorIdentity);
  delete post.author;
  info(`Adding identity to post made by ${authorIdentity.username}.`);
  post.secret_identity = transformImageUrls({
    name: authorIdentity.display_name,
    avatar: authorIdentity.secret_identity_avatar_reference_id,
  });
  if (authorIdentity.friend || authorIdentity.self) {
    info(`...who is our friend (or us).`);
    post.user_identity = transformImageUrls({
      name: authorIdentity.username,
      avatar: authorIdentity.user_avatar_reference_id,
    });
  }

  post.comments?.map((comment: any) => {
    mergeCommentsAndIdentities(comment, identitiesMap);
  });
};

// TODO: decide whether transformImageUrls should be here.
export const mergeThreadAndIdentities = (
  thread: any,
  identities: DbIdentityType[]
) => {
  const identitiesMap = new Map<string, DbIdentityType>();
  identities.forEach((identity) =>
    identitiesMap.set(identity.id.toString(), identity)
  );
  info(identitiesMap);
  thread.posts.map((post: any) => mergePostAndIdentities(post, identitiesMap));
  return thread;
};

export const ensureNoIdentityLeakage = (post: any) => {
  if (!post.friend && !post.self && post.user_identity) {
    throw Error("Identity leakage detected.");
  }
  if (post.author || post.user_id) {
    throw Error("Identity leakage detected.");
  }
};
