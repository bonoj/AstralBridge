# Crossing expedition: candidate, external validation pending

Date: 2026-09-29 UTC

The candidate replaces the inherited physical world with a bounded text crossing: copy outward, switch to an existing Google AI Mode conversation, paste/send there, copy its response, return and record it. Exact outward and return text remain separately inspectable and exportable. Reload recovery earns its small cost because the crossing leaves this page.

## Observed Google boundary

The public `https://www.google.com/ai` entry point redirected to AI Mode with an Ask anything input. After rejecting optional cookies, the operator submitted:

> AstralBridge transport probe 1. Reply with the word amber and the number 17. Keep the response to one short sentence.

Google rendered the submitted prompt. Its accessibility announcement said the response was ready, but the visible page retained a loading ellipsis and no response text. One reload produced “Our systems have detected unusual traffic from your computer network.” The operator stopped Google probing. No successful external reply is claimed, and no synthetic response is counted as a Google response.

Google's documented AI Mode interface supports follow-up questions; this candidate leaves conversation continuity on that surface. Reference: https://support.google.com/websearch/answer/16011537

## Surviving machinery

A small DOM interface, Clipboard API with manual fallbacks, a single pending crossing, exact-string evidence, session-only reload recovery, JSON export, and the existing immutable candidate/preview/promotion deployment pipeline.

No browser automation ships in the application. No scraping proxy, API subscription, generalized provider layer, durable memory, identity, world simulation, or orchestration was introduced. These would add unproven cost to the crossing.

## Finish-line status

Implementation and local/candidate checks are recorded below. Actual repeated Google round trips and the human's judgment of clerical effort remain unverified. The expedition is paused at that external product boundary, not declared complete. Candidate promotion remains withheld until human acceptance.

## Executed checks

`node --test tests/crossing.test.mjs`: five passing behavioral tests against the authored JavaScript in a minimal DOM harness, covering three repeated synthetic exchanges, exact multiline/Unicode/HTML-like text preservation, re-copy without duplicate crossings, reload recovery, clipboard refusal, whitespace rejection, close-without-return, quota failure, and JSON export. These tests validate application state transitions, not Google behavior or real browser clipboard permission handling.

`npm run build`: successful self-contained artifact, approximately 11 KB. JavaScript syntax check passed. Real-browser local inspection was blocked by the cloud browser's localhost restriction. Visual and real-browser clipboard checks therefore remain pending.

Automatic approval review rejected a direct push to `main`, identifying it as a consequential shared-repository mutation without explicit authorization. The user subsequently explicitly authorized publication. Command-line Git lacked credentials; the connected GitHub service published the identical source tree as commit `62f05e3b8ba7e686d336dddfeb8cef7f4df250e7`. The candidate is live at https://bonoj.github.io/AstralBridge/preview/. No stable artifact was promoted.

## Live candidate verification after authorized publication

The live preview visibly identifies build `62f05e3b`. Three synthetic browser crossings completed through the actual UI. Clipboard write preserved multiline Farsi, emoji, and spacing; clipboard read filled the return field; record-return advanced to the next crossing. A reload during crossing 2 restored both the frozen outward message and unfinished response. The final UI showed three returned crossings. These are explicitly synthetic UI checks, not Google replies. Desktop layout was inspected. Real Android interaction and Google round trips remain unverified.
