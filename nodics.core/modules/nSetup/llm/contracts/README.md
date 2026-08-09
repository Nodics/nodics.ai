# nSetup AI Contracts

This folder contains permanent AI/developer contracts for Nodics engineering.

Use these files for durable rules that are more specific than root
`AGENTS.md` and the module `AGENTS.md`, especially ownership, extension
boundaries, override expectations, testing rules, security constraints,
configuration ownership, generated-artifact responsibilities, and release
expectations.

Do not put phase checklists, refactor action registers, temporary migration
plans, or reusable page templates in this folder. Put procedures under
`playbooks/`, reusable authoring patterns under `templates/`, examples under
`examples/`, and durable decisions under curated `memory/`. Promote only the
permanent rule into a contract.

## Contract Index

- `nodics-principles.md`: canonical platform principles for layered
  ownership, source-of-truth, extension-first implementation, loader-visible
  behavior, configuration ownership, generated artifacts, security/governance,
  and human/AI equality.
- `ai-role-and-responsibility-contract.md`: canonical AI role stack requiring
  business analyst, enterprise architect, Nodics framework/domain specialist,
  senior engineer, QA leader, tester, and TechOps/DevOps responsibilities before
  design, implementation, testing, documentation, operation, or release work.
- `ai-coding-and-customization-contract.md`: canonical AI coding rules for
  reuse-first implementation, export-friendly JavaScript, artifact placement,
  configuration-first behavior, status definitions, file/function
  documentation, formatting, generated artifacts, and customization evidence.
- `developer-implementation-contract.md`: shared human-developer and AI-tool
  implementation rules for Nodics-native development.
- `human-maintainability-contract.md`: maintainability rules for code that
  humans and AI tools can understand, diagnose, review, test, and safely change.
- `nodics-expert-decision-contract.md`: AI decision rules for choosing the
  correct Nodics layer, artifact, extension point, and proof before coding.
- `module-structure-contract.md`: standard module, docs, and LLM folder shape.
- `module-group-participation-contract.md`: canonical workspace, runtime-group,
  structural-group, child-discovery, activation, and registration boundaries.
- `customer-config-classification-contract.md`: ownership and placement rules
  for customer/project, environment, server, generated, and framework
  configuration.
- `integration-governance-contract.md`: ownership, configuration, security,
  testing, and MCP exposure rules for external/provider integrations.
- `documentation-impact-contract.md`: canonical platform-wide documentation
  authority for impact analysis, audience and use-case coverage, detail
  preservation, generation, migration, distributed discovery, and updates
  required by behavior and contract changes.
- `testing-and-release-contract.md`: testing and release expectations.
- `customer-project-mode-contract.md`: scope rules for customer/project work on
  top of released Nodics.
