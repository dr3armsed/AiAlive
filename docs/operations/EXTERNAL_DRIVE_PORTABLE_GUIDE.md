# External Drive Portable Runtime Guide

This project can be run from an external drive (including Maxone) with a portable-first workflow.

## 1) Recommended portable layout

```text
<MAXONE_DRIVE>/genmeta/
  runtimes/
    node/           # optional portable Node install
    python/         # optional portable Python install
  app/
    AiAlive/        # this repo
  portable/
    data/
    logs/
    cache/
```

You can either:
- use host-installed Node/Python, or
- point PATH to portable Node/Python from `runtimes/`.

## 2) One-time setup

From repo root:

```bash
npm install
npm run portable:init
npm run portable:doctor
```

What this does:
- creates `.portable/` with `data`, `logs`, `cache`, and runtime cache subfolders,
- generates `.env.portable` containing portable path variables,
- verifies runtime availability and writable directories.

## 3) Launch in portable mode

```bash
npm run portable:dev
```

This launches Vite while forcing runtime/cache environment variables to portable directories:

- `GENMETA_PORTABLE_ROOT`
- `GENMETA_PORTABLE_DATA`
- `GENMETA_PORTABLE_LOGS`
- `GENMETA_PORTABLE_CACHE`
- `NPM_CONFIG_CACHE`
- `PYTHONPYCACHEPREFIX`

## 4) Put portable files outside the repo (recommended)

To keep repository files clean and put mutable runtime state on the drive root, set:

```bash
export GENMETA_PORTABLE_ROOT="/Volumes/MAXONE/genmeta/portable"
npm run portable:init
npm run portable:doctor
npm run portable:dev
```

(Windows PowerShell)

```powershell
$env:GENMETA_PORTABLE_ROOT="E:\genmeta\portable"
npm run portable:init
npm run portable:doctor
npm run portable:dev
```

## 5) Distribution checklist

- Copy `app/AiAlive` to drive.
- Run `npm ci` once on target machine (or copy `node_modules` if you need offline startup).
- Run `npm run portable:init` on first launch.
- Use `npm run portable:doctor` before demos.

## 6) Notes

- `python3` is optional unless you are exercising bridge tests/runtime bridge workflows.
- USB SSD / USB 3.x is strongly recommended for good startup and dependency install performance.

## 7) Portable bridge state behavior

The Python runtime bridge now checks `GENMETA_PORTABLE_DATA` first for state snapshots:

- `<portable-data>/state/id.json`
- `<portable-data>/state/ego.json`
- `<portable-data>/state/superego.json`
- `<portable-data>/state/anomaly_log.json5`

If those files do not exist, it falls back to repository defaults under `data/state/*`.

## 8) Portable verification bundle

Use:

```bash
npm run portable:checks
```

This runs a portable verification pipeline (`build` + `test:bridge` + `test:portable` + `test:substrate`) to validate bridge behavior, portable bootstrap paths, and substrate coherence foundations.

