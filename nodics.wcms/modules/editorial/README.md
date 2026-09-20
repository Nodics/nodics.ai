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

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Remote workflow callbacks accept only scoped Workflow runtime credentials and opaque execution handles. Claim the current action from Process before using its context; never accept caller-supplied decisions. Editorial enforces exact revision/instance correlation, optimistic decision mutation and publication through nPublish. Human authoring permissions stay on the existing authoring APIs. See `llm/contracts/README.md`.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.
