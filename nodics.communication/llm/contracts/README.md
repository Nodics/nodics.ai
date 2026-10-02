# Communication contracts

Status: active Phase 1C provider-neutral authority.

Mandatory email/SMS placement: domain-owned `src/templates/<channel>/<name>`
resources, typed manifests and locale files. Configuration selects; providers send
frozen output. Follow [the resource contract](../../modules/commsCore/llm/contracts/template-resources.md)
and [framework principle](../../../nodics.foundation/modules/nSetup/llm/contracts/nodics-principles.md#module-owned-email-and-sms-presentation).
Legacy inline text is compatibility only, not a new authoring path.

- `commsSchema` owns source schema declarations.
- `commsCore` owns template, intent, rendering, policy, suppression, delivery, retry, callback, inbox, and evidence behavior.
- `commsVerification` owns reusable challenge mechanics without taking Profile or Security identity authority.
- provider modules implement transport only.
- `commsApi` owns secured operator, service, and callback routes.
- Consuming domains send declared variables and correlation/idempotency references; Communication never mutates their state.
