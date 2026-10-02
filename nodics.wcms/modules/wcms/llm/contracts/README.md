# wcms AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.wcms/modules/wcms`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Canonical Startup Installation

Required Init installation belongs exclusively to the framework's awaited
`DefaultDataReleaseService.installStartupReleases` call in `initFramework`, before
mandatory bootstrap, credentials, listeners and READY. WCMS `postInit` must not
register another import in the tolerant runtime-lifecycle `ready` phase. Failed
mandatory installation propagates through existing startup cleanup; do not change
generic lifecycle tolerance or introduce a second required phase/registry.

The exported `wcms.importStartupData` compatibility helper delegates only to the
selected canonical release owner. It must not invoke `importInitData` directly,
force CURRENT replays, override destination selection or swallow installer errors.
Legacy `wcmsStartupImport` disable options affect this helper only, not the
framework's mandatory path. Missing canonical owner rejects rather than silently
falling back. Projects customize immutable releases and existing nImport policy,
not startup-body flags or revisions.

`test/axisContentCatalogDataContract.test.js` composes actual framework startup,
WCMS finalization and canonical discovery/installation of the actual Axis Init
sources with offline receipt/import/auth/listener ports. It proves first install,
repeat no-op with unchanged receipts, Online destination rejection, checksum drift,
RUNNING rejection and mandatory failure blocking listeners/READY. It performs no
runtime imports or database writes and is not live acceptance evidence.
