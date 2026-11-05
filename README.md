# KWSX Client

A small [Electron](https://www.electronjs.org/) desktop client for
[KWSX Radio](https://radio.kwsx.online/) — internet radio for all.

<p align="center">
  <img src="assets/logo.png" alt="KWSX" width="240">
</p>

The app is a thin native shell around the station's existing web player: it opens a
native window showing an animated KWSX splash screen, then hands the window over to
<https://radio.kwsx.online/>. There is no local audio engine, no playlist logic,
and no API keys — the player, the stream, and the metadata all come from the station
itself.

## Requirements

- [Node.js](https://nodejs.org/) **22.13.0 or newer** (required by Electron Forge 8)
- npm (bundled with Node)

## Getting started

```bash
npm install
npm start
```

`npm start` launches the app with Electron Forge and will open the player window.

## Building installers

```bash
npm run package   # unpacked app bundle in out/
npm run make      # distributable installers in out/make/
```

`npm run make` builds the makers for the host platform — a Squirrel installer on
Windows, `.deb` / `.rpm` on Linux, and a `.zip` on macOS — so installers for every
platform mean running it on each platform. All build output is written to `out/`,
which is git-ignored.

## Project structure

| Path | Purpose |
| --- | --- |
| `main.js` | Electron main process: window creation, app lifecycle, single-instance lock, external-link handling |
| `loading.html` | Splash screen markup (with a strict Content-Security-Policy) |
| `loader.css` | Splash screen styles, including the bundled `AMedium` font face |
| `loader.js` | Splash timing and the redirect to the station |
| `forge.config.js` | Electron Forge packaging, makers, and Electron fuses |
| `assets/` | Per-platform icons (`.ico`, `.icns`, `.png`), logo, and the Ancient Medium webfont |

## Configuration

- **Station URL** — the splash hands the window to `RADIO_URL` in `loader.js`, and
  `main.js` pins the window to `STATION_ORIGIN`. Pointing the client at a different
  station means updating both, plus the `connect-src` entry and the `preconnect` /
  `dns-prefetch` hints in `loading.html`.
- **App identity** — `APP_ID` in `main.js` sets the Windows `AppUserModelID`, which
  is what makes taskbar pinning and notifications associate with this app. Keep it
  in sync with the app id you distribute under.
- **Window size and appearance** — the `BrowserWindow` options in `main.js`.
- **Packaging** — `packagerConfig`, `makers`, and the Electron `FusesPlugin`
  settings in `forge.config.js`.

## Security notes

The window loads remote content, so the renderer is deliberately locked down:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- no preload script, so the remote page has no bridge into the main process
- `will-navigate` and `setWindowOpenHandler` keep the window pinned to the
  station's origin: every other `http(s)` URL is opened in the user's default
  browser instead, and look-alike hosts are rejected by an exact origin check
  rather than a string prefix match
- the splash screen runs under a `default-src 'self'` CSP
- packaged builds disable `RunAsNode`, `NODE_OPTIONS`, and inspector CLI
  arguments, enable cookie encryption, and load the app only from the ASAR
  archive with integrity validation

Because there is no preload bridge, the main process exposes no IPC surface to
page content.

## Notes and limitations

- Unofficial and unaffiliated with KWSX Radio. Station branding, artwork, and
  audio belong to the station.
- The player's own UI is what you interact with, so its behaviour (and its
  availability) is controlled upstream.

## License

[ISC](LICENSE) — Copyright (c) 2025-2026 Refueled.

The bundled `assets/ancient-medium.woff` typeface and the KWSX name and artwork
are the property of their respective owners and are included here only to
reproduce the station's branding.
