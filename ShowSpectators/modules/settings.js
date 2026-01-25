import { Data, Webpack } from "@api";

const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", { searchExports: true });
const Flux = Webpack.getByKeys("Store");

const Settings = new class Settings extends Flux.Store {
    constructor() { super(Dispatcher, {}); }
    _settings = Data.load("SETTINGS") ?? {};

    get(key, def) {
        return this._settings[key] ?? def;
    }

    set(key, value) {
        this._settings[key] = value;
        Data.save("SETTINGS", this._settings);
        this.emitChange();
    }
};

export default Settings;
