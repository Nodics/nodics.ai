# Governed Human Task Commands

Follow the [operator and customization guide](../../data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js).

`DefaultCopilotProcessTaskActionService` owns bounded preparation and fixed-route
dispatch for `process.task.claim`, `.assign`, `.complete` and `.cancel`. Reuse
Workbench persistence, policy approval and ActionExecution; Core dispatches only
these fixed capabilities. Workflow retains native permissions, task actor policy,
state changes, audit and advancement. It records original acknowledgements through
the nDatabase receipt protocol; never infer completion from current task state.

Set `copilot.workbench.processTaskTarget` through existing layered properties and
native `commandReceipts.owners.workflow` only in explicitly selected deployments.
Inspection admission is independent and cannot be request-selected to enable writes.
Use exact employee identity, reviewed fields and digest-bound routing. Typed and
short-form task turns are model-free. The optional existing intent planner accepts
literal input only and never guesses an approval boolean.

Run Workbench Process action/recovery tests, Core intent planning, Workflow task
transition/actor-policy tests and the opt-in Process task runtime acceptance.
Later-layer input/routing changes must retain denied, uncertain, duplicate and
foreign-scope cases. This adapter does not expose arbitrary Process operations or
all nested domain decision schemas.
