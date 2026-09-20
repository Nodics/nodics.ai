# copilotKnowledge Agents

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before registering or retrieving any source, read
`llm/contracts/secure-source-registry-contract.md`,
`llm/contracts/secure-ingestion-and-retrieval-contract.md`, and the parent
`../../llm/contracts/copilot-security-governance-contract.md`. Every source
must be explicitly classified, channel-scoped, provenance-bearing, and subject
to required secret scanning. Missing or weak metadata fails closed. Discovery
and its indexes are derived projections; neither may become authorization
authority or return a chunk outside the policy-produced query scope.

Repository ingestion is permitted only through the registered bounded
repository provider and only for non-public sources. Public documentation must
come from an owning publication-aware provider that proves Online/public state;
repository Markdown is never public merely because it is documentation. Every
file passes secret inspection before chunking. Every query is filtered before
Discovery execution and every returned record is reauthorized before evidence
assembly.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
