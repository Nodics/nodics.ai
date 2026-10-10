# Payment Foundation Agent Contract

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Implementations are active. Preserve Commerce ownership, tenant security, exact
evidence, idempotency, audit and generation discipline. Refunds require the
[guarded original-capture contract](llm/contracts/README.md); never restore raw
provider-token authority or caller-selected wallet/ledger/financial identities.
Missing approval, remaining-authority or settlement gates fail closed, without
enabling policy or manufacturing Profile/customer context.

Real CARD and historical unbound simulator captures remain fail-closed. Only
fresh, explicitly selected `LOCAL_SANDBOX_DEMO` captures may use the retained
original-capture offline contract through guarded Order authority. Preserve
`sandbox: true` and `OFFLINE_CONFORMANCE` labels; simulated success never means
financial settlement. Do not synthesize refund tokens, accept caller receipts or
trust qualification flags. Read the [CARD gate](llm/contracts/README.md#card-original-capture-gate)
and both CARD regressions before changing provider selection.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
