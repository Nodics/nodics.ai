# Communication contracts

Status: active Phase 1C provider-neutral authority.

- `commsSchema` owns source schema declarations.
- `commsCore` owns template, intent, rendering, policy, suppression, delivery, retry, callback, inbox, and evidence behavior.
- `commsVerification` owns reusable challenge mechanics without taking Profile or Security identity authority.
- provider modules implement transport only.
- `commsApi` owns secured operator, service, and callback routes.
- Consuming domains send declared variables and correlation/idempotency references; Communication never mutates their state.
