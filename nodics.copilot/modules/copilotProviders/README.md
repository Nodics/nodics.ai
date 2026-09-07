# copilotProviders

Provider-neutral model invocation, usage, resilience, and credential-reference boundary.

This is the pure Copilot provider-family group, equivalent to `nCache`. It owns
composition and shared guidance but no runtime provider service.

- `copilotProvider` is the provider-neutral capability and owns selection,
  validation, profiles, limits, routing, usage and invocation.
- `mockProvider` supplies deterministic in-process test behavior.
- `ollamaProvider` supplies local Ollama HTTP, streaming and health behavior.
- Future OpenAI, Anthropic and Gemini modules belong beside these adapters.

The group requires the neutral capability and mock adapter. Other providers are
optional and become active only through module activation plus layered
properties.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
