# nController AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nController`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Generated schema mutation boundary

Use compiled schema identity and active owner resolution before authoring checks.
Pass explicit create/update/delete operation names so schema operation lists are
enforced. Map body data through `mapRequestBody`; never spread/merge the body into
trusted runtime context. Only declared transport fields and boolean recursive/
returnModified options may be copied. Model field normalization belongs to the
existing `DefaultSchemaUtilityService`, including original counter preservation.
Keep request/header idempotency separate from model data and from durable domain
replay logic. Test promise/callback success and rejection, missing services,
forged authority, owner/tenant isolation and actual generated template dispatch.
