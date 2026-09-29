# commsCore contracts

Status: active Phase 1C. Communication orchestration and delivery governance. Later-loaded projects may override implementation while retaining Communication ownership, security, audit, retry, and recovery invariants.

- [Durable outcome delivery](durable-outcome-delivery.md)

## Provider configuration ownership

Communication owns inert `communication.providerTypes` technical defaults
(provider code, implementation service and timeout). No provider type may carry
credential references or secrets. A type alone never enables a channel: the
deployment must select it under `communication.providers`, with its own
credential references and policy. Selected provider fields override defaults;
arrays replace rather than merge. Explicit providers without a type retain
their existing behavior. Unknown types and credential-bearing templates are
rejected. Customer notification templates and trusted-source lists remain
customer policy. `communicationProviderOwnership.test.js` covers this boundary.
