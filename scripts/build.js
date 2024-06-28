const { watch } = require("rollup");
const path = require("path");
const fs = require("fs");
const nodeResolve = require("@rollup/plugin-node-resolve");
const cssom = require("cssom");
const { js: jsBeautify } = require("js-beautify");
const { default: esBuild } = require("rollup-plugin-esbuild");
const { default: json } = require("@rollup/plugin-json");

const NO_PLUGIN_FOLDERS = [".github", "scripts"];

const argv = process.argv.slice(2).reduce((args, arg, index, array) => {
    if (arg.startsWith("--")) {
        let key = arg.slice(2);
        let value = true;
        if (key === "plugins") {
            value = new Set();
            for (let i = index + 1; i < array.length; i++) {
                if (array[i].startsWith("--")) break;
                value.add(array[i].split("/")[0]);
            }
            value = [...value];
        }
        if (!value || !value.length) return;
        args[key] = value;
    }
    return args;
}, {});

if (!argv.plugins || argv.plugins.filter(e => !NO_PLUGIN_FOLDERS.includes(e)).length === 0) {
    console.error("No Plugins provided!");
    process.exit(0);
}

function makeMeta(manifest) {
    manifest.author ??= manifest.authors.map(e => e.name).join(", ");

    return Object.keys(manifest)
        .filter(e => e !== "authors")
        .reduce((str, key) =>
            typeof manifest[key] === "string"
                ? str + ` * @${key} ${manifest[key]}\n`
                : str
            , "/**\n") + " */\n\n";
}

const styleLoader = `
import {DOM} from "@api";
export default {
    sheets: [],
    _element: null,
    load() {
        DOM.addStyle(this.sheets.join("\\n"));
    },
    unload() {
        DOM.removeStyle();
    }
}`;

const matchAll = ({ regex, input, parent = false, flat = false }) => {
    let matches, output = [], lastIndex = 0;
    while (matches = regex.exec(input.slice(lastIndex))) {
        if (!regex.global) lastIndex += matches.index + matches[0].length;
        if (parent) output.push(matches);
        else {
            const [, ...match] = matches;

            output.push(...(flat ? match : [match]));
        }
    }
    return output;
}

const virtual = files => ({
    name: "Virtual Files",
    resolveId(id) {
        return files[id] && id;
    },
    load(id) {
        if (files[id]) {
            return files[id];
        }
    }
});

function upperFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
    let out = "";
    const split = str.split("-");

    for (let i = 0; i < split.length; i++) {
        out += i > 0 ? upperFirst(split[i]) : split[i];
    }

    return out;
}

const buildPlugin = pluginFolder => {
    pluginFolder = path.resolve(process.cwd(), pluginFolder);
    if (!fs.existsSync(pluginFolder)) {
        console.error(`Can't find plugin folder "${path.basename(pluginFolder)}"`);
        process.exit(1);
    }

    const manifestPath = path.resolve(pluginFolder, "package.json");
    if (!fs.existsSync(manifestPath)) {
        console.error(`Can't find a package.json file in "${pluginFolder}"`);
        process.exit(1);
    }

    const watcher = watch({
        input: path.resolve(pluginFolder, fs.readdirSync(pluginFolder).find(e => e.indexOf("index") === 0)),
        watch: {
            skipWrite: true
        },
        output: {
            format: "cjs",
            exports: "auto"
        },
        external: require("node:module").builtinModules,
        plugins: [
            json(),
            nodeResolve({
                extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]
            }),
            esBuild({
                target: "esNext",
                jsx: "transform"
            }),
            virtual({
                "react": "export default BdApi.React",
                "react-dom": "export default BdApi.ReactDOM",
                "@styles": styleLoader,
                get "@manifest"() { return "export default " + fs.readFileSync(manifestPath, "utf8"); },
                "@api":
                    "import manifest from \"@manifest\";" +
                    "export const {Net, Data, Patcher, ReactUtils, Utils, Webpack, UI, ContextMenu, DOM} = new BdApi(manifest.name);",
            }),
            {
    
                name: "StyleSheet Loader",
                async load(id) {
                    const ext = path.extname(id);
    
                    if (ext !== ".css" && ext !== ".scss") return null;
    
                    let content; {
                        if (ext === ".scss") {
                            content = (await require("sass").compileAsync(id)).css;
                        } else {
                            content = await fs.promises.readFile(id, "utf8");
                        }
                    };
    
                    const names = cssom.parse(content).cssRules.reduce((classNames, rule) => {
                        const matches = matchAll({
                            regex: /((?:\.|#)[\w-]+)/g,
                            input: rule.selectorText,
                            flat: true
                        });
    
                        Object.assign(classNames,
                            Object.fromEntries(matches.map(m => (m = m.slice(1), [toCamelCase(m), m])))
                        );
    
                        return classNames;
                    }, {});
    
                    return "import Styles from \"@styles\";" +
                        `Styles.sheets.push("/* ${id.split(path.sep).pop()} */",` +
                        `\`${content.replaceAll("`", "\\`")}\`);` +
                        "export default " + JSON.stringify(names, null, 4);
                }
            },
            {
                name: "Code Regions",
                transform(code, id) {
                    id = path.basename(id);
    
                    return `/* @module ${id} */\n${code}\n/*@end */`;
                }
            }
        ],
    
    })
    
    watcher.on("event", async event => {
        switch (event.code) {
            case "BUNDLE_START": {
                if (argv.watch) console.clear();
                console.time(`Build ${path.basename(pluginFolder)} in`);
            } break;
    
            case "BUNDLE_END": {
                const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));
                const bundle = event.result;
    
                let { output: [{ code }] } = await bundle.generate({ format: "cjs", exports: "auto" });
    
                code = code.replace(/var (\w+) =/, "const $1 =");
                code = code.replaceAll("/* @__PURE__ */ ", "");
                code = jsBeautify(code, {});
    
                const contents = makeMeta(manifest) + code;
    
                $ensureBuildsDir: {
                    const folder = path.resolve(process.cwd(), "builds");
    
                    if (fs.existsSync(folder)) break $ensureBuildsDir;
    
                    fs.mkdirSync(folder);
                }
    
                const outfile = path.resolve(process.cwd(), "builds", `${manifest.name}.plugin.js`);
    
                fs.writeFileSync(outfile, contents, "utf8");
    
                if ("install" in argv) {
                    const bdFolder = path.resolve(process.env.APPDATA, "BetterDiscord", "plugins", `${manifest.name}.plugin.js`);
                    fs.writeFileSync(bdFolder, contents, "utf8");
                }
    
                console.timeEnd(`Build ${path.basename(pluginFolder)} in`);
    
                event.result.close();
                if (!argv.watch) watcher.close();
            } break;
    
            case "ERROR": {
                console.error(event.error);
                if (!argv.watch) watcher.close();
            } break;
        }
    });
}

argv.plugins.filter(e => !NO_PLUGIN_FOLDERS.includes(e)).forEach(buildPlugin);