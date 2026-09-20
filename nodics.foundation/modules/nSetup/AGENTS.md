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

- Preserve the universal partner write boundary and contribution process in
  `llm/contracts/customer-project-mode-contract.md`; do not grant framework or
  accelerator modification authority from a partner application request.

## nSetup Rules

- Enforce [existing layers and project independence](llm/contracts/nodics-principles.md#existing-layers-and-project-independence).
  Extend established authorities; never introduce an architectural layer or
  duplicate consumer API. No framework or accelerator layer may embed
  project-specific configuration, including tooling and templates.

- Apply [corrective change and recurrence prevention](llm/contracts/ai-coding-and-customization-contract.md#corrective-changes-and-recurrence-prevention)
  in every correction batch. Strengthen existing authorities and their discovery
  paths; keep module-specific detail with its owner and unresolved findings open.

- Treat this module as the canonical home for Nodics AI guidance, governance contracts, templates, and validation metadata.
- Do not put runtime application behavior in nSetup.
- Keep AI contracts portable Markdown/JSON so Codex, Copilot, Cursor, Claude, Aider, and future tools can consume them.

Apply [module-owned UI contributions](llm/contracts/module-owned-ui-contribution-contract.md) when placing navigation, component properties or workspace data. Visual nesting does not transfer business ownership; generic modules must not predeclare optional accelerator branches.

Before completion or progression, enforce the
[mandatory ownership, placement and scope review](llm/contracts/ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review).
Require a complete scoped inventory, semantic review, explicit evidence limits
and a recorded PASS/FAIL; leave unresolved findings in the canonical checklist.
