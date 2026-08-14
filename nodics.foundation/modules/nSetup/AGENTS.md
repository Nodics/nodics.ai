# nSetup Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the Nodics Foundation repository contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a Core-owned, module-shaped, non-runtime package boundary.
- Keep governance contracts stable and portable across repositories.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Do not add schemas, routers, services, pipelines, runtime data, or active lifecycle behavior here.
- Update the concise `README.md`, canonical documentation content, `llm/` guidance, and tests whenever behavior or extension contracts change.
- Do not generate module context under `modules/nSetup/llm/generated`; nSetup
  is the human-authored global LLM governance package. Validate its guidance
  through the nTooling governance and acceptance tests instead.
- Generated files in other modules must be recreated from source definitions;
  do not hand-maintain generated artifacts as source of truth.

## nSetup Rules

- Treat this module as the canonical home for Nodics AI guidance, governance contracts, templates, and validation metadata.
- Do not put runtime application behavior in nSetup.
- Keep AI contracts portable Markdown/JSON so Codex, Copilot, Cursor, Claude, Aider, and future tools can consume them.
