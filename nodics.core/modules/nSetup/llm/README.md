# nSetup LLM Guidance Taxonomy

`nSetup/llm` is the canonical, tool-neutral guidance pack for Nodics
development. It should teach developers and AI tools how Nodics code,
documentation, tests, generated artifacts, configuration, and runtime
governance must be handled.

This folder must not become a history dump for every refactor. Durable rules
belong in contracts and standards. Temporary work records belong in records.

## Folder responsibilities

- `contracts/` contains permanent non-negotiable engineering rules: ownership,
  source of truth, extension-first coding, configuration layering, module
  structure, documentation impact, testing/release expectations, security,
  tenant isolation, and governance boundaries.
- `standards/` contains concrete standards and reference guides for code
  structure, module generation, schema/generation, artifact ownership,
  architecture, tenant/runtime isolation, and lifecycle patterns.
- `playbooks/` contains step-by-step working procedures, such as daily change
  checks, feature delivery process, test-selection process, and release/change
  gates.
- `templates/` contains reusable templates and rubrics that can be copied or
  applied when creating documentation or guidance.
- `examples/` contains approved examples for common development tasks.
- `prompts/` contains optional workflow lenses for AI-assisted review,
  refactor, testing, schema, and runtime-governance work. Prompts are not
  separate authorities.
- `records/` contains historical or phase-specific records. Records explain why
  a migration or refactor happened; they must not become permanent runtime or
  coding law unless their durable rule is promoted into `contracts/` or
  `standards/`.
- `memory/` contains curated source-controlled decision memory. Raw assistant
  transcripts and private tool memories must stay outside the repository.

## Contract hygiene rule

Do not place phase checklists, migration notes, refactor action registers,
temporary implementation plans, or page templates in `contracts/`.

When a temporary record reveals a permanent rule, extract the rule into the
appropriate contract or standard, then keep the original record under
`records/` for traceability.

## Navigation route

For non-trivial work, start with:

1. root `README.md`;
2. root `AGENTS.md`;
3. the root-to-leaf module `README.md`/`AGENTS.md` chain;
4. `modules/nSetup/llm/ai-enablement-index.md`;
5. the relevant contract, standard, playbook, template, example, or record for
   the actual change.
