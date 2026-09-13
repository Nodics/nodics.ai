# Editorial

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

Editorial is the WCMS-owned backend capability for News, Blog, and future governed article types. It owns authoring records, localization, authors, taxonomy, series, corrections, validation, and readiness evidence.

Phases 0–7 add Process-owned review, nPublish orchestration, Cron-backed scheduling metadata, immutable Online projections, bounded delivery, discovery hooks, and standard Nexus renderer contracts while preserving each owning authority.

Authoring endpoints include validation, readiness, workflow submission/inspection, scheduling, and withdrawal. Public delivery includes bounded listing, detail, structured projection, RSS, and sitemap routes. Validation and readiness remain side-effect free.

Editorial owns editorial truth and readiness. Process owns workflow execution and task state. CMS owns page/component composition, Media owns binaries, and Nexus owns customer-facing renderer implementations.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
