# Nodics Communication

Communication is the provider-neutral authority for templates, rendering, recipient/channel policy, consent and suppression evidence, message intents, delivery attempts, callbacks, retry, fallback, and inbox records. Business modules request communication and retain their own business state.

External SMTP and SMS providers are disabled until deployment-specific credentials, sender identity, consent, residency, callback, observability, and rollback pass acceptance. The local provider is deterministic and intended for development and contract testing.

Read `AGENTS.md` and `llm/contracts/README.md` before changing ownership or provider behavior. Run `npm test --workspace nodics.communication` and the effective Engagement server build for verification.
