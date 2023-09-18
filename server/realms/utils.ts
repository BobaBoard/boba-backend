import {
  CssVariableSetting,
  GlobalSettings,
  SettingEntry,
} from "../../types/settings";

const isSettingActiveOrUnset = (
  settingName: GlobalSettings,
  userSettings: SettingEntry[]
) => {
  return (
    userSettings.find((setting) => setting.name == settingName)?.value !== false
  );
};

export const getRealmCursorSetting = (
  realmCursorSetting: {
    image?: string;
    trail?: string;
  },
  userSettings: SettingEntry[]
) => {
  if (!userSettings || userSettings.length == 0) {
    return realmCursorSetting;
  }
  const hasCursorImage = isSettingActiveOrUnset(
    GlobalSettings.FESTIVE_CURSOR,
    userSettings
  );
  const hasCursorTrail = isSettingActiveOrUnset(
    GlobalSettings.FESTIVE_CURSOR_TRAIL,
    userSettings
  );
  if (!hasCursorImage && !hasCursorTrail) {
    return undefined;
  }

  return {
    image: hasCursorImage ? realmCursorSetting.image : undefined,
    trail: hasCursorTrail ? realmCursorSetting.trail : undefined,
  };
};

export const filterOutDisabledSettings = (
  pageSettings: CssVariableSetting[],
  userSettings: SettingEntry[]
) => {
  let finalSettings = pageSettings;
  if (
    !isSettingActiveOrUnset(
      GlobalSettings.FESTIVE_BACKGROUND_HEADER,
      userSettings
    )
  ) {
    finalSettings = finalSettings.filter(
      (setting) => setting.name !== "header-background-image"
    );
  }
  if (
    !isSettingActiveOrUnset(
      GlobalSettings.FESTIVE_BACKGROUND_FEED,
      userSettings
    )
  ) {
    finalSettings = finalSettings.filter(
      (setting) => setting.name !== "feed-background-image"
    );
  }
  if (
    !isSettingActiveOrUnset(
      GlobalSettings.FESTIVE_BACKGROUND_SIDEBAR,
      userSettings
    )
  ) {
    finalSettings = finalSettings.filter(
      (setting) => setting.name !== "sidebar-background-image"
    );
  }
  return finalSettings;
};

export const processRealmActivity = ({ boards }: { boards: any[] }) => {
  return boards.reduce((result, current) => {
    result[current.slug] = {
      id: current.string_id,
      last_post_at: current.last_post_at,
      last_comment_at: current.last_comment_at,
      last_activity_at: current.last_activity_at,
      last_activity_from_others_at: current.last_activity_from_others_at,
      last_visit_at: current.last_visit_at,
    };
    return result;
  }, {});
};
