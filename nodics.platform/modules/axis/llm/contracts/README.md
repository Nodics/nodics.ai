# platform/axis Contracts

This folder contains backend Axis-support contracts owned by the Platform
`axis` module.

Add a contract here only for backend-owned Axis data, documentation metadata,
BackOffice capability presentation, bootstrap content, or server/API behavior.
Do not place frontend rendering contracts or browser implementation rules here.

## Shared Composition Configuration

Axis owns its canonical `cms.publication.baselines.axis` descriptor and explicit
`employeeCompositionPaths`. Its `cms.runtimeRoleProfiles.WCMS_ONLINE` references
that descriptor without copying it. WCMS Online deployments must explicitly
discover/select this inert contribution through nConfig's
[server selector contract](../../../../../nodics.foundation/modules/nConfig/llm/contracts/configuration-inheritance-contract.md#explicit-inactive-owner-configuration).
Do not activate Axis services on WCMS or copy Axis policy into CMS/customer
defaults. The Local reference declaration is deployment wiring, not automatic
discovery for every deployment or evidence of Docker runtime qualification.
CMS still requires an authorized human employee and privately reads only the
configured project's Online pointer and pinned static UI manifest. No business
data, Media access, import, publication or grant authority is conferred.

## Initialization transport failures

Axis readiness reads the fixed project baseline using the configured default-tenant
internal credential. Employee tenants do not own separate copies of the Axis
application baseline. Preserve the original human request and route permissions;
browser-supplied tenant or authority fields cannot select that credential.
This rule applies only to status GETs. Initiation retains its original caller
tenant, actor and authorization, and never gains project-wide write authority
from this readiness projection. Missing authority credentials fail closed.

Initialization delegates exclusively through DefaultModuleService. Its typed
temporary transport evidence maps to existing ERR_BOF_00083 (HTTP 503), with
fixed client-safe copy and bounded target code/status/baseline/module metadata.
Circuit-open, network refusal/reset/timeout and remote 502/503/504 are unavailable,
not baseline conflicts. Unknown failures and genuine business rejections retain
ERR_BOF_00085 (HTTP 409); human/route permissions remain independently enforced.
Do not classify by English messages or generic ERR_SYS_00000. Later-layer
transport replacements must preserve the typed evidence contract. This status
mapping never retries initialization, imports, publication or approval.
