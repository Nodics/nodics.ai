# Digital Core

`POST /entitlements/delivery-evidence` reads one exact generated delivery for a
currently admitted Customer or represented Enterprise entitlement. It rechecks
Profile ownership before and after the read, keeps merchant Enterprise placement
separate from owner identity, rejects broad discovery and returns a bounded safe
projection. It grants no reveal permission and exposes no coupon secret.

Gift expiry has an [inactive module-owned Cron definition and callable binding](llm/contracts/gift-expiry-schedule.md).
The existing Cron trigger reaches the secured persisted expiry owner; both the
record and framework binding remain disabled until separately qualified.

Whole-gift pending, cancellation, acceptance, decline and expiry notifications
use [postcommit Communication delivery](llm/contracts/bundle-gift-notifications.md).
Explicit Profile opt-in recipients and frozen intent replay remain separate from
holdings mutations. Delivery defaults off/unqualified; source tests do not assert
installed delivery. Bundle proceeds target the canonical LOYALTY runtime role.

[Coupon expiry reminders](llm/contracts/coupon-expiry-reminders.md) connect the
bounded Cron-to-Process sweep to Profile's opted-in Customer or explicitly
authorized Enterprise staff recipients and Communication's durable IN_APP inbox.
Current source/recipient checks apply at request, dispatch and retry. Empty rosters
skip without fallback; NONE expiry produces no reminder. Defaults remain off.

Whole fixed-price purchases use the [bundle settlement owner](llm/contracts/bundle-settlement.md).
Seller proceeds become available through Loyalty only after original payment and
every transfer/finalize receipt. Buyer/seller status is not another wallet.
Completed bundles are final; uncertain outcomes retain original Checkout recovery.
`acceptance:digital-fixed-bundle-sale --execute` consumes one explicitly reviewed,
isolated, existing quantity-one Cart and its fixed listing. It uses common Checkout,
then requires exact buyer/seller Digital status, one delivered ownership entitlement,
whole-transfer evidence and available canonical Loyalty proceeds. It creates no
identity, balance, holding, listing or Cart and never retries an uncertain Checkout.
Framework request bounds stay here; a project may only select concrete fixtures and
provide the original buyer and seller sessions.

Bundle listing publication persists original terms, immediate component holds,
one original binding and per-owner publication checkpoints, including auction
round creation. Read [bundle publication](llm/contracts/bundle-publication.md)
for Product automatic policy, the required Pricing port, namespaces and release
fences. The fixed-sale runner above is the installed local owner check; publication
and auction acceptance remain independently owned.

`acceptance:digital-bundle-publication --execute` is the Digital owner check for
certificate-and-realized-carbon composition and publication. It creates or replays
one reviewed immutable manifest, publishes the exact fixed-price instruction,
requires Digital's complete held-component proof, and independently inspects the
canonical Product ONLINE receipt. Reward settlement terms remain listing metadata;
rewards cannot enter the manifest. Framework bounds and command registration stay
in Digital Core. Projects provide only reviewed fixture identities and original
participant, Digital-runtime and Product-runtime sessions.

Coupon consideration, finality/no-expiry and acquisition history follow the
[coupon source contract](llm/contracts/coupon-acquisition-source.md). It separates
offline source verification from runtime qualification. Common Checkout now
continues original COMMIT-fenced coupon purchases through its qualified action
and confirmed recovery route, including a closed-Cart/final-checkpoint failure.
Notification, reveal, reminder and reporting readers use retained Order binding
after in-place recovery; source composition does not claim installed acceptance.

Persisted bundle manifests and pending-acceptance gifts use the
[bundle holdings contract](llm/contracts/bundle-holdings-and-gifts.md).
Digital coordinates exact component receipts; component owners retain locks,
ownership and original beneficiary history. Null authority/provider selections
fail closed. The contract records remaining integration requirements explicitly.

Bundle manifests and operations use the generated managed-revision CAS save path
after Digital verifies the installed primary identity and unique index. They do
not combine managed concurrency with the separate unversioned `insertOnly`
contract; exact readback resolves duplicate races and lost acknowledgements.

`POST /holdings/certificates` reads paginated certificates for the currently
authorized Customer or Enterprise owner. `HOLDINGS_READ` uses the existing
participant authority and `commerce.digital.own.read`; a caller's owner selector
does not confer access. The qualified component owner supplies validity and
availability, not a second Digital certificate database. Private custody evidence
and metadata are excluded, and reads never reserve or transfer holdings.
The customer HTTP adapter pins tenant and Enterprise namespace to the authenticated
route authority before holdings, gift, bundle or entitlement dispatch; caller
fields cannot replace that scope.
The framework owns `digitalCore.bundles.certificatePageSize`; only intentional
runtime overrides belong downstream. `digitalCertificateHoldings.test.js` covers
projection and owner/transport failure boundaries with isolated fixtures.

Digital Core bridges normal Checkout with digital unit owners.

Historical one-asset evidence remains inspectable; new eWaste sale admission and
completed ownership refund commands are closed. Ordinary Commerce and coupon
refunds retain their separate policies.

Purchased coupon reveal reuses committed Checkout/Payment/Order/delivery evidence
and signed private customer admission before Promotion decrypts its retained token.
Reservations, pending payments, revoked/expired stock and another buyer cannot reveal.
See [secure reveal](llm/contracts/README.md#secure-purchased-coupon-reveal) for key
ownership, replay and native qualification boundaries.

The staged increment strengthens generated write/readback and partial reservation
compensation, retains Promotion purchase-derived expiry/terms, and supplies inert
layered purchase/refund EMAIL/SMS resources. This is not installed qualification;
see [owning contracts](llm/contracts/README.md) for remaining provenance, receipt,
seller-authority and lifecycle-trigger gates.

Post-commit messaging and original-intent recovery are described in
[committed coupon notifications](llm/contracts/committed-coupon-notifications.md).
The source defaults remain off; approved recipients, transport and installed
acceptance are required before enabling EMAIL/SMS.

`acceptance:digital-coupon-reminder-source --execute` verifies only exact current
Digital source eligibility through the private service API. It intentionally
returns `deliveryQualified: false`: Profile recipient selection, Communication
intent persistence and channel delivery require their own owner acceptance. The
framework owns runner bounds; projects supply reviewed source coordinates and the
original service token without enabling a schedule.

For coupon products, it identifies calculation entries backed by a `COUPON_CODE_POOL`, asks Promotion to reserve one code per purchased unit during checkout placement, confirms the sale after payment authorization, and marks delivery after fulfillment release.

Merchant fulfillment follows [the merchant redemption contract](llm/contracts/merchant-redemption-contract.md).
Its explicitly deployment-selected ITEM simulation exercises the same coordination
without claiming verified goods delivery. Responses retain simulation labels;
already-redeemed benefit reversals are not supported.
New projections use SIMULATION; retained historical Local simulation markers
remain unverified, with original benefit hashes and receipt bindings unchanged.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Participant bundle authoring reads `POST /bundles/composition-context` with an
empty body under original access-token authority. It projects current Profile
ownership and active, bounded `digitalBundleListingContext` records, then rechecks
authority. Bindings select existing Store/category/currency/pricebook/reward
references in the participant namespace; Product independently resolves the Store
merchant. There are no configured business IDs or automatic selections. Reward
scale comes from Loyalty's exact active Program/RewardType evidence;
records cannot supply it. Publication pins the selected context code/revision and
revalidates all governed terms before holds. Complete generated counts are required.
Customer screens show destination names, not internal binding diagnostics. Listings
stay disabled/unavailable without qualified dependencies, while separately
authorized Gift composition remains reachable. See
[composition context](llm/contracts/bundle-publication.md#participant-composition-context)
for governance, bounds, failures and test coverage.

Composer manifests retain the reviewed follow-on instruction for exact
`/bundles/commands/query` and explicit `/bundles/commands/resume` recovery.
Gift decisions have exact `/gifts/inspect` independent of paged history. These
capabilities reuse existing manifests/operations and current Profile authority;
browser references are not instructions, grants or receipts. Unknown outcomes
never authorize replacement. See [recovery](llm/contracts/bundle-holdings-and-gifts.md#recovery-and-integration-limits).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

A selected digital-ownership provider may expose a published listing before its
genuine owner binding exists. Zero retained bindings return explicit unavailable
supply and never call the remote owner. Duplicate, malformed, stale or remote-owner
evidence still fails closed, and checkout cannot reserve an unbound listing.
