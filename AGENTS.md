# Nodics AI Framework Agent Contract

`nodics.ai` is the Nodics backend/framework repository root.

Use this file as the first LLM/developer navigation contract when working
inside the Nodics framework repository. Module-specific `AGENTS.md` files still
own local behavior inside each functional module group.

## Repository boundary

- Treat `nodics.ai` as the authoritative backend/framework repository root.
- Keep standard Nodics backend functional module groups under this repository,
  such as `nodics.core`, `nodics.platform`, `nodics.cron`, `nodics.wcms`, and
  `nodics.docs`.
- Keep customer projects outside this repository. `nodics.kickoff` is a reference
  customer project and must not be treated as a framework module.
- Keep frontend applications outside this repository. `nodics.axis` is the
  Axis/BackOffice frontend application and must be managed as a separate
  project/repository parallel to the framework repository.
- Do not import behavior from archived legacy repositories except as explicitly
  approved reference material during migration.

## Functional module identity

- BackOffice and Axis must reason about standard functional module identities:
  `nodics.platform`, `nodics.cron`, `nodics.wcms`, `nodics.docs`, and so on.
- Customer extension modules customize implementation but do not rename the
  standard functional capability.
- Example: `nodics.kickoff.platform` may extend `nodics.platform`, but the registry
  identity and display capability remain `nodics.platform` / `Platform`.
- Register optional business capabilities at the functional module level, not
  at every internal technical module level.

## Runtime inheritance

- Repository/package dependency only makes code available.
- Module `extends` defines functional inheritance and customization.
- Runtime server `extends` defines the effective boot chain for a server.
- Service override order remains explicit through runtime load/index order and
  merge behavior. Do not confuse module availability with service precedence.
- Treat import retry phases as operational probes. Transient phase errors may be
  visible in logs, but recovered retries must not remain in persisted import-run
  diagnostics.

## Documentation and LLM ownership

- Repository-wide framework principles live under `llm/contracts/` and
  `docs/` in this repository root.
- Module-local contracts live under each functional module group, for example
  `nodics.core/llm/contracts/`.
- README files are concise human overviews. AGENTS files direct agent behavior.
- Update the Phase 0 modularization contract before broad source movement,
  runtime loader changes, dependency-resolution changes, or module skeleton
  changes.
