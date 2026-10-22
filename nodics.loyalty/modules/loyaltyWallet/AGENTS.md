# loyaltyWallet

Every auction funds refusal emitted as `ERR_LOYALTY_AUCTION_*` must retain its
HTTP code and message in this owner's `src/utils/statusDefinitions.js`.
Keep error vocabulary separate from lifecycle enums and configurable policy.
Stable Wallet lifecycle vocabulary belongs in `src/utils/enums.js`; consume the
loaded `ENUMS` registry without changing wire keys or treating extensions as
transition permission. Core wallet, ledger and reservation vocabulary remains
owned by loyaltyCore. Isolated tests load the actual definitions.

Read-evidence helpers are mergeable exported methods and dispatch through `this`.
Admission itself stays private: an active asynchronous public invocation and its
exact WeakMap context are required across every generated read. Direct helper
calls, copied contexts and continuations after completion cannot mint authority.
Document method inputs, results, effects/failures and override constraints.
The focused auction suite checks the complete emitted refusal set.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Own wallet and per-reward balance contracts. Wallet owner identity must remain `ownerType` plus `ownerCode`; do not add tenant or enterprise fields as ordinary wallet data.

Participant transfers use Profile identity and exact recipient revalidation with
the original bearer. Never expose the private service transfer endpoint to a
customer or fabricate service credentials to pass its admission. Reuse `settle`
after owner authorization, inside qualified transaction composition with usage
and receipt writes. Limits aggregate by owner/program/type, not employee.
Follow [participant transfers](llm/contracts/participant-transfers.md) and
[partner conversion](llm/contracts/partner-reward-conversion.md). Protected external
holds require the coordinator's private in-process admission and never clock-expire.
Property definitions/defaults belong only in implementing framework properties;
persist business selections separately and accept only override values downstream.
Resolve amount operations through `SERVICE.DefaultLoyaltyAmountService`, not a raw
owner-file import, so registered amount customizations apply consistently.
Notification RPC response bounds belong to `loyalty.transferNotifications.maxResponseBytes`
in Wallet properties; validate a positive safe integer and never replace it inline.
Keep original participant credentials and signed aliases intact; runtime-token RPCs
must let canonical transport select its own credential namespace.

Axis participation metadata and CMS copy are presentation only. Keep exact
`loyalty.participation` bindings and LoyaltyAPI operation routes aligned with the
renderer. Native availability never grants permissions or enables transactions
or test funding. Settings display owner-effective defaults; credit recovery
retains complete original intent and key. See [Axis participation](llm/contracts/axis-participation.md).

Reviewed sample credits use the actual selected environment allowlist and exact
deployment approval pins, not a hardcoded Local class. Defaults stay inert;
explicit non-Local demo selection never grants real funding authority. Preserve
the historical `localDemoOnly` replay metadata. Retain exact source/intent, human permission and
original-balance guards. Qualify real identical schema database wrappers before
record reads; fix inherited registration in nDatabase, never weaken transaction
identity in Loyalty. Diagnostic blockers allow only fixed gates and the three
fixed participant schema names. See `llm/contracts/sample-credit-admission.md`.

Protected wallet evidence may omit `walletCode` only to select one exact existing
CUSTOMER or ENTERPRISE owner with required ownerType/ownerCode/program/reward
selectors. Keep wallet ownership distinct from signed runtime and business
enterprise scopes; reject customerCode aliases and same-code/different-type
substitution. Preserve explicit
code mode, bounded ambiguity detection, verified read partition and original
caller credentials. Never call wallet open/projection or derive a wallet code for
this read. Missing, closed, inactive, foreign and ambiguous wallets must refuse
without creating records. See `llm/contracts/README.md` and loyaltyApi evidence tests.

Participant transfer persistence records must include the framework base record
fields before generated writes. Native acceptance uses only an explicit
credential-free loopback replica set and must prove one concurrent settlement,
atomic rollback, durable replay, limits and fees without direct database seeds.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.

Advanced `specialAccessGroups` and `specialAccessRoles` definitions are owner data.
Keep them separate from ordinary business access levels. Assignments and exact
approval/source/deployment pins stay with the consuming project; these roles
never waive owner admission or activate operations.
