# Enterprise Test Credit

Owner: `loyaltyWallet`. Entry point:
`DefaultLoyaltyEnterpriseTestCreditService.credit(request)`.

This is a confirmed Super Admin command for an existing, explicitly marked test
Enterprise wallet. It is not nImport, wallet provisioning, a balance setter,
production funding, a customer credit command, or a source of carbon units.
Implementation is in the Wallet owner because it composes canonical earning,
balance projection and replay evidence. Profile remains the only identity and
platform-administrator authority; loyaltyApi remains transport only.

## Admission And Interface

### Separate Zero-Balance Provisioning

`PUT /nodics/loyaltyApi/v0/admin/enterprise-test-wallets` delegates only to
`DefaultLoyaltyEnterpriseTestCreditService.provision(request)`. Exact body:

```json
{
  "enterpriseCode": "existing-test-enterprise",
  "programCode": "selected-program",
  "rewardTypeCode": "selected-point-type",
  "reason": "Reviewed isolated Enterprise wallet",
  "confirmed": true
}
```

In addition to every native Super Admin, environment, POINT program and persistence
gate below, `loyalty.enterpriseTestCredits.provisioningEnabled` must be exactly
true (default false). Profile resolves the existing target Enterprise using the
original credential. The selector never changes the signed administrator's
Enterprise or tenant. No amount, test marker, actor, wallet code, environment,
transaction handle or additional payload field is accepted.

Creation atomically inserts the canonical owner wallet and canonical program/type
balance using their existing deterministic identity owners. All six counters are
zero; no ledger or credit receipt is created. The owner supplies test markers and
immutable `metadata.testProvision` intent, precision, original administrator
proof references and provision time on both records. The owner wallet identity
is the replay key: the first program/type/reason intent is retained for that test
wallet. This command cannot extend it to another program or change its reason.

Exact replay returns CURRENT with the original actor and time, including after
later credit/spending; it never resets counters. Existing ordinary/unmarked,
foreign, ambiguous, partial or contradictory wallet/balance evidence refuses.
There is no adoption, repair or relabeling branch. Lost acknowledgement requires
the identical PUT. Unique code indexes and one qualified transaction protect
concurrent requests. Fresh authority is checked before qualification, inside the
transaction and before the final result.

Response fields: status (PROVISIONED or CURRENT), testOnly, walletCode, balanceCode,
ownerType, ownerCode, programCode, rewardTypeCode, actorCode and provisionedAt.
This is provisioning evidence, not funding or a current balance. Funding remains
the separate confirmed POST below with its own stable key. Service-only `/wallets`
still opens ordinary wallets and cannot supply test qualification. Neither route
selection nor an environment label proves production-provider isolation; the
deployment operator must establish isolation before enabling either command.

### Credit Existing Qualified Balance

The request carries the original verified `tenant`, `authData` and signed
`authorization`. The exact payload is:

```json
{
  "walletCode": "existing-test-wallet",
  "programCode": "selected-program",
  "rewardTypeCode": "selected-point-type",
  "amount": "100.00",
  "reason": "Reviewed Enterprise demonstration allocation",
  "idempotencyKey": "unique-confirmed-command",
  "confirmed": true
}
```

No extra payload fields, caller query, caller transaction token, numeric amount,
owner/actor overrides, environment selector, or funding flags are accepted.
Identifiers are bounded; reason must be nonempty, trimmed and control-free.
The existing `loyalty.wallet.testCredit` permission is necessary, not sufficient.
The caller must be a native human PASSWORD access-token principal with positive
`authVersion`, no system identity or linked/session/runtime identity context.
The token tenant must equal the storage tenant. This does not authorize a
platform administrator to cross tenants or fabricate Enterprise credentials.

Successful output is:

```js
{
  status: "CREDITED", // CURRENT on exact replay, including after later spending
  testOnly: true,
  operationCode, walletCode, ownerType: "ENTERPRISE", ownerCode,
  programCode, rewardTypeCode, amount, ledgerEntryCode, actorCode, creditedAt
}
```

The output is original posting evidence, not a current available balance.
`actorCode` is the original administrator; `ownerCode` is the existing recipient
Enterprise. A different currently admitted administrator can retry the same
intent but cannot overwrite its actor or reason. The stable operation identity
hashes tenant, actual selected environment and command idempotency key, excluding
mutable amount/target/actor fields so changed intent conflicts rather than funds
again. Any uncertain commit is retried with the same key, never a fresh key.

## Existing Owner Reuse

- Sample credit's `persistence`, `read` and `scale` helpers supply existing
  transaction/schema/index qualification, bounded exact generated reads, and
  active POINT precision/earning checks. No importer selection, approval file,
  contribution load or installation method is used.
- Participant `profile` supplies original-token remote Profile transport, using
  its framework-defined timeout. `recipient` calls `/participants/resolve` for
  an exact active same-tenant existing Enterprise. Participant scopes alone do
  not prove platform-administrator authority.
- Reward operations supply private generated-storage `serviceRequest` only
  after human owner admission. This does not replace the signed token sent to
  Profile, grant public generic CRUD, or create a synthetic funding principal.
- `transaction.compose` and canonical `earn`/`join` commit the balance CAS,
  EARN ledger and command receipt atomically. Real same-database wrappers,
  non-versioned transactional schemas, no cache/events, installed nonpartial
  unique code indexes and balance compare-and-set support are mandatory.

Both existing wallet and existing program/type balance must have
`metadata: { sample: true, testOnly: true, testEnvironment: <actual selected environment> }`.
The wallet is active, OPEN and ENTERPRISE-owned. Neither record is created or
reclassified by this command. Governed provisioning supplies those markers;
public callers cannot attach them. The program must select the reward type in
`testCreditRewardTypeCodes`, permit earning, and be within any validity window.
Only active POINT types and their explicit precision are accepted. The actual
environment allowlist must select isolated test deployments; test assets must
not be connected to production providers by deployment governance.

Before writing, the coordinator rejects orphan ledger evidence under the same
command. After earning, it verifies the exact ledger intent, original actor audit,
all six balance counters, revision, retained test markers and durable receipt.
The ledger metadata contains `operatorCode` and `testCredit` with contractVersion,
testOnly, environmentCode, ownerCode, intent (including reason/key) and actor
proof references. Signed tokens and proof nonces are never persisted.

Fresh Profile proof is checked before storage qualification, inside the
transaction before target reads, and immediately before returning the committed
result (including replay). An observed revocation, context mutation, environment
change or persistence mismatch aborts. Profile reads are not a distributed lock:
this does not claim atomicity between a remote identity revocation and the final
database commit. The original credential and all original command/context values
remain pinned throughout the operation.

## Integrated Properties

The parent integrated this complete definition under `loyalty` in **framework**
`loyaltyWallet/config/properties.js`. Source integration does not select an environment
or enable funding:

```js
enterpriseTestCredits: {
  enabled: false,
  provisioningEnabled: false,
  allowedEnvironments: [],
  maximumReasonLength: 500,
  platformAdministratorEvidencePath: '/identity/platform-administrator/evidence',
},
```

There is no inline production fallback. The reader validates the enabled value,
DMS local `loyaltyWallet` ownership and explicit OPERATIONAL publication, unique
bounded environment identifiers, positive integer
reason limit and absolute owner path; absent/malformed/unselected configuration
refuses. Customer/runtime configuration may carry only intentional overriding
values, never copies of definitions/defaults. Programs carry business reward
selections. Do not activate a test environment, grant permission or enable
transactions as part of integrating these definitions. Existing framework
`loyalty.transactions.moduleName` and Core amount defaults remain authoritative.

## Integrated Schemas

The parent integrated this Wallet schema before its existing final transaction/index
registration loop in `loyaltyWallet/src/schemas/schemas.js`, reusing the existing
private `transferRecord` helper:

```js
module.exports.loyaltyWallet.rewardTestCreditOperation = {
  ...transferRecord({
    ownerType: { type: 'string', required: true, enum: ['ENTERPRISE'], description: 'Canonical test recipient type.' },
    ownerCode: { type: 'string', required: true, description: 'Existing recipient Enterprise, distinct from administrator.' },
    testOnly: { type: 'bool', required: true, description: 'Explicit non-production allocation marker.' },
    environmentCode: { type: 'string', required: true, description: 'Actual selected test environment at posting.' },
    intent: { type: 'object', required: true, description: 'Immutable wallet/program/type/amount/reason/idempotency command.' },
    scale: { type: 'int', required: true, description: 'Original governed POINT precision for exact replay.' },
    actor: { type: 'object', required: true, description: 'Original actorCode/authVersion/authorityTenant/authorityEnterpriseCode proof references.' },
    ledgerEntryCode: { type: 'string', required: true, description: 'Atomic canonical EARN ledger reference.' },
    creditedAt: { type: 'date', required: true, description: 'Original allocation time.' },
    revision: { type: 'int', required: true, default: 0, description: 'Immutable receipt revision.' },
  }),
  backoffice: { enabled: false },
};
```

The generated service name must be `DefaultRewardTestCreditOperationService`.
Program and RewardType policy reads retain the same opaque transaction context
as wallet operations. Their owning schemas explicitly declare side-effect-free
transaction participation with cache and events disabled. Do not remove the token
or relax database eligibility to make policy reads succeed. The test-credit suite
crosses the canonical database transaction owner and Mongo `getItems` boundary
with actual owner schema definitions and an isolated driver/session double; it
also rejects missing participation and enabled cache/events. This is not live
database acceptance.

The existing loop supplies `transaction: { enabled: true, sideEffects: 'none' }`
and unique code index. Retain no generic router, no cache/event/search, no CMS
publication or receipt mutation command. Tenant is the runtime partition, not a
business field. No new wallet/balance fields are necessary; existing metadata
holds the test markers. No ledger schema change is necessary; existing metadata
holds immutable audit.

The parent integrated this field in `loyaltyProgram/src/schemas/schemas.js`,
the existing governed `loyaltyProgram.loyaltyProgram.definition` (Program owner):

```js
testCreditRewardTypeCodes: {
  type: 'array', required: false,
  description: 'Explicit POINT reward types eligible for isolated Enterprise test allocations.'
},
```

Missing/empty selection refuses; do not seed active programs or balances here.

## Integrated Profile Proof

Implemented **Profile-owned** endpoint:
`POST /identity/platform-administrator/evidence`. Transport uses PLATFORM Profile
with the original Authorization and original X-Enterprise-Code, same tenant,
one attempt and the existing participant identity timeout. Exact request:

```js
{ permission: 'loyalty.wallet.testCredit', nonce: '<fresh UUID>' }
```

Successful evidence (normal `data`/`result` envelopes are supported):

```js
{
  contractVersion: 1,
  nonce: '<unchanged request nonce>',
  tenant: '<verified token tenant>',
  enterpriseCode: '<verified native token enterprise>',
  actorCode: '<verified native human loginId>',
  principalType: 'human',
  platformAdministrator: true,
  permission: 'loyalty.wallet.testCredit',
  authVersion: '<same positive integer as current token>'
}
```

Profile must validate the original signed native PASSWORD access token, current
active employee, current authVersion, active native membership and persisted
dedicated `platformAdministratorUserGroup` authority in the configured platform
default tenant/Enterprise; validate the actual reserved group and explicit
platform wildcard permission plus the requested permission using the canonical
Profile/platform access contracts. Refuse disabled/revoked actors, service/system
or session-linked principals, ordinary enterprise/adminGroup membership and
scope mismatches. Resolve evidence freshly, no cached role flag or caller-supplied
principal/authority fields. Echo the nonce only after admission; emit no token,
private group catalogue or extra identity payload. Limit requested permission to
this command (or a future explicitly governed owner allowlist).

Neither `/identity/scopes/me` nor `/participants/resolve` supplies this proof.
The dedicated Profile service/controller/facade/router and fresh native authority
checks are implemented. See the Profile
[evidence contract](../../../../../nodics.platform/modules/profile/llm/contracts/platform-administrator-evidence.md).
The endpoint must not be faked by Wallet, implemented as a
service-account fallback, or replaced with the broad legacy
`isPlatformAdministrator` helper that can accept service/system identities.
Native membership means existing direct persisted Employee group assignment in
the authority partition, not an optional enterpriseAccessAssignment. Source
integration does not qualify live identity, storage or test-environment selection.

## Integrated API And Status

The parent integrated this Loyalty API command route (not a schema route),
preserving the existing module router prefix:

```js
enterpriseTestCredit: {
  secured: true, authTokenTypes: ['access'],
  accessGroups: ['platformAdministratorUserGroup'],
  permission: 'loyalty.wallet.testCredit', apiExposure: 'loyaltyParticipation',
  cache: { enabled: false }, requestPrivacy: { sensitive: true },
  key: '/admin/enterprise-test-credits', method: 'POST',
  controller: 'DefaultLoyaltyInternalController', operation: 'enterpriseTestCredit'
}
```

Controller method (existing `headerValue`/`invoke` contract):

```js
enterpriseTestCredit: function (request, callback) {
  request.authorization = this.headerValue(request, 'Authorization');
  request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
  return this.invoke('enterpriseTestCredit', request, callback);
},
```

Facade method:

```js
enterpriseTestCredit: function (request) {
  return this.service('DefaultLoyaltyEnterpriseTestCreditService').credit(request);
},
```

The parent integrated stable owner status entries for `ERR_LOYALTY_TEST_CREDIT_UNAVAILABLE`,
`ERR_LOYALTY_TEST_CREDIT_INVALID`, `ERR_LOYALTY_TEST_CREDIT_FORBIDDEN`,
`ERR_LOYALTY_TEST_CREDIT_INELIGIBLE`, `ERR_LOYALTY_TEST_CREDIT_CONFLICT`.
Existing transaction, amount, participant and sample-qualification owner errors
may also propagate; do not turn them into successful funding. Keep the existing
permission definition ungranted. Update Wallet README/contract index and API owner
guidance when integrating shared files; do not change recipient/transfer owners.

## Verification Boundary

Provisioning coverage includes atomic zero-only creation without ledger effects,
concurrent replay, lost acknowledgement, post-credit replay, original actor audit,
default-off/environment/native authority/program/index refusal, invalid fields,
ordinary-wallet refusal and rollback after incomplete writes. LoyaltyAPI's
participant contract test verifies PUT routing, original credentials, private
response, error propagation and that provisioning cannot dispatch credit.

`test/loyaltyEnterpriseTestCredit.test.js` connects the real command, real reward
operations, real transaction compose/join, real participant transport and real
sample safeguards. Only generated persistence, canonical database provider,
security pipeline and Profile responses are isolated doubles. It covers durable
receipt/ledger/balance evidence, rollback and false acknowledgements, concurrent
same-key serialization, lost commit acknowledgement, post-spend replay, audit
conflicts, default-off/environment gates, identity proof, revocation, original
token pinning, production-target refusal, precision and persistence admission.

`profile/test/profilePlatformAdministratorEvidence.test.js` additionally verifies
the actual original-token Wallet-to-Profile proof handshake through the real
Profile controller/facade/service and fresh native identity owners.

These are unit/owner-contract tests, not database or live Profile acceptance.
Concurrent tests simulate canonical serializable transactions; they do not
qualify an actual database installation. No environment, provider, permission,
server or data import is activated. The service and required shared
schema/config/API/Profile source additions are integrated. Installed indexes,
schema adoption, current native authority and explicit test deployment selection
remain live qualification/operation work, not missing endpoint implementations.
