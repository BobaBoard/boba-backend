const TRANSFORM_DICT: { [key: string]: string } = {
  avatar_reference_id: "avatarUrl",
};
export const transformImageUrls = (obj: any) => {
  Object.keys(TRANSFORM_DICT).forEach((key) => {
    if (obj[key]) {
      if (obj[key].startsWith("http")) {
        obj[TRANSFORM_DICT[key]] = obj[key];
      } else {
        obj[TRANSFORM_DICT[key]] = `/${obj[key]}`;
      }
    }
    delete obj[key];
  });
  return obj;
};
