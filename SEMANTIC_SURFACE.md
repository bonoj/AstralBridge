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

No API, proxy, browser extension, provider abstraction, model identity, agent loop, or orchestrator exists. A real repeated Google round trip and human assessment of transport effort remain necessary before declaring the expedition complete.
