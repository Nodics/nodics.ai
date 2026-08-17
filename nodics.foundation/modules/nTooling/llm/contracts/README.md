# nTooling AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nTooling`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Application-owned documentation source lives under the owning repository or
data module `docs/` directory. Generators must validate catalogues through
`defaultApplicationDocumentationContractService`, emit only lifecycle-qualified
data files, and publish immutable manifest sections with
`OPTIONAL_AXIS_INITIATED` installation, `WCMS_STAGED` destination and required
publication. Never treat source Markdown, generated CMS records, or a frontend
renderer as interchangeable authorities.

Use [application-builder.md](application-builder.md) for the non-runtime
Application Builder authorities, validation rules, deterministic planning, and
customer-data ownership boundary.
