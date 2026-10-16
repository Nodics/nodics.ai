# commsApi examples

Use bounded tenant-scoped inputs, correlation and idempotency references, safe outcomes, explicit failures, and deterministic recovery. Never include secrets or complete message content in events or logs.

`test/communicationIntentInspection.test.js` exercises both the unchanged
three-field status inspection and separate safe latest-attempt diagnosis using
the real controller/facade/operations with isolated generated repositories.
No network provider, live database or native runtime is contacted. Coverage
includes exact attempts, absent/unknown evidence, tenant/source/permission and
private-entry denial, concurrent changes, fixed copy and malicious extra fields.
