# openAiProvider Agents

Web retrieval is profile-controlled and disabled unless selected. Preserve actual
search/open-page sources separately from model text; do not treat model-written URLs
as retrieval evidence. See the adapter contract for reasoning and search options.

## Inheritance

- Follow the repository agent contract: `../../../../../AGENTS.md`.
- Follow the Copilot contracts: `../../../../AGENTS.md` and `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Follow the root and `nodics.copilot` contracts. Keep credentials behind secret references, keep this adapter disabled by default, and preserve provider-neutral outputs.

Image mapping belongs in this adapter. Keep raw evidence out of logs. JSON mode does not replace domain validation; incomplete/refused responses must fail closed. Prove later-profile image detail and transport bounds when changing image support.
