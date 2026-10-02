# Circa Deployment, Operations and Verification

Circa is a multi-owner product experience. Beginners should distinguish backend
readiness, imported reference data, published content/catalogue and frontend health.
A running Vite server proves none of the first three. The business objective of
deployment verification is an understandable, recoverable programme whose customer
and operator journeys agree with saved owner evidence.

## Runtime topology and prerequisites

The reference uses runtime authorities for Platform/Profile, Waste, Location, Media,
Loyalty, Commerce Staged/Commerce, WCMS Staged/Online and Engagement/Communication,
with Process for governed review/publication where required. Follow the chosen
project's runtime descriptors and launch commands; these are deployment-specific,
not a permanent list of universal ports. Backend readiness must work without a
frontend checkout/server. Frontend startup and unavailable/retry UI remain frontend
responsibilities.

The current Circa frontend package uses React, TypeScript and Vite, with Location
map UI and Leaflet/Mapbox dependencies. Its checked-in package and lockfile define
exact supported dependencies; do not substitute remembered newest versions.
Provider credentials are governed secret references. Browser endpoint/CORS settings,
runtime role authority and application/channel bindings must be checked in their
existing owners rather than copied into a second endpoint or authentication registry.

## Prepare data and publish separately

| Gate | Expected evidence | Not sufficient |
| --- | --- | --- |
| Framework/schema readiness | Owner runtimes ready and compatible schema/config | Frontend renders a home shell |
| Reference preparation | Selected release receipt, version/checksum and policy | Files exist on disk |
| Operational allocation | Approved enterprises, employees and centre/store scopes | Shared admin credentials |
| WCMS publication | Approved Online route/page/template/renderer references | Staged page exists |
| Commerce publication | Active published product/price/inventory/promotion projection | Website publication succeeded |
| Transaction acceptance | Order/payment/asset/entitlement/ledger references | Browser success message |
| Notification delivery | Qualified source intent and delivery evidence | HTML/SMS resource exists |

The Circa setup profile prepares maps/Waste policy, local sample profiles/operator
access, collection centres, reward programme, Commerce Staged catalogue and website.
Local sample sections are explicitly scoped. Never use setup replay to refresh
transactional ownership/opening ledgers in an established installation. Inspect
owner inventory and receipts first. Sample data is not production partner approval.

For account composition, the `circa.ewaste:customer-workspace` release contributes
WCMS `/account/waste` and `circa.wasteWorkspace`; install into Staged and publish
through the normal approved route. Do not import old transaction samples merely
because a new customer workspace page is required.

## Development commands and test boundaries

Developers should use the checked-in lockfile and owner test entry points. Keep
API mocks separate from connected acceptance, and record any provider/runtime
assumption a fixture substitutes. A successful mocked interaction does not prove
the installed owner's authorization, persistence acknowledgement or recovery.

From the frontend checkout:

```bash
npm ci
npm run typecheck
npm run build
npm run dev -- --host 127.0.0.1 --port 3600
```

These are documented operator commands, not automatic runtime permission. Installation
and builds can change local artifacts; use the approved project workflow. If the
port is occupied, choose an available one and align browser configuration. The
frontend's `npm run verify` includes behavioral tests/build; do not run it during a
static-only work phase. Docker deployment guidance stays with the frontend's
`docker/README.md`; do not move its lifecycle into backend properties.

Backend adapters use module `npm test` under `circa.ewaste`. Frontend mocked behavior
uses `npm run test`; connected browser scripts include
`test/live/catalogue-browsing.mjs`, `customer-workspace.mjs`,
`customer-journey.mjs` and `reviewed-descriptor.mjs`. Read each script's fixture and
mutation requirements first. Catalogue browsing is designed to cancel purchase
review; a complete customer journey can write real local records. Physical device,
native Telegram and real provider delivery acceptance remain separate.

## Joint acceptance matrix

Cover successful, unauthorized, boundary, interrupted and custom-layer behavior:
registration and session switch; absent/stale location; centre browsing versus arrival;
exact/outside radius; analysis failure/cancellation/replacement; persisted drafts;
confirmation retry; wrong-owner item/media; staff scope and verified overlays;
approval/rejection; partial assessment; original reward evidence; settlement retry;
catalogue publication/filter totals; changed price; insufficient wallet; quantity
limits; partial/uncertain coupon reservation; duplicate sale/redemption; expiry;
wrong outlet; refund policy and original payment reversal; notification retry.

Visual acceptance covers desktop/mobile/navigation, long localized text, keyboard
and touch, loading/empty/stale/error states, private-photo delivery, quick view/detail
return, saved draft resume, purchase terms and token clearing after session change.
Use sanitized screenshots with runtime/version context. A screenshot cannot prove
permission enforcement, physical custody or an external provider's calculation.

## Troubleshooting and recovery

| Symptom | Inspect first | Safe recovery boundary |
| --- | --- | --- |
| Empty Shop despite source products | Store, published catalogue/price/inventory and kind | Correct/review Staged projection; do not add browser fixtures as real data |
| Centre distance appears wrong | Canonical/runtime location plus reported coordinates | Approved Location correction, then fresh arrival check |
| Preparation fails | Photo/provider/assessment contract and retained draft | Retry analysis without creating empty duplicates |
| Approved item lacks rewards | Saved decision and Loyalty settlement reference | Qualified settlement recovery, not reapproval |
| Purchase response uncertain | Checkout/order/payment and reservation checkpoint | Owner inspection under original key, not a new purchase |
| Coupon history stale | Authorized read and current customer session | Read-only refresh; clear revealed token |
| Refund or message incomplete | Original refund/intent, payment and delivery evidence | Qualified recovery; no fabricated completion |

Log correlation/command identifiers and revisions without exposing passwords,
bearers, OTPs, coupon tokens, private photos or unnecessary personal data. Unknown
provenance, conflicting writes and incomplete invalidation should stop success.
Backups and restore need cross-owner receipt/ledger consistency; no universal
Circa rollback API is implied. Use the existing runtime release/rollback process.

## Customize and extend safely

Deployments select actual endpoint/provider/channel differences in project/runtime
layers. A minimal example changes the frontend port and its approved public endpoint
while leaving backend launch ownership independent. Test unavailable backend startup,
CORS/session behavior and correct retry UI. Do not embed backend start commands into
frontend tests as a framework readiness dependency or copy secrets into example data.
Use [customization](circa-customization.md) before changing functional defaults.

## Common mistakes

Calling source-written code accepted; running a mutating browser script against a
non-disposable environment; merging after static checks alone; confusing docs
catalogue ONLINE metadata with published runtime evidence; and treating production
integration requirements as merely test gaps all obscure release risk.

## Verification

Documentation checks are `npm run docs:generate`, `npm run docs:check` and
`npm run validate` in `nodics.docs`, with framework principle/context and scoped
whitespace checks. They do not import or publish this guide. Record authored,
generated/validated, rendered, imported/published and live-accepted states separately.
The ongoing enterprise/coupon batch still has source gaps in delegation, complete
administrator safeguards, commercial authority, rich benefit validation and trusted
notification wiring. Complete those before declaring the whole product qualified.
Release/merge/push requires the separately approved acceptance and Git process.
