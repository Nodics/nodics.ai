# nodics.localization

Standard protected functional-module group for the runtime localization authority. The group root is composition-only and extends `nodics.core`.

The active capability is split into two child boundaries:

- `localizationCore`: locale policy, translation aggregate, override protection, coverage/queue/analytics projections, translation memory/provider ports, import/export, and `nPublish` adapter ownership.
- `localizationApi`: audience-specific runtime bundles and secured BackOffice lifecycle/operations APIs.

CMS, Catalog/Product, and Communication continue to own their localized domain content. Axis is a management client, not translation authority.

Phase 7 repository qualification runs through `npm run qualification:verify`. Phase 8 production acceptance is deliberately separate: `qualification/release-acceptance.json` remains `CONDITIONALLY_READY` until accountable owners attach live-environment evidence and the release authority approves it. The operational procedure is maintained in `nodicsRoot/docs/nodics-localization-operations-and-recovery-runbook.md`.
