# Native Command Receipts

The abstract `commandReceipt` schema and `DefaultModelCommandReceiptService`
provide a bounded private persistence protocol, not domain authorization or a
second mutation dispatcher. Journals belong to the concrete native module.
Admission defaults off through `commandReceipts.enabled` and exact `owners`.

Require the original human/access-token tenant, enterprise and login identity,
stable key, canonical bounded JSON input, current native authorization callback,
private journal metadata and DURABLE_JOURNAL provider qualification. Claim by
durable insert-only identity before invoking the original command once. Any
existing claim forbids dispatch, including completed claims. Record COMPLETED
only after the owner validates its exact original result. Reread completion.
Pass a separate claim object to generated persistence: generated defaults must
not mutate the retained scalar claim predicate used for completion CAS.

No lease stealing, automatic retry, historical record inference or transactional
exactly-once claim is permitted. An ambiguous completion acknowledgement may be
inspected; a native-write/journal-completion crash gap remains OUTCOME_UNKNOWN.
Inspection works with new recording disabled but requires current authority.

Generated single-record create, update, and delete opt in with
`schema.commandReceipt.journalSchema`. The existing generated controller wraps
its original facade operation after canonical field/identity mapping; it does not
add a second dispatcher. Current schema descriptor, operation, write grant,
authoring policy, ownership, validation, references, and concurrency remain
mandatory. Update and delete record COMPLETED only after the native result proves
exactly one affected row. Aggregate form owners are excluded from generic create
and must wrap their own native operation. The generated inspection route accepts
only the fixed operation and exact original normalized input and requires current
authority for that same operation.

An ordinary schema may additionally declare `commandReceipt.insertOnly: true`.
The existing native generated create wrapper then forces generated
`options.insertOnly: true` before facade dispatch, independently of whether
receipt recording is enabled. It never accepts HTTP input to turn this off.
The normal save pipeline retains access, ownership and validation, and its
existing insert primitive rejects duplicate identity, unsupported managed or
versioned models and ambiguous acknowledgement. Provision the native unique
identity index. Internal generated imports are unchanged.
Schemas without the declaration retain existing behavior; this is not a global
change from save/upsert to insert. Waste Collection opts in for collection-point
creation. Product/Pricing keep their native version lifecycle.

After an insert conflict, a started receipt without positive completion remains
OUTCOME_UNKNOWN under the current receipt protocol. Do not infer success from
the pre-existing record, reinterpret it as an update, or retry automatically.
Runtime service variants must retain the shared insert/journal guards described
in [insert-only saves](../examples/insert-only-save.md#qualify-runtime-variants).

See [business operation recovery](../../../../../../nodics.docs/docs/pages/nodics.copilot/original-business-results.md).
Run `test/modelCommandReceipt.test.js`, generated controller/router contracts,
Copilot selected-schema action tests, and provider durable-journal tests after
modifications.
