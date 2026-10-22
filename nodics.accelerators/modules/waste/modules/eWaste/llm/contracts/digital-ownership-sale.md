# Persisted Waste Asset Sale Owner Contract

## Meaning And Supported Outcome

New sales use [common bundle Commerce](common-bundle-commerce.md). Digital owns
manifests, publication and settlement; Loyalty owns balances; Waste owns
certificate reservations and transfers. eWaste delegates domain commands and
never credits sellers, reverses reward-labelled carbon or refunds completed sales.

This contract covers retained original one-asset evidence and bounded
incomplete-purchase recovery. Legacy availability is false with
`COMMON_COMMERCE_BUNDLE_REQUIRED`; reserve and incomplete confirm refuse.
Completed confirm/deliver verify original evidence without another financial
or ownership effect. Existing receipts and historical records remain unchanged.
Historical policy snapshots never re-enable a removed operation.

DigitalCore's [retained ownership contract](../../../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/llm/contracts/persisted-digital-ownership.md)
owns protected Commerce evidence. Waste's
[asset contract](../../../../../../../nodics.waste/modules/wasteCore/llm/contracts/README.md)
owns persistence and certificate state. Payment/Order own original capture and
compensation receipts. No shadow wallet, persistence authority or physical
Inventory fallback belongs here.

## Admission And Configuration

The service-only route is `POST /internal/digital-sales/:phase`, logical
`eWaste.internalDigitalSale.internalDigitalSaleInvoke`. Its existing `wasteInternal` exposure,
secured admission, `authTokenTypes:[service]`, `serviceAccountUserGroup` and
`waste.asset.sale.transfer` permission remain independent gates. The controller
allowlists `evidence/compensation-resolve/availability/reserve/confirm/deliver/cancel`,
with final-sale refusal for all `refund-*` phases, and forwards only
router-derived auth/tenant plus the phase/body. Body fields cannot replace actor
or enterprise. This does not introduce another exposure category.

The service independently requires signed service token/principal type, an exact
allowed principal ID, matching technical tenant, signed enterprise aliases and current transfer
permission. Human/customer callers and an employee permission alone refuse.
An explicitly approved business-enterprise grant is the only permitted difference
between the selected business enterprise and the unchanged signed principal enterprise.
Signed principal, tenant and enterprise identifiers are 1..128 characters from
letters, digits, underscore, period, colon, at-sign and hyphen. Every supplied
signed/input `tenant/tenantCode` and `enterpriseCode/entCode` alias must be valid
and equal to its canonical scope; conflicts, null/empty aliases and malformed
allowlists refuse before owner reads. Body scope/qualification flags remain
non-authoritative and cannot substitute for signed context.

| Effective setting | Source default | Meaning |
| --- | --- | --- |
| `eWaste.marketplace.digitalOwnership.enabled` | `false` | Integration admission only. |
| `eWaste.marketplace.digitalOwnership.qualified` | `false` | Explicit admission assertion, not substitute for installed evidence. |
| `allowedServicePrincipals` | `[]` | Exact approved signed internal callers; not a body grant. |
| `targets` | `{}` | Server-owned module targets for `commerce`, `loyalty`, `profile`; absent target refuses. |
| `digitalCore.digitalOwnership` | Disabled/unqualified with null owner fields | Standard DigitalCore owner selection; see its contract. |

Module invocation uses existing service transport and fixed owning module/API
names, trusted tenant/enterprise headers, 15-second timeout and `maxAttempts:1`.
No credentials, customer bearer fabrication, automatic mutation retry or body
selection of targets/services is added. Generic schema HTTP is not an integration
contract, even when a module's router is enabled. `sale.rows` refuses all generic
reads; listing and sales use DigitalCore's protected
`/internal/ownership/evidence/query` with exact `LISTING`, `BINDING`, `PURCHASE`
or `REFUND` commands. Original command selectors come from the persisted Waste
event. Product's existing publication-status API remains the serving pointer.
DigitalCore binding admission obtains the read-only domain plan through
`POST /internal/digital-listings/plan`; `preview` remains a compatible read-only
alias. Both phases return the same digest and never create a binding or qualify
a sale. Only `complete` attaches the independently admitted binding through
Waste-owned persistence. The route is sensitive and returns `Cache-Control: no-store`.
Loyalty uses `/reward-ledger-evidence` with exact customer, program, reward type,
entry/original-entry and source selectors; no hidden wallet/ledger schema reads
or wallet-opening projection calls qualify financial evidence.

Canonical customer code/login resolution must use a separately approved Profile
capability endpoint selected by server-owned `customerEvidenceApiName`. It accepts
`{contractVersion:1,enterpriseCode,identifier}` and must return
`{contractVersion:1,tenant,enterpriseCode,customer:{code,loginId,active}}`.
Profile owns `POST /nodics/profile/v0/internal/customer-evidence`, disabled by
default under `profileCustomerEvidence`. It requires `profile.customer.reference.read`,
private request capture and one exact approved deployment/business-enterprise grant.
It freshly checks active Enterprise/Tenant placement before and after a bounded
unique code-or-login Customer read, exposing only code, loginId and active. Select
`customerEvidenceApiName: /internal/customer-evidence` only in an approved deployment.
An arbitrary customer code, display reference or notification recipient API is
not a substitute; never reopen Customer CRUD or fabricate caller groups.

Known static integration failures use append-only registered statuses from
`src/utils/digitalSaleDiagnostics.js`. The private router emits only the registered
code and static message, never an error object's diagnostic text. Unknown controller failures use the fixed controller-unavailable status; unknown errors outside that boundary retain normal private-request
masking. Neither error path exposes remote responses, identities, tokens or
financial records, and capture protection remains mandatory.

Amount verification uses the canonical pure decimal utility at
`nCommon/src/utils/exactAmount.js` through the mergeable sale `amount()` accessor.
Waste must not activate Pricing or depend on `SERVICE.DefaultExactAmountService`
for arithmetic. Retained evidence uses the pure utility; current Commerce
Payment retains its own Pricing runtime.

Internal sale and listing route leaf keys are respectively
`internalDigitalSaleInvoke` and `internalDigitalListingInvoke`.
nRouter registers common/module routes using the
module and leaf key, not the containing group. Keep these leaf identities unique
so refreshing a bound route cannot select another controller or permission.
Both controller operations remain `invoke`; their HTTP paths and authority
are unchanged. The registry regression uses real route preparation and refresh
before controller dispatch, without opening a listener or qualifying native calls.

Unexpected failures inside the exact evidence read expose only an append-only
fixed evidence stage (private admission, selectors, snapshot, authority,
projection, original event, generated context or generated records). Per-call
stage state is private and survives runtime service cloning without cross-request
sharing. Original exception messages, names, stacks and causes are not forwarded.
These diagnostics locate a failed gate; they do not relax or qualify it.

## Exact Original Ownership Read Evidence

`POST /nodics/eWaste/v0/internal/digital-sales/evidence` is a private read-only
business capability, not a maintenance-inspector or generic schema endpoint.
It retains the existing `waste.asset.sale.transfer`, integration enablement and
qualification gates, original scoped runtime principal and private capture proof.
Every body contains `contractVersion:1`, `kind`, `bindingCode`, `productCode`,
`sku`, `storeCode`, `locale`, `assetCode`. LISTING verifies the current original
seller, binding/reverse projection and current supported policies. PURCHASE adds
`code` (original transfer), `ownerId`, `orderCode`, `entryCode` (original Cart entry),
`checkoutIdempotencyKey`; REFUND adds `refundCode`. Unknown fields/queries refuse.
The owner joins the original persisted sale, and for REFUND its exact completed
reversal and restored seller. Results expose bounded allowlisted asset/custody,
policy, sale/settlement/reversal fields plus owner fingerprints, never arbitrary
metadata/history. Stable before/after generated reads are not an atomic snapshot.
Financial/approval proof still comes independently from Commerce and Loyalty.
The maintenance inspection's transaction fingerprint ceiling remains unchanged.

Waste operational schemas do not require a stored `tenant` field. Evidence
projects the admitted tenant into its asset, projection, policy, original-sale
and reversal DTOs only after a bounded uncached generated reread verifies the
actual persistence request partition and unchanged original admitted request.
`DefaultWastePersistenceService` obtains local persistence authority only from
`DefaultIdentityGovernanceService.getSystemAuthData()`. This canonical system
identity has no tenant claim: generated services select the storage model using
`NODICS.getModels(moduleName, request.tenant)`. Require the admitted request
partition, `isSystem: true` and exact canonical authority before the reread, then
reject changes to the captured request/auth across the provider call. Never add
a tenant claim or invent service groups to make evidence validation pass. Tests
exercise generated model selection with tenant-less authority and reject injected
groups, permissions and conflicting tenant claims; they do not prove live storage.
An absent row tenant is valid; an explicitly conflicting, null or blank tenant
refuses. Generated request/auth/query/limit/cache drift, failed or ambiguous
envelopes, inconsistent counts and changed records refuse. Original signed
principal/business scope, private capture and configured admission are checked
across awaits. Stored rows are never modified and fingerprints hash the original
records without the projected tenant. These reads remain non-atomic evidence,
not a transaction or sale/refund qualification.
The generated get initializer may add only `limit:2,skip:0,snapshot:false` to
`pageSize:2,pageNumber:1`. Accept that exact canonical normalization, not another
limit, offset, projection or snapshot. Tests exercise the real initializer as
well as isolated owner responses; normal generated paging is not authority drift.

Default-enterprise runtime credentials may act in a business enterprise only
through an exact `businessCallers` selection containing tenant,
principalEnterpriseCode, enterpriseCode, serviceId, projectCode, environmentCode,
serverCode, instanceCode, assignmentCode and literal permissions. The existing
principal allowlist still applies. A top-level body `enterpriseCode` selects the
reviewed business scope. Canonical runtime claims use the original `serviceId`
as the allowlist identity when `principalId` is absent, only after nAuth's
`requireRuntimePrincipal` validates the original private request for `eWaste`.
No synthetic principal ID or service group is added; private capture and literal
permission checks still apply, including for same-enterprise runtime callers.
An existing signed `principalId`, when present, must still match its allowlist;
an unapproved explicit identity cannot fall back to an approved service ID.
The top-level body selector is removed before exact domain-selector validation.
The HTTP enterprise header and normalized request aliases, when present, must
match the original signed principal enterprise; they cannot select the business
scope. Original claims and groups are never rewritten. Private
capture, signed runtime/module/instance, permission, environment and policy drift
are rechecked. Same-enterprise callers retain the original scope checks.

Exact Commerce, Loyalty and Profile evidence calls omit the business enterprise
header so canonical module transport uses its actual outgoing runtime token's
namespace, not the incoming caller's enterprise. The separately allowlisted
business enterprise remains in each evidence body. The native acceptance helper
likewise does not overwrite runtime actors' headers with the business namespace;
its eWaste evidence body carries that explicit selector. Commerce callers of
both digital-listing and digital-sale phases must follow the same body contract.

The former original-sale/refund acceptance flow is superseded. Do not execute
it against a Local environment or treat its old source results as current
acceptance. Current common-bundle tests belong to the implementing owners.
Connected E2E execution remains a separate, explicitly authorized phase.

## Retained Binding And Policy

The owner re-reads exactly one active DigitalCore binding for tenant, merchant,
Product and SKU. Its typed provider is `wasteCore`, its delivery classification
is `DIGITAL_OWNERSHIP`/`DIGITAL_COMMERCE`, and its provider reference contains:

| Binding field | Canonical check |
| --- | --- |
| `assetCode/projectionCode` | Existing active Waste asset and LISTED marketplace projection for that exact asset. |
| `sellerRef` | Exact `profile/customer` reference matching projection owner, resolved through current Profile. |
| `storeCode` | Exact requested retained selling Store. |
| `transferPolicyCode` | Same exact policy code as Waste marketplace projection. |
| `rewardSettlementPolicyCode/carbonSettlementPolicyCode` | Exact projected policy identities; no inferred default policy. |
| `evidence.retainedProducts[]` | Unique locale pins, 1..20 entries, each selected by original Cart locale. |

Reverse evidence requires `commerceProductRef` to the exact Product,
projection `metadata.storeCode/sku`, and the original seller. Selected retained
Product evidence must match code, merchant/tenant/Store/locale/Product,
sourceHash/publicationVersion, variant-to-SKU map, localized `assetCode` and all
three exact digital classification attributes. The current asset must still be
active; reservation separately enforces LISTED seller ownership and no competing
lock. A locale pin is translation evidence, never extra asset inventory.

Store validation follows
[Store's owner contract](../../../../../../../nodics.commerce/modules/baseCommerce/modules/store/llm/contracts/README.md)
and `DefaultStoreContextService`: exact technical tenant, code, active ACTIVE
record, positive revision and merchant enterprise. `enterpriseRef` accepts a
string code, a code object, canonical `moduleName/schemaName`, or existing
`module/schema` names. Supplied module/schema aliases must all identify
`profile/enterprise`; contradictory aliases and foreign enterprise refuse.
This normalization never changes enterprise identity or accepts a browser Store.

All three policies must be active ACTIVE records with integer revision and
currently valid effective dates. The entire resolved binding/policies and
canonical Profile references are retained in the original reservation command.

| Policy | Required supported terms |
| --- | --- |
| Asset transfer | `SELL`, `TRANSFER_TO_COUNTERPARTY`, completion `SOLD`, cancellation `LISTED`, `allowSelfTransfer:false`, `lockRequired:true`, reward `RETAIN_ORIGINAL_OWNER`, carbon `NONE`. |
| Asset transfer restrictions | No requested completion custody status, receipt/compliance review or counterparty-acceptance step unsupported by this bridge. |
| Reservation | Explicit integer `metadata.digitalOwnership.reservationSeconds` in `1..86400`; no source-selected business TTL. |
| Reward settlement | Trigger `SALE`, mode `POLICY_RESOLVED`, explicit wallet currency, and `metadata.digitalOwnership` with `version:1`, `proceeds:CAPTURED_TOTAL`, `payee:CURRENT_SELLER`, program/type codes and integer scale `0..12`. |
| Carbon settlement | Trigger `SALE`, mode `NONE`; transfer policy also carbon `NONE`. |

Absent, DRAFT, expired, future, ambiguous or unsupported policy refuses. A source
fixture's synthetic terms do not approve an application policy. No default
reservation duration, proceeds formula, currency/program, review waiver or
qualification is created by this contract.

## Retained Purchase Verification

The original event binds one complete quantity-one OrderEntry, one original
Loyalty capture and seller earning, with empty carbon settlement references.
These are historical evidence constraints, not a new financial path.
A completed replay verifies them; an incomplete original sale remains with
canonical Checkout recovery rather than creating an eWaste seller earning.

### Original Capture Proof

The event's original command must match every incoming purchase selector,
technical tenant/merchant, canonical asset/seller/buyer and original binding.
`capture` re-reads bounded protected owner results, not a supplied transaction.

| Evidence | Required binding |
| --- | --- |
| Order | Exact original code/buyer/tenant/enterprise, root `idempotencyKey`, nonempty original Cart, Store evidence, supported placed/completed/fulfilled state and original total/currency. |
| Complete OrderEntry | Exactly one active entry, `<order>:<original-entry>`, same buyer/merchant/Cart, exact Product/SKU, quantity one, `<root>:order-entry:<entry>` key and this original digital reservation code. |
| Captured Payment | Exactly one active original `<order>:capture`, same buyer/tenant/**enterprise**/Cart/order, `CAPTURED`, `CAPTURE`, exact method/provider/currency/amount, `<root>:payment:capture` and nonempty buyer ledger reference. |
| Authorization | Original active `<order>:authorization`, same buyer/tenant/**enterprise**/Cart/order, `AUTHORIZED`, `AUTHORIZE`, matching method/provider/currency/total and `<root>:payment`. Its provider reference equals Order `evidence.paymentReference`. |
| Buyer ledger | Exact captured Payment `providerReference`, `CAPTURE`, matching amount/program/reward type/wallet, original capture key, `sourceType:PAYMENT`, original order source and ORDER target. Its `reservationCode` equals the original authorization reference. |
| Payment wallet evidence | Both original payment entries' wallet/program/reward type agree with the captured ledger; Loyalty wallet is CUSTOMER-owned by the canonical buyer Profile code. |

Payment now retains `enterpriseCode` in fresh transaction/entry evidence and
declares it in the owning schemas. It does not backfill historical records from
later callers. Missing original enterprise, even with matching order/buyer/amount,
refuses this pathway. The original captured amount, not mutable catalogue price,
determines supported proceeds.

Generated Payment projections retain operation/methodCode/providerCode/providerReference
inside `evidence`. Internal `paymentEvidence` falls back to those exact fields
only when root mirrors are undefined, and from undefined `amount` to mandatory
`totalAmount`. Contradictory mirrors reject. Tenant, enterprise, owner, keys,
status, currency and totals never fall back to evidence or caller aliases.
Original decimal strings remain unchanged in retained capture/refund intent.

The retained `capture` contains typed original Payment and authorization refs,
merchant enterprise, original Checkout key, authorization Loyalty reservation,
buyer `ledgerCode`, amount and currency. Only after Waste CAS retains that exact
capture may the domain request seller earning. This fences cancellation against
uncertain ledger execution; the fence itself is not proof of an earning.

### Original Seller Evidence And Delivery

Original wallet and ledger reads use Loyalty's protected evidence capabilities
with `ownerType:CUSTOMER`, `ownerCode`, programme, reward type and original
source/key selectors. No generic schema read or wallet creation qualifies
settlement. Verify exact scope, source, key, amount and wallet owner.
Missing, ambiguous or changed evidence refuses.

Completed confirm/deliver checks original capture, retained settlement and
current Waste ownership. It never posts another earning or changes custody.
Unknown settlement stays recovery-required; current configuration cannot
manufacture programme, precision, payee or a successful receipt.

## Persisted State And Recovery

Waste uses its existing generated services. Asset and event require unversioned
primary `code`, installed `compareAndSetItem`, inspected unique non-sparse,
non-partial code identity with simple collation, and supported revision behavior.
Asset concurrency must be managed by `revision`; event revision may be managed
or explicitly advanced. Updates require one revision match and exact successor
readback. Event creation is insert-only; lost acknowledgements are accepted only
after exact original-event readback. Configuration booleans cannot satisfy this
installed persistence inspection.

| Stage | Existing durable evidence | Recovery rule |
| --- | --- | --- |
| Acquisition | Asset `SALE_PENDING`, `pendingTransferCode/pendingTransferEvent`; original RESERVED event with command/deadline | Preserve historical evidence; new admission is closed. Use original Checkout recovery, not a fresh reservation. |
| Capture fenced | Original event retains `metadata.digitalSale.capture` under CAS | Cancellation refuses, including after timeout; inspect original payment and settlement. |
| Seller credit uncertain | Capture fence retained; original Loyalty command may have committed | Keep lock/recovery for canonical owner reconciliation. No eWaste earning retry or inferred compensation. |
| Settlement retained | Original reward refs and empty carbon refs under `metadata.digitalSale.settlement` | Compare exact retained settlement; do not choose replacement refs. |
| Ownership committed | Asset digital owner/buyer under `LOCKED`, original last-transfer code and ownership timestamp | Retain for explicit owner reconciliation; the closed adapter cannot complete an incomplete sale. |
| Event complete, cleanup interrupted | Event COMPLETED; asset still LOCKED for same event | Retain lock and original evidence for owner reconciliation; completed confirm is verification-only. |
| Digital record write/readback fails | Completed Waste sale and original financial evidence remain | Retry original confirm/deliver through DigitalCore, which must exactly verify saved evidence. No new charge. |
| Onward transfer or refund | Current owner/last-transfer no longer original buyer/event | Refuse original delivery or automatic reversal; manual domain resolution. |

Successful delivery requires active SOLD asset, original last-transfer code,
matching owner/digitalOwner, no remaining pending lock, original event COMPLETED,
valid identical original event/asset timestamp and matching retained settlement
refs. It never changes physical owner or custody status.

## Cancellation And Compensation Safety

`cancel` is not a financial reversal. It reads the root-key Checkout failure
checkpoint and original Order payment entries before Waste cancellation. The
checkpoint must belong to the same tenant/buyer/root and have durable
`COMPENSATED` or `COMPENSATION_REQUIRED` state. Those state labels alone do not
prove payment safety. Current bounded reads reject oversized/incomplete evidence.

| Observed original payment evidence | Cancellation result |
| --- | --- |
| No payment entries | Requires durable pre-payment completed-step evidence without AUTHORIZED/ORDERED/PAYMENT_CAPTURED and no payment compensation intent. |
| AUTHORIZED | Requires one original VOIDED entry and one durable COMPLETED PAYMENT_VOID receipt, matching transaction/reference and `<root>:payment:void`, plus scoped original VOID intent. |
| DECLINED/CANCELLED terminal entries | Allowed only with the scoped durable compensation checkpoint and permitted original payment states. |
| CAPTURED with full original REFUND_SUCCEEDED but no Waste capture fence | Only the bounded refunded-reservation cleanup below can release. A refund is not an uncaptured VOID. |
| Pending, ambiguous, unknown, failed owner read or no checkpoint | Refuse release; retain recovery. |
| Event already capture-fenced/completed | Refuse cancellation irrespective of elapsed expiry. |

Waste CAS first makes the original RESERVED event CANCELLED or EXPIRED, then
clears only its own seller SALE_PENDING lock back to LISTED. Original replay
must prove released seller state and must not unlock a later lock. Time alone
never releases an asset and there is no new background expiry worker.

Checkout may attempt digital release before it has confirmed payment reversal.
That first attempt can correctly fail. Recovery must retain the original
checkpoint/financial key, obtain durable original VOID proof or qualify the
refunded-reservation cleanup below, or keep manual recovery. Never label a
seller-settled asset as compensated through cancellation. A transport timeout,
qualification flag or application status is not proof of financial absence.

### Refunded Unfenced Reservation Cleanup

`compensation-resolve` is a read on the existing private route/permission. Body:
`contractVersion:1`, reservation `code`, original `ownerId`, `orderCode` and
`checkoutIdempotencyKey`, plus the existing top-level business `enterpriseCode`.
It resolves only the persisted original Waste command, validates its canonical
event identity and `<root>:digital:<entry>:0` key and joins protected original
financial/checkpoint evidence. Response: bounded original unit, `eventRevision`
and canonical `commandDigest`, without policies/raw command. No Cart/current
Product/price reconstruction or new customer identity is admitted.

Existing `cancel` requires exactly the retained completed stages VALIDATED,
CALCULATED, RESERVED, DIGITAL_RESERVED, AUTHORIZED, ORDERED, PAYMENT_CAPTURED;
both reservation-recovery flags false and no uncertain digital key; the original
failed DIGITAL_OWNERSHIP_RELEASE and completed PAYMENT_REFUND receipts; scoped
original REFUND intent; exactly original AUTHORIZE/CAPTURE/REFUND rows; full
REFUND_SUCCEEDED amount/currency; and exact buyer CAPTURE/REVERSE ledger chain.
No Payment operation is executed. Only active RESERVED without capture,
settlement, completion timestamp or reward/carbon settlement refs qualifies.

Waste CAS first records CANCELLED with `metadata.digitalSale.compensationRecovery`
FENCED, immutable financial proof/digest, custody snapshot and asset/event
revision fences, retaining SALE_PENDING. Both `capture` and
`prepareDigitalSettlement` freshly reject this fence, including stale callers.
If capture's CAS wins first, cleanup refuses; settling/completed sales never
qualify. After fencing, fixed Commerce PURCHASE must successfully return
`entitlements:[]`; its owner requires the explicit successful generated count
and validates exact buyer/business/order/provider/binding/unit scope.

Loyalty `/reward-ledger-evidence` uses persisted `sellerRef.code`, retained
program/reward type, `sourceType:WASTE_ASSET_SALE`, `sourceCode:<event>` and
`earningIdempotencyKey:<event>:sale-proceeds`. Its owner reads source-wide EARNs
in the existing exact seller wallet with mandatory generated count. Consumer
requires `entries:[]` and exact `ledgerSelection` {entryType:EARN, sourceType,
sourceCode, idempotencyKey, programCode, rewardTypeCode}. Any row, other key,
ambiguity, missing selection, malformed response or failed read refuses absence.

Fresh original financial proof is rechecked before bounded absence audit is
persisted and only this asset lock CAS-clears to LISTED; the marker then becomes
COMPLETED. Owners and physical custody never change. Lost acknowledgements and
interrupted cleanup recover only by exact original readback/replay. Revision or
custody drift, later locks, entitlement/earning presence or changed proof refuses;
unknown outcomes retain the fence/lock for reconciliation. No entitlement,
seller earning/reversal, buyer debit/refund, new Order or purchase is created.
Checkout owns explicit customer-authorized original-key recovery and checkpoint
claim/CAS. Source tests do not qualify installed/native cleanup. Later modules
may narrow owner methods but must retain these proof/privacy/concurrency gates.

Loyalty seller earning and seller reversal transports omit business enterprise
headers and forward no incoming auth/token. nService supplies its unchanged
original signed runtime namespace; exact wallet/source/key checks remain.
Evidence reads retain explicitly admitted business selectors in their bodies.

## Completed Purchases Are Final

Completed certificate/bundle purchases cannot be returned or refunded. The
`refund-preview` compatibility response is ineligible; all mutation phases
refuse before touching ownership or financial state. The obsolete
`/internal/order-reversals` route, controller and service have been removed.
No eWaste code reverses reward-labelled carbon or chooses precision from
marketplace settings.

Historical sale, reversal, Payment and Loyalty records remain immutable evidence.
Their existence is not permission to resume the retired reversal implementation.
Incomplete purchases use original Checkout recovery and the bounded
compensation evidence described above; completed transactions never enter that
recovery as a return. Current sales use the common Digital bundle contract.

## Explicit Unsupported Boundaries

| Request | Contract outcome |
| --- | --- |
| Completed asset/bundle refund | Preview returns `COMPLETED_BUNDLE_FINAL_SALE`; all mutation phases refuse. No approval or historical policy can enable the retired adapter. |
| Onward-transfer refund | Unsupported; original evidence never authorizes reversing later ownership. |
| Physical return/custody | Digital RETURN is BLOCKED/nonrefundable. No physical Inventory, receipt, shipping or custody mutation is inferred. |
| Carbon, fees, mixed/split allocation | Unsupported by this exact settlement contract; require owner design/policy/testing before extension. |
| Coupon redemption or ITEM merchant fulfillment | Separate DigitalCore/Promotion/provider contracts; ownership delivery is not a coupon benefit or physical fulfillment receipt. |
| Imported documentation or business pack | Import does not grant service permissions, approve policy, install a qualified owner or publish an offer. |

## Installed And Publication Gates

The existing read-only `digital-listings/plan` persistence preflight must use
`DefaultWasteAssetTransferOperationService.digitalPersistence` for only
`wasteAsset`, `wasteAssetMarketplaceProjection` and `wasteAssetOwnershipEvent`,
with `sale.recheckAuthority` before and after awaited owner checks. It adds no
endpoint, persistence write, caller-selected resource or configuration
authority. Persistence capability results must stay outside the original
listing command and `planDigest`; the same command must retain the same digest.
The owner verifies installed generated CAS, unversioned unique code identity
and its revision contract. An ownership-event managed revision field can be
absent: the existing event owner still uses explicit revision-guarded CAS; do
not invent a mandatory managed field or add one to stored records.

This preflight is available before sale flags are selected. It proves only
the inspected installed prerequisites, not an executed CAS, distributed
atomicity, a financial capture, seller posting, refund, production qualification
or permission to enable another environment. The existing owner-runtime helper
`wasteCore/test/helpers/installedOwnerAcceptance.inspectOwnershipPersistence`
separately checks asset/event prerequisites in an explicitly opted-in booted
Local Waste process. `/waste/installed-data/inspect` is a protected bounded
record/fingerprint API, not an index/CAS qualification API. Never substitute
raw database inspection or a record fingerprint for these owner checks.

| Gate | Required evidence | What is not sufficient |
| --- | --- | --- |
| Source/build | Loader-visible services/controller/route, declared inert settings, focused and affected owner tests | A source pass is not connected acceptance. |
| Effective runtime | Correct active modules, overrides, configured server targets, secured service credentials and permitted route exposure | Repository package presence or a successful HTTP response from another endpoint. |
| Installed persistence | Qualified Waste generated CAS/indexes/revisions/insert-only identity; generated Digital evidence read/write and readback | In-memory doubles or `qualified:true`. |
| Cross-owner protected reads | Exact authorized Product/binding/Store/Profile/Order/Payment/Loyalty/Checkpoint evidence | Missing/error reads interpreted as empty or body-selected grants. |
| Business review | Exact approved policy identities, settlement mode/program/currency/scale/reservation terms and seller eligibility | Synthetic fixtures, proposal files or this documentation. |
| Publication | Existing owners' Staged review/approval, exact Online pointers, retained Product pins and current Waste projection/binding | Installed data, stale index payload, arbitrary CURRENT/STALE record or documentation publication. |
| Financial/native acceptance | Original buyer debit, seller earning replay/uncertainty, partial persistence/concurrency and recovery proven through qualified owners | Isolated test count, one simulator receipt or manually asserted success. |

The bridge does not install data, build search indexes or publish CMS/Product/
Media records. Operators preserve those existing owner's workflows and asset
access rules. If publication changes the pinned hash/version, review/update the
binding through the owning governed data lifecycle; do not silently rewrite a
reserved event's original binding/policies. An old retained reservation is not
permission to sell a newly listed asset to another buyer.

## Scenarios And Safe Extension

Completed original purchases can be inspected with exact retained evidence.
Foreign scope, changed authority, ambiguous ledgers or altered custody refuse.
Incomplete purchases retain their original Checkout key and recovery evidence.
New sales use Digital's common bundle flow, never removed eWaste adapters.
Customer layers may narrow policy or choose deployment values; they cannot
recreate missing owner authority or copy reusable defaults.

## Verification Scope And Source Map

Focused local tests:

```bash
node --test nodics.accelerators/modules/waste/modules/eWaste/test/eWasteCommonCommerceMigration.test.js
node --test nodics.accelerators/modules/waste/modules/eWaste/test/eWasteInternalRouteRegistration.test.js
node --test nodics.accelerators/modules/waste/modules/eWaste/test/eWasteDigitalOwnershipAdmission.test.js
node --test nodics.accelerators/modules/waste/modules/eWaste/test/eWasteDigitalOwnershipBridge.test.js
```

Migration tests cover delegated listings/gifts, closed legacy admission,
final-sale refusals and removed reversal modules/routes. Registry tests use real
preparation/dispatch without a listener. Admission tests retain signed scope and
privacy checks. The bridge exercises common bundle owner composition.
None proves native persistence, provider qualification, live payment,
publication or E2E acceptance.

Authoritative implementation:
[domain evidence/recovery service](../../src/service/defaultEWasteDigitalSaleService.js),
[controller](../../src/controller/defaultEWasteDigitalSaleController.js),
[route](../../src/router/routers.js),
[framework defaults](../../config/properties.js),
[common migration regression](../../test/eWasteCommonCommerceMigration.test.js)
and Waste's
[persisted transfer owner](../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteAssetTransferOperationService.js).
