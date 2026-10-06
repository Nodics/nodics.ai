# copilotProvider

Provider-neutral Copilot model selection, validation, routing, usage, resilience, and invocation capability.

This is the single provider-neutral service authority. Its
`DefaultCopilotProviderService` resolves effective layered configuration,
validates adapter metadata and capabilities, invokes standard or streaming
handlers, and returns normalized results. It contains no vendor transport.

Profiles must exist explicitly: a misspelled or inherited object-property name
is rejected before transport. Requests declaring tools require an adapter that
advertises tool calling. The provider-neutral preflight enforces the configured
message and request-byte bounds on both standard and streaming entrypoints.
These checks do not authorize tools; the owning policy and domain remain the
authorization authorities.

Missing token counts are `null`, never invented zeroes. Normalized usage includes
`state: MEASURED` only when input, output, and total token counts are known;
otherwise it is `UNKNOWN`. Known zero remains zero. This state describes
measurement, not budget settlement, price, or an enterprise allowance.

See [provider setup and verification](llm/examples/provider-setup-and-verification.md)
for the local Ollama journey, failures, customization, and validation commands.

Opt-in [usage and budgets](llm/examples/usage-and-budgets.md) adds private
generated-persistence reservations, measured/pending settlement, calendar resets,
personal balances and permission-scoped enterprise usage. It is bounded to one
tenant-period journal. [Current-period allocation administration](llm/examples/allocation-administration.md)
adds separately permissioned enterprise/employee limits, explicit confirmation
and atomic change evidence. Optional configured `defaultLimit` values recur each
calendar period below hard ceilings. Dedicated recurring-policy administration,
global cross-tenant pools and billing remain open. Historical period browsing and
comparisons are described in [historical usage](llm/examples/historical-usage-and-provider-checks.md).

[Usage insights and reconciliation](llm/examples/usage-insights-and-reconciliation.md)
adds current-period daily/ranked aggregates, scoped call inspection and opt-in
private measurement receipts. Administrators can reconcile a retained reservation
only from a verified receipt, with explicit confirmation and atomic audit.
Calls without measured evidence remain held; no estimated refund is permitted.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
