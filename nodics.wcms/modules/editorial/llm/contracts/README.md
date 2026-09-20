# Editorial contracts

- News and Blog are initial `editorialContentType` records, not runtime modules.
- `editorialArticle` is the aggregate root; localized copy lives in `editorialArticleLocalization`.
- Validation and readiness are side-effect free.
- Process executes workflow and task state; Editorial contributes one allow-listed revision-correlated action adapter.
- Cron remains scheduler authority through Process trigger metadata.
- nPublish owns validation, activation, rollback, and withdrawal transitions; Editorial supplies domain and version adapters.
- Online projections and publication receipts permit secured canonical schema inspection only; their read-only authoring metadata rejects every generated mutation. Public clients continue through sanitized Editorial delivery services.
- Axis discovers authoring workspaces from `DefaultEditorialBackofficeCapabilityService`.
- Nexus renderer keys are allow-listed executable frontend contracts; customer/project data packs own CMS composition records.

## Remote workflow callbacks

`POST /workflow/actions/applyDecision` and `POST /workflow/actions/publishApproved`
are internal operations under `moduleInternal`, service-token authentication and
`authSecurity.internalToken.routePermission`. Human authoring/review APIs keep
their existing employee permissions; a workflow submitter cannot call these
internal callbacks directly.

The callback carries exactly `{ instanceCode, executionCode }`. nAuth's existing
service-token owner checks the verified principal's Workflow capability, tenant
and runtime scope. Editorial uses its own runtime credential through nService to
claim the current action from Process; the Process caller credential is not
forwarded. `editorial.workflow.actionAuthority` owns the default `process`
connection, abstract connection type, PROCESS runtime role and five-second
claim timeout. Deployments override that selection through existing layers.

Only Process's stored claim response supplies the article revision, decision,
actor and node. Editorial loads the actual article and requires exact workflow
correlation. An IN_REVIEW decision uses an optimistic state predicate and stores
Editorial decision evidence for retry. An identical committed decision is not
applied again. Publication loads the actual approved article and calls nPublish;
a published retry reads the existing nPublish state and does not publish again.
Neither a supplied article status nor matching identifiers authorize mutation.

Missing/forged/stale handles, wrong capability/tenant/enterprise/environment,
wrong source runtime, concurrent claims, replay, unapproved publication and
changed article state fail closed. Transport uncertainty is not success; use
Process's existing incident/retry path and the domain's existing commit evidence.
Tests use the real controller, Process lifecycle/claim and domain services with
isolated stores; this evidence does not claim live deployment acceptance.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.
