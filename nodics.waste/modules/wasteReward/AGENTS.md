# wasteReward Agent Contract

Follow `../../AGENTS.md`, repository guidance and global nSetup contracts.

Stable material release/evidence states and governed policy vocabulary belong
in `src/utils/enums.js`, consumed through effective `ENUMS` with unchanged wire
strings. Shared record/receipt states remain in wasteCore. New enum members do
not enable transitions or financial release. Exported methods document inputs,
results, effects/failures and override obligations; tests load real owner enums.
Category attribution weight digit bounds belong to
`wasteMaterialValue.validation.categoryWeightDigits`, not a service regex limit.
Keep positive-integer grammar and the inherited 30-digit ceiling unchanged.

- Own reusable Waste reward-assessment persistence and read models.
- Do not move eWaste-specific property semantics here.
- Do not duplicate `nodics.rulesEngine` evaluation.
- Do not duplicate Loyalty wallet/ledger operations.
- Reuse nCommon `exactAmount` through the material owner's mergeable `amount()` accessor; do not import Loyalty runtime arithmetic or implement a second decimal engine. Preserve input precision guards and fixed-scale wire values.
- Material settlement uses canonical internal-token transport with `requireInternalAuth:true`. Do not derive an outgoing Enterprise header from tenant, beneficiary or incoming signed aliases; preserve the original request and scopes unchanged.
- Preserve ESTIMATED and CONFIRMED/RECALCULATED assessments independently.
- Reward assessment records are append-only business evidence; do not overwrite historical calculations.
- Material-value assessment and release are explicitly owned here: read llm/contracts/material-value.md. Release is a payment-evidence-gated handoff to existing Loyalty earning, never a wallet mutation, payment execution or second ledger.
- Keep rates, shares, programs, beneficiary and payer/payee evidence in governed records. No program/rate defaults; config/properties.js alone defines reusable defaults. Missing qualified valuation/payment adapters must fail closed. No physical receipt or caller paid flag proves recycler payment.
- Participant allocation reads consume current Profile identity/scopes using the original bearer via DefaultWasteMaterialValueReadAccessService. Body ownerRef is only an exact assertion, never authority. Preserve explicit denies, represented-Enterprise isolation, private/no-store routes and service-only full evidence/mutations.
- Cross-module tests must exercise the actual Loyalty controller/facade/wallet/earning handoff, not only ledger builders. Require matching source, target, reason and Material value provenance before completion. A posted reward with incomplete response evidence remains pending reconciliation; never change its source key or issue a replacement credit. Qualified atomic Loyalty transaction execution remains a deployment acceptance requirement.
- Native persistence acceptance must remain owner-local, opt-in and isolated to a random database on an explicitly supplied credential-free loopback replica set. Synthetic valuation/payment/Loyalty ports may test frozen intent and recovery only; they never qualify recycler payment or live settlement. Permission import tests use the actual release files and Foundation admitted dispatch without creating Profile assignments.
