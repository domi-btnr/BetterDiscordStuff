# AGENTS.md

Instructions for AI coding agents working in this repository.

**Read this file together with `CONTRIBUTING.md`, not instead of it.** This file covers agent-specific operational details (build internals, manifest/changelog format, what never to touch); `CONTRIBUTING.md` covers dev setup and PR rules that still apply to you. Treat both as required reading before making changes.

## What this repo is

`BetterDiscordStuff` is a pnpm monorepo of independent [BetterDiscord](https://betterdiscord.app/) plugins. The **`development` branch is source code**; the **`main` branch holds compiled, ready-to-use plugin files** and is written to only by CI. See `README.md` and `CONTRIBUTING.md` for the human-facing overview, dev setup, and PR guidelines — this file focuses on what an agent specifically needs to know to work here safely and correctly.

## Never touch these

- **`builds/`** — generated output of `pnpm build`. Gitignored locally, but on every push to `development` the `auto-build.yml` workflow builds it and a bot (`PluginBuilder`) commits and pushes it straight to `main` (force-adding the gitignored files, not a force-push). Never hand-edit files here or commit them yourself.
- **`main` branch** — only the CI bot pushes here (via a deploy key). Do all work on `development` or a feature branch off it.
- **`src/archive/`** — retired plugins, kept for reference only. Excluded from lint/build config. Leave alone unless explicitly asked to modify one.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in `package.json`) — never use `npm`/`yarn` yourself. (The repo's own git hooks — `.husky/pre-commit`/`pre-push` → `scripts/hooks/*.cjs` — happen to shell out via `npm run ...` internally; that's just how those wrapper scripts were written, not a reason to use npm elsewhere. Those hooks also run interactively on lint failure, which can hang in a non-interactive shell.)

```bash
pnpm install
pnpm build [--watch] [--install] [--publish] [--plugins <PluginName...>]
pnpm lint       # prettier --check . && eslint && tsc --noEmit -p tsconfig.json
pnpm lint:fix   # same, but prettier --write and eslint --fix
```

- `--plugins <Name>` limits the build to one or more plugins. Accepts folder names (e.g. `GlobalBadges`) or any path inside `src/plugins/` (e.g. `src/plugins/GlobalBadges/index.tsx`); other paths are ignored, unknown plugin names fail the build.
- `--install` copies the built file into your local BetterDiscord plugins folder — only meaningful if BetterDiscord is actually installed on the machine.
- `--publish` is what CI uses to stage output for `main`; don't invoke it manually as part of normal edits.
- There is **no test suite**. The quality bar is: `pnpm lint` passes, and `pnpm build --plugins <Name>` succeeds for any plugin you touched. Do both before considering a change done.

## Repo layout

- **All source code lives in `src/`**; the root only holds `scripts/`, tooling folders (`.github`, `.husky`, `.vscode`), config and docs files.
- **A "plugin" is any folder in `src/plugins/`** (see `PLUGINS_DIR` in `scripts/build.js`). Each plugin folder has an `index.jsx`/`index.tsx` entry point, optionally `components/`, `modules/`, `types/`, its own `package.json` (doubles as the BD manifest — see below), and a `README.md`. Run `pnpm build --plugins <FolderName>` to build one.
  - Adding or removing a plugin folder also means updating `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/bug-report.yml` — both hardcode the current plugin list as checkboxes/dropdown options.
- **`src/common/`** — shared code, imported via the `@common/*` path alias (see `tsconfig.json` `paths` and the matching resolver in `scripts/build.js`):
  - `Changelog/` — `showChangelog(manifest)`, wraps BetterDiscord's native `UI.showChangelogModal`; `footer.tsx` renders support/issue links into the modal.
  - `ErrorBoundary/` — wrap any UI a plugin injects into Discord in it. It builds on BetterDiscord's `Components.ErrorBoundary` and shows a Discord-styled error card instead of the broken UI; `mini` shows only an icon for tight spots like tooltips. It has to keep working when Discord breaks, so anything it uses from Discord needs a fallback.
  - `i18n/` — Discord's localized strings and the current locale, plus `createI18n({ resources: { en, de, … } })` for a plugin's own locale files (kept in the plugin's `locales/` folder). Modeled after react-i18next: `useTranslation()` → `{ t, i18n }`, `t("group.key", { count, defaultValue, …values })` with `{{value}}` placeholders and `_one`/`_other` plural keys, and `<Trans i18nKey components={…}>` for messages containing React elements. Generic words can reuse Discord's own messages through the `discord` option (our key → Discord's hashed key, e.g. `"card.copy": "OpuAlK"`); the plugin's own text stays the fallback. Follows Discord's language live and falls back to English for missing languages or keys. `.vscode/settings.json` points the i18n-ally extension at `src/plugins/*/locales`, so keep locale files there as `<locale>.json`.
  - `Settings/` — small settings-panel framework (`store.ts`, `panel.tsx`, typed `items/` controls).
  - `Utils/` — small helpers that don't need a namespace of their own, one file per topic:
    - `contextMenu.ts` — `findContextMenuGroupByItemId(res, id)` finds the group of a context menu that holds a specific item.
    - `fiber.ts` — call `rerenderComponent(component, filter?)` right after patching or unpatching a component that's already on screen (e.g. `rerenderComponent(TabBar.Panel)`, or a `[module, key]` pair from `withKey`): mounted components keep the function they were created with, so the change would otherwise only show once they mount again. It also works for memoized components.
  - `Webpack/` — Discord modules needed in more than one place, one file per module. Each export is the module itself, ready to use (`import { RestAPI } from "@common/Webpack"`). Most are wrapped in `lazyExport`, so they're only looked up on first use. Don't wrap a module that plugins patch (e.g. `MessageActions`): BetterDiscord's `Patcher` tracks patches per object, so patching the proxy instead of the real module breaks other plugins' patches on the same function. `Dispatcher` and `Flux` aren't wrapped either, because the settings store needs the real objects as soon as it loads (`extends Flux.Store`). Stores are not shared here; use `Webpack.getStore(name)`. Only add a module here once a second plugin or `common/` module needs it. Their types live in `src/types/discord/`, extending `@vencord/discord-types` where it has a type.
  - `Schemas/` — `manifest.schema.json` and `settings.schema.json`, referenced via `$schema` from each plugin's `package.json`/`settings.json`.
- **`src/types/`** — shared type declarations, imported via the `@typings` / `@typings/*` path alias (type-only imports, e.g. `import type { ModuleWithKey } from "@typings"`). Not `@types`: TypeScript reserves `@types/*` import paths for npm type packages and rejects them (TS6137). `discord/` holds the types of `src/common/Webpack` modules, `modules.d.ts` the ambient types of the virtual modules. Types used by more than one plugin go here, plugin-only types stay in the plugin's own `types/`.
- **`scripts/build.js`** — the custom Rollup+esbuild bundler behind `pnpm build`. Compiles each plugin's entry file into a single `builds/<Plugin>.plugin.js`, prepending a BetterDiscord `/** @name ... */` meta block generated from that plugin's `package.json`. It injects several **virtual modules** that source files import as if they were normal packages — this is why plugin code looks like ordinary React/npm code despite having no real dependencies:
  - `@api` → a bound `BdApi(manifest.name)` instance, destructured into individual exports (`Data`, `DOM`, `Patcher`, `UI`, `Webpack`, etc.). For the current, authoritative list of exported names, check the `virtual(...)` block in `scripts/build.js` or the `declare module "@api"` block in `src/types/modules.d.ts` — don't rely on any list written here going stale.
  - `react` / `react-dom` → `BdApi.React` / `BdApi.ReactDOM`. Import them like in any React app (default, named or namespace); the bundle references the global directly (`useState` → `BdApi.React.useState`), see `GLOBAL_MODULES` in `scripts/build.js`.
  - JSX compiles straight to `BdApi.React.createElement` / `BdApi.React.Fragment`, so files that only use JSX don't need to import React. esbuild ignores `tsconfig.json`, which only drives type checking.
  - `@manifest` → the plugin's own `package.json` contents
  - `@styles` → a loader backed by `DOM.addStyle`/`removeStyle` that also injects into Discord popout windows (via `PopoutWindowStore`); `.scss`/`.css` imports are compiled and exposed as class-name maps
  - Ambient types for all of the above live in `src/types/modules.d.ts`.

## Plugin manifest & changelog format

Each plugin's `package.json` **is** its BetterDiscord manifest, validated against `src/common/Schemas/manifest.schema.json` — treat that schema as the authoritative reference for manifest fields (including the full shape of `changelog`) rather than any field list written here, since it can change.

A plugin's `package.json` can *also* declare real `dependencies`/`devDependencies`, exactly like a normal npm package — this is how a plugin bundles a third-party library. If either field is present, `scripts/build.js` runs `pnpm install` in that plugin's folder before bundling, and Rollup (via `@rollup/plugin-node-resolve` + `@rollup/plugin-commonjs`) resolves and bundles whatever is actually `import`ed straight into the compiled `.plugin.js` output. There's no separate runtime install step — to add a dependency to a plugin, add it to that plugin's own `package.json`, not the root one.

Note: the build does **not** treat `dependencies` and `devDependencies` differently — it's the same npm-convention split as any Node project (runtime vs. dev/tooling-only), not something the bundler enforces. Anything you `import` gets bundled regardless of which field it's listed under.

`changelog` is rendered once per version bump by `src/common/Changelog` (tracked via `Data.load/save("lastVersion")`). Example matching the schema:

```json
{
    "changelog": {
        "date": "2026-09-05",
        "changes": [
            { "type": "added", "title": "Added", "items": ["Some new feature."] },
            { "type": "fixed", "title": "Fixed", "items": ["Some bug fix."] }
        ]
    }
}
```

**When you change a plugin's behavior, bump its `version` and add a `changelog.changes` entry** in that plugin's `package.json` — check `src/common/Schemas/manifest.schema.json` for the current set of valid `type`s and optional fields (`title`, `subtitle`, `blurb`, `video`, `banner`, `poster`, etc.). This is the PR requirement from `CONTRIBUTING.md`; skipping it means users never see what changed.

## Coding conventions

- Plugin entry point = a single default-exported class implementing BetterDiscord's lifecycle: `start()`, `stop()`, optionally `getSettingsPanel()`.
- Everything else is functional React components.
- Import the BdApi surface from the virtual `@api` module (`import { Webpack, Patcher } from "@api"`), not a global `BdApi`.
- Import shared code through a module's `index.ts` (`import { Dispatcher, Flux } from "../Webpack"` / `"@common/Webpack"`), never from its individual files. Only files inside the same module import each other directly, because importing their own `index.ts` would create a circular import.
- **Match the existing language of whatever you're editing.** Plugins are mixed: some are plain JS/JSX, others are TypeScript (check whether a plugin's entry file is `index.jsx` or `index.tsx`; all of `src/common/` is TypeScript). Don't convert a plugin's language as a side effect of an unrelated change. Default new plugins to TypeScript.
- TypeScript is checked (`tsc --noEmit`) but **not strict** — no `strict`/`noImplicitAny` in `tsconfig.json`. Don't assume strict-mode guarantees hold.
- Style is enforced by ESLint + Prettier, not up for debate: 4-space indent, double quotes, semicolons, no trailing commas, `eslint-plugin-simple-import-sort` import ordering, 120-char line length. Run `pnpm lint:fix` rather than hand-formatting.

## CI

- PRs run four checks: `eslint`, `prettier --check`, `tsc --noEmit`, and a build of whichever plugin(s) the PR touches.
- Pushes to `development` trigger `auto-build.yml`, which builds changed plugins (all of them if anything in `src/common/` changed) and auto-commits the compiled output to `main`, where each plugin stays a top-level `<Plugin>/` folder. This is fully automated — never try to replicate the publish step by hand.

## AI self-disclosure

If you are an autonomous agent opening a PR that the human operator did not personally review before submission, say so explicitly in the PR description. For example:

> This PR was generated by [agent/tool]. The human operator [reviewed the diff, ran `pnpm lint`/`pnpm build` locally, and tested the change in BetterDiscord / did not review the output before submission].

This is a transparency expectation, not a penalty against AI-assisted work — the maintainer is fine with AI-assisted PRs, just not undisclosed unreviewed ones. It helps calibrate how much review effort a PR needs. PRs that read as unreviewed agent output without this disclosure will be closed without detailed feedback.

## Keep this file in sync

If your change makes something in this file inaccurate — a command, build/CI behavior, the general folder layout, a lint/TS rule — update the relevant section of `AGENTS.md` in the same PR.

This deliberately does **not** include field-level details like manifest/changelog fields or `@api` exports — this file points at `src/common/Schemas/*.schema.json`, `scripts/build.js`, and `src/types/modules.d.ts` for those on purpose, so they stay correct on their own even when nobody remembers to touch `AGENTS.md`. Keep it that way: don't copy those details into this file just to "complete" this rule.
