# loyaltyWallet

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Own wallet and per-reward balance contracts. Wallet owner identity must remain `ownerType` plus `ownerCode`; do not add tenant or enterprise fields as ordinary wallet data.

Reviewed Local sample credits retain exact source/intent, human permission and
original-balance guards. Qualify real identical schema database wrappers before
record reads; fix inherited registration in nDatabase, never weaken transaction
identity in Loyalty. Diagnostic blockers allow only fixed gates and the three
fixed participant schema names. See `llm/contracts/sample-credit-admission.md`.

Protected wallet evidence may omit `walletCode` only to select one exact existing
CUSTOMER owner with required customer/program/reward selectors. Preserve explicit
code mode, bounded ambiguity detection, verified read partition and original
caller credentials. Never call wallet open/projection or derive a wallet code for
this read. Missing, closed, inactive, foreign and ambiguous wallets must refuse
without creating records. See `llm/contracts/README.md` and loyaltyApi evidence tests.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
