# nodics.wcms Contracts

This folder contains WCMS-specific AI/developer contracts.

Use root `AGENTS.md`, `nodics.wcms/AGENTS.md`, and
`nodics.foundation/modules/nSetup/llm/contracts` as the primary authority. Add a
local contract only when WCMS introduces durable rules for CMS records,
websites, pages, components, renderer mappings, publication, media, delivery,
or content lifecycle behavior.


## Explicit release contribution composition

WCMS contributes the CMS approval and Media publication workflow sections to their selected Process installer. CMS Online no longer uses an empty role allowance; actual destination ownership and explicit publication admission govern availability.
The group owns ordinary `data.dataReleases.contributions` source selectors,
expressed with `$config: "keyed"`, `key: "moduleName"`, and explicit replacement
of each owner's `sections`. Duplicate source entries from retired role buckets
are combined once. No `runtimeRoleProfiles` fold or role-to-destination map remains.

Source visibility does not activate modules, install releases or grant permissions.
The selected immutable headers and existing nImport destination contract admit
only actual module/schema owners, or the explicitly configured owner installer.
Environment, tenant, lifecycle, publication, prerequisite and permission checks
remain authoritative. Existing manifest selection policies and checksums are
unchanged; this migration does not add startup profile selections or imports.
Later customer layers may narrow/remove sources through the same collection
operators, without copying framework defaults or enabling business capabilities.

The cross-group offline regression is
`nodics.commerce/test/frameworkReleaseContributionComposition.test.js`; it uses
real manifests/headers and isolated destination ports, including wrong-host,
Online denial, collection projection and no-autoimport checks.
