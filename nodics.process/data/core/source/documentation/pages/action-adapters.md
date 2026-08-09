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

