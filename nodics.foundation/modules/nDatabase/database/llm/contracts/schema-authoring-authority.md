# Schema Authoring Authority

The effective schema's existing `backoffice` metadata is the source of generic
authoring eligibility. `DefaultSchemaAuthoringPolicyService` resolves it against
the server-owned `runtimeRole.publication`; it does not discover server names,
inspect technical counters, or create publication states.

- `mutationPolicy.publishRequired: true`, `mutationPolicy.lifecycle: 'PUBLISHABLE'`,
  `backoffice.lifecycle: 'PUBLISHABLE'`, or `mutationMode: 'PUBLISHABLE'` requires
  `runtimeRole.publication: 'STAGED'` for generic mutations.
- `mutationMode: 'READ_ONLY'` denies generic mutations on every runtime.
- Optional `mutationPolicy.allowedStages` is a nonempty, unique array drawn only
  from `STAGED`, `ONLINE`, `OPERATIONAL`. It intersects the other restrictions.
  Invalid declarations fail closed; absent or unknown runtime context cannot
  satisfy a declared stage restriction. Body-supplied policy never changes it.
  A Staged-only reference schema may use `allowedStages: ['STAGED']` without a
  publishable marker. Reference classification is appropriate only when the data
  governs authoring and has no published-content lifecycle. It is not a shortcut
  for editing Online content or removing approval.
- Other schemas keep existing operation permissions, ownership, versioning,
  concurrency, and domain behavior. A version-aware operational schema is not
  automatically publishable.
- Workbench descriptors project `authoring.publishRequired`, `stage`, and
  `authoringAllowed`. Non-authoring descriptors retain read/search but no write,
  bulk, or aggregate commands. Nested forms use the target's effective operations.
- The generated HTTP controller checks the compiled schema name and route-owned
  module before merging request-body values. No request flag grants a bypass.
- This is a generic-authoring boundary, not a ban on owning service calls.
  Publication providers and approved import workflows still use their existing
  generated services; their own authentication/lifecycle contracts remain mandatory.
  The generated save and update access checks may accept an active nImport
  Staged source write proof. The proof is limited to one sealed release operation,
  one effective owner schema, one tenant and an existing declared writer group.
  Record ownership and validation still run.
- Axis hides non-Staged copies of publishable sources in the default catalogue,
  including deep-link selection. It must not silently use another connection if
  the selected instance disappears.
- Do not call raw Online authoring records Published. CMS/Editorial active
  snapshots and Product search projections have distinct schemas and visibility.

## Project Customization

Contribute this fragment in the owning project's `src/schemas/schemas.js`:

```js
module.exports = { projectCatalogue: { promotionCopy: {
    backoffice: {
        mutationPolicy: { lifecycle: 'PUBLISHABLE', publishRequired: true }
    }
} } };
```

Use the project's existing environment contribution to set
`runtimeRole: { code: 'PROJECT_STAGED', publication: 'STAGED' }`. Never accept it
from a browser. Mark derived publication schemas with
`backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] }`.
These declarations do not implement a publishing workflow; wire the owning
nPublish adapter/version provider before promising a live Published view.

If redefining a genuinely operational schema, remove all inherited publication
markers through the existing schema layering rules, document its owning writer,
and test the resulting effective descriptor. Removing a marker merely to write
live published content is not a supported customization.

Editorial content-type policy uses this reference distinction: its declared
REFERENCE foundation installs through normal nImport only on Staged. Articles,
localized copy and publication projections retain their existing publication
guards. The import owner consumes the same effective authoring policy; stage
restrictions also apply to its narrowly declared read-only Staged-source import
exception. No reference-policy declaration grants schema access or mutates an
installed receipt.

Verify `schemaAuthoringAuthorityContract.test.js`, `schemaWorkbenchContract.test.js`,
domain publication tests, and Axis renderer/client tests. Include missing role,
Online, operational, Staged, read-only projection, body spoofing, callback and
promise APIs, bulk/aggregate denial, missing Staged, and reference editing cases.

## Explicit operation restrictions and transport scope

Generated mutation controllers resolve the active schema owner from the trusted
route module before checking the compiled schema. If `backoffice.operations` is
an explicit list, a create/update/delete absent from that list is denied before
body mapping or persistence. Preserve the declared business create operation and
the existing Staged/read-only rules. `backoffice.enabled: false` remains metadata
discovery exclusion; it does not invent an additional generic write policy.

The controller maps only operation data, never body-supplied auth, tenant,
enterprise, module/schema identity, transaction authority or trace context.
Utility-owned model normalization applies the effective field contract; generated
pipelines retain schema access, property policy, ownership, references and CAS.
HTTP authoring gates do not remove authorized internal import/domain operations.
