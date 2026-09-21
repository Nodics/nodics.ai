# nodics.rulesEngine Agent Contract

## Inheritance

- Follow the repository agent contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the nSetup role and coding/customization contracts before changing this functional module.
- Follow all applicable ancestor and child-module guidance before implementation.

## Ownership

`nodics.rulesEngine` is a functional module group. The group root owns composition, configuration, tests and LLM guidance only. Runtime behavior belongs in child capability modules.

## Mandatory rules

- Keep the generic engine domain-neutral.
- Reuse existing Nodics schema, service, permission, BackOffice, Process, audit and provider patterns before creating new authorities.
- Property semantics belong to the consumer module/accelerator.
- Operator semantics belong to Rules Engine.
- Published versions are immutable; changes prepare a new draft/version.
- Evaluation must be deterministic, explainable and version-bound.
- Optional missing values are ignored, not evaluated as false.
- Fallback chains are resolved by the consumer provider.
- Input quality/confidence checks occur before operator evaluation.
- Do not execute arbitrary expressions, scripts, regex programs, AI prompts or consumer-provided service names.
- Do not duplicate Process workflow/task ownership.
- Do not duplicate Loyalty wallet/ledger ownership.
- BackOffice navigation/workspaces are module-owned, declarative and non-executable.
- Axis must never become an authoritative evaluator or policy registry.

## Required validation

Run the module syntax and contract tests plus affected Foundation/BackOffice/Process/eWaste tests before completion.
