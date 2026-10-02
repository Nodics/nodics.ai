# commsCore examples

Use bounded tenant-scoped inputs, correlation and idempotency references, safe outcomes, explicit failures, and deterministic recovery. Never include secrets or complete message content in events or logs.

## Notification examples

Use the [worked authoring guide](../../../../../nodics.docs/docs/pages/nodics.communication/email-sms-templates.md)
for full examples. The smallest branding override is just
`<customer-module>/src/templates/email/employee-email-verification/en/subject.txt`:

```text
Your Example Company verification code
```

Do not copy the manifest or renderer for a subject-only change. The concrete
customer module must participate in the existing discovery/load hierarchy.
An environment/server/node override uses the same relative resource path under
that selected runtime module. Optional owners must be explicitly made available.
Copy a complete compatible manifest only when changing a presentation default or
locale/version; never redefine the source, purpose or parameter contract for branding.

For a new notification, author a new domain-owned manifest and all channel files,
select it through trusted configuration or governed adoption, and call the existing
Communication owner with a stable domain-derived idempotency key. Do not call SMTP
or SMS ports directly from domain/UI code. Examples are inert until deliberately
composed and enabled in an authorized runtime.
