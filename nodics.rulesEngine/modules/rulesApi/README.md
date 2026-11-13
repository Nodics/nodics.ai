# rulesApi

Owns secured Rules Engine management, simulation and BackOffice API projection. Backend lifecycle and evaluation services remain authoritative.

## Workflow owner routing

`rulesEngine.approval.processTarget` and `actionAuthority` require an explicit
connection and `targetAuthority: { publication: "OPERATIONAL" }`; optional exact
server/environment pins remain inside that object. Defaults supply the neutral
selector, never a connection or activation. Retired runtimeRole fields and
missing/malformed selectors fail before dispatch. The inert Rules action
contribution likewise targets rulesApi/OPERATIONAL and still requires an
explicit Process allowlist and a completed task.

Approval start always uses the existing nService/DMS Workflow module route and
exact POST /instances with the original requester bearer. Loading a local
Process service is not owner admission. Callback claim uses the existing runtime
principal and exact POST /instances/{instanceCode}/actions/claim, binding the
original executionCode, rulesApi.applyDecision and source runtime instance.
No decision payload, new grant, retry fallback, workflow migration or implicit
import is introduced. Existing lifecycle, simulation and maker/checker policy
remain authoritative. Isolated tests prove transport and refusals, not live
workflow adoption.

## Structured authoring contract

Authoring catalogue responses retain catalogue and operators and add inert authoring version 1: canonical operator value shapes, current definition limits, registered outcome fields and normalized input-quality vocabulary. Definition/band details project allowedOperations through the same secured route admission used by commands, with human/tenant separation. Axis consumes this metadata without a parallel authority. The public publishDraft entry refuses direct policy publication; only the verified Process action adapter invokes the lifecycle publisher. Use ruleAuthoringContract.test.js and the Axis structured editor tests; then qualify live draft, simulation, review and immutable readback.

Rules approval contribution 0.0.2 declares Process human actor and decision policy. Rules supplies the authenticated enterprise and requester, and Process projects only the exact rule code and draft revision pinned to the published workflow action. Existing workflow instances retain their version; source installation never rewrites their policy. Axis inspects the owner-held pending revision and immutable simulated score-band version before a decision.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
