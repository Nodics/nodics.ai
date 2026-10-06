# Recorded Manual Refresh

Canonical user/admin/API/customization and recovery guide:
[Recorded Manual Knowledge Refresh](../../../../../nodics.docs/docs/pages/nodics.copilot/recorded-manual-refresh.md).

Knowledge owns employee admission, current source policy and explicit assignment.
Process owns start identity, idempotency and recorded attempts. Default-disabled
`workflowRefresh.manualEnabled` blocks the old synchronous endpoint when enabled.
Review is non-mutating; start is one nService dispatch. Service callback authority
is independently verified; employee permissions never become service credentials.

Stable original identity binds verified scope, employee, source and UUID, excluding
mutable version/policy. Inspection filters the exact original instance, rechecks
current access and never claims/retries. Missing evidence remains unknown.
Late failures cannot imply no effects; no automatic fallback or new command.
The manual gate does not govern read-only inspection. Legacy runs are not backfilled.

Run `copilotKnowledgeEventRefresh.test.js`, `copilotKnowledgeStudio.test.js`,
Process `processRemoteActionInspection.test.js` and Axis manual/Studio/history
tests. The event and manual paths share strict canonical Process acknowledgement
validation, including outer/nested negative acknowledgements.
