export enum SettingTypes {
  CSS_VARIABLE = "CssVariable",
}

export enum SettingValueTypes {
  BOOLEAN = "BOOLEAN",
}

export enum GlobalSettings {
  FESTIVE_BACKGROUND_HEADER = "FESTIVE_BACKGROUND_HEADER",
  FESTIVE_BACKGROUND_FEED = "FESTIVE_BACKGROUND_FEED",
  FESTIVE_BACKGROUND_SIDEBAR = "FESTIVE_BACKGROUND_SIDEBAR",
  FESTIVE_CURSOR = "FESTIVE_CURSOR",
  FESTIVE_CURSOR_TRAIL = "FESTIVE_CURSOR_TRAIL",
}

export interface DbSettingType {
  name: GlobalSettings;
  value?: string;
  type: SettingValueTypes;
}

interface BaseSettingEntry {
  name: GlobalSettings;
  value?: unknown;
  type: SettingValueTypes;
}

export interface BooleanSettingEntry extends BaseSettingEntry {
  value?: boolean;
  type: SettingValueTypes.BOOLEAN;
}

export type SettingEntry = BooleanSettingEntry | BaseSettingEntry;

export interface CssVariableSetting {
  name: string;
  type: "CssVariable";
  value: string;
}
