# Nodics Modularization Phase 0 Validation Record

This is a historical validation record for Phase 0 modularization. It is useful
for traceability and regression thinking, but it is not the permanent coding,
documentation, or testing contract. Promote durable rules into `contracts/`,
`standards/`, or `playbooks/`.

## A1 - Nodics Kickoff metadata

- [ ] `nodics.kickoff/package.json` describes Nodics Kickoff as a reference/customer project.
- [ ] Nodics Kickoff root metadata is loader-visible only as a customer
      `application` topology module, not as a BackOffice functional module.
- [ ] Runtime server packages remain runtime-loadable only where they represent
      runnable server topologies.
- [ ] Nodics Kickoff README explains local platform, WCMS, and cron servers.

## A2 - Portable dependency resolution

- [ ] `nodics.ai` is documented as the backend/framework repository root.
- [ ] `nodics.ai/package.json` declares framework-root metadata and backend
      module workspaces.
- [ ] `nodics.ai/AGENTS.md` is the framework-level LLM navigation entrypoint.
- [ ] `nodics.ai/README.md` is a concise human overview, not an agent behavior
      contract.
- [ ] `nodics.axis` is documented as a separate frontend project/repository,
      not a backend framework module.
- [ ] No runtime contract requires Nodics Kickoff to be parallel to the `nodics.ai`
      checkout.
- [ ] Customer project `.env.example` documents `NODICS_FRAMEWORK_ROOT`.
- [ ] Customer project `.env` is ignored by source control.
- [ ] Existing `nodics.*` package dependencies point to stable
      `.nodics/framework/*` generated links.
- [ ] `npm run configure:framework` creates `.nodics/framework/*` links from
      `NODICS_FRAMEWORK_ROOT` before `npm install`.
- [ ] Generated `.nodics/` setup is ignored by source control.
- [ ] Nodics Kickoff may default to the documented sample layout where it sits
      parallel to `nodics.ai`, but customer projects can override framework
      location.
- [ ] Customer extension modules such as `nodics.kickoff.platform` do not rename the
      standard functional module identity they customize.
- [ ] Framework root/package resolution is declared in one place.
- [ ] `npm test` from `nodics.ai` validates the framework root boundary.
- [ ] Local development can later be tested from a non-parallel customer project
      location.
- [ ] Runtime startup logs or diagnostics can explain where framework modules
      were resolved from.

## A6 - Installed/link/configured-root decision

- [ ] Keep `package.json` dependencies as the install contract.
- [ ] Use `NODICS_FRAMEWORK_ROOT` only to create generated framework links
      before install.
- [ ] Decision covers generated artifacts from clean/build.
- [ ] Decision covers framework update behavior.
- [ ] Decision covers customer portability and CI/release packaging.

## B1 - Formatting principle

- [ ] JS, JSON, and config formatting scripts exist or are planned.
- [ ] Formatting is safe to run without rewriting generated/runtime temp output.
- [ ] Contract says whether comments/headers are added manually or through a
      formatter/header tool.

## B3 - Module skeleton contract

- [ ] Required module files/folders are listed in the Phase 0 contract.
- [ ] Exceptions are documented per module, not left implicit.
- [ ] `nodics.cron`, `nodics.wcms`, `nodics.docs`, and Nodics Kickoff modules are audit
      targets.

## B4 - Customer configuration classification

- [ ] Customer config classification rules are documented.
- [ ] Repeated same-environment server defaults are moved to environment config.
- [ ] Server-specific active modules, ports, database names, and peer endpoints
      remain in server config.
- [ ] Local sample credentials remain outside framework modules.
- [ ] Runtime `temp/` files are treated as generated state, not authored config.

## C1 - Fresh-start import diagnostics

- [ ] After dropping `kickoffLocal`, Platform startup creates one latest
      `ImportRunModel` with `status=COMPLETED`, `failureCount=0`, and
      `summary.recordsFailed=0`.
- [ ] After dropping `kickoffLocalWcms`, WCMS startup creates one latest
      `ImportRunModel` with `status=COMPLETED`, `failureCount=0`, and
      `summary.recordsFailed=0`.
- [ ] Transient first-phase dependency lookup errors may appear in logs, but
      recovered retries are not persisted as final import failures.
- [ ] The finalized import dispatch contract test covers retry-phase failures
      so stale diagnostics cannot return.

## E1 - Verification path

- [ ] Every Phase 0 action has a verification command or manual check.
- [ ] Validation distinguishes documentation/contract checks from runtime tests.
- [ ] Runtime-impacting changes are verified with at least one composed Nodics Kickoff
      server.
