import React from "react";
import { Webpack } from "@api";

import Settings from "../modules/settings";
import SettingsItems from "../modules/settings.json";

const useStateFromStores = Webpack.getByStrings("useStateFromStores", { searchExports: true });
const { FormDivider, FormSwitch, FormText, FormTitle, Select } = Webpack.getByKeys("Select");

function Dropdown(props) {
    return (
        <div style={{ marginBottom: "20px" }}>
            <FormTitle
                tag="h3"
                style={{ margin: "0px", color: "var(--header-primary)" }}
            >
                {props.name}
            </FormTitle>
            {
                props.note &&
                <FormText
                    type={FormText.Types.DESCRIPTION}
                    style={{ marginBottom: "5px" }}
                >
                    {props.note}
                </FormText>
            }
            <Select
                closeOnSelect={true}
                options={props.options}
                serialize={v => String(v)}
                select={v => Settings.set(props.id, v)}
                isSelected={v => Settings.get(props.id, props.value) === v}
            />
            <FormDivider style={{ marginTop: "20px" }} />
        </div>
    );
}

function Switch(props) {
    const value = useStateFromStores([Settings], () => Settings.get(props.id, props.value));

    return (
        <FormSwitch
            {...props}
            value={value}
            children={props.name}
            onChange={v => {
                Settings.set(props.id, v);
            }}
        />
    );
}

function renderSettings(items) {
    return items.map(item => {
        switch (item.type) {
            case "dropdown":
                return <Dropdown {...item} />;
            case "switch":
                return <Switch {...item} />;
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