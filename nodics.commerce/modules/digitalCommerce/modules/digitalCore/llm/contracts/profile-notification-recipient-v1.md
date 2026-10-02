# Profile Notification Recipient V1

## Private Owner Boundary

Digital Core selects `DefaultDigitalCommerceNotificationRecipientService` through
`digitalCore.notifications.recipientService`. The adapter uses only
`DefaultModuleService.invokeModule`, internal authentication, the selected
Profile connection and PLATFORM target authority. It never sends a customer ID
or address as lookup authority. All qualification/exposure defaults remain false.
No import, sending, runtime registration or grant is performed by this source.

## Profile Request

Service-only POST `/internal/commerce/notification-recipient` requires permission
`profile.commerce.notification.recipient.resolve`, signed tenant and seller
enterprise context. Request body contains exactly:

```json
{
  "channel": "EMAIL",
  "source": {
    "kind": "PURCHASED",
    "orderCode": "stored-order-code",
    "sourceCode": "stored-entitlement-code",
    "orderRevision": 3
  }
}
```

SMS is the other supported channel. REFUNDED uses the canonical full-order
refund checkpoint code as sourceCode. Coordinates are handles, not proof; Profile
must reread Commerce before looking up a contact. No unsigned human claims,
browser contact input or arbitrary service-supplied buyer lookup is admitted.

## Commerce Callback

Profile calls service-only POST `/internal/notifications/recipient-source` on
digitalCore using DefaultModuleService, internal authentication, signed tenant
and the same enterprise context, with permission
`commerce.digital.notification.source.read`. Body is the source above flattened
with channel: `{kind,orderCode,sourceCode,orderRevision,channel}`. No query keys.
The verified runtime must include profile/digitalCore modules. Commerce derives
ownerId from exactly one owned Order record and rereads strict committed-event
evidence: completed Checkout/capture/deliveries for PURCHASED; completed
refund/checkpoint/Payment/reversals for REFUNDED. Buyer, enterprise, revision and
original entitlement/refund identity must agree. A final Order read refuses
revision drift. This does not weaken historical inspection or creation/retry.

Commerce responds under its normal data envelope with:

```json
{
  "contractVersion": 1,
  "sourceModule": "digitalCore",
  "sourceType": "DIGITAL_COUPON_PURCHASED",
  "committed": true,
  "tenant": "signed-tenant",
  "enterpriseCode": "signed-seller",
  "ownerId": "stored-order-buyer",
  "channel": "EMAIL",
  "source": {
    "kind": "PURCHASED",
    "orderCode": "stored-order-code",
    "sourceCode": "stored-entitlement-code",
    "orderRevision": 3
  }
}
```

REFUNDED sourceType is DIGITAL_COUPON_REFUNDED. No contact, coupon token, payment
reference or intent is exposed. The callback has no-store, fixed safe error
normalization and controller -> facade -> service ownership. It creates no state.
The route declares requestPrivacy.sensitive. Controller/facade preserve admitted
exact-object capture proof; the service refuses missing/unqualified protection.
Operational local ownership of digitalCore/order/checkoutCore/payment is required;
remote financial ownership requires an actual owner read bridge, not local shadow
records. The router category commerceNotificationSources and independent recipient
resolution qualification must be enabled only after integration acceptance.

## Profile Response And Consent

After validating every callback field and exact source/channel binding, Profile
must use its existing canonical customer/contact or external-destination owner.
Require verified active channel, unsuppressed destination and applicable consent
for DIGITAL_COUPON_PURCHASED or DIGITAL_COUPON_REFUNDED. A committed purchase is
not automatic marketing consent. Do not invent a destination or fallback email.
Return under the normal data/result envelope:

```json
{
  "contractVersion": 1,
  "tenant": "signed-tenant",
  "enterpriseCode": "signed-seller",
  "ownerId": "stored-order-buyer",
  "channel": "EMAIL",
  "source": {
    "kind": "PURCHASED",
    "orderCode": "stored-order-code",
    "sourceCode": "stored-entitlement-code",
    "orderRevision": 3
  },
  "verified": true,
  "recipientId": "canonical-recipient-id",
  "recipientAddressReference": "communication-supported-owner-reference"
}
```

Commerce compares buyer to its own stored event, not just Profile's assertion.
Recipient references must resolve through existing Communication destination
semantics; an unresolvable reference is an integration refusal. Responses are
private and bounded to 8192 bytes; redirects/retries are disabled. The entire
recipient operation uses DefaultLoggerService.runSensitiveOperation with a new
trusted entry; exported private helpers require actual capture proof.
recipientResolution.allowInsecureLoopback defaults false. Transport supplies
secureTransport.required true, requiring HTTPS unless exact-loopback HTTP is
explicitly allowed. No raw address is logged or accepted as lookup authority.
Owner errors,
failed envelopes and drift become ERR_DIGITAL_NOTIFICATION_UNCONFIRMED without
private diagnostics. Original intent retry never invokes Profile or substitutes
recipient/template material. Later layers may select a connection or override the
mergeable adapter, but cannot remove source verification or canonical ownership.

## Acceptance Boundary

Profile endpoint/contact integration is owned by Profile and not authored here.
The [native priced adapter](../../../../../baseCommerce/modules/pricing/llm/contracts/native-merchant-priced-evidence-v1.md)
is separate from recipient resolution; actual external POS integration remains
a later provider overlay, not native paid-transaction evidence.
Fixtures in `test/digitalCommerceNotificationRecipientContract.test.js` are
authored but NOT RUN. Joint acceptance must cover verified/unverified channels,
suppression/consent, wrong source/buyer, stale revision, remote owner refusal,
lost acknowledgements and frozen recipient retry. Static parsing/formatting does
not qualify a deployment or establish successful delivery.
