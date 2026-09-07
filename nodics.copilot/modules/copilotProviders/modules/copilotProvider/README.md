# copilotProvider

Provider-neutral Copilot model selection, validation, routing, usage, resilience, and invocation capability.

This is the single provider-neutral service authority. Its
`DefaultCopilotProviderService` resolves effective layered configuration,
validates adapter metadata and capabilities, invokes standard or streaming
handlers, and returns normalized results. It contains no vendor transport.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
