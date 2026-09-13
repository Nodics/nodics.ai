# locationCore

`locationCore` owns reusable physical-place identity and the first runtime
behavior slice for Location.

It validates Location records, delegates persistence to generated
`DefaultLocationService`, and exposes secured internal APIs for create, update,
read, and search. It stores operational map placement as separate `latitude` and
`longitude` fields and references Profile address/contact records instead of
duplicating reusable address facts.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
