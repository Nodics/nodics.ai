# Protected Ownership Evidence API

## Boundary And Maturity

DigitalCore owns exact Commerce evidence queries and admission of its own binding.
eWaste still owns the listing plan, reverse Waste binding, sale/refund policy and
settlement; Order and Payment still own approval and financial mutations. These
APIs grant no refund, payment, asset transfer or generic CRUD authority.

The implementation is disabled by default. Source fixtures use actual Profile
runtime authorization, nAuth service issuance/signature verification, nRouter
route admission, Logger private provenance and schema ACL resolution with isolated
persistence/transport ports. They do not qualify an installed runtime, database,
network capture path or financial provider. No existing `qualified` flag changes.

## Deployment Selection

Select only after reviewing actual signed deployment evidence:

- `apiExposure.categories.commerceOwnershipEvidence.enabled: true` on Commerce.
- `digitalCore.ownershipEvidence.enabled: true` and the actual `runtimeRole` (default `COMMERCE`).
- Qualified Logger private request capture with capture disabled, as required by all private owner APIs.
- One exact `ownershipEvidence.callers` entry for each approved tenant/business
  enterprise and service deployment. Required fields are `tenant`,
  `principalEnterpriseCode`, `enterpriseCode`, `serviceId`, `projectCode`,
  `environmentCode`, `serverCode`, `instanceCode`, `assignmentCode`, and `kinds`.
  Signed principal enterprise may remain `default`; an explicit business enterprise
  grant is not an issuer impersonation. Every runtime coordinate must match current
  Profile-issued claims and the selected environment. Duplicate matching grants refuse.
- Profile-approved runtime module `digitalCore` and permission
  `commerce.digital.own.read` for queries; `commerce.product.publish` for admission.
  Route metadata uses nRouter's existing `runtimeAccessGroups` mechanism. Never
  append service groups to real claims or broaden generated schema ACLs.
- For admission only, explicitly select `ownershipEvidence.bindingAdmission`:
  `enabled`, `moduleName`, `connectionName`, `targetAuthority`, `apiName`.
  The existing eWaste plan path is `/internal/digital-listings/plan`; its current
  permission is `waste.asset.marketplace.project`. The outgoing Commerce runtime
  must independently hold the actual approved eWaste capability/permission.
  Ordinary Module transport supplies its own runtime credential; incoming caller
  authorization and canonical persistence auth are never forwarded.

No body field can select services, authority, connection, query, auth or persisted
records. Generic generated routers can remain disabled. Canonical generated reads
and insert-only binding saves occur only inside private admitted owner operations.
Caller authentication is preserved and rechecked across asynchronous reads.

Transport request/header enterprise aliases must match the signed principal
enterprise, not the body business enterprise. Exact deployment grants independently
admit the body scope. Commerce-to-eWaste listing-plan and sale/refund requests carry
`enterpriseCode` in the body and omit the business enterprise header; Module
transport supplies its retained runtime credential. Incoming customer/service
claims and private persistence auth are never forwarded or rewritten. Original
principal aliases remain checked across owner awaits.

## Wire Contract

Both routes are private, secured service-only POSTs, non-cacheable, with no-store
responses. Normal framework transport wraps the following result inside `data`.

`/nodics/digitalCore/v0/internal/ownership/evidence/query`

Every command has `contractVersion: 1`, `kind`, `enterpriseCode`. No other fields
are accepted except those specified for that kind:

| Kind | Exact Additional Fields | Result |
| --- | --- | --- |
| `LISTING` | `productCode`, `variantCode`, `sku`, `storeCode`, `assetCode`, `locales` | `store`, `publication`, `products`, `retainedProducts` |
| `BINDING` | `bindingCode`, `productCode`, `sku`, `storeCode`, `locale` | `binding`, `product`, `store` |
| `PURCHASE` | BINDING fields plus `ownerId`, `orderCode`, `entryCode`, `checkoutIdempotencyKey`, `providerCode` | BINDING result plus `orders`, `entries`, `payments`, `checkpoints` |
| `REFUND` | PURCHASE fields plus `entitlementCode`, `refundCode` | PURCHASE result plus `entitlement`, `refunds`, `cases`, `transactions` |

`entryCode` is the original Cart entry code, including pipe delimiters, not the
generated `<orderCode>:<entryCode>`. `providerCode` is the original persisted Waste
transfer event code. It must occur in the Order entry's retained reservation list.
Queries are exact tenant/enterprise/customer/order reads with independently checked
envelopes and bounded cardinality; an empty read does not become proof of completion.
Only the supported single asset/quantity-one purchase is admitted.

LISTING checks the serving Product pointer before and after exact locale reads.
BINDING uses original saved pins, so later publication cannot substitute a new
Product. Store must belong to the exact business enterprise. PURCHASE checks the
original Order, entry, root idempotency key, transfer and payment Cart scope.
Compensation checkpoints can lack top-level enterprise/order fields: the exact
retained payment intent and original transfer release outcome establish those
coordinates. An absent Order requires that checkpoint; no matching anchor refuses.
For retained compensation, PURCHASE also returns `entitlements` from an exact
original buyer/business/order read with a mandatory successful generated count.
Any returned entitlement must match the original reservation, unit and binding;
empty evidence does not itself authorize cleanup, which remains with eWaste.
REFUND additionally joins original entitlement, Order refund request, persisted
case and recorded payment transaction. PENDING or unapproved rows remain PENDING
or unapproved evidence; eWaste must enforce its existing approval/settlement policy.

`/nodics/digitalCore/v0/internal/ownership/bindings/admit`

```json
{
  "contractVersion": 1,
  "kind": "ADMIT_BINDING",
  "enterpriseCode": "GREENPERKS_ONLINE",
  "reviewedPlanDigest": "<exact original eWaste plan SHA-256>",
  "selectors": {
    "assetCode": "<asset>",
    "productCode": "<product>",
    "variantCode": "<variant>",
    "sku": "<sku>",
    "storeCode": "<store>",
    "transferPolicyCode": "<policy>",
    "rewardSettlementPolicyCode": "<policy>",
    "carbonSettlementPolicyCode": "<policy>",
    "idempotencyKey": "<original listing key>",
    "locales": ["en"],
    "expectedAssetRevision": 0
  }
}
```

The owner freshly obtains the configured domain plan, requires its original digest,
revision, selectors, canonical seller, classification and policies, then compares
all retained pins against current Product publication. It derives a deterministic
binding code and saves with generated `options.insertOnly: true`, never upsert or
update. Exact readback resolves replay/concurrency/lost response; conflicting or
absent readback refuses. Result is `{contractVersion:1,state:"BINDING_ADMITTED",binding}`.

eWaste listing completion receives the returned binding code and original reviewed
plan digest, then revalidates the binding through BINDING query. Commerce admission
does not itself activate Waste listing or assert settlement qualification.

## Customer Cart Context

Canonical Profile `authenticateCustomer` resolves the requested enterprise, looks
up the original login within that enterprise's tenant, verifies credentials, and
issues the resulting session with that enterprise. Source Customer records need
not contain `enterpriseCode`/`entCode`. Existing membership/native eligibility and
current credential/group/lockout policies still apply; this API does not relax them.
Cart's customer facade uses signed `auth.entCode` and original `auth.loginId` for
issuer and buyer. For issuer monetary baskets the original `circa-customer` must
authenticate through that supported path, choose the issuer's Store and explicitly
select `currency: "AED"` (Cart source fallback is USD). Rewriting a token or header
does not change signed Cart authority. Cart's existing SKU-resolution helper is
outside this evidence/admission change and is not used to qualify these APIs.

## Focused Verification

```bash
node --test nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalOwnershipEvidenceContract.test.js
```

Installed acceptance must independently prove actual approved callers, denied
foreign scope, generated persistence/router-hidden owners, binding readback and
eWaste completion. Do not equate the isolated fixture results with that evidence.
