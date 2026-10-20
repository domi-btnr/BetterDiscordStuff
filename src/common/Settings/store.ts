import { Data } from "@api";

import { Dispatcher, Flux } from "../Webpack";

const Settings = new (class Settings extends Flux.Store {
    constructor() {
        super(Dispatcher, {});
    }
    _settings = Data.load<Record<string, unknown>>("SETTINGS") ?? {};

    get<T>(key: string, def?: T): T {
        return (this._settings[key] ?? def) as T;
    }

    set(key: string, value: unknown) {
        this._settings[key] = value;
        Data.save("SETTINGS", this._settings);
        this.emitChange();
    }
})();

export default Settings;
