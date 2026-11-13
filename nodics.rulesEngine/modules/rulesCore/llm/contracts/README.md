# rulesCore Contracts

Shared Rules Engine vocabulary, registries and framework contracts.

This capability inherits the parent `nodics.rulesEngine` contracts and must preserve domain neutrality, deterministic evaluation, version binding, backend authority and standard Nodics layering.

## Structured authoring and review

Operator descriptors now declare inert valueShape (NONE, ONE, LIST or RANGE). Registered outcomes may declare authoring labels and typed scalar fields; ADD_SCORE declares its numeric score field. These descriptors describe existing deterministic operations and contain no executable frontend extension. Consumer property/quality semantics and outcome execution remain with their owners. Extend validators and inert metadata together and retain type/operator contract tests.
