# Source-Owned Review Retirement

Owner: workflow. Source available; deployment qualification and behavioral
acceptance remain pending. No customer implementation or second process engine.

`process.runtime.internalRetirements` is disabled by default with an empty
definition allowlist and explicit service permission. POST
`/internal/instances/retire-review` requires signed workflow and source-module
runtime authority in the exact tenant/enterprise, retained owner/version/context,
and an owner-derived stable closureCode. Browser identifiers cannot confer it.

Only a fully started WAITING governed TASK with exactly one instance task is
eligible. Pending remote execution (READY/CLAIMED, expired or not) requires
inspection. Task CAS binds status, assignee, instance and node; completion wins
return DECISION_IN_PROGRESS, never cancel the instance. Cancellation then fences
the WAITING instance and original context/remote marker. A matching own marker
permits uncached lost-ack recovery. A different closure, generic cancellation or
ambiguous read rejects.

This is staged persistence, not an atomic domain/Process transaction. Interrupted
task-only retirement must be reconciled with the same source closure, not a new
command. Private generated hooks reject marker forgery/rename/removal, mutation of
retired records and unbounded (>100) generic mutation reads; ordinary queries gain
an atomic no-retirement marker fence. The owner alone receives transient exact
request-identity admission. Do not bypass hooks using system-looking request data.

Later-layer partial exports may narrow policy, override transport or specialize
source rules. Preserve module owner/context checks, task/instance evidence and
private admission. Deployment selects allowed definitions and runtime permission;
source availability does not grant runtime credentials or activate Workflow.

Profile may request retirement of a retained historical closed attempt using its
original instance/context and unchanged closure identity. Process has no notion
of application history and does not accept attempt selection or new context.
An already completed competing task returns DECISION_IN_PROGRESS read-only, even
if its instance advanced or retained a pending remote action; the source closure
remains authoritative for access, and Process delivery is never stolen.

Task retirement CAS requires absence of prior retirement evidence. Instance CAS
also binds immutable definition/version and completed-start evidence. Generic
updates cannot rewrite execution identity via update operators, perform upserts,
or combine a selector with a replacement code. These fences prevent pre-read
selector evasion; they do not substitute for installed provider/index atomicity.

No expiry sweep or delivery notification is implied. Authored fixtures cover competing completion, lost acknowledgements,
source/scope/context negatives and private persistence admission; execution and
installed-runtime acceptance remain deferred to the joint testing session.
