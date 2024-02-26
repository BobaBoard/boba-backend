export type BooleanSettingType = "BOOLEAN";
export type BooleanSetting = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string
    */
    type: BooleanSettingType;
    /**
     * @type boolean
    */
    value: boolean;
};