# Probe 002: direct receipt through Android Share

Status: implemented; phone-side share route unverified. This is not expedition completion.

## Why this probe

Crossing 001 established usable transfer and unacceptable repeated clerical effort. Routing a selected response or file directly from its source app to a receiver could remove the manual return-to-ledger, paste and record sequence. The new receiver stores incoming data before opening its receipt. Whether text selection and the Android chooser actually make this cheaper is still a device-level question.

The probe remains beside the existing ledger until that question is answered. It does not add another required step to the established crossing.

## Sources inspected on 2026-09-29

- https://developer.chrome.com/docs/capabilities/web-apis/web-share-target documents an installed web app as a share target, multipart POST for files, service-worker receipt handling, and Android URLs sometimes arriving in the text field.
- https://support.google.com/websearch/answer/16517651?co=GENIE.Platform%3DAndroid&hl=en describes Google response sharing as link sharing, potentially exposing the thread. This is why the probe asks for selected text first and does not equate links with response bodies.
- https://support.google.com/websearch/answer/16011537?co=GENIE.Platform%3DAndroid&hl=en documents image and file/PDF inputs. No archive-ingestion capability was established.
- https://support.google.com/websearch/answer/17586477 documents downloadable generated documents, spreadsheets and presentations from AI Mode. This makes original-file receipt a relevant route, but availability and effort on this account/device have not been exercised.

No attempt was made to evade the previously observed Google unusual-traffic block.

## Executed implementation checks

Ten tests pass, including baseline regression, multi-megabyte Unicode text with repeated field names, binary fidelity, duplicate filenames, file hashes, rejecting empty/oversized/excessive-file parcels, and distinguishing links from text evidence. HTML and archives stay opaque. The build succeeds.

Browser and publication results follow after the actual run.

## Smallest remaining human observation

Open the published intake, install it in Android Chrome, select a short passage of an AI Mode reply, and use the selection menu's Share action to choose AstralBridge Intake. The resulting receipt should contain the selected text, not just a URL. If selection Share or the receiver is absent, that is evidence to stop or replace this route, not a request for the human to debug it.

The application's installation and this real app-to-app action are unavailable to the operator's desktop cloud browser. There is no need for another ten-turn narrative run before this capability check.
