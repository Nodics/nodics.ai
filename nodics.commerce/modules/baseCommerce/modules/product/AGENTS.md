# Product Agent Contract

Publication publishers do not receive generic catalogue CRUD. The graph owner
keeps membership capability minting and its WeakMap private: only verified-root
capture/resolve may construct tokens. A private security-only object is justified
here; never export its factory to satisfy mergeable source style. Pure
`referenceKey` customization uses the effective service receiver and must retain
all schema/code/version/hash coordinates. Preserve the forged/copied-token and
effective-helper regressions in the publisher admission suite.
The graph owner
checks authenticated Staged tenant/enterprise and `commerce.product.publish`,
then uses canonical local persistence authority only for scoped graph reads and
the membership-only seal update. Roots require the signed enterprise. Neutral
dependencies require a private verified-root membership context, exact parent
links/category ancestry or sealed references, and matching tenant. Never treat
explicit foreign/null/empty enterprise values as neutral. Reject foreign or
unrelated roots/dependencies before that write; retain the real caller for nPublish. Run
`test/productPublicationPublisherAdmission.test.js` after changing this boundary.

Governed Product publication uses `DefaultProductPublicationGraphService`, the
nPublish adapter/version provider, and `DefaultProductPublicationTargetService`.
Read [the exact graph and activation contract](llm/contracts/README.md#exact-product-graph-and-activation)
before registration. Source selection requires qualified versioned CURRENT
models; do not enable `publishEnabled` or schema version flags as a shortcut.
Target manifests/pointers reuse generated managed-revision persistence, not a
second approval lifecycle. Registration and secured cross-runtime transport are
still integration gates. Legacy projection APIs are not governed activation.

Own the complete Product publication acceptance suite and customer-safe delivery
assertions here. Customer fixtures select catalogues and exact approved publication
evidence; they never redefine invariants. Never call internal Online restore or
Media asset import from operator acceptance, mint service tokens, change grants,
or treat missing domain lifecycle adapters as permission to bypass governance.
See the acceptance prerequisite contract in `llm/contracts/README.md`.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Product owns shared Product, Category, Variant/SKU identity, localized catalogue records,
publication evidence, and Product search projections. It must not absorb Pricing, Tax,
Inventory, Fulfillment, Media asset lifecycle, nImport/nExport transport, nSearch provider,
or nCache provider authority.

Preserve tenant/Product/Store/locale isolation, mandatory-locale readiness, deterministic
projection evidence, compensation on partial indexing failure, auditable rollback, bounded
bulk validation, and generation discipline. Axis may preview and operate these contracts but
must not reproduce publication rules or persist catalogue truth in the browser.

Internal digital availability resolves pinned search identities through
`DefaultProductSearchEnrichmentService.retainedProjections`; indexed payloads may
omit enterprise scope and digital classification. Preserve retained code, scope,
status, publication version and source-hash checks before using catalogue data.
Live customer availability partitions those retained projections: physical SKUs
use one Inventory summary batch; digital offers use DigitalCore's internal
`availabilityFromProjection` once per distinct Product. Never call its pinned
`availability` reader from enrichment or return coupon pool identifiers/counts.
Missing or failed digital owners reject without warehouse/index fallback.
Only DigitalCore's ERR_DIGITAL_AVAILABILITY_METADATA is contained per item in
customer summaries as false/OUT_OF_STOCK. Cart still rejects that malformed
classification; never infer ownership from saleMode or swallow owner/scope faults.
Digital handoff preserves the original access context, before catalogue-derived
enterprise augmentation and without Product's synthetic service identity. A
retained enterprise is catalogue scope, not a signed customer/employee grant.
Anonymous or service callers require their own trusted Promotion admission;
never manufacture that admission from a public Product or request-body flag.
Governed consumer enrichment remains STALE-only; legacy CURRENT publication
snapshots and internal pinned identity reads retain their existing behavior.
Run `test/productDigitalAvailabilityContract.test.js` with governed Product and
DigitalCore Cart availability tests after changes to this owner split.

- Use the existing `schemaOperations` router group and shared `schemaApi` policy;
  do not duplicate schema route declarations in this module. Preserve effective
  source search/read/create/update limits, Staged-only writes and domain publishing.
- Keep generic delete/bulk blocked by the source schema policy. Verify compiled
  transport, grant denial, writable fields and the owning publication tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
