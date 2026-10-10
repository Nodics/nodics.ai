# Stripe Provider Agent Contract

- Follow `../../../../../../../AGENTS.md` and `../../../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

The offline adapter is active. Preserve Commerce ownership, protected generated
Payment evidence, tenant/enterprise/owner scope, exact amounts, idempotency and
audit. Read README and llm/contracts/README before changing the adapter.

Legacy token-based sandbox operations are conformance only. Explicit new
`LOCAL_SANDBOX_DEMO` captures retain bound receipts; refunds require fresh guarded
Order approval and existing Payment owner readback, never caller tokens/receipts.
Keep `OFFLINE_CONFORMANCE` labels at every handoff. No credentials, network calls,
live qualification, policy enabling or alternate ledger may be introduced here.
