# Loyalty Wallet

`loyaltyWallet` defines reward wallet ownership and balance projections per program and reward type. Balance changes must be explained by ledger entries.

Authenticated participant transfers reuse the same accounting primitive as private
transfers. Profile resolves canonical customers and represented Enterprises;
Loyalty applies issuer eligibility, separate incoming/outgoing selections, shared
owner limits and confirmed fees. See [Participant Transfers](llm/contracts/participant-transfers.md).
Circa retains only actor/owner-scoped original transfer references across same-tab
reloads and queries the existing owner status route. Storage failure stops dispatch;
unknown results never authorize a fresh transfer. Completed owner evidence clears
the matching reference without blocking legitimate new transfers.
`acceptance:loyalty-participant-transfer` is the Loyalty-owned live command. It
requires explicit execution, one reviewed project JSON selection and existing
Customer and Enterprise sessions. It verifies fees, limits, owner separation,
uncertain recovery and replay without provisioning identities, wallets, rewards,
policies or permissions.
Partner reward conversion uses protected outcome-based holds and qualified adapters;
it is disabled by default. See [Partner Conversion](llm/contracts/partner-reward-conversion.md).
Its participant choice projection reads existing verified owner links and eligible
issuer rewards without opening a wallet or contacting a partner for credit. The
Circa consumer uses retained quotes and original-reference reconciliation; empty
provider selection remains unavailable. Canonical public documentation now uses
the Staged `docs-v002` successor; prior release bytes remain retained.

Axis has source-wired participant wallet, Enterprise transfer-settings and Super
Admin test-credit views. Wallet registers exact `loyalty.participation` native
bindings; commands use existing `loyaltyApi` routes and the original token. The
optional `participationWorkspace` release supplies CMS copy using the existing
Axis Site/template. ACTIVE metadata means an implemented renderer, not installed
data, permission grants, transaction qualification or test-credit enablement.
See [Axis participation](llm/contracts/axis-participation.md).

Reviewed sample-credit contributions are disabled by default. A deployment may
explicitly select a Local or non-Local demo environment through the existing
`loyalty.sampleCredits.allowedEnvironments` and exact `approvedSources` pins;
environment class alone grants nothing. Human permission, sample ownership,
original balance, atomic posting and once-only replay remain mandatory. See
[Sample Credit Admission](llm/contracts/sample-credit-admission.md).

The first operation service owns balance mutation for `earn`, `reserve`, `capture`, `release`, and `reverse`. It coordinates reservation, redemption, and ledger persistence through generated services without storing tenant or enterprise fields in Loyalty models.

Wallet projections return up to 100 recent ledger entries, ordered by posting time descending with the code as a stable tie-breaker. The generated database request uses `searchOptions` for its page size and ordering; owner and runtime tenant scopes remain authoritative. This bounded projection is not a complete history export.

Exact recovery evidence uses the private LoyaltyAPI wallet/ledger evidence
capabilities with explicit CUSTOMER or ENTERPRISE `ownerType`/`ownerCode`.
The original ledger selects the wallet, and both owner fields must match. No
wallet is opened, no reward is posted, and no bounded-history absence proves a
missing movement. Runtime grants and authenticated tenant remain unchanged.

The same private evidence owner exposes exact active Program/RewardType precision
and revisions via LoyaltyAPI `/reward-unit-evidence`. This wallet-independent read
uses canonical Loyalty Core validation and repeated bounded owner reads. It never
copies precision authority into a consumer's context record or opens a wallet.

Reservation and redemption evidence uses exact codes and verifies the persisted
lifecycle record through its canonical wallet owner. The API is read-only and
does not treat a ledger reference alone as independent lifecycle proof.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
