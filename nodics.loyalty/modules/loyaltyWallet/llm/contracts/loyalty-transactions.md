# Optional Loyalty Transactions

`DefaultLoyaltyTransactionService.run(request, operation)` implements the existing
`DefaultLoyaltyRewardOperationService.transaction` hook. It also supports an
authorized owner composing generated reads, balance/ledger writes and postreads
inside a single awaited callback. It grants no permission or frontend authority.

## Selection And Scope

The effective `loyalty.transactions.enabled` must be exactly `true` to enable the
bridge. Missing configuration or any other value preserves legacy pass-through:
the callback runs directly, without checking provider availability or changing the
request. That mode makes no atomicity claim. `qualify(request)` is a synchronous,
read-only admission check for enabled execution; it throws while disabled and never
starts a transaction, mutates the request or issues a token.

Enabled execution selects `loyalty.transactions.moduleName`, defaulting to the
stable `loyaltyWallet` capability identity, plus the original request tenant (or
`authData.tenant` when the request tenant is absent). Conflicting tenant selectors
refuse. Payload fields never select the module, tenant, database or provider.
The selected owner module must resolve every participating generated model to the
same canonical database wrapper; sharing a physical database name is insufficient.

`databaseTransactions` must have `enabled: true`, `failClosed: true` and a positive
safe integer `maximumCommitTimeMs`. The loader-composed canonical database service
must expose `capabilities` and `execute`, with effective `multiRecordAtomic: true`
and `contextPropagation: true` for the exact scope. Refusal happens before work.
No provider, database or project identity is hardcoded here.

## Token And Identity Ownership

The canonical owner issues the opaque token. The bridge temporarily installs that
exact object on the original request, because reward operations close over that
request. Awaited work sees it; finally restores the original property descriptor
or absence on success and failure. Undefined data properties are supported;
accessors and immutable slots refuse. Separate requests may run concurrently;
sharing one active request between parallel transactions is unsupported and
refuses when its token is present. Work must not freeze the request, alter the
context property descriptor, leak the token or leave unawaited persistence.

Enabled execution rejects every pre-existing non-undefined context, including
null, forged tokens, expired tokens, foreign scopes and valid nested tokens.
The canonical owner has no context-only validated join API. The bridge does not
infer validity from public token fields, mint a token or open a replacement outer
transaction. A credit importer should call `run` once around its complete owner
operation and avoid calling another transaction-wrapped reward operation inside
that callback.

Caller credentials and wallet ownership remain with the authorizing owner.
`rewardOperation.serviceAuthData` remains the established private storage actor;
this bridge does not replace either signed caller context or storage identity.
The generated-service request builder must forward the token unchanged. Every
participating schema must be explicitly transaction-eligible with safe side
effects under `DefaultDatabaseTransactionService.assertSchemaEligible`. Config,
schema selection and request forwarding are separate owner changes.

## Refusal And Recovery

The shared Loyalty status owner defines:

| Code | HTTP | Meaning |
| --- | --- | --- |
| `ERR_LOYALTY_TRANSACTION_UNAVAILABLE` | 503 | Configuration, canonical owner or provider capability is unqualified. |
| `ERR_LOYALTY_TRANSACTION_SCOPE` | 400 | Request or exact owner module/tenant scope is invalid or conflicting. |
| `ERR_LOYALTY_TRANSACTION_CONTEXT` | 409 | Existing context cannot be joined, installed or replaced safely. |
| `ERR_LOYALTY_TRANSACTION_OPERATION` | 400 | Work callback is missing or invalid. |

Callback and provider failures propagate unchanged. The bridge performs no
automatic retry, compensation or out-of-transaction fallback. A provider may
retry its callback according to its own contract; operation owners must retain
their idempotency and revision checks. An uncertain commit acknowledgement needs
independent original-evidence readback by the operation owner.

## Examples And Qualification

- Success: explicitly select the module mapped to qualified generated Loyalty
  persistence, then call `run` around awaited original-wallet/balance reads,
  owner-qualified balance and ledger writes, and their postreads.
- Rejection: enabled execution with an HTTP-supplied token, missing tenant,
  mismatched authentication tenant or a standalone transaction-incapable provider
  refuses before the callback.
- Failure: a ledger write rejects after a staged balance write; the canonical
  provider aborts and the request loses its temporary token. Retain the original
  failure and use owner evidence to handle uncertain acknowledgements.
- Boundary: one transaction covers one canonical database wrapper. This is not a
  cross-provider, distributed or nested transaction protocol.
- Customization: a later active module can merge a stricter `scope`, `qualify` or
  `admission` member into the same service; internal calls resolve through `this`.
  Preserve canonical execution, opacity and refusal behavior.

Run `node --test nodics.loyalty/modules/loyaltyWallet/test/loyaltyTransactionContract.test.js`
and the owning Loyalty `npm test`. Focused tests exercise the real canonical
transaction service with an in-memory adapter, not a live database.

Capability evidence is necessary but cannot independently prove installed
provider readiness, generated-service forwarding, eligible schemas, same-wrapper
participation, installed uniqueness, rollback durability or full business
authorization. Native owner acceptance must qualify those separately. This
internal service exposes no new API or business-user workflow. Operators own
selection; maintainers and AI tools own the code and focused contracts. Existing
business evaluator/user documentation stays with the parent Loyalty journey.
