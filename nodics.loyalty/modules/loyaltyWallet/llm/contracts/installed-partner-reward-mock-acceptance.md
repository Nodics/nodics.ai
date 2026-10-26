# Installed Local Partner Reward Mock Acceptance

Wallet owns `acceptance:loyalty-partner-reward-mock`, implemented by
`src/service/acceptance/defaultLoyaltyPartnerRewardMockAcceptanceService.mjs`.
It consumes the existing participant options, wallet, quote, confirm and status
HTTP APIs. It never authenticates, grants access, imports data, starts servers,
opens wallets, adds credit, changes policy or calls a database/provider directly.
Framework bounds and command registration live in Wallet properties. Customer
selections contain business identities and the explicitly reviewed Local target.

## Prerequisites And Selection

An operator must separately qualify the installed schema, original human session,
participant permissions, Profile source/partner Enterprise resolution and atomic
Loyalty persistence. The source wallet must already be OPEN, funded, and carry
persisted `metadata.sample: true` and `metadata.testOnly: true`. The conversion
owner checks these markers at quote and confirmation; public wallet projection
does not expose them. Never fund or relabel a wallet to make acceptance pass.

Separately select `loyalty.partnerRewardConversion.enabled: true` and
`loyalty.partnerRewardConversion.mock.enabled: true` in the approved Local
deployment. Both framework defaults remain false. Keep `providers.mock` inherited
from Wallet and select the governed integration's `providerKey: "mock"`.
This runner covers the default CREDITED mock scenario only. PENDING/UNKNOWN
retain holds and must not be converted into success by changing configuration.
Program eligibility requires `partnerConversionRewardTypeCodes` to explicitly
include the selected reward type; a default reward type is insufficient.

Use a reviewed external JSON file with exactly these fields (illustrative
identities below are not installed fixtures):

```json
{
  "contractVersion": 1,
  "approvalReference": "reviewed-local-acceptance",
  "environmentCode": "exampleLocal",
  "localDemo": true,
  "isolatedPartition": true,
  "baseUrl": "http://127.0.0.1:3005",
  "enterpriseCode": "signed-runtime-enterprise",
  "runCode": "retained-partner-conversion-001",
  "owner": { "ownerType": "ENTERPRISE", "ownerCode": "source-enterprise" },
  "walletCode": "existing-test-wallet",
  "integrationCode": "approved-mock-integration",
  "accountLinkCode": "approved-mock-link",
  "partnerEnterpriseCode": "partner-enterprise",
  "programCode": "approved-program",
  "rewardTypeCode": "points",
  "termsReference": "simulated:approved-terms",
  "termsRevision": "1",
  "amount": "1",
  "sourceScale": 0,
  "targetUnit": "SIMULATED_POINTS"
}
```

Supply the existing signed access token through
`NODICS_LOYALTY_ACCEPTANCE_PARTICIPANT_TOKEN`, never the JSON or command line.
`enterpriseCode` must match its signed `entCode` alias; business wallet owner
remains independently checked against the participant API. Decoding the alias
does not verify authority: the installed API verifies the unchanged bearer.
No caller-supplied tenant/auth context or service credential impersonation exists.
The environment/isolation declarations are operator assertions, not attestation
of the process behind the explicit loopback URL. Verify that target separately.

From the Wallet module, planning and explicit execution are:

```sh
node src/service/acceptance/defaultLoyaltyPartnerRewardMockAcceptanceService.mjs --selection=/absolute/reviewed.json
node src/service/acceptance/defaultLoyaltyPartnerRewardMockAcceptanceService.mjs --selection=/absolute/reviewed.json --execute
```

Planning reads only bounded JSON and emits stable identities without HTTP or
credential access. Execution issues at most eight HTTP calls, each bounded in
time and bytes, refusing redirects. There are no automatic retries or polls.
`runCode + ':convert'` is the original quote idempotency key; conversion identity
matches the coordinator's SHA-256 of `[walletCode, idempotencyKey]`. Never replace
the selection/key after uncertainty. Keep the source partition quiescent during
balance verification; concurrent source activity causes refusal.

## Evidence And Recovery

The runner requires one exact simulated option and checks original source,
partner, account link, terms, quantities, precision and `simulated: true` on every
result before progressing. A fresh QUOTED command must complete with one exact
source available/spent delta and unchanged reserved/earned values. Duplicate
confirmation and status must return the same result and unchanged balances.
An already started command returns RECOVERED with `sourceDeltaVerified: false`;
it never claims to have observed its historical debit. Refusals, timeouts,
expired quotes or incomplete outcomes stop without credit, replacement keys,
compensating release or provider rebinding. Inspect/reconcile the original
conversion through the owner before proceeding.

PASSED means installed simulated HTTP behavior plus observed local accounting.
It never proves real external credit, account verification, partner protocol,
registry qualification, or private ledger/redemption receipt contents. Public
responses deliberately omit those private receipts. Existing coordinator and
accounting tests cover the retained `simulated:` receipt invariant.
Simulation still spends existing test-wallet rewards when explicitly executed.
The framework does not auto-run this runner or make it a setup prerequisite.

`test/loyaltyPartnerRewardMockAcceptance.test.js` uses synthetic HTTP responses
only. It covers source/session selection, offline planning, successful and
recovered commands, replay, balance drift, malformed/error/oversize envelopes
and simulated/foreign-result refusal. Those tests are not installed acceptance.
Later deployments select their own JSON and approved overrides; preserve the
original signed bearer, simulation checks, bounds and stable identities.

## Targeted Program Eligibility Administration

Program now owns a targeted read/update service exposed through explicit Loyalty
API routes; see the [permanent administration contract](../../../loyaltyProgram/llm/contracts/partner-eligibility-administration.md).
Its source implementation is not installed acceptance. The earlier generic PATCH
procedure in this document was incorrect and must not be used. Program's schema declaration enables
`schemaOperations`, but `loyaltyProgram/package.json` declares
`nodics.runtime.router: false`. The module-level gate takes precedence:
`nConfig/src/utils/utils.js:isRouterEnabled` requires runtime router true, and
both `DefaultRouterService.registerRouter` and
`DefaultOpenapiContractGeneratorService.collectRoutes` check that gate.

The generic route template lowercases schema aliases and separates
`schemaOperations` from `commonGetterOperation`. Neither that template nor
`apiExposure.categories.schemaApi.enabled` establishes an installed Program
route. A GET query, a lowercase path, or another HTTP method cannot bypass the
module gate. Check the selected generated/live OpenAPI contract before offering
an operator command. The checked Local contract has no Program paths; read-only
Program capabilities and safe-search probes returned HTML 404. Participant
wallet/options probes reached authentication and returned JSON 401 without a
session, which proves route admission only.

After separate operator deployment and permission-vocabulary adoption, use
`POST /nodics/loyaltyApi/v0/admin/programs/partner-conversion-eligibility/read`
with exact `programCode`, then
`PUT /nodics/loyaltyApi/v0/admin/programs/partner-conversion-eligibility` with
`programCode`, its observed `expectedRevision`, the approved
`partnerConversionRewardTypeCodes` replacement array and `reason`. Both require
fresh native Super Admin proof with the unchanged human session. The Program
owner performs atomic revision CAS and last-change audit without funding.

Verify those exact routes in selected/live OpenAPI before executing. Existing
participant transfer-policy operations do not administer Program eligibility.
The mock integration/account release does not update the installed Program, and
changing its source record does not adopt it. Parent owns installed adoption;
do not broaden generic APIs, edit the database or replay a financial sample pack.

## Safe Participant Selection Reads

Use the existing signed participant bearer and its matching Enterprise transport:

- `GET /nodics/loyaltyApi/v0/participant/wallet` returns the current owner,
  existing `wallet.code` and balances. It does not open or fund a wallet.
- `POST /nodics/loyaltyApi/v0/participant/partner-conversions/options` with `{}`
  returns `walletCode` and eligible `integrationCode`, `accountLinkCode`, partner,
  source reward, terms and simulation markers. It creates no quote or hold.

These routes require `loyalty.wallet.read` and
`loyalty.partnerConversion.read` respectively and native human participant
admission. The options owner filters issuer-ineligible rewards, so an empty
options list does not disprove a successful integration/account import. Private
account references are deliberately absent. Do not use quote/confirm to discover
fixtures, or treat conversion status as a read-only probe: status can reconcile
an already confirmed operation. Without an existing authorized session, installed
wallet/account selections remain unverified; source sample codes are not readback.
