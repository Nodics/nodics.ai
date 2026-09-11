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

`ai:principle-audit` validates the authored nSetup partner write boundary,
framework/accelerator/project ownership and contribution process, plus discovery
from AI coding, developer and enablement guidance. Preserve these checks when
extending the audit. This is a static documentation-drift gate, not a filesystem
or repository access-control mechanism.

Documentation module filters resolve the nearest source package directory within
the explicit coverage root. A nested framework path must not be classified as
`modules`, and a legacy npm alias must not hide the folder named by a gate.
`test/documentationCoverageScopeContract.test.js` proves scoped failures against
disposable framework, nested exporter and package-root layouts.
