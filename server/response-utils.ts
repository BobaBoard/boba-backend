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

// TODO: decide whether transformImageUrls should be here.
export const mergeThreadAndIdentities = (thread: any, identities: any[]) => {
  const identitiesMap = identities.reduce((accumulator, identity) => {
    accumulator[identity.id] = identity;
    return accumulator;
  }, {});
  thread.posts.map((post: any) => {
    const authorIdentity = identitiesMap[post.author];
    delete post.author;
    post.secret_identity = transformImageUrls({
      name: authorIdentity.display_name,
      avatar: authorIdentity.secret_identity_avatar_reference_id,
    });
    if (authorIdentity.friend || authorIdentity.self) {
      post.user_identity = transformImageUrls({
        name: authorIdentity.username,
        avatar: authorIdentity.user_avatar_reference_id,
      });
    }

    post.comments?.map((comment: any) => {
      const authorIdentity = identitiesMap[comment.author];
      delete comment.author;
      comment.secret_identity = transformImageUrls({
        name: authorIdentity.display_name,
        avatar: authorIdentity.secret_identity_avatar_reference_id,
      });
      if (authorIdentity.friend || authorIdentity.self) {
        comment.user_identity = transformImageUrls({
          name: authorIdentity.username,
          avatar: authorIdentity.user_avatar_reference_id,
        });
      }
    });
  });
  return thread;
};
