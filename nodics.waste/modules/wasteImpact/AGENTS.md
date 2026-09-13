# wasteImpact Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteImpact` owns reusable metric/profile/result contracts, provider dispatch,
and the illustrative mock algorithm. Later supported configuration layers own
selected provider settings and policy deltas. Domain formulas, real coefficients,
legal claims, and public messaging remain with their owning accelerator,
provider, or project policies; no specific customer module is mandatory.

Read [the provider contract](llm/contracts/README.md) and the
[canonical guide](../../../nodics.docs/docs/pages/nodics.waste/impact-providers.md)
before modifying dispatch or calculations.

- Resolve selected adapters through `SERVICE`, and effective settings through
  `CONFIG.get('wasteImpact', trustedTenant)`. Never trust body fields for tenant,
  provider selection, file paths, credentials, or configuration overrides.
- Preserve asynchronous provider support in facade consumers and partial
  exported-method overrides through the normal loader.
- Keep mock results estimated, preserve immutable calculation provenance, and
  provider adapters never issue credits, post rewards, persist results, or authorize public claims. Assessment operations persist immutable results through generated owner services.
- Missing/failed providers must not silently fall back to mock. Bound execution,
  propagate the cancellation signal, and normalize errors without raw payloads.
- Keep scalar policies in configuration, protocol vocabulary in enums, and
  error codes in status definitions. Add focused default, customization,
  rejection, isolation, decimal-boundary, timeout, and compatibility evidence.

Environmental disclosure is additive result metadata over provider metric codes.
Keep missing values null, mock values illustrative, units exact, and signed values
limited to explicitly configured net indicators. Do not let display mappings
become another formula/metric authority or turn assessment into credit issuance.

Saved reassessments and explicit acceptance use `DefaultWasteImpactAssessmentService`; see the [provider and history contract](llm/contracts/README.md). Original approval evidence and reward settlements remain unchanged. Focused history tests cover replacement, stale/cross-scope commands, retry, concurrency and partial-persistence recovery.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
