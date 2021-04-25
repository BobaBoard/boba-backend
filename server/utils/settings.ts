import {
  DbSettingType,
  SettingEntry,
  SettingValueTypes,
} from "../../types/settings";

export const parseSettings = (settings: DbSettingType[]): SettingEntry[] => {
  return settings.map((setting) => {
    const parsedSetting: SettingEntry = { ...setting };
    if (!parsedSetting.value) {
      return parsedSetting;
    }
    switch (parsedSetting.type) {
      case SettingValueTypes.BOOLEAN:
        parsedSetting.value = parsedSetting.value === "true";
        break;
      default:
        throw new Error(`Unrecognized setting type: ${parsedSetting.type}`);
    }

    return parsedSetting;
  });
};

export const aggregateByType = (settings: SettingEntry[]) => {
  return settings.reduce(
    (aggregate, setting) => {
      aggregate.decorations.push(setting);
      return aggregate;
    },
    { decorations: [] }
  );
};
