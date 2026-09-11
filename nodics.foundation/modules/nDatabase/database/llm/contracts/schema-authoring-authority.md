# Schema Authoring Authority

The effective schema's existing `backoffice` metadata is the source of generic
authoring eligibility. `DefaultSchemaAuthoringPolicyService` resolves it against
the server-owned `runtimeRole.publication`; it does not discover server names,
inspect technical counters, or create publication states.

- `mutationPolicy.publishRequired: true`, `mutationPolicy.lifecycle: 'PUBLISHABLE'`,
  `backoffice.lifecycle: 'PUBLISHABLE'`, or `mutationMode: 'PUBLISHABLE'` requires
  `runtimeRole.publication: 'STAGED'` for generic mutations.
- `mutationMode: 'READ_ONLY'` denies generic mutations on every runtime.
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

Verify `schemaAuthoringAuthorityContract.test.js`, `schemaWorkbenchContract.test.js`,
domain publication tests, and Axis renderer/client tests. Include missing role,
Online, operational, Staged, read-only projection, body spoofing, callback and
promise APIs, bulk/aggregate denial, missing Staged, and reference editing cases.
