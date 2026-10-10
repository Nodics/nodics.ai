# nPublish Agent Contract

Bounded application intents follow [coordinated setup](llm/contracts/publication-setup.md).
Keep domain capture, immutable receipts and ordinary Process approval; never add
bundle approval or automatic activation authority.
Setup status is human/access-token and enterprise-bound. Its
[read authority boundary](llm/contracts/publication-setup.md#read-authority-boundary)
does not authorize foreign aggregate observation through a runtime credential.
The separate [exact-plan observer](llm/contracts/setup-observation.md) is disabled
by default: require reviewed deployment/plan authority and the dedicated explicit
permission before any private canonical owner reads. Never modify signed claims,
borrow human identity or expose that internal persistence context to actions.
Commerce publisher group admission is limited to the six human setup/lifecycle
routes in that contract. Keep granular permissions and domain/enterprise checks;
service decisions and activation retain their existing groups and token types.

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

Approval is permission-based, including for the original requesting user.
Shared deployment callbacks retain signed deployment identity; separately bind
the exact claimed business enterprise to the stored publication. Cross-enterprise
use requires the explicit bounded `approvalWorkflow.runtimeEnterpriseScope`
selection. Never derive this authority from an enterprise header or widen human
submission scope; cover absent, malformed and foreign selections.
Native requester binding proves provenance, not separation of users. Reuse
Process authority and preserve scoped identity and immutable decision evidence;
do not add a username-based admin bypass or reinstate self-approval exclusion.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Preserve [publication authority](llm/contracts/publication-authority-contract.md)
  when selecting domain workflows. Before enabling the
  [Process approval bridge](llm/contracts/process-approval-bridge.md), qualify its
  existing-owner prerequisites; isolated tests are not live approval evidence.
- Publication source reads, target deployment, receipts, reconciliation,
  rollback, migration, and verification must use owning Nodics services/APIs
  and generated DAO/provider boundaries. Never use direct database CRUD.
- Preserve the optional `targetReceiptContract: 'v1'` provider contract in
  `llm/contracts/publication-authority-contract.md`. Retain activation identity
  before target work and prefer receipt-backed predecessors on replay. Receipt
  shape validation is not proof of provider-owned target CAS or atomicity.
- FAILED retry and renewed approval must preserve the original activation key
  and predecessor through target receipt replay, including response loss and
  failed completion hooks. Clear it only at a completed-cycle validation boundary,
  never because a failed activation is being approved again.
- Persist absent optional typed fields with the existing generated-service
  `$unset` contract. Keep explicit no-predecessor evidence in receipts/journals;
  do not loosen validators or send BSON null to string/object-only fields.

This capability declares an inert model-service inventory for [governed Local reset](../nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

`publicationRequest` and `publicationAudit` support secured generic read/search
only. Their `backoffice` read-only contract denies generic HTTP mutations;
authoritative lifecycle/repository services retain internal updates. Never let
generic CRUD manufacture approval, Online state or transition evidence. Verify
the existing authority test and lifecycle/atomicity suites when changing this
boundary; a domain retry must read or reuse the existing publication authority.
