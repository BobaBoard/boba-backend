export enum SettingTypes {
  CSS_VARIABLE = "CssVariable",
}

export enum SettingValueTypes {
  BOOLEAN = "BOOLEAN",
}

export enum GlobalSettings {
  FESTIVE_HEADER_BACKGROUND = "FESTIVE_HEADER_BACKGROUND",
  FESTIVE_BACKGROUND_BOARD = "FESTIVE_BOARD_BACKGROUND",
  FESTIVE_BACKGROUND_THREAD = "FESTIVE_THREAD_BACKGROUND",
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
  value?: any;
  type: SettingValueTypes;
}

export interface BooleanSettingEntry extends BaseSettingEntry {
  value?: boolean;
  type: SettingValueTypes.BOOLEAN;
}

export type SettingEntry = BooleanSettingEntry | BaseSettingEntry;
