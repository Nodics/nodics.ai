# nPipeline AI Contracts

Use the [sensitive request capture contract](../../../nRouter/llm/contracts/request-capture-privacy-contract.md)
for private pipeline envelopes and logging. Starting a pipeline preserves the exact
request and suppression, but does not grant admission to an ambient-context clone.
New owner mappings explicitly inherit from the admitted source. Private exception
logs use a fixed marker; business errors remain intact for domain recovery and
are masked at the owned HTTP diagnostic boundary. Deferred entry fixtures are
`../../test/privateRequestEntryContract.test.js`, NOT RUN in the source batch.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nPipeline`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.
