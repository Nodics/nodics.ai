# Module Topology and Transport Contract

## Enterprise Inventory

Enterprise inventory failures retain the canonical held status. Diagnostics may
identify only fixed startup stages: credential issuance, credential verification,
private-context admission, inventory invocation or inventory validation. Never
log upstream errors, credentials or tenant payloads. A failed diagnostic sink
must not replace the original held status or weaken readiness checks.

Default-only enterprise inventory binds the local request and remote
`x-enterprise-code` header to the enterprise in the verified runtime credential.
Forwarding a bearer token alone is insufficient: Profile independently requires
the request enterprise to match its grant. Keep proof-selected tenant inventory
on its separate bootstrap route; do not infer or broaden enterprise authority.

## Module topology registry

Selected Profile namespace provisioning authenticates in the default tenant;
the target is the protected subject of that admission, not a relabelled proof.
After providers, target Init and identity reconciliation, operational completion
requires genuine target-principal authentication and a current target-enterprise
deployment grant. Retain its token only in the target slot. Native Local binding
derivation belongs to Profile's original setup provenance and preserves explicit
overrides; no default bearer fallback or new credential registry is permitted.
Unselected/default startup retains existing token scope.
`DefaultEnterpriseHandlerService.isEnterpriseRuntimeReady` observes the exact
active mapping, absence of in-flight preparation, actual target retained slot
and current namespace enforcement; it grants no execution authority or token
verification. Recovery qualification/admission remain with Profile. See
[the owner contract](../../../../../nodics.platform/modules/profile/llm/contracts/enterprise-tenant-provisioning.md#selected-subject-completion-and-credential-realm)
and `test/tenantNamespaceHandshakeContract.test.js` for actual provider/issuer
composition and rejection coverage. No target credential registry is introduced.

`DefaultModuleService.classifyTransportFailure` classifies native circuit/network
codes and actual remote HTTP 502/503/504 responses without parsing messages.
`fetch` preserves its bounded `{code,httpStatus?}` evidence as
`metadata.transportFailure` after Nodics error normalization replaces native
codes. Classification is independent of retry policy and authorizes no retry,
circuit bypass or write replay. HTTP business/auth responses take precedence;
generic ERR_SYS_00000/500 or matching English text is not outage evidence.
Consumers may map this evidence to their existing unavailable status, retaining
their own business-conflict and permission checks.

Typed remote HTTP refusals retain response-owned `{code,httpStatus}` as
`metadata.remoteHttpFailure`. Construct it only from the parsed response code
and actual HTTP status before `NodicsError.enrich`; never promote an identically
named response-body metadata field. The installed plain-object utility excludes
native Error objects, so normalization can retain an ERR code while defaulting
its responseCode to 500. Consumers requiring actual HTTP evidence must prefer
this bounded transport snapshot, not error text or the status-definition default.
It contains no message, raw response, credential or exception payload and grants
no retry, authorization or write admission.

### Capability-Owned Domain Refusals

`serviceCommunication.circuitBreaker.domainRefusals` defaults to `{}`. A
capability may contribute a logical-module map of exact error codes to numeric
HTTP 400/404 statuses. nImport contributes only `ERR_IMP_00003: 400` and
`ERR_IMP_00004: 404`. `DefaultModuleService.isExpectedDomainRefusal` requires
actual response-owned `remoteHttpFailure` evidence, the resolved logical module,
and an exact configured code/status match. Missing, malformed, foreign-module
or mismatched declarations retain the ordinary circuit penalty. No error text
or response-body metadata can qualify an exemption.

These responses still reject and increment diagnostic `failures` and
`lastFailureAt`; they grant neither replay nor successful business admission.
Repeated expected refusals do not trip the shared module circuit or erase prior
closed-state transport failures. An admitted half-open probe receiving a declared
domain response closes the transport circuit because the owner answered; the
business operation remains failed. A locally open circuit still rejects before
HTTP dispatch and retains its original recovery deadline. HTTP 401/403, 429,
5xx, network faults and timeouts keep existing penalties and retry rules. No
threshold, timeout or rate limit is raised.

Later layers may remove a declaration with `null` or change the exact owner map,
but must not declare authentication, authorization or rate-limit denials as
domain availability evidence. Do not use blanket 4xx exemptions. Offline
`test/moduleDomainRefusalCircuitContract.test.js` composes actual nService and
nImport configuration, the actual fetch owner, NodicsError and installed object
utilities; only HTTP is stubbed. It covers repeated refusals, fault accumulation,
half-open recovery, spoofed body evidence, mismatches and security/transport
failures. This is not live provider qualification.

Circuit-breaker admission rejection is not a remote transport failure. Preserve
the circuit's failure count and original `openedAt` when no request is admitted;
periodic registration attempts must not postpone recovery indefinitely. At the
configured recovery deadline, successful transport closes the circuit and a real
failed probe starts a new interval. Preserve existing diagnostics, identity,
idempotency and layered `serviceCommunication` policy; do not bypass discovery.

- `DefaultModulesConfigurationService` is the singleton authority for effective
  module, server, and node topology in one runtime process.
- `ModuleConfiguration` remains an independently constructed descriptor type;
  it is not the registry authority.
- Registry refresh must validate into an isolated candidate and replace active
  state atomically. Failed refresh must preserve the last valid registry.
- Later modules customize normalization or descriptor creation through exported
  service members, without restoring a `src/lib` container or parallel state.
- Runtime self-registration must use the router's effective module options to
  exclude `remoteOnly` consumers from local leases, authority claims and data
  package claims. Active-module membership alone does not prove local hosting.

Native business workspaces reuse the concrete module capability builder. `nativeWorkspace` projects the same common navigation fields while replacing the schema target with bounded, non-executable workspace/view keys. Ownership remains the publishing module; registration and BackOffice validation remain mandatory.
