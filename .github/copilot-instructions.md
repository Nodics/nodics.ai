# GitHub Copilot Instructions

Follow the canonical Nodics AI agent contract in `AGENTS.md`.

Before suggesting source changes, also follow:

- `nodics.foundation/modules/nSetup/llm/contracts/ai-role-and-responsibility-contract.md`
- `nodics.foundation/modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md`

When working inside a module or submodule, preserve root-to-leaf AGENTS.md
guidance by following every applicable ancestor module `AGENTS.md` from root to
the nearest owning module. Keep framework changes layered, configurable,
export-friendly, documented, tested, and free from project-specific hardcoding.
