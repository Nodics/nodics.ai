# Copilot Workspace

## Available Journey

The personal Workspace is an overview of the signed-in employee's current
enterprise context. It is separate from Conversation. It provides recent
conversation search/resume, recent request outcomes, authorized knowledge status,
model configuration status, and explicit accounting/retention limitations.

This is not an enterprise-wide administrator dashboard. It does not implement
knowledge-group management, provider administration, budget reservations, a
recording toggle, or approval management. Those require their own governed
contracts. The full requirements matrix remains the delivery authority for
unfinished work; the sections here document implemented behavior only.

## Business User Steps

1. Sign in to Axis with a valid enterprise context and `copilot.assistant.read`.
2. Open **AI & Copilot > Copilot Workspace**. Alternatively, open the main Axis
   dashboard and select **Details** in the Copilot summary.
3. Verify the displayed tenant and enterprise. All activity belongs to that
   tenant, employee, and enterprise; an administrator role does not widen this
   personal view.
4. Inspect recent conversations. Search filters the loaded recent window, not
   the complete retained archive. Select **Resume** to open the separate
   Conversation page. The backend rechecks ownership before returning history.
5. Select **New conversation** to open a fresh conversation. This action is
   available only with `copilot.assistant.use` and an authorized Conversation
   navigation entry. Opening the Workspace itself never invokes a model.
6. Select **Refresh** to fetch a new read-only snapshot. During refresh the same
   context's snapshot may remain visible; a context/token/endpoint change hides
   the previous snapshot immediately. Failed reads show recovery rather than
   retaining a success-looking stale result.

## Interpret the Visuals

| Area | What it proves | What it does not prove |
| --- | --- | --- |
| Recent conversations | Number of owned records in the bounded returned window | Total archive size or activity across all employees |
| Recent requests | Turn lifecycle counts within the returned window | Completion or rollback of a business operation |
| Knowledge readiness | Accessible source projection state | Global source/group coverage or permission to refresh |
| Model configuration | The configured selected adapter is enabled | Provider live health, quality, or permission to administer credentials |
| Token allowance unavailable | Accounting has not supplied a supported balance | Zero allowance, zero spend, or unlimited use |
| Recording enabled | Current conversation service retains messages | Configurable recording or a guaranteed retention duration |

A completed conversation turn can contain a clarification or confirmation
request. Only the canonical business owner can establish that a domain action
actually completed. No monetary price is invented for local Ollama.

## Authority and Data Flow

```text
Authorized BackOffice navigation
    -> Axis native binding: copilot.workspace / overview
    -> copilotApi GET /v0/workspace
    -> core API enablement + trusted principal + read permission
    -> Conversation generated services: tenant + principal + enterprise query
    -> bounded records + returned-record ownership recheck
    -> authorized Knowledge status (only with its separate permission)
    -> allowlisted, secret-safe snapshot
    -> typed Axis parser -> Workspace or compact dashboard summary
```

The API returns no prompt bodies, event bodies, provider endpoint, credential,
secret reference, or raw provider error. Titles are owned conversation metadata
derived from earlier messages and can contain sensitive user text; they receive
the same ownership boundary as the conversation. Do not expose them in telemetry,
cross-enterprise notifications, or public caches.

## API and Projection Contract

`GET <copilotApi endpoint>/v0/workspace` is secured, requires `userGroup`,
`copilot.assistant.read`, the `copilotApi` exposure, and `copilot.api.enabled`.
Tenant/principal/enterprise come from the authenticated request, not query/body
selectors. Missing trusted enterprise context is rejected.

The standard success envelope contains `data.contractVersion: 1` and
`data.scope: PERSONAL`. Sections are `context`, `presentation`, `activity`,
`knowledge`, `provider`, `budget`, `recording`, and `actions`. Activity defaults
to 12 conversations and 12 turns. Each durable query asks for at most limit + 1
to detect overflow and includes trusted ownership fields before execution.
Turn queries also restrict conversation codes to the selected owned window.
No message/event query or provider call is needed for the dashboard.

Knowledge metadata uses the same window limit after source authorization.
`knowledge.hasMore` indicates omitted accessible sources; the shown readiness
ratio covers only that window. Unknown request states remain visible as unknown,
not completed or failed. Invalid display timestamps are rejected by the client.

`hasMoreConversations` and `hasMoreTurns` are window-overflow indicators, not
total counts. The frontend rejects unknown contract versions, unsupported scope,
oversized windows, invalid flags, incomplete presentation, and invented balances
on an unavailable-budget response. It rejects an enterprise mismatch against
the current request context.

Navigation is published by `DefaultCopilotBackofficeCapabilityService`:

- `/copilot`: read permission, native Workspace binding.
- `/assistant`: use permission, existing separate Conversation route.

There is no capability-wide use grant prerequisite for read-only navigation;
each navigation item and each endpoint retains its own permission. The browser
does not reconstruct unavailable menu entries or infer an owner from `/copilot`.

## Upgrade and Legacy History

1. Deploy backend schema/service/route changes through the normal Nodics
   generation and runtime lifecycle, then deploy the compatible Axis client.
2. Refresh authenticated BackOffice discovery. A source change alone does not
   establish that a running registry or generated router has reloaded it.
3. New conversation and turn records store the trusted enterprise binding.
4. Existing unbound records are preserved. They are not visible to an
   enterprise-scoped caller and are not silently rebound. Start a new scoped
   conversation for current work.
5. A historical rebind requires a separately reviewed migration with evidence
   of each record's original enterprise and its related records. No automatic
   rebind or raw-database migration is supplied by this implementation.
6. Generic CRUD routes for private conversation, turn, message, event, and action
   schemas are disabled. Generated persistence services remain active for the
   canonical owners. Rebuild deployed router artifacts; do not restore generic
   CRUD exposure to work around an API or migration issue.

Turn idempotency now includes conversation and enterprise, so the same client
key in a different conversation cannot return another conversation's turn.
This is not a new atomic business-operation replay ledger.

## Customize and Extend Safely

Presentation and the bounded window are module-owned configuration under
`copilot.core.workspace`. A later approved layer may supply a delta:

```js
module.exports = {
    copilot: { core: { workspace: {
        maximumRecentRecords: 20,
        presentation: { title: 'AI workspace', subtitle: 'My current enterprise' }
    } } }
};
```

Limits must be integer values from 1 through 100. Keep `workspaceActivity`,
`matchesIdentity`, and `findWorkspaceRecords` in the existing Conversation owner;
focused later service merging must preserve query-time and returned-record
scope checks. Never add frontend balance calculation, an alternate navigation
registry, direct provider fetches, or framework code in a customer kickoff hook.

## Verification and Recovery

Backend acceptance: `npm test --workspace=nodics.copilot`. The owning
`copilotCore/test/copilotWorkspace.test.js` covers enterprise switching,
legacy scope, idempotency boundaries, secret exclusion, permission denial,
bounded windows, and generated-query ownership.

Axis separately owns parser, navigation admission, context-switching, interaction,
responsive renderer, and build tests. Its `test/assistant/workspace.visual.html`
is an isolated synthetic renderer fixture, not a live authenticated Axis page.
Fixture screenshots must be labelled accordingly; they do not prove database,
registry, or router deployment acceptance.

For unavailable knowledge, inspect its owning configuration and source policy;
do not broaden permissions to make a card green. For failed Workspace reads,
check API enablement, current identity, route permission, effective backend
deployment, and generated storage availability. Retrying a snapshot performs
only a GET; it never retries an underlying business mutation.
