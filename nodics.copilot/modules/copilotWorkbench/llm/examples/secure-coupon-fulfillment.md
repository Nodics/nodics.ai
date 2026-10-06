# Secure Coupon Fulfillment

## Ownership And Availability

Copilot coordinates one reviewed action. Digital Core owns merchant qualification,
outlet binding, validation proofs, fulfillment receipts and original-command
idempotency. Promotion owns coupon eligibility and redemption. Profile owns live
employee/enterprise/outlet scope. Axis renders these contracts and cannot grant
permission, select arbitrary APIs or update coupon status directly.

The adapter is disabled by default. No schedule, sample enterprise, grants,
customer claim or external POS settlement is created by installing these files.
The supported owner modes are `MERCHANT_SCREEN` and `LOCAL_SAMPLE`; the latter is
test evidence, not a production provider qualification. Native `PRICED_CART`
benefits are reviewed with their original source hash/revision, currency, amounts
and outlet. Unrecognized benefit fields fail closed rather than being hidden.

## Runtime Setup

1. Deploy the normal Copilot API/Core/Workbench/Policy owners and generated private
   action persistence. Keep the standard authentication and sensitive-request
   logger integration enabled.
2. Configure a named remote `digitalCore` connection to the operational Commerce
   runtime. The connection must resolve the `COMMERCE` runtime authority. Do not
   reuse the Product author's Staged target or use a service credential fallback.
3. Through existing layered configuration, set `copilot.workbench.couponTarget`:

   ```js
   {
     enabled: true,
     moduleName: 'digitalCore',
     connectionName: 'commerce-owner',
     targetAuthority: { runtimeRole: 'COMMERCE' }
   }
   ```

   The connection name is illustrative; it must already exist in the deployment.
   Configuration changes follow the normal runtime governance, not direct browser
   routing or a new Copilot registry. Changing the target invalidates old plans.
4. Assign only approved employee access through Profile: preparation needs
   `copilot.mutation.prepare`, `commerce.coupon.pos.redeem` and the native
   `profile.scope.read` permission; fulfillment and
   receipt reconciliation additionally need `copilot.mutation.execute`. Normal
   Copilot route admission remains required. Digital Core separately verifies live
   issuer and outlet scope. The authenticated partition is not automatically the
   issuing merchant; do not replace Profile's scope checks with that assumption.
   Commerce's approved runtime credential separately needs
   `profile.enterprise.reference.read` for Profile's bounded `/references/read`
   contract. It returns only active issuer display references, not generic
   identity CRUD. Missing runtime grants must fail closed, not fall back to a
   broader service identity or a caller-supplied issuer.
5. Qualify the merchant provider, Promotion eligibility, native pricing where
   selected, outlet revisions and generated receipt persistence using their owner
   guides. Copilot availability is not proof of provider readiness.
6. Open the Axis conversation page. Its fresh `/context` projection advertises
   the secure form only when preparation grants and target configuration permit
   it. Reload after changing runtime configuration or grants.

## Business Journey

1. Select **Redeem a coupon**. No token is sent merely by opening the form.
   The form reads authorized outlet metadata from Commerce through Copilot.
2. Enter the customer-presented code into the masked field. Enter the original
   receipt reference; when native pricing requires a priced source reference,
   use the owner-provided field label. Select an authorized outlet if required.
3. Select **Validate and review**. The transient token field clears immediately.
   The code is sent once to Digital Core validation, not a model or conversation.
   Validation does not confirm fulfillment or redemption.
4. Review the benefit, issuer, receipt, outlet, entitlement revision and proof
   expiry. A new private action stores only the minimized review, original owner
   proof and pinned target. It does not store the raw token or customer identity.
5. Select the approval command. Approval pins that exact plan digest and action
   revision; it does not execute anything or grant missing permissions.
6. After the benefit has actually been provided, select **Confirm fulfillment**.
   Copilot first claims the action with a durable revision CAS and then sends one
   original-employee command to Digital Core. Do not use this command as a claim
   that an unintegrated external POS has settled a purchase.
7. Completion appears only after positively verified evidence. Keep the visible
   action reference for investigation. Closing and reopening the dialog retains
   the action in that mounted session. After navigation, enter the reference and
   select **Open existing action**; the backend checks ownership again.

## Control Flow

```text
Masked Axis input -> sensitive Copilot API -> Digital Core validation
                                              | Profile + Promotion + outlet
                                              v
Private proof/review <- validated owner evidence (no raw coupon)
       |
Explicit approval -> action revision CAS -> explicit fulfillment
                                              |
                                     original employee + stable command key
                                              v
                          Digital Core receipt + Promotion redemption
                                              |
                     confirmed result <-------+------> uncertain result
                                                           |
                                  read original receipt, never reissue command
                                                           |
                                      exact evidence -> action completion CAS
```

## Uncertain Results And Recovery

1. A timeout, lost response, failed persistence acknowledgement or malformed owner
   evidence does not prove failure. Fulfillment controls disappear; no automatic
   retry, compensating write or background queue is created.
2. Select **Reload action** to read its current revision. An `EXECUTING` or
   `OUTCOME_UNKNOWN` action supports **Check original receipt**.
3. Inspection calls only Digital Core's read-only receipt query with the original
   stable command key, entitlement, receipt and outlet. It never calls confirm,
   claim, redeem or a fulfillment provider.
4. Only `REDEEMED` plus the exact committed original receipt can complete the
   Copilot action. The owner rechecks current staff, issuer/outlet and entitlement
   state before returning completion. Copilot rechecks grants/target and atomically
   advances the exact action revision. Concurrent inspectors cannot both write.
5. A missing receipt, incomplete owner commit, changed outlet revision, lost scope
   or mismatched evidence remains unconfirmed/unavailable. Do not create a new
   fulfillment attempt. An authorized Commerce operator must investigate its
   original command using Commerce's own recovery contract.
6. Proof/approval expiry does not prevent inspecting an old completion. It always
   prevents new execution with that expired approval.

## API And Stored Evidence

| Entry | Meaning |
| --- | --- |
| `GET /copilotApi/v0/coupons/workspace` | Current authorized input metadata |
| `POST /copilotApi/v0/coupons/prepare` | Sensitive token validation and reviewed private action |
| Existing confirmation approve/reject/execute/get | Revision/digest-bound action lifecycle |
| `POST /copilotApi/v0/confirmations/:confirmationCode/coupon-receipt` | Read original owner receipt, reconcile exact uncertain action |
| `POST /digitalCore/v0/merchant/redemptions/:code/receipt/query` | Current employee-scoped, noncacheable original receipt evidence |

Preparation accepts only `couponToken`, `merchantReceiptReference`, optional
`storeCode`. Reconciliation accepts the existing action `expectedRevision` and
`argumentsDigest`; callers cannot supply a target, command key or replacement
receipt. Route prefixes follow the deployment's normal module exposure.

The stable command key is `coupon-confirm:` plus SHA-256 of the immutable plan ID,
schema and entitlement code. It is bounded to the owner's key grammar. Private
action audit contains the proof and revision, not a token, bearer or owner error.
Reconciled completion records its receipt code, inspector and timestamp. Existing
activity metadata reports the standalone action; it is not a conversation turn.

## Privacy And Customization

Recognized coupon-redemption messages are diverted before conversation persistence
and provider invocation. Only a neutral secure-form request and guidance are saved,
and those turns are excluded from later provider context. This is not universal
secret detection: an arbitrary bare code or an unrelated message cannot always be
identified. Historical content is not retroactively cleansed. Do not paste secrets
into chat, conversation titles, receipt references or free-form review fields.

Customize business labels through `copilot.workbench.couponPresentation`. All
required labels must remain bounded nonempty strings. Preserve supported owner
DTO fields and review every argument; adding provider modes or new benefit shapes
requires domain qualification, strict parser changes and tests, not just UI copy.
Do not add customer-module kickoff logic, direct database access or generic route
execution. A changed target/proof/review requires a new owner validation and review.

## Verification

Run the coupon adapter tests with Digital Core merchant contract tests. Exercise
denied grants, missing privacy, expired proof, raw-token echo, bad benefit DTO,
lost response, mismatched receipt, policy revocation and concurrent reconciliation.
Axis tests cover masked input, no eager writes, separate commands, offline
non-submission, closed metadata, reference reopening and uncertain recovery.
The synthetic `test/assistant/coupon-fulfillment.visual.html` fixture exercises
responsive UI only; no coupon is redeemed by those unit or browser fixtures.

### Disposable Native Acceptance

Run from the framework root after local MongoDB replica-set, Elasticsearch binary
and Ollama prerequisites are available:

```sh
NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \
NODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \
NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \
node --test nodics.copilot/modules/copilotWorkbench/test/copilotCouponRuntime.live.test.js
```

1. The existing provider-owned fixture creates private database namespaces,
   loopback ports and Platform/operational Commerce runtimes.
2. Digital Core's test helper creates a synthetic campaign through its generated
   owner, then invokes real Promotion reservation/sale/delivery and Digital Core
   entitlement/delivery services. The synthetic paid-order reference is a test
   prerequisite, not proof of payment checkout or policy publication.
3. Actual employees authenticate through Profile. A reader lacks the operation
   grant; another employee has that grant but lacks merchant scope. Neither may
   prepare fulfillment. The scoped operator validates and explicitly approves.
4. The normal scenario checks that approval writes no fulfillment, rejects a stale
   action revision, confirms once and retains the same redeemed receipt after
   restarting both runtimes.
5. The fault scenario drops only the real successful native confirmation reply.
   Copilot retains uncertainty across restart. Original receipt inspection must
   complete the existing action without a second native confirmation.
6. The conversation scenario checks local Ollama availability, sends a recognized
   coupon command and verifies zero model calls and no raw token in the retained
   conversation before and after restart. Fulfillment still requires the secure
   form and separate approval/execution.
7. Teardown closes only fixture-owned processes, provider directories and databases.

The selected provider is native `MERCHANT_SCREEN` staff attestation, without outlet
or monetary-benefit selection. This does not qualify an external POS, activated
pricing, issuer/seller publication, production deployment or new signed-in browser
acceptance. The three API scenarios are separate from the responsive UI fixtures.
