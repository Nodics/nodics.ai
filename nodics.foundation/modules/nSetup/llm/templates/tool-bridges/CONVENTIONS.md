# Nodics Tool Conventions

This file is a reusable tool-bridge template. It does not replace or duplicate
canonical Nodics guidance.

When a tool or downstream project explicitly needs a `CONVENTIONS.md` bridge,
copy this template to that tool's expected discovery location and keep it thin.
Do not make it a second source of truth.

Follow root `AGENTS.md`, then preserve root-to-leaf AGENTS.md guidance through
the applicable root-to-module `AGENTS.md` chain.

Before design or implementation, also follow:

- `nodics.foundation/modules/nSetup/llm/contracts/ai-role-and-responsibility-contract.md`
- `nodics.foundation/modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md`

Keep all generated or suggested Nodics changes layered, configurable,
export-friendly, properly documented, tested, and free from project-specific
hardcoding.
