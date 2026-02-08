import { Components, Hooks } from "@api";
import React from "react";

import Settings from "../modules/settings";
import SettingsItems from "../modules/settings.json";

const { DropdownInput, SettingItem, SwitchInput } = Components;

function DropdownItem(props) {
    return (
        <SettingItem {...props}>
            <DropdownInput
                options={props.options}
                value={Settings.get(props.id, props.value)}
                onChange={v => Settings.set(props.id, v)}
            />
        </SettingItem>
    );
}

function SwitchItem(props) {
    const value = Hooks.useStateFromStores([Settings], () => Settings.get(props.id, props.value));
    return (
        <SettingItem
            {...props}
            inline={true}
        >
            <SwitchInput
                value={value}
                onChange={v => {
                    Settings.set(props.id, v);
                }}
            />
        </SettingItem>
    );
}

function renderSettings(items) {
    return items.map(item => {
        switch (item.type) {
            case "dropdown":
                return <DropdownItem {...item} />;
            case "switch":
                return <SwitchItem {...item} />;
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
