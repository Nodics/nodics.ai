# copilotApi

The explicit `copilotApi:knowledgeRefreshWorkflow` data contribution installs the
Process-owned refresh graph on the PROCESS destination through nImport. The
module-owned remote declaration requires private attempt recording. Neither
contribution enables the action, grants source access or provisions schedules.
Follow the Knowledge [setup guide](../copilotKnowledge/llm/examples/process-backed-refresh.md)
for topology overrides, assignments and separate deployment acceptance.

`POST /activity/:conversationCode/transcript` delegates a purpose-bound sensitive
read under `copilot.activity.transcript.read`; the conversation owner additionally
requires activity permission, enterprise scope and durable access audit. See the
[inspection guide](../copilotConversation/llm/examples/audited-transcript-inspection.md).

`POST /providers/check` delegates an explicit readiness probe with an empty body
or configured adapter selection to the provider owner under
`copilot.provider.check`; it accepts no URL, model or secret
override. `GET /usage` supports bounded historical periods and unresolved-call
queue pagination. See the [history and readiness guide](../copilotProviders/modules/copilotProvider/llm/examples/historical-usage-and-provider-checks.md).
`GET /activity` accepts exact metadata and updated-time filters; it does not
grant transcript access or search conversation content.

Usage inspection uses secured `GET /usage` and `GET /usage/call`.
Evidence-backed reconciliation uses `POST /usage/reconciliation/preview` and
`POST /usage/reconciliation`, with an independent reconciliation grant and
owner-enforced read/scope checks. No receipt-write or token-count override route
is exposed. See the [provider-owned recovery guide](../copilotProviders/modules/copilotProvider/llm/examples/usage-insights-and-reconciliation.md).

Secured Copilot HTTP and streaming API boundary for Axis and future channels.

Configured route names are unique across this module, including across groups.
Groups do not namespace nRouter's live route registry. See the
[registered route contract](llm/contracts/README.md#registered-route-identity)
and HTTP dispatch regression before adding or overriding a route. Public URLs
remain stable; rebuild selected runtimes after changing route declarations.

The current employee API exposes owned conversation history and replay,
turn submission and cancellation, governed knowledge status/refresh, product
plan preparation, and confirmation get/approve/reject/execute operations. Each
route declares a specific Copilot permission. Axis renders structured citation,
usage, export, clarification, and confirmation events; it does not infer
authorization or execute a mutation directly.

The module-owned conversation entry is grouped under **AI & Copilot** and named
**Copilot Conversation**. Its existing `/assistant` route and permission contract
are unchanged. The separate `/copilot` Workspace and secured `GET /workspace`
projection require `copilot.assistant.read`. Refresh authorized BackOffice
discovery after deploying the capability change. No unsupported administration
pages are advertised. See the
[Workspace guide](../copilotCore/llm/examples/workspace-operations.md).

Knowledge Studio is the separate authorized `copilot.knowledge/sources` native
binding at `/copilot/knowledge`. `GET /knowledge/sources` supplies scoped metadata;
`POST /knowledge/sources/:sourceCode/preview` prepares read-only ingestion counts.
Preview and refresh require current source visibility in addition to management
permission. See the [source guide](../copilotKnowledge/llm/examples/knowledge-studio.md).

`POST /knowledge/sources/:sourceCode/cleanup/preview` and
`POST /knowledge/sources/:sourceCode/cleanup` require the independent
`copilot.knowledge.cleanup.execute` grant plus current source-management authority.
The first reviews published-origin cleanup debt; the second requires explicit
confirmation bound to that source policy, index routing, employee and revision.
Both are uncached. Private audit persistence must acknowledge authorization
before deletion. Neither endpoint abandons writers or accepts index predicates.
See [reviewed cleanup](../copilotKnowledge/llm/examples/reviewed-cleanup.md).

## Governed Administration And Sensitive Reads

The service-only `POST /workflow/actions/refreshKnowledge` accepts an opaque
Process instance/execution handle. It does not accept source paths or user grants.
Read [Process-backed refresh](../copilotKnowledge/llm/examples/process-backed-refresh.md)
for explicit source/definition authorization, setup and failure semantics.

`GET /administration`, `GET /administration/history`,
`POST /administration/preview` and `POST /administration/requests` expose safe
effective fields and nDynamo proposals, not direct activation. The Settings native
binding is `copilot.administration/overview`. Read the
[administration guide](../copilotPolicy/llm/examples/governed-administration.md).

`POST /activity/search` requires separate content-search and transcript grants
and records a durable sensitive-access receipt before content access.
`GET /activity/retention` provides separately authorized metadata-only lifecycle
review with no deletion. Read the Conversation guides for
[search](../copilotConversation/llm/examples/recorded-content-search.md) and
[retention](../copilotConversation/llm/examples/retention-and-holds.md).

Separately authorized sensitive employee POSTs at
`/activity/:conversationCode/retention/{preview,begin,inspect,advance,stop}`
delegate explicit bounded lifecycle work to Conversation. They require the
independent lifecycle.execute grant, preserve trusted route/actor context and
never retry commands or expose generic persistence. Read the
[execution and recovery guide](../copilotConversation/llm/examples/bounded-retention-execution.md)
before enabling its default-disabled deployment gates.

`GET /knowledge/sources/:sourceCode/collections` and
`POST /knowledge/sources/:sourceCode/query` delegate bounded live data access to
owning schema APIs with original employee credentials.
`POST /knowledge/sources/:sourceCode/incidents` delegates scoped, redacted,
audited evidence to a registered Discovery provider; no external lake is deployed.
`POST /enterprises/prepare` prepares the explicit Profile enterprise/invitation
command. Existing confirmation routes handle its review and execution. See the
[enterprise guide](../copilotWorkbench/llm/examples/enterprise-invitations.md).

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
