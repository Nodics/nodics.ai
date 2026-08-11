# Action Adapter Contract

An `ACTION` node is where a workflow asks another capability to do something.
Examples:

- ask Commerce to reserve stock;
- ask Profile to notify a user;
- ask WCMS to move content to review;
- ask a customer module to call a partner integration.

Process should not contain that business logic. Process should orchestrate,
authorize, and audit the request.

## Safe default

The framework includes one safe demo action:

```json
{
  "moduleName": "nodics.process",
  "operation": "noop"
}
```

This proves the runtime path without touching a real business domain.

## What is not allowed

Graph JSON must not contain:

- JavaScript functions;
- file paths;
- URLs as executable handlers;
- arbitrary script fragments;
- secrets or credentials.

This is a security and maintainability rule. A workflow should say what domain
operation is requested, not how to execute arbitrary code.

## Customer extension pattern

A customer project can register allowed adapters through configuration or a
custom registry override.

```js
module.exports = {
  process: {
    actionAdapters: {
      allowedActions: [
        {
          moduleName: 'customer.commerce',
          operation: 'reserveStock',
          service: 'CustomerCommerceProcessAdapterService',
          method: 'reserveStock'
        }
      ]
    }
  }
};
```

The service implementation belongs to the customer/domain module. Process only
calls it through the approved registry and records the result.

## QA checklist

- Unknown actions fail with a stable Process error.
- Allowed demo no-op action completes successfully.
- Failed actions create audit evidence.
- Action output is bounded and does not leak secrets.
- Domain modules can be tested independently from Process orchestration.

## Adapter operating contract

| Concern | Required behavior | Rejection evidence |
| --- | --- | --- |
| Registration | Resolve an allowlisted adapter owned by a functional or customer module. | Unknown adapter returns a stable Process error before any side effect. |
| Input | Accept only the versioned, bounded input contract declared by the adapter. | Invalid or oversized input is rejected and redacted in logs. |
| Authorization | Enforce the initiating identity, tenant, permission, and workflow context in the backend. | Unauthorized execution records a denial without invoking the domain action. |
| Idempotency | Reuse the process instance, node, attempt, and business correlation identity. | Duplicate delivery returns prior evidence or a deterministic conflict. |
| Output | Return a bounded, serializable result suitable for Process audit and transition evaluation. | Secrets, provider payloads, and unbounded objects are excluded. |
| Failure | Classify retryable, terminal, and compensatable failure through stable codes. | Process creates an incident and preserves the original attempt evidence. |

A beginner developer should start with a deterministic no-op or test adapter in
the owning customer module. The adapter should validate one small input, return
one bounded output, and expose no network or filesystem path through workflow
metadata. After that contract works, the developer can connect a domain-owned
service such as Order, Fulfillment, Payment, or Communication. Process invokes
the adapter but does not take ownership of the domain command.

For production, operators need enough evidence to distinguish a Process engine
failure from a domain dependency failure. Every attempt therefore needs the
definition version, instance and node identity, adapter identity, attempt
number, tenant, correlation identifier, duration, outcome code, and redacted
error classification. Metrics should show latency, retry volume, terminal
failure, compensation, and dead-letter growth without placing request bodies or
credentials in labels.

Negative testing is part of the adapter contract. Test an unknown adapter,
invalid input, unauthorized caller, duplicate correlation, timeout, dependency
failure, malformed output, retry exhaustion, and compensation failure. A test
that only proves the successful call does not establish that the adapter is safe
for a long-running business process.

## Common mistakes

- Executing arbitrary code or URLs from workflow metadata instead of registered adapters.
- Moving domain validation, authorization, or compensation ownership into Process or Axis.

## Verification

Run the Process contract suite, reject unknown adapters, verify permission denial, and confirm bounded audit evidence for successful, failed, retried, and compensated actions.
A beginner developer should be able to repeat this while a production operator can inspect the resulting evidence.
