# AstralBridge Semantic Surface

## Current crossing

`src/main.js` operates one pending text crossing at a time. `Copy & begin crossing` freezes the exact textarea string into an outward record before attempting Clipboard API write. The recorded copy outcome is not proof that Google received a message. Re-copying does not create another crossing.

The user switches to an independently opened Google AI Mode conversation, pastes and submits there, then copies its response back. The static apparatus neither reads Google's DOM nor automates submission. The Google link opens the public AI Mode entry point; it is not a continuation deep link. Follow-ups require switching back to the existing Google conversation.

The return textarea is editable until `Record return`. `Paste response` requests clipboard read on a click, with ordinary paste as fallback. Recording retains the exact textarea string, marks its source as human-supplied, and closes the crossing. Whitespace-only outward/return values cannot begin/finish a crossing. Text is not parsed as commands, JSON, HTML, or Markdown. Ledger rendering uses `textContent`.

Closing without a return retains outward evidence and any unrecorded return draft in the export. It does not invent a response. Crossing IDs are sequential within the tab. Begin, successful-copy, and end timestamps are distinct; each record carries its source build identity.

## Recovery and inspection

A versioned JSON snapshot in `sessionStorage` holds records and current drafts. It survives ordinary same-tab reloads. It is not a durable history service; closing a tab or browser recovery behavior can lose it. Storage exceptions show a visible warning while in-memory operation continues. `Save evidence` downloads JSON containing records, drafts, and an export timestamp. It has no import or sync facility.

The page shows separate outward and returned text in expandable crossing records. It cannot attest that pasted text originated from Google, or that copied outward text was submitted unchanged. Those boundaries are stated in the interface.

## Build and release

Authored source consists of `src/main.js`, `src/shell.html`, and `src/styles.css`. `tools/build.mjs` uses esbuild to create one self-contained `dist/index.html`; no network dependency is needed to run the apparatus. Three.js, ECS, terrain, rendering loops, and inherited world diagnostics have been removed.

The inherited `globalThis.__CRUCIBLE_BUILD__` identity and `crucible-candidate-<sha>` artifact names remain compatible with exact-byte promotion. Root `index.html` remains the accepted stable artifact, untouched by this expedition candidate. Candidate publication is `/preview/`; promotion requires human acceptance under `EXPEDITION.md` and `CLONE_AND_DEPLOY.md`.

## External evidence boundary

On 2026-09-29 UTC, the operator opened Google's public AI Mode UI and submitted a short transport probe. No answer appeared. One reload produced Google's explicit unusual-traffic block. This establishes a cloud-browser boundary, not successful model round-trip evidence or a restriction on the human's device.

No API, proxy, browser extension, provider abstraction, model identity, agent loop, or orchestrator exists. The human subsequently completed ten real crossings, preserved in `evidence/crossings-001.json`. The transport worked but was reported laborious. This satisfies repeated manual transfer evidence, not the low-friction finish line.

## Direct-share intake probe

`src/intake/` is a separate installable receiver at `/preview/intake/`. The original clipboard ledger remains separate and unchanged except for a link to this probe. No shared receipt is automatically attached to a crossing or represented as a Google reply.

The manifest registers a multipart POST share target for title, text, URL and arbitrary files. The service worker intercepts its scoped `capture` endpoint, preserves fields (including repeated names) and original File blobs in IndexedDB, and redirects to the saved receipt. It awaits the write transaction before redirecting. The receiver cannot verify the sender, and a POST alone is not proof of an Android share.

The receipt shows exact field values, filenames, sizes, MIME hints and SHA-256 hashes. Long text has a truncated display preview; JSON export retains its full value. Original-file download uses the stored blob. Receipt JSON excludes file bytes and says so. Links remain links: the receiver does not fetch them, scrape Google, execute HTML, unpack archives, or imply that a linked response was received. Files are opaque evidence, not supported-Google-upload claims.

IndexedDB is scoped by the intake URL path so preview and future stable installations do not mix receipts. This storage is necessary for a service-worker-to-window transfer that may open a new window. Data persists until browser eviction or clearing site data; there is no remote sync or memory/personality layer. The intake UI states this storage boundary. Quota or parsing failures return an explicit error and do not acknowledge receipt.

The receiver bounds a parcel at 128 MiB and 64 files; these are local protective limits, not provider limits. Original bytes remain local. Install caches the receiver shell, manifest and icons for offline opening; navigation is network-first with that shell as fallback. The worker controls only its `intake/` directory and cleans only its own scope's versioned caches.

Local fixture buttons POST to a distinct `probe-capture` route and label the resulting receipts synthetic. They compare returned text and file bytes with the input after storage. They do not exercise the operating system's share chooser.

## Candidate sidecars

`tools/build.mjs` also produces `dist/intake/` (self-contained receiver HTML, bundled worker, manifest, icons and a synthetic ZIP fixture). The immutable candidate artifact now contains the entire `dist/` directory. Preview publication includes that full artifact. Exact-byte promotion, if authorized later, copies `index.html` plus `intake/`; Pages also includes any promoted `intake/`. The legacy stable index and promotion marker have not been changed by this probe.

Installing the receiver and routing a real share from the human's Google/Android surface remain external validation boundaries. Neither desktop fixtures nor the earlier clipboard run establishes that this share path is available or sufficiently easier on the phone.
