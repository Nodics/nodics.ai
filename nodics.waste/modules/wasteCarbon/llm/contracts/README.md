# Carbon Provider and Component Contract

## Configuration Ranges

`wasteCarbon.validation` in the owning properties defines quantity scale 0..8,
quantity digits 1..100, operational capacities 1..100000 and transport/provider
timeouts 1..100000ms. Services consume these ranges without replacement ceilings.
Partial intentional limit/range overrides inherit the remaining owner defaults;
malformed objects, invalid numbers and inverted ranges reject. These are technical
admission ceilings, not issuance precision or provider qualification: governed
lot evidence still selects the actual scale. `carbonConfiguration.test.js`
covers inherited defaults, custom ranges and invalid overrides without live calls.

## Digital component API

The owner contributes `WasteCarbonLotState`, `WasteCarbonAllocationKind`,
`WasteCarbonHoldingState`, `WasteCarbonOperation` and `WasteCarbonEligibility`
in `src/utils/enums.js`. Runtime comparisons and projections consume
`ENUMS.<definition>.<member>.value`, preserving existing wire values. Enum
membership is not a permission or a new lifecycle transition: retain explicit
admission, eligibility, original-key and destination-hold guards. The holding
tests load these definitions through nConfig's Enum constructor and cover
effective registry access as well as rejected unsupported actions.
The dispatcher enforces an explicit operation allowlist independently of enum
extension and permission grants. Quantity parsing/alignment/formatting delegate
to nCommon `exactAmount` through `amount()`; strict unsigned admission, precision
rejection and fixed-scale wire presentation remain Carbon-owned.

SERVICE.DefaultWasteCarbonHoldingService exposes reserve(request), transfer(request), finalize(request), release(request), getOperation(request), holdings(request), synchronize(request). request.tenant/authData are trusted transport context; request.payload is business input. Mutations require an authorized service principal or canonical native Platform Admin, with the exact owner permission. Digital/Profile authorize the originating actor and selected owner; pass the actorRef as audit evidence, never as a grant.

reserve/transfer/finalize/release payload: lotCode, ownerRef {module: 'profile', schema: 'customer' | 'enterprise', code}, quantity (positive exact decimal string), unitOfMeasure, operationKey (stable Digital component identity), manifestRef {module, schema, code, revision}. transfer and finalize require recipientRef. Reuse identical reserve fields throughout. getOperation takes lotCode, ownerRef, operationKey. Each operation returns {module: 'wasteCarbon', schema: 'wasteCarbonLot', lotCode, operationKey, status: 'RESERVED' | 'TRANSFERRED' | 'COMPLETED' | 'RELEASED', destinationHold: null | 'HELD' | 'RELEASED', quantity, unitOfMeasure, ownerRef, recipientRef, manifestRef, revision}. Missing operations return null. Replays reject changed bindings. Release cannot reverse transferred or completed ownership. A released key cannot be reserved again.

Transfer atomically moves realized quantity into a retained recipient destination hold. The received quantity counts as reserved, never available for onward activity. POST /carbon/transfers/finalize requires carbon.holdings.finalize and exact original sender, recipient, quantity, unit, key and manifest. It persists COMPLETED, destinationHold RELEASED, finalizedAt and finalizationActor without creating quantity or repeating issuance. The authorized coordinator must retain all component transfer receipts first. Early or changed-binding finalize rejects; retry after a lost acknowledgement uses the same operation. Finalize does not re-run registry eligibility for an already-recorded transfer; subsequent onward reserve/transfer still rechecks eligibility.

Digital's actual Carbon component now declares retainsTransferLock:true and supports mixed/multi-component manifests. It calls finalize, never relabels lookup as completion. Transfer replay may return already COMPLETED owner evidence; the adapter preserves its transfer checkpoint while retaining that terminal evidence. All transfers, including single-component bundles, require explicit finalize. No compatibility bypass unlocks older incomplete records. Acquisition projections additionally expose status, destinationHold and finalizedAt; reserved includes incoming holds.

Reserve selects only realized available holdings. Allocation and transfer provenance stay in the lot; original allocations never change beneficiary. Eligibility is re-read at reserve/transfer; failed or uncertain provider responses retain the reservation. A completed transfer replay returns persisted evidence even if eligibility subsequently changed. Atomicity is one lot, not a whole Digital bundle. Digital retains whole-manifest coordination and seller-release ordering.

## Participant read APIs

POST /carbon/holdings accepts {page?}; POST /carbon/operations/lookup accepts {lotCode,operationKey}. Both require an access token, carbon.holdings.read and customerUserGroup or employeeUserGroup. An optional ownerRef must exactly match the Profile-resolved owner; service callers retain the explicit ownerRef contract above. These paths are relative to the deployed wasteCarbon API mount, not a prescribed gateway URL.

DefaultWasteCarbonReadAccessService forwards the original bearer and signed Enterprise context to Profile /customer/identity for customers or /identity/scopes/me for employees. Profile supplies canonical customer identity or current Enterprise scope evidence. Enterprise reads require the existing Profile profile.scope.read permission as well as carbon.holdings.read, a matching tenant/Enterprise allow scope and no matching deny. Capability restrictions match waste or wasteCarbon. A business-unit, foreign Enterprise or hierarchy relationship does not grant access. No new permission definitions or shared group assignments are added. Source changes do not import or grant these permissions.

The holdings envelope is {data:{ownerRef,items,total,page,limit}}. Each item retains lotCode, revision, issuanceRef, programRef, unitOfMeasure, scale, state, synthetic, owner-only allocationRefs/acquisitionRefs and exact string total/prospective/realized/reserved/available. totalSpendable is false; eligibility is NOT_CHECKED and transferable is null. Available means unreserved, not currently registry-eligible. Reserved includes incoming destination holds. No provider call is needed to read persisted holdings, and provider selection or source-module activation never qualifies real issuance. Operation lookup returns {data:null} when absent or {data:operation} for the originating owner, with RESERVED/TRANSFERRED/COMPLETED/RELEASED status. It is not a whole-bundle status endpoint.

The carbonRead exposure category is separate from carbonInternal mutations. Both read routes are secured, sensitive, uncached and send Cache-Control: no-store. Controller/facade preserve original credentials and trusted authData; body tenant/provider/grant fields have no effect. config/properties.js owns Profile connectionName, targetAuthority and bounded positive timeoutMs defaults. Changing deployments may intentionally override them without changing identity authority. Profile absence/failure, unsuccessful nested envelopes, invalid settings or authority drift fail closed before lot reads.

Unit tests cover customer codes distinct from login IDs, represented Enterprise access, explicit denies, spoofed owners/tenants, failed Profile responses, exact status projections, private route configuration and transport customization. No frontend, registry, server or live API is exercised.

## Trusted evidence adapter

Configured wasteCarbon.evidence.providerService implements readLot({evidenceRef}, context) and eligibility({lotCode, issuanceRef}, context). context contains tenant, qualificationRef and AbortSignal. It must resolve authoritative evidence, enforce its program/source scope, and never trust request flags. Settings selection is CONFIG only. readLot returns {code, evidenceRef, issuanceRef, providerRef, programRef, unitOfMeasure, scale, issuedQuantity, state: 'PROSPECTIVE' | 'REALIZED', synthetic, allocations: [{code, ownerRef, quantity, kind: 'CONTRIBUTOR' | 'PARTNER', contributionRef, allocationRef}]}. Each allocationRef is authoritative and stable; contributor references point to wasteSubmission records and must match their original owner. Partner shares require a separate agreementRef. Impact references may accompany evidence but cannot replace issuanceRef.

readLot is cumulative: issued quantity may grow, existing allocation identities and terms are immutable, and new allocations must fit the cumulative issued quantity. Prospective records do not become holdings; realization replaces prospective evidence with separately evidenced issued allocations. The adapter must reconcile serial/range uniqueness across lots; lot identity is bound to authoritative issuanceRef, not arbitrary customer codes. eligibility returns {lotCode, issuanceRef, status: 'ELIGIBLE' | 'INELIGIBLE', evidenceRef}. Qualification includes registry custody/transfer rules: this internal owner records platform beneficial ownership only for programs that permit it. A program requiring external registry transfer needs a separately qualified adapter workflow before activation; no external transfer is fabricated.

## Permissions and composition

The forward transferFinalizationPermission section (init-v001, version 0.0.2) adds carbon.holdings.finalize. Existing permissionCatalogue bytes and hashes remain unchanged. Import and coordinator assignment are separate explicit actions; no user/service grant is made by source configuration. Grant finalization only to the authorized whole-bundle coordinator.
The standard Waste group Platform contribution exposes this existing section
alongside participantAccessGroups when Carbon is an inactive source owner. Keep
that placement in `nodics.waste/config/properties.js`; customers select source
roots/topology, not duplicate standard section wiring. Discovery leaves EXPLICIT
installation, Profile assignments and provider qualification independent.


Definitions: carbon.holdings.read, carbon.holdings.reserve, carbon.holdings.transfer, carbon.holdings.release, carbon.evidence.record. Profile owns grants. Waste group composition includes wasteCarbon; deployment selects intended runtimes separately. No automatic entitlement follows from group membership. Permission definitions are an explicitly selected data/manifest.json section, never automatic grants. The optional Impact provenance handoff additionally needs waste.impact.evidence.read from Impact's forward carbonEvidencePermission section.

Lot identity is derived from the canonical issuance reference alone; changing provider identity cannot duplicate a registry lot. Realized allocation references have persistent cross-lot claims. Partial allocations need distinct authoritative allocation identities. Retain lot and claims together during recovery. Holdings return prospective/realized/reserved/available and a nonspendable total, plus owner-only allocation/acquisition references. Available means unreserved; transferable remains null and eligibility NOT_CHECKED until the provider is checked for an actual reserve/transfer.

Original contributor lookup uses the uniquely matched Waste asset's originalOwnerRef by sourceSubmissionCode, independently of current holder or certificate status. Without an asset, use canonical submission originalOwnerRef/submitterRef. Conflicting or ambiguous original-owner evidence rejects. No Waste Core field or transition is modified by this reader.

## Customization and failures

Override the configured provider through a later module's registered service, with a governed qualificationRef. Default null provider rejects unavailable. Invalid limits reject configuration. Exact decimal arithmetic rejects precision loss, insufficient quantities, same owner, foreign owner and replay changes. CAS conflicts require reload/retry; no in-process mutex claims cross-process safety. Provider errors do not erase reservations. Capacity limits reject new operations before persistence and retain all prior replay evidence.

## Permanent Mock Provider

For E15 simulation, select `DefaultWasteCarbonMockProviderService` using the
existing `wasteCarbon.evidence.providerService`. Both `wasteCarbon.mock.enabled`
(default false) and `wasteCarbon.evidence.allowSynthetic` (default false) must
be explicitly true. The existing qualificationRef remains required and defaults
to null. These definitions and all limits stay in owner properties. Later layers
supply only intentional overrides; there are no customer/program/quantity defaults.

The provider implements the existing readLot/eligibility interface. The input
evidenceRef must identify wasteCarbon/wasteCarbonMockEvidence. This governed,
tenant-isolated record contains code, revision, synthetic:true, qualificationRef
matching the effective qualificationRef, and evidence with synthetic:true plus
the existing lot contract fields and an explicit eligibility value. Its evidence
contains programRef, state, scale, unitOfMeasure, issuedQuantity and allocations;
contributor/partner references retain their existing meaning. No Impact estimate
is converted to issuance. No records, grants or live values ship with this change.

The adapter fixes evidenceRef and issuanceRef to the mock record reference,
providerRef to its owner-local mock identity, and allocationRef to a stable hash
of mock record code and allocation code. Supplied external issuance/provider/
allocation references cannot make this output real. The adapter never contacts
a registry. REALIZED and ELIGIBLE describe only the simulated contract outcome.
Both holding and component-operation projections retain synthetic:true.
Synthetic eligibility cannot qualify a non-synthetic lot.

Administrators provision governed scenario records through approved owner import
or generated service mechanisms, separately from selecting configuration. There
is no public scenario-write route. A separate tenant record is required in each
simulation tenant. Missing/wrong qualification, wrong namespace, non-synthetic
records, malformed settings, cancellation and missing repositories fail closed.
Revoking recorded eligibility blocks new reserve/transfer; existing finalization
and original-key recovery retain their current atomic semantics. Original
beneficiaries, cumulative allocation immutability, capacity limits, exact quantity
and recipient holds remain enforced by the canonical holding owner.

Local adoption requires an isolated simulation runtime/data scope, active
wasteCarbon/wasteCore/wasteSubmission, generated mock and lot repositories,
canonical persistence identity, explicit permission definitions and separately
approved service grants. Configure the three explicit selections above plus the
qualificationRef; provision scenario and original-beneficiary evidence separately.
Do not activate simulation against real registry holdings. Switching providers
does not promote a synthetic lot to real issuance. Live registry qualification,
external custody/transfer acceptance and deployment validation remain separate.

Maintainers verify this through wasteCarbonHolding.test.js (mock admission,
tenant/qualification isolation, eligibility revocation, beneficiary preservation,
destination hold and lost acknowledgement), plus carbonConfiguration.test.js.
Business users and evaluators must treat every such holding as simulated;
partner developers may replace the registered provider through the existing
contract while retaining its owner gates. No compatibility route or fallback exists.

## Native Platform Admin Admission

Existing command routes also accept access tokens. Owner admission requires the
canonical nRouter hasPlatformFullAccess(request) gate or the existing authorized
service principal, plus the exact capability permission. Only native PASSWORD
human access in the configured default tenant and Platform enterprise with the
reserved grant qualifies. Ordinary Admin labels, participants, represented or
linked sessions, foreign tenants, service-group membership and caller flags
cannot confer this authority. Normal authentication and security-stamp validation
remain mandatory; this gate is not a new persisted Profile proof RPC and does not
independently re-read grants during a long-running command.

Controllers retain the original bearer/authData; business ownerRef remains an
explicit target, not impersonation or an Enterprise-header replacement. Existing
human actor audit fields remain authoritative. Administrative reads require the
same exact owner references as service reads; participant self-scoped reads retain
their existing Profile admission. All evidence/provider, synthetic, ownership,
quantity/payment, CAS, finalization and original-key recovery checks still apply.
Waste's canonical post-admission persistence authority and Material's existing
internal Loyalty transport remain separate boundaries, not new task credentials.
No new role, profile, permission grant, configuration default or generic CRUD API
is required. The installed HTTP runner accepts the unchanged existing Admin bearer
and retains every explicit Local/mock gate. Source tests are not live acceptance.

## Installed Local HTTP Acceptance

This owner contributes a permanent installed HTTP command. It defaults to a
plan and never authenticates, mints/renews tokens, imports fixtures, assigns
permissions, funds a wallet, changes budgets or starts a runtime. Explicit
execution invokes the normal owner business commands and therefore persists
simulation outcomes. Source delivery does not authorize or perform Local adoption.

Use a reviewed JSON selection with exact keys. Common fields are contractVersion:1,
approvalReference, environmentCode (native name ending Local, not Docker),
localDemo:true, isolatedPartition:true, baseUrl (loopback HTTP(S) origin only),
tenant, enterpriseCode and runCode. These assertions document operator review;
they do not prove physical data isolation or grant signed tenant/Enterprise rights.
The existing server must verify the unchanged supplied native Platform Admin or authorized service bearer and scopes.
Unknown keys, external targets, missing credentials and malformed selections
reject. Supply no credentials inside selection files.

The owner properties define command wiring, a 10000ms request timeout, 65536-byte
selection limit, 262144-byte response limit and authorization environment name.
Transport refuses redirects, disables caching, bounds response envelopes and
sanitizes failures. Requests are sequential. There is no automatic retry or
compensating cleanup after timeout/unknown acknowledgement. Retain the original
selection and keys; inspect owner state before explicitly rerunning.
Installed providers must already be the enabled permanent mock services with
allowSynthetic:true and qualification-matched governed records. Real evidence
cannot pass the runner's synthetic and mock-reference assertions.

Tests use injected HTTP over actual owner services and permanent mock providers,
without network or live storage. Native persistence tests remain separate and
do not become installed-HTTP proof. Passing this runner establishes only the
selected synthetic owner journey, never real registry/recycler qualification.

Run `nodics project:run acceptance:waste-carbon --selection=<reviewed.json>`;
append `--execute` only for the authorized installed simulation. Supply the
complete existing `Bearer ...` value in
`NODICS_WASTE_CARBON_ACCEPTANCE_AUTHORIZATION`. The direct executable is
`src/service/acceptance/defaultWasteCarbonHttpAcceptanceService.mjs`.

Additional selection keys: evidenceRef, lotCode, ownerRef, recipientRef,
contributionRef, allocationCode, allocationQuantity, issuedQuantity, quantity,
unitOfMeasure, scale, manifestRef. References contain module/schema/code;
manifestRef additionally requires revision. evidenceRef must be
wasteCarbon/wasteCarbonMockEvidence. lotCode is CARBON_ plus SHA256 of the JSON
array [evidenceRef.module,evidenceRef.schema,evidenceRef.code]. Contribution is
wasteSubmission/wasteSubmission; owners are distinct Profile customer/enterprise
references. Quantities are positive fixed-scale strings matching scale 0..8.
Use an explicitly reviewed single-component simulation manifest; this runner
does not coordinate a real Digital bundle or attest another component's delivery.

The runner synchronizes selected mock issuance, asserts original allocation and
synthetic lot terms, rejects zero-quantity reservation, then reserves/transfers/
finalizes with operationKey runCode + ':transfer'. It checks the persisted
recipient acquisition and held/finalized state, identical finalization replay,
unchanged recipient projection, release-after-transfer refusal and exact operation
lookup. Completed operations are recoverable by the same selection/key.
Existing reviewed issuance must allocate sufficient quantity; permission failures,
missing evidence, changed beneficiary, unavailable provider or wrong receipts stop.
Prerequisites are the Carbon evidence/read/reserve/transfer/finalize/release service
permissions, active owner repositories and enabled mock qualification. The runner
creates no scenario records or grants. Owner pagination must expose the selected
lot on the recipient's first page; use a bounded dedicated fixture partition.


Runtime service actors use the Profile-issued `serviceId`; native human actors
use `loginId`. Carbon never borrows a human login as a missing service identity.
The same canonical actor projection binds sourceActor and finalizationActor on
holding operations. Tenant, explicit permission, owner and finalization checks
remain independent and mandatory; runtime group membership is not invented.
