# Communication Provider Runbooks

Communication providers deliver messages through channels such as SMTP email
and SMS. The provider sends or queues delivery, but business modules own the
reason for the message: order confirmation, OTP, approval, contact response,
publication event, or support notification. For beginners, communication is a
delivery lane, not the owner of business decisions.

## Source map

| Area | Source location |
| --- | --- |
| Communication overview | `docs/pages/nodics.communication/overview.md` |
| SMTP provider | `../nodics.communication/modules/smtpCommsProvider/package.json` |
| SMS provider | `../nodics.communication/modules/smsCommsProvider/package.json` |
| OTP integration | `../nodics.foundation/modules/nOtp/package.json` |
| Engagement source | `../nodics.engagement/modules/contactSubmission/package.json` |

## Delivery flow

```mermaid
flowchart LR
  Source["Owning business module"] --> Intent["Delivery intent"]
  Intent --> Template["Template and locale"]
  Template --> Provider["SMTP or SMS provider"]
  Provider --> Receipt["Delivery receipt"]
  Receipt --> Audit["Audit and retry evidence"]
```

The business problem is reliable communication. Customers and administrators
need clear, timely messages. Developers need provider abstractions so a module
can request a message without knowing gateway details. Operators need failed
delivery evidence, retry policy, suppression, and provider health in
production.

## Provider contract

Providers should accept normalized recipient, template, locale, payload,
priority, and correlation id. They should return status, provider reference,
retryability, and failure reason. They should not own order, OTP, publication,
or contact business state.

```js
const deliveryIntent = {
  channel: 'email',
  templateCode: 'orderConfirmation',
  locale: 'en',
  recipientRef: 'customer001',
  correlationId: 'order-1001'
};
```

## Customization and extension guidance

Developers can add providers, template renderers, delivery callbacks, retry
policies, suppression lists, and audit adapters. Business users should manage
template text, enablement, and consent where Axis exposes those controls.
Operators should track queue depth, sent count, failed count, retry age, and
provider outage status.

## Implementation handoff

A communication provider handoff should include supported channel, template
contract, locale behavior, retryability, suppression behavior, provider health
check, callback evidence, and privacy handling. Business users get predictable
message journeys, developers get integration boundaries, operators get
production recovery signals, and QA owners can test sent, delayed, failed,
suppressed, and retried messages.

## Evidence checklist

Delivery evidence should include message code, source module, template code,
locale, channel, recipient reference, provider reference, delivery state,
retry count, suppression decision, and correlation id. Operators should be
able to prove whether a message was blocked by policy, delayed by a provider,
or rejected permanently. Business users should see a clear communication
state, not raw gateway text.

This evidence should be searchable from the originating business object. For
example, an order confirmation should be traceable from order to delivery
intent, provider receipt, retry history, and final outcome.

Production support should also know whether a message was intentionally not
sent. Consent, suppression, invalid recipient, missing template, and disabled
provider states are normal controlled outcomes, not always incidents.

## Common mistakes

- Putting business state transitions inside SMTP or SMS provider code.
- Logging sensitive payloads or raw OTP values.
- Retrying non-retryable failures indefinitely.
- Sending messages without locale or consent checks.
- Showing gateway error text directly to business users.

## Verification

Run provider tests with successful delivery, temporary failure, permanent
failure, retry, suppression, template missing, and locale missing cases. In a
fresh schema, trigger OTP and contact messages, inspect receipts, and confirm
Axis shows safe delivery status. Production readiness requires business
template approval, developer contract tests, operator failure dashboards, and
QA evidence for retries.
