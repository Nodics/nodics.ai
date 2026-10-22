# Axis Participation Contract

Wallet owns records and policy; LoyaltyAPI owns HTTP admission; Profile proves
canonical participants and platform administrators. The provider
`DefaultLoyaltyWalletBackofficeCapabilityService.init` registers `loyaltyWallet`
with the actual module-registration service. Axis dispatch is in
`nodics.axis/src/app/App.tsx`, implementation in
`src/operations/loyaltyParticipation`. No module composition is changed here.

## Exact Views

All bindings use native renderer contract v1 and workspace `loyalty.participation`:

| View | Axis Route | Existing LoyaltyAPI Contract | Permission |
| --- | --- | --- | --- |
| `loyalty.wallet` | `/loyalty/wallet` | GET `/participant/wallet` | `loyalty.wallet.read` |
| `loyalty.transferSettings` | `/loyalty/transfer-settings` | POST `/participant/transfer-policy/read`, PUT `/participant/transfer-policy` | `loyalty.transfers.manage` |
| `loyalty.enterpriseTestCredit` | `/loyalty/enterprise-test-credits` | POST `/admin/enterprise-test-credits` | `loyalty.wallet.testCredit` |

The discovered `loyaltyApi` connection carries the original bearer and Enterprise
namespace. No browser-fabricated runtime principal or storage endpoint exists.
Metadata filtering does not replace the platformAdministratorUserGroup route,
fresh Profile administrator evidence or Wallet's environment, test-marker,
reward eligibility and atomic-ledger checks.

## Presentation And Defaults

The explicit optional `participationWorkspace` CMS release contains one localized
copy component, its type/renderer binding, one existing-template page and three
routes. It reuses `axisCmsSite`, `axisContentCatalog` and
`axisSchemaWorkbenchPageTemplate`; no competing frontend CMS renderer is added.
The existing `axis.component.message` transports copy, not backend policy.
Import/publication remains governed and was not run.

Framework defaults remain solely in Wallet `config/properties.js`:
`loyalty.participantWallet`, `loyalty.transfers`,
`loyalty.enterpriseTestCredits` and `loyalty.transactions`. No new policy
defaults or customer overrides were needed. Axis shows effective settings and
edits only the five allowed governed selections, including removing an override
to inherit. It cannot change fees, time zone, global enablement, transaction
qualification or framework ceilings. Reward precision remains owner data.
Blank credit fields select no wallet, reward, amount or reason.

## Evidence And Recovery

Wallet reads never provision or fabricate zero balances. Missing wallet is
explicit; recent ledger entries use the owner's configured maximum, not a
frontend-selected history limit or a complete export.

Settings writes require review and the exact returned revision, including null
for initial creation. The renderer rereads selections before success. Uncertainty
freezes intent; inspection proves the selected state, allows only an unchanged
revision retry, or reports a conflict and loads current selections. This proves
observed state, not the identity of a concurrent writer.

Test credit is an explicit reviewed command, not normal funding, invoice
settlement or a balance edit. It retains the exact decimal string, wallet,
program, reward type, reason and UUID across uncertainty. Retry requires another
confirmation of that same command. After a page reset, explicit original-command
recovery requires the retained key and exact original fields; Wallet independently
checks immutable intent. No browser storage or offline queue persists financial
commands. The receipt describes the original allocation, not current spendable
balance. No new credit is offered while the result is uncertain. Authority
replacement discards private state and late results cannot restore it.

## Verification Boundary

`test/loyaltyParticipationWorkspace.test.js` checks actual provider registration,
secured route alignment, inert defaults and exact presentation hashes. Axis
component tests mock transports and cover evidence, overrides, confirmation,
conflicts, uncertainty, context replacement and offline refusal.
Installed registration, governed publication, real grants, isolated test marking,
Profile proof, transaction/index qualification and E2E remain final-phase gates.
No live enablement, assignment, provisioning or funding ran.
