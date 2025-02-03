import { Components, Webpack } from "@api";
import React from "react";

import Settings from "../modules/settings";
import SettingsItems from "../modules/settings.json";

const { SettingItem } = Components;
const Select = Webpack.getByStrings(".selectPositionTop]:\"top\"===", { searchExports: true });

function DropdownItem(props) {
    return (
        <SettingItem {...props}>
            <Select
                closeOnSelect={true}
                options={props.options}
                serialize={v => String(v)}
                select={v => Settings.set(props.id, v)}
                isSelected={v => Settings.get(props.id, props.value) === v}
            />
        </SettingItem>
    );
}

function renderSettings(items) {
    return items.map(item => {
        switch (item.type) {
            case "dropdown":
                return <DropdownItem {...item} />;
            default:
                return null;
        }
    });
}

export default function SettingsPanel() {
    return (
        <div className="settings-panel">
            {renderSettings(SettingsItems)}
        </div>
    );
}
