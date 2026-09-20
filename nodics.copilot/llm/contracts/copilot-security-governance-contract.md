# Copilot Security Governance Contract

This contract is mandatory for every Nodics Copilot knowledge source, channel,
conversation, provider request, capability, tool, export, confirmation, and
execution path. Implementations must fail closed when identity, classification,
scope, permission, or policy cannot be resolved.

## Non-Negotiable Rule

The model may interpret intent and propose a response or action. It must never
decide identity, visibility, authorization, tenant scope, permitted fields, or
whether an operation may execute. Those decisions belong to deterministic
Nodics policy and the secured owning domain API.

Prompt text, retrieved content, model output, user confirmation, provider tool
selection, and conversation history are untrusted inputs. None can grant or
expand authority.

## Enforcement Sequence

Every request must pass through this order:

1. resolve the authenticated or anonymous principal and channel;
2. construct an immutable security context from trusted Nodics state;
3. resolve the permitted capability profile;
4. restrict knowledge retrieval before any content enters model context;
5. restrict the provider-visible tool catalogue before model invocation;
6. authorize every selected operation again at invocation time;
7. enforce tenant, ownership, record, field, volume, and purpose boundaries;
8. sanitize the response, citations, diagnostics, and downloadable artifacts;
9. write an immutable security and operation audit record.

Post-generation redaction is defence in depth only. It is never a substitute
for retrieval-time and execution-time enforcement.

## Channel Capability Profiles

### Public Nexus

Anonymous or public Nexus sessions may receive only explicitly published,
Online, public knowledge and explicitly public read-only capabilities. They
must not receive internal documentation, `AGENTS.md`, source code, project
memory, private customer-project material, database records, employees, users,
roles, permissions, logs, imports, exports, runtime configuration, secrets, or
administrative operations.

Public sessions must never receive create, update, delete, publish, import,
export, configuration, administrative, or arbitrary query tools. A prompt
requesting such access must produce a bounded denial or safe sign-in/handoff
journey without revealing whether protected records exist.

### Authenticated Nexus Customer

An authenticated customer may receive public knowledge plus data and actions
explicitly authorized for that customer identity, enterprise relationship, and
tenant context. Authentication alone does not grant BackOffice, employee,
operator, engineering, or cross-customer access.

### Axis Employee

An Axis employee receives only capabilities derived from the current employee
identity, tenant, enterprise relationship, groups, roles, permission codes,
environment, active modules, source classification, and field policy. Axis
authentication does not imply administrator authority.

Administrative access must remain permission-specific. There is no universal
Copilot super-tool or unrestricted provider profile.

### System And Service Identities

Background indexing, evaluation, and maintenance identities must have explicit
service permissions, bounded source registrations, and auditable purpose. They
must not reuse an end-user token or silently convert service authority into
user-visible data.

## Knowledge Classification And Retrieval

Every ingested source and retrievable chunk must carry provenance and effective
security metadata sufficient to enforce access before retrieval. At minimum:

- repository, project, module, path, version or commit, content digest, and
  source owner;
- classification: `PUBLIC`, `CUSTOMER`, `INTERNAL`, or `RESTRICTED`;
- lifecycle/publication state where applicable;
- tenant, enterprise, customer-project, environment, and channel scope where
  applicable;
- required roles, groups, and permissions;
- sensitive-data and secret-detection state;
- ingestion time, effective time, and retirement state.

Absence, invalidity, or conflict in required security metadata must exclude the
source from retrieval.

Default classifications are conservative:

| Source | Default classification and rule |
| --- | --- |
| Published Online Nexus documentation/site content | `PUBLIC`, only when the owning publication contract explicitly marks it public |
| Axis documentation | `INTERNAL` unless an owning content policy grants narrower authenticated access |
| Framework and module `README.md` | `INTERNAL` |
| `AGENTS.md`, LLM contracts, source code, tests, and curated engineering memory | `RESTRICTED` |
| Customer-project documentation and source | customer/project scoped; never cross-project by default |
| Database records, logs, import/export records, and operational state | not ordinary corpus content; access through governed capabilities |
| Secrets and resolved credentials | prohibited from ingestion, prompts, responses, citations, logs, events, and audits |

Search or vector infrastructure is a derived projection, not authorization
authority. Every query must apply the current security context. Cache keys must
include all visibility dimensions, and results must never be reused across
principals, tenants, customers, projects, channels, or permission sets unless a
formally equivalent public scope is proven.

Retrieved content is untrusted data. Instructions embedded in documentation,
repositories, records, logs, media, or web content must not alter system policy,
tool authorization, provider configuration, or execution rules.

## Capability And Tool Governance

Every capability must declare a stable operation identity, owning module,
classification, mutation flag, required permission, accepted argument schema,
tenant and ownership behavior, result-field allowlist, size limits, audit
policy, and implementation maturity.

The capability service must construct a least-privilege tool catalogue for the
current security context before calling the provider. Unauthorized tools must
be absent, not merely described as forbidden in a prompt.

Every tool invocation must independently re-resolve and verify:

- principal and credential validity;
- channel and capability profile;
- operation permission and current module availability;
- tenant and enterprise relationship;
- target record visibility and current state;
- allowed input and result fields;
- request limits, export limits, and policy conditions.

All business reads and mutations must use the owning secured Nodics API or
loader-visible service. Copilot must not use raw database drivers, direct model
persistence, filesystem scanning, or provider-generated URLs as bypasses.

## Read, Export, And Mutation Separation

Risk classes must be explicit and independently authorized, including at least:

- `PUBLIC_READ`;
- `AUTHENTICATED_SELF_READ`;
- `INTERNAL_READ`;
- `SENSITIVE_READ`;
- `EXPORT`;
- `CREATE`;
- `UPDATE`;
- `DELETE`;
- `ADMINISTRATIVE`.

Read permission does not imply export permission. Export permission does not
imply broader row or field visibility. Export generation must reapply the
authorized query, field allowlist, tenant scope, row/size limits, retention,
download authorization, and audit policy. Download references must be bounded
and short-lived where files are persisted.

Mutations must follow:

`clarify -> prepare -> validate -> preview -> confirm -> authorize -> execute -> audit`

Confirmation proves user intent only; it does not grant permission. The
execution boundary must reauthorize the current principal and target after
confirmation, validate an immutable argument digest and revision, claim the
execution atomically, and avoid automatic replay when the outcome is uncertain.

## Provider And Conversation Isolation

Provider switching must not alter security behavior. Every adapter receives
only the already-authorized, minimized prompt context and permitted tool
catalogue. Provider credentials come only from the runtime secret resolver.

Conversation history, summaries, embeddings, events, evaluations, caches, and
usage records must retain their security scope. They must not be shared across
users, tenants, customer projects, or channels. A later permission change must
affect future retrieval and execution; old conversation text must not be used
to recover newly unauthorized information.

Diagnostics must record identifiers and reason codes without prompt bodies,
secret values, sensitive field values, or unrestricted provider payloads by
default.

## Required Denial Behaviour

Denied responses must be safe and non-enumerating. They may explain the
required general capability or sign-in path, but must not disclose protected
record existence, counts, identifiers, source paths, permission topology, or
hidden tool definitions.

Security failures must use stable Nodics status definitions and auditable
reason codes. Implementations must distinguish authentication failure,
authorization denial, unavailable capability, invalid scope, confirmation
failure, and provider failure without leaking sensitive internals.

## Mandatory Verification

No capability is complete without tests proving both allowed and denied paths.
Coverage must include:

- anonymous Nexus public documentation success;
- anonymous access to internal knowledge, employee/user/customer data, export,
  and every mutation class denied before provider/tool execution;
- authenticated customer self-access success and cross-customer/cross-tenant
  denial;
- Axis permission-specific success and denial, including non-admin employees;
- field-level filtering and result-size limits;
- retrieval exclusion for missing, conflicting, private, retired, or
  unpublished classifications;
- prompt injection in user input and retrieved content cannot expose sources or
  add tools;
- confirmation cannot elevate permission and reauthorization occurs at
  execution time;
- cache, conversation, citation, export, and evaluation isolation;
- provider adapters receive equivalent bounded context and tool catalogues;
- audit evidence exists for reads, denials, exports, confirmations, mutations,
  and uncertain outcomes without containing secrets.

Tests must assert that forbidden retrieval and tool invocation did not occur,
not only that the final response omitted sensitive text.

## Implementation Gate

Before implementing or enabling any Copilot source, capability, tool, channel,
export, or action, the change must document:

1. the identities and channels in scope;
2. source classification and publication rules;
3. required permissions and risk class;
4. tenant, enterprise, customer, project, record, and field boundaries;
5. retrieval-time, tool-catalogue-time, and execution-time enforcement points;
6. audit, retention, cache, conversation, export, and provider-data handling;
7. allowed and denied acceptance tests;
8. the owning Nodics API and why no parallel authority is introduced.

If any item is unresolved, the implementation must remain disabled or
proposal-only. A customer, environment, server, node, or provider override may
make policy stricter but must not weaken these invariants.

## One conversation API enablement choice

`copilot.api.enabled` is the explicit conversation API opt-in and defaults to false. The selected `copilotApi` capability owns its `copilotApi` exposure category; an advanced nRouter category deny still blocks access. `copilot.enabled` and `copilot.core.enabled` are retired ambiguous switches and the orchestration entry rejects their presence. Remove them from later overlays when migrating. Provider enablement, qualified credentials and knowledge-source selection remain separate controls; internal knowledge/provider compositions do not activate the conversation API. Group-level descriptive guardrail values are retired; actual Policy, Workbench, Provider and Knowledge consumers retain their owning limits.

Knowledge source `definitions` and nested `paths` use explicit nConfig replacement or keyed changes. A shorter list must never inherit additional repository sources or filename patterns unintentionally. Replacing with `[]` selects none; keyed removal/disable retains explicit source identity, scope and permission checks. The standard framework root comes from nConfig's trusted path context, never a sibling-directory assumption.
