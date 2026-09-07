# Copilot Policy Security Enforcement Contract

`copilotPolicy` owns provider-neutral policy decisions and reasoned denials for
Nodics Copilot. It implements the mandatory parent contract at
`../../../../llm/contracts/copilot-security-governance-contract.md`; it does not
replace nAuth, tenant/enterprise authorities, source publication policy, or the
owning domain API's authorization.

The effective policy service must:

- accept only trusted, normalized identity and channel context;
- derive a least-privilege capability profile deterministically;
- return explicit decisions for source retrieval, tool exposure, field access,
  export, confirmation, and execution;
- fail closed on missing, conflicting, stale, or unsupported security context;
- use stable reason codes suitable for audit without leaking protected facts;
- prevent later module, customer, environment, provider, or prompt layers from
  weakening parent security invariants;
- remain independent of the selected LLM provider;
- expose no raw database, filesystem, repository, secret, or network bypass.

Callers remain responsible for enforcing the decision at their boundary:
`copilotKnowledge` before retrieval, `copilotCapability` before tool exposure
and invocation, `copilotWorkbench` before confirmation and mutation,
`copilotApi` before response/export delivery, and the owning domain service at
final execution.

Focused tests must cover public Nexus, authenticated customer, Axis employee,
administrator, service identity, cross-tenant, cross-project, field-level,
permission-change, prompt-injection, confirmation, export, cache, conversation,
and provider-switching cases. Each denial test must prove the protected source
or operation was never reached.
