# Composer Drawer

<img src="icon.svg" alt="Plugin icon" width="64" height="64">
![License MIT](https://img.shields.io/badge/license-MIT-green)
![Target DSH 0.2.1-rc.5](https://img.shields.io/badge/DSH-0.2.1--rc.5-blue)

[中文](README.md)

A small handle for the DeepSeek Harness (DSH) Web composer: hide the input card for more reading space, then restore it when needed.

## Behavior

- Click the handle to toggle the composer.
- Drag down more than approximately 18 pixels to hide it, or up more than 18 pixels to show it. Small movements do not toggle it.
- With keyboard focus on the handle, press ↓ to hide or ↑ to show. The native button also supports Enter / Space.
- CSS hides the input card without deliberately clearing or submitting its draft. DSH owns draft storage; this plugin adds no draft backup.
- Switching sessions restores the expanded state. Blank conversations hide the handle and show the composer. Remounting the plugin also starts expanded.
- Chinese and English button text and plugin metadata are included.

## Install

This is a directly loadable JavaScript bundle with no runtime npm dependencies or build step. Do not run `npm install` to prepare it. The existing package name `@local/dsh-composer-drawer`, module id, and plugin row id `local-composer-drawer` are retained to avoid duplicate identities. `private: true` prevents accidental npm publication; Git and local-directory installation still work.

In the DSH Web sidebar, open **Plugins**, install this Git source, and enable the Composer Drawer bundle:

```text
github:gaoerge/dsh-composer-drawer#main
```

The CLI syntax was checked read-only with `dsh plugin --help` on DSH 0.2.1-rc.5. For the `web` profile:

```sh
dsh plugin --profile web add "github:gaoerge/dsh-composer-drawer#main"
```

Alternatively, download the repository and install its absolute directory path:

```sh
dsh plugin --profile web add "C:/path/to/dsh-composer-drawer"
```

Replace `web` with your actual profile. Installation affects every session using that profile. Check that the bundle and plugin row are enabled on the Plugins page; follow any restart instruction and refresh the page. This repository has no prepare/install lifecycle scripts and needs no build-script approval. Git installation requires Git and network access, independently of the plugin's runtime behavior.

## Disable or remove

On the Plugins page, turn off the Composer Drawer bundle or disable the `local-composer-drawer` row. Remove the bundle there to uninstall, or use:

```sh
dsh plugin --profile web remove @local/dsh-composer-drawer
```

Follow any restart / refresh instruction. Avoid installing renamed copies alongside this plugin. If the same local package is already installed, manage that installation before changing its source.

## Compatibility and limitations

- This release declares only **DSH 0.2.1-rc.5 Web** compatibility, using an exact `engines.dsh` requirement. No other DSH version is claimed as verified. Release-file checks are not Git-installation or end-to-end UI tests.
- Uses the `conversation.input.dock` slot, host React / locale services, and theme tokens.
- Hiding relies on internal DOM markers `[data-composer-seat]`, `[data-composer-card]`, `[data-conversation-content][data-content-phase="blank"]`, and CSS `:has()`. These are not stable public layout contracts. Host DOM changes or browsers without `:has()` support may break the hiding effect.
- This is a visibility feature. It does not pause tasks, stop model responses, or change message submission.

## Privacy

Review of the current `index.js` and `client.js` shows no plugin-initiated network requests, filesystem writes, localStorage, sessionStorage, IndexedDB, or other persistence. Expansion and gesture state live only in React component memory. The plugin does not read or transmit draft text. This statement does not cover DSH's own storage and network behavior.

## Screenshots

Real screenshots are pending. No placeholder or simulated screenshot is displayed.

## Release checks

Only Node.js and npm are needed. No dependency installation is required:

```sh
npm run check
npm pack --dry-run --ignore-scripts --json
```

The built-in-only verifier checks metadata, exports, the bundle patch, locale metadata, icon, package path / symlink containment, and explicit packing rules. `--readme-links` checks relative README links; `--pack-json <file>` checks an npm dry-run JSON file against the allowed package contents. These checks do not exercise the UI or duplicate its implementation in unit tests. No GitHub Actions workflow is included; run these checks locally before release.

See [CHANGELOG.md](CHANGELOG.md). Code and the original icon are available under the [MIT License](LICENSE), attributed to gaoerge.
