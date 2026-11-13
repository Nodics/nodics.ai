# rulesCore

Shared Rules Engine vocabulary, registries and framework contracts.

Read `AGENTS.md`, `llm/contracts/README.md`, and the parent Rules Engine contract before implementation.

## Structured authoring contract

Operator descriptors now declare inert valueShape (NONE, ONE, LIST or RANGE). Registered outcomes may declare authoring labels and typed scalar fields; ADD_SCORE declares its numeric score field. These descriptors describe existing deterministic operations and contain no executable frontend extension. Consumer property/quality semantics and outcome execution remain with their owners. Extend validators and inert metadata together and retain type/operator contract tests.
