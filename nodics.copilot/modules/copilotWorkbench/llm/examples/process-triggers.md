# Workflow Trigger Commands

Read the canonical [operator, configuration and customization guide](../../data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js).

The existing Conversation review accepts `process.trigger.create`, `.update`,
`.archive` and `.execute`. These are four fixed Workflow routes, not an arbitrary
API dispatcher. `processTriggerTarget` selects a qualified owner alias;
`processTriggerPresentation` owns review copy and `processTriggerTimeoutMs` owns
the bounded single-attempt transport timeout. Defaults remain disabled.

Create requires explicit identifier, definition, name, type, status and active
choice. Update cannot change the definition/owner. Execute requires explicit new
instance identity and context; it may immediately invoke native domain actions.
Archive is metadata archival only, never Cron removal or instance cancellation.

Do not expose secrets, infer activation, omit nested fields from review, replace
employee credentials with service authority or treat current record state as an
original command receipt. Uncertain operations remain inspection-only after
restart, including when new recording is disabled. Verify default and later-layer
behavior with `copilotProcessTriggerAction.test.js` and separately enabled real
runtime acceptance with `copilotProcessTriggerRuntime.live.test.js`.
