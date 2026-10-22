# wasteCore Agents

Certificate asset states, operation phases and operation states are declared in
`src/utils/enums.js` and consumed through loaded `ENUMS`. Array definitions use
their string keys; mapped phase definitions use their wire values. Enum extension
does not authorize a transition: preserve explicit operation allowlists, original
beneficiary/custody guards and fresh private admission. Document exported helper
inputs, outputs, persistence effects, failures and override boundaries.

Asset owner/original-owner/physical-owner/digital-owner and event from/to fields
are typed Profile descriptors, not static customer child references. Owner
commands validate customer/Enterprise identity. Never restore customer-only
refSchema targets: save-time traversal runs even with recursive:false and can
otherwise attempt nested customer writes for an Enterprise descriptor.

Coupon certificate holds/consumption use `DefaultWasteCertificateCouponService`
and the same generated asset/event CAS owner. Require fresh domain admission and
exact Digital acquisition source evidence for every mutation. `REDEEMED` is final;
only a failed, uncompleted acquisition may release a reservation. Never transfer
the original contributor's rewards, carbon or material entitlements implicitly.
Reusable limits and evidence transport defaults belong in this module's
`config/properties.js`, under `waste.certificateCoupons`.

Certificate bundle mutations belong to the existing asset/event persistence
boundary through `DefaultWasteCertificateBundleComponentService`. Require eWaste's
fresh authority callback, generated CAS and exact original-operation readback.
Never unlock during transfer or change physical custody/contributor entitlements.
See [certificate holdings](llm/contracts/README.md#certificate-bundle-holdings).

Follow [scoped business Workbench](llm/contracts/business-workbench.md) for ordinary
business reads. Keep Waste Core's employee schema ACL at zero; admit owner commands
before canonical identity persistence. Discovery and reads use `wasteApi`, current
Profile collection scopes and persisted enterprise links, not generic schema grants.
Do not treat sibling modules' independent schema policies as fixed by this ACL.

The module owns explicit ordinary business access definitions in
`data/manifest.json` sections `businessAccessGroups` and `businessAccessRoles`.
Keep mappings on persisted Profile roles and user groups; never infer grants from
verbs or add approval, financial, simulation, or platform bypass authority.
Source packs alone never change an employee's assignments. Existing employee
level changes and scoped No access use Profile's reviewed business-access command,
preserving other areas, advanced responsibilities, scope and registration proof.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Completed digital sales are final; no automatic asset-reversal mutation service
remains. Preserve historical REVERSAL events, refund metadata and locked receipts
as evidence, not executable replay authority. Do not restore the retired adapter
or infer permission to clear an installed lock. See
[historical refund evidence](llm/contracts/README.md#original-digital-sale-refund).

The transfer owner also owns strictly unfenced RESERVED captured/refunded
cleanup through `digitalCompensationState`, `fenceDigitalCompensation` and
`completeDigitalCompensation`. CAS cancellation precedes qualified owner absence
reads and blocks fresh/stale capture preparation. Never release capture/settlement
fences, infer financial absence or execute wallets. Retain original financial
proof, command, custody and asset/event revision fences; uncertain reads keep
locks. See the refunded-reservation contract and eWaste real-owner bridge tests.
No new routes, permissions or activation defaults are needed.

`wasteCore` owns shared Waste enum, status, source-reference, and policy defaults.
Retained pending listing completion requires the domain-owned revalidation
callback and original intent key/revision/digest before every write. Preserve
existing LISTED onboarding and exact generated CAS recovery; never accept client
proof objects as approval or binding authority. See the retained listing contract.
Common Waste reference data belongs here when it serves the whole Waste
functional module. Do not place material records, submissions, receipts, impact
results, movement, or partner policy here.

`holdLegacyRequest` owns only the managed asset audit receipt for a domain-qualified
legacy request. Require original human/tenant identity, fresh domain revalidation,
revision/snapshot admission and exact successor recovery. Preserve status,
ownership, custody and listing evidence. A receipt blocks listing completion but
does not establish external absence or a distributed writer fence.

Keep generic verification presentation policy-neutral: verification does not
imply a different approver. Preserve the explicit `differentApproverRequired`
label for the owner-enforced separate-actor gate. Presentation never changes
permissions or decision policy. See [the presentation contract](llm/contracts/README.md#verification-presentation).

Waste Core owns only the generic Waste Management dashboard anchor and its All submissions and Review queue links. Accelerator subgroups and family-specific view properties belong to their accelerator. Apply `../../../nodics.foundation/modules/nSetup/llm/contracts/module-owned-ui-contribution-contract.md`; never add placeholders for future accelerators.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Waste Core owns inert Waste acceptance defaults under `tooling.acceptance`.
Resolve the WASTE and PLATFORM roles from the selected topology; do not copy
customer environment names, server names, ports or initialization profile codes.
Waste Core owns the complete protected `acceptance:waste-backoffice` suite.
It checks existing authorized registration and navigation without identity
migration, runtime grant expansion, automatic activation or runtime startup.
Customers supply topology and employee credentials, not replacement assertions.

Installed reference inspection belongs to Waste Core and the secured Waste API,
not a customer repair script or enabled generic CRUD router. Preserve the
[installed evidence contract](llm/contracts/README.md#installed-evidence-inspection):
tenant-wide permission, bounded generated reads, transaction fingerprints only,
operator-policy conflict rejection and nImport-owned exact release provenance.
Inspection is not migration authority or an atomic snapshot.
Effective inspection configuration may narrow the owner resource inventory and
disclosure only. Preserve the enforced transaction fingerprint ceiling and
multi-page checksum regression coverage; never turn a transaction into a
reference response through configuration.
