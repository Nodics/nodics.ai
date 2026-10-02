# Order Notification Workspace V1

## Owner And Gates

Digital Core publishes this native operator workspace through the existing
BackOffice capability registry. It is not a schema editor or an order CRUD view.
The navigation id is `order-notifications`, Axis route
`/commerce/orders/notifications`, renderer `axis.workspace.native`, workspaceCode
`commerce.orderNotifications`, viewCode `orderNotifications.detail` and
contractVersion `1`. No schema target is supplied.

The navigation and DTO are ACTIVE only when `digitalCore.notifications.enabled`,
`qualified`, `workspaceQualified` and the effective
`apiExposure.categories.commerceNotificationManagement.enabled` are all true.
All four defaults remain false. Runtime qualification and matching service-source
grants are not established by this implementation. A disabled workspace returns
no Communication observations and disables all commands; it does not claim that
historical intents are absent. The route exposure gate normally prevents calling
these APIs at all until explicitly selected.

## Exact API For Axis

Resolve the selected runtime's `digitalCore` module endpoint using existing Axis
module routing; do not hard-code a host or invent a transport prefix.

| Method | Module-Relative Path | Body | Permission |
| --- | --- | --- | --- |
| GET | `/orders/:code/notifications/workspace` | Empty | `commerce.digital.notification.read` |
| POST | `/orders/:code/notifications/inspect` | `{kind}` | `commerce.digital.notification.read` |
| POST | `/orders/:code/notifications/retry` | `{kind,expectedRevision,confirmed:true}` | `commerce.digital.notification.retry` |

`code` is the selected original order code. Query parameters are forbidden.
`kind` is exactly PURCHASED or REFUNDED. Retry requires the latest **order**
revision, not an intent revision, and explicit human confirmation. Requests need
current human access-token tenant/enterprise binding and fresh existing Order
staff authorization. The shared Order staff check additionally depends on its
dispute-review permission and deployment policy. Signed context supplies tenant
and enterprise; the owner order supplies the buyer. No buyer override is accepted.
Inspection/retry body fields are whitelisted; browser recipient, template,
provider, amount and intent identifiers cannot be supplied. GET rejects bodies.

Controllers return the usual `{data: DTO}` envelope and set `Cache-Control:
no-store` for workspace, inspection and retry, including domain failures. Every
domain rejection is replaced by a fresh `ERR_DIGITAL_NOTIFICATION_UNCONFIRMED`
NodicsError without copying the original message, cause, driver code or errInfo.
Both promise and callback consumers receive only this fixed safe error.
Axis must use its existing response unwrapping and reject unsupported contract
versions. GET returns:

```json
{
  "contractVersion": 1,
  "workspaceCode": "commerce.orderNotifications",
  "viewCode": "orderNotifications.detail",
  "featureState": "DISABLED",
  "orderCode": "<selected-original-order>",
  "orderRevision": 7,
  "financialState": "REFUNDED",
  "events": [
    {
      "kind": "PURCHASED",
      "status": "POLICY_DISABLED",
      "notificationPolicyEnabled": false,
      "outcomes": [],
      "retrySourceEligible": false,
      "retryEligible": false
    },
    {
      "kind": "REFUNDED",
      "status": "POLICY_DISABLED",
      "notificationPolicyEnabled": false,
      "outcomes": [],
      "retrySourceEligible": false,
      "retryEligible": false
    }
  ],
  "presentation": {
    "title": "Order Notifications",
    "defaultColumns": ["kind", "channel", "status", "revision", "observed"]
  },
  "commands": ["<fixed-inspect-descriptor>", "<fixed-retry-descriptor>"]
}
```

This is a shape illustration, not an approved business record. Actual command
entries are objects returned by `workspaceCommands()`, not strings. They include
id, label, intent, permission, ownerModule, handlerAction, operationRoute,
httpMethod, inputFields, confirmationRequired, enabled and eligibleKinds.
`inspect` has only the kind selector. `retry` has kind, hidden numeric
expectedRevision from orderRevision, and boolean confirmed. Both use the fixed
POST paths above. BackOffice lifecycleActions publish only bounded navigation
descriptors (id, label, intent, permission, ownerModule, handlerAction,
operationRoute, httpMethod and independently gated featureState). Input types,
confirmation and revision requirements remain in the authenticated native DTO;
they are not copied into the different navigation-action contract. Native
registration supplies version, renderer, workspaceCode, viewCode, title and
description only. The installed native renderer owns fixed API resolution, not
executable transport metadata in registration. Disabled metadata never grants access.

## Evidence And Rendering

Render the order's financialState separately from notification observations.
Each event has an inspection summary: INSPECTED, PARTIALLY_INSPECTED, UNCONFIRMED,
NO_SOURCE_EVENT or POLICY_DISABLED. Observed outcomes contain channel,
server-derived intentCode, stored status, stored revision and observed:true.
Failed/absent/denied outcomes have channel, server-derived intentCode,
status:UNCONFIRMED and observed:false, with no fabricated revision. The intent
identifier is display-only; never send it back as a browser command argument.

The stored statuses are exactly ACCEPTED, DELIVERING, DELIVERED, RETRY_PENDING,
UNCERTAIN, SUPPRESSED, FAILED, UNCONFIGURED, DEAD_LETTER and CANCELLED. Do not
present DELIVERED as financial success or CANCELLED as an order cancellation.
Financial commit does not prove notification delivery. NO_SOURCE_EVENT is about
missing original event sources, not proof of private intent nonexistence.

Historical PURCHASED inspection remains available after redemption or refund,
provided original immutable commit evidence remains intact. It never calls the
creation/retry financial authorization path. REFUNDED inspection independently
requires its original completed refund/payment/reversal proof. See
[committed coupon notifications](committed-coupon-notifications.md).

`retrySourceEligible` reflects stricter current financial evidence only.
`retryEligible` also needs an observed existing ACCEPTED, RETRY_PENDING or
DELIVERING intent in a currently configured event channel. The retry command
needs current retry permission and at least one eligible event. Axis must respect
eligibleKinds, refresh after a command, and require explicit confirmation.
These hints are not authorization: the POST repeats current role/order revision
and full financial checks; Communication rechecks original intent retry safety.
Terminal, absent, uncertain and unobserved outcomes cannot enable a retry button.

## Customization And Remaining Integration

All business presentation defaults live in effective layered configuration at
`digitalCore.notifications.workspace`, not source command definitions:

```js
workspace: {
  title: "Order Notifications",
  navigationLabel: "Order Notifications",
  summary: "Inspect original notification delivery evidence independently of order financial state.",
  fields: {
    kind: "Event",
    expectedRevision: "Order revision",
    confirmed: "Confirm retry"
  },
  commands: {
    inspect: "Inspect Notification",
    retry: "Retry Original Notification"
  }
}
```

Override only desired leaves through the normal module/project/runtime layered
configuration. Labels must be nonempty plain text, at most 192 characters; summary
is bounded to 512. Markup/control characters are refused. The service resolves and
validates effective labels for both DTO and BackOffice presentation; it does not
silently invent missing labels or use browser-supplied strings. Routes, command
ids, permissions, allowed kinds, input names/types and qualification remain fixed
owner contracts, not configurable business labels.

The request path is router -> `DefaultDigitalCommerceNotificationController`
(HTTP mapping) -> `DefaultDigitalCommerceNotificationFacade` (signed operator
context and fixed-operation orchestration) ->
`DefaultDigitalCommerceNotificationService` (fresh scoped authority, original
commit proof, DTO and source-private Communication operations). The facade and
service are loader-visible mergeable object exports; the controller does not call
SERVICE directly. Existing financial owner commit hooks still invoke the service
from trusted owner context without passing through an HTTP facade.

Later module/runtime layers may override mergeable service members and BackOffice
presentation while preserving canonical ownership, fixed command allowlists,
version semantics, qualification and fresh authority. Keep customer projects
limited to intentional configuration and qualified owner selection. Do not add
browser contact/template inputs, duplicate intent journals or generic CRUD.

Axis implements the native renderer for this exact workspaceCode/viewCode,
selected order lookup, bounded outcome table, empty/disabled/partial/error states
and fixed commands. Installed visual acceptance remains NOT RUN. Communication must deploy its
source-scoped POST `/internal/communications/:intentCode/inspect` accepting `{}`
and returning intentCode/status/revision. Inspection never requests or retries an
intent. The actual committed-source Profile recipient adapter and native PRICED_CART
provider now exist in source. Contact verification/consent, activated prices,
private capture, service grants and installed topology remain qualified deployment
prerequisites. External third-party POS is a later provider extension, never a
default claim of settlement or a qualification switch substituting for a connector.

Fixtures in `test/digitalCommerceNotificationContract.test.js` cover historical
redemption/refund inspection, partial/ambiguous commits, strict creation/retry
refusal, retained refund proof, gated DTO/navigation and terminal retry hints.
They are authored but **not executed**. Only static source/format checks are
authorized here; connected behavior and visual acceptance remain for the joint
session. No runtime writes, sends, business records or release actions occur.
