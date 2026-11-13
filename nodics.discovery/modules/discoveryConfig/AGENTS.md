# discoveryConfig Agents

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow every ancestor group `AGENTS.md` from root to this package.
- Keep configuration generic and domain-neutral.
- Domain-specific source providers and rules belong in Commerce or WCMS participant modules.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Use the DMS fixed internal configuration read contracts for Discovery configuration.
Keep target publication explicit and defaults owner-defined. Preserve local actor
context, remote internal identity and denial propagation; never forward authData
as a remote body or accept caller-selected service names. See the owner contract.
