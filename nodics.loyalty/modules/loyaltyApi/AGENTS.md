# loyaltyApi

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Own explicit Loyalty APIs for service-to-service integration. Keep public routes resource-oriented and avoid Commerce-specific coupon/order/payment language in route ownership.

Authorized wallet reads use Loyalty's existing service-owned storage context;
group-free runtime credentials must not acquire administrator groups. See the
wallet-read contract and `test/loyaltyWalletReadContext.test.js`.

Exact balance/ledger evidence uses the protected capability routes documented in
`llm/contracts/README.md` and `test/loyaltyReadEvidence.test.js`. Preserve the
original groupless runtime principal, exact customer/source binding, tenant and
permission checks, bounded generated owner reads and reversal ambiguity refusal.
Never substitute wallet-opening projection calls or hidden schema HTTP reads.
`wallet-evidence` permits an omitted wallet code only for one exact existing
CUSTOMER owner; customer/program/reward selectors remain required. An explicit
invalid or missing wallet code never falls back. Do not turn this into a general
query or wallet-opening endpoint; test both selector modes and no-create refusal.
Tenant is the authenticated generated-read partition, not a required stored
wallet/balance/ledger property. Evidence DTOs derive tenant from that verified
context without mutating rows; explicit contradictory row tenants and read-context
drift refuse. Cover canonical rows with no tenant field in the evidence tests.
An explicit business enterprise selector requires one exact readEvidence caller
grant when it differs from the signed principal enterprise. Preserve every
original deployment coordinate, tenant, groups and enterprise claim; HTTP headers
alone never delegate. Recheck policy/credential drift across generated reads.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
