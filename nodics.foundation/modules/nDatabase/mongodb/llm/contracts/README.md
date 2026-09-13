# mongodb AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDatabase/mongodb`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Transaction rules

- Keep native sessions behind nDatabase transaction authority.
- Propagate `{ session }` to every participating MongoDB operation.
- End sessions in `finally`.
- Use snapshot reads, majority writes, and configured commit timeout.
- Require replica-set or sharded topology qualification.

## Keyed schema constraints

`database.default.mongodb.options.schemaProperties` is a keyed boolean map.
A later layer disables one inherited keyword with `false`; all other enabled
keywords remain inherited. Preserve explicit zero/false schema values. Reject
arrays, null and non-boolean entries instead of silently dropping validation.
This unreleased property has no array compatibility adapter; migrate declared
project overrides together. Driver validation still owns keyword semantics.
