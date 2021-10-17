import { QueryTagsType } from "Types";

export const getTagsDelta = ({
  oldTags,
  newTags,
}: {
  oldTags: QueryTagsType;
  newTags: QueryTagsType;
}): {
  added: QueryTagsType;
  removed: QueryTagsType;
} => {
  return {
    added: {
      contentWarnings: newTags.contentWarnings.filter(
        (newTag) => !oldTags.contentWarnings.includes(newTag)
      ),
      categoryTags: newTags.categoryTags.filter(
        (newTag) => !oldTags.categoryTags.includes(newTag)
      ),
      indexTags: newTags.indexTags.filter(
        (newTag) => !oldTags.indexTags.includes(newTag)
      ),
      whisperTags: newTags.whisperTags.filter(
        (newTag) => !oldTags.whisperTags.includes(newTag)
      ),
    },
    removed: {
      contentWarnings: oldTags.contentWarnings.filter(
        (oldTag) => !newTags.contentWarnings.includes(oldTag)
      ),
      categoryTags: oldTags.categoryTags.filter(
        (oldTag) => !newTags.categoryTags.includes(oldTag)
      ),
      indexTags: oldTags.indexTags.filter(
        (oldTag) => !newTags.indexTags.includes(oldTag)
      ),
      whisperTags: oldTags.whisperTags.filter(
        (oldTag) => !newTags.whisperTags.includes(oldTag)
      ),
    },
  };
};
