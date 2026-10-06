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
Administrative proposals require independent read/manage/admin grants, scoped
delegation and fresh canonical configuration. Bind review to actor, enterprise,
reason and exact runtime preview; recheck at persistence. See
[the guide](../examples/governed-administration.md).
Business-action settings are fixed boolean tenant-runtime proposals available
only to elevated administrators. They cannot be delegated to enterprise editors,
configure owner routes/credentials/journals, or grant native operation permissions.
Enabling new standalone writes requires the corresponding configured Workbench
target; disabling writes must not force the independent recovery gate off.
Re-read effective revision, scope, editability, choices and the fixed patch after
asynchronous preview. Refresh assignment forms never grant runtime authority or
install Process definitions; preserve the exact deployment and active source/group
intersection described in [refresh assignments](../examples/refresh-assignments.md).

Execution callers retain their existing responsibilities:
`copilotKnowledge` before retrieval, `copilotCapability` before tool exposure
and invocation, `copilotWorkbench` before confirmation and mutation,
`copilotApi` before response/export delivery, and the owning domain service at
final execution.

Confirmation contract version 2 includes the enterprise and a digest covering
primary records, related records, preview and execution target. Legacy challenges
cannot authorize mutations. Approval must have a finite future expiry and match
the current tenant, enterprise, actor and complete plan; current execution grants
are checked again. A confirmed flag is never a permission grant.

Focused tests must cover public Nexus, authenticated customer, Axis employee,
administrator, service identity, cross-tenant, cross-project, field-level,
permission-change, prompt-injection, confirmation, export, cache, conversation,
and provider-switching cases. Each denial test must prove the protected source
or operation was never reached.
