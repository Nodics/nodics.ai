# loyaltyWallet

The [Enterprise capability contract](llm/contracts/enterprise-participation-role.md)
retains settings and partner conversion as internal parent-free employee-safe
groups, never new task-specific roles or profiles. Preserve separate funding, provisioning and
provider/program admission. Never inherit customer groups into employee roles.
Definitions stay insert-only, assignments with Profile, and current
scope/DENY checks remain mandatory.

Partner conversion first creation must use generated `options.insertOnly: true`.
Omitting query still permits primary-key lookup; keep upsert false and exact
revision/status predicates on later writes. Preserve duplicate/uncertain-outcome
readback and test through the real generic save initializer with isolated I/O.
Exclude storage-owned `_id` from conversion write models and acknowledgement
comparisons; preserve all owner fields and exact code/revision/status predicates.
Cover BSON readback through the actual Mongo save adapter with isolated driver I/O.
The standard pre-save interceptor owns `updated`; require a valid returned Date,
not equality to its prior value. Keep created/createdAt, business fields and CAS
exact. Compose the real timestamp interceptor, initializer and Mongo adapter in
transaction/replay tests; never bypass the interceptor or exempt all metadata.
See [quote persistence](llm/contracts/partner-reward-conversion.md#generated-quote-persistence).

Partner reward simulation reuses the existing conversion provider registry.
Keep the permanent mock disabled by default, require persisted sample/test-only
wallet markers, and retain `simulated` on quotes, conversion records, terminal
evidence and public results. Redemption receipts retain the `simulated:` prefix.
Never switch retained operations between mock and real providers or infer real
external success from simulated completion. See [partner conversion](llm/contracts/partner-reward-conversion.md#permanent-simulated-adapter).

Reservation readiness is read-only and native Super Admin-only. Reuse fresh
nonce-bound Profile administrator evidence before/after persistence qualification,
with the original bearer. Never invoke compose/execute, credit, decision/accounting
CRUD or schema repair. Readiness is not historical no-effects or traffic approval.

Payment reservations require the [durable decision contract](llm/contracts/reservation-decisions.md).
Reuse the canonical transaction owner and Reservation's private decision schema.
Commit authorization/denial atomically; never treat absent historical rows as
no-effects proof. CANCELLED fences an unknown original key with noEffects false;
it cannot authorize cleanup or reverse a completed purchase. Drain old workers
before relying on fences. Preserve the partial-balance regression.

Participant per-transfer amount refusal uses ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT
with its owner status definition. Sensitive routes retain only registered status
diagnostics. Acceptance must assert exact HTTP/code, not dynamic text or generic
conflicts; preserve original operation keys and private logging.

Consolidate unreleased data into init-v001, core-v001, sample-v001 and docs-v001.
Preserve separate explicit manifest selections and semantic section versions;
merge latest record intent without duplicate destination identities. Keep
historical fixtures outside data and refresh file hashes and prerequisite pins.

Explicit test-wallet PUT provisioning uses the existing Enterprise test-credit
owner's native Super Admin proof, selected test environment and qualified atomic
persistence. Keep creation zero-only and separate from credit. Never relabel an
ordinary wallet, reset balances, accept caller markers or replace retained
provisioning intent. Read the enterprise-test-credit contract and focused tests.

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

Acceptance policy inspection uses a separate existing
authorized session, never the employee business token or new participant grants.
Require exact target Enterprise/program/type evidence before transfer probes.
Explicit administrative policy reads use native Profile proof and same-tenant
target resolution before and after reads, never substituted signed context or
optional membership activation. Explicit native administrative target updates
use the same proof, exact expectedRevision and existing policy transaction owner.
Revalidate authority/target before and after persistence; drift must roll back.
Persist approved selections, never modify framework ceilings or participant grants.
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

Payment reservation results must return the verified transaction-local balance,
not the generic update acknowledgement. Preserve exact balance business fields,
revision, created/updatedAt and BSON identity; only framework-owned updated may
change and must remain a valid Date. Decision readback uses the same timestamp
ownership rule. Preserve real initializer/Mongo adapter coverage in
`test/loyaltyReservationDecision.test.js`, including atomic rollback and replay.

Separate attempted-authorization reconciliation may append positive proof to a
CANCELLED decision only after complete ledger/balance reconciliation and exact
original-key transactional fencing. Preserve original decision fields, append-once
CAS, no accounting writes and the distinct LOYALTY_RESERVATION_RECONCILIATION_V1
receipt. Legacy cancel/inspect never upgrades noEffects. Retained original Payment
terms must come from its owner; no caller proof, DENIED fabrication or old-worker
bypass. Keep race, rollback, real-adapter, drift and lost-commit tests focused.

Auction funding selection is a narrow native administrative setter owned by
DefaultLoyaltyAuctionFundingSelectionService. Use existing system.schema.manage
and fresh Profile native proof; never substitute test-credit or transfer authority.
Preserve original signed scope, exact wallet owner/revision CAS, existing active
program/type/balance eligibility, unrelated metadata and all accounting. No new
funding or runtime-wallet fixture. Keep the real initializer/timestamp/Mongo
adapter regression in test/auctionFundingSelection.test.js.

Reward release must return the verified in-transaction balance document, not the
truthy generated update acknowledgement. Preserve exact balance-field checks,
private original-hold admission, rollback and original-key replay. The focused
auction release tests exercise actual initializer/timestamp/Mongo acknowledgement.

Auction capture must prove the retained redemption-to-capture-ledger link and
original BIDDING/AUCTION_ROUND provenance before returning canonical ledger
evidence. Payment reference is the ledger code, not redemptionCode; retain exact
auctionCapture binding separately. Preserve rollback and unchanged replay tests.

Capture, like release, returns the verified transaction-local balance document,
never a generated update acknowledgement. Preserve all expected balance fields
and valid framework updated timestamp; corrupt readback rolls back the complete
capture. Keep real initializer/timestamp/Mongo acknowledgement and replay coverage.

Local evidence/credit admission requires `DefaultModuleService.isLocalModuleActive("loyaltyWallet")`
and explicit `runtimeRole.publication: OPERATIONAL`. Physical role codes and role
membership do not establish ownership. A loaded remote-only module must refuse.
Retain independent permissions, tenant/Enterprise scope, signed deployment pins,
private capture and policy revalidation. Recheck ownership around owner reads;
cohosting grants no authority and changes no database ownership.

Capability transport selects logical module plus explicit OPERATIONAL publication,
with optional exact server/environment pins. Reject physical-role selectors.
Preserve original bearer for participant reads and internal authentication for
settlement/evidence. See the relocatable transport contract; do not infer grants
from cohosting or rewrite persisted transaction evidence.
