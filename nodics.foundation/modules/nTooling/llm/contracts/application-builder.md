# Application Builder Contract

The Nodics Application Builder is a non-runtime `nTooling` capability. WP-B1
through WP-B3 provide contracts, read-only discovery, validation, and planning.
WP-B4 adds guarded generation for Commerce-only and Apparel solutions. WP-B6
adds evidence-backed qualification for generated outputs. WP-B7 adds the first
beginner-facing guided wrapper. WP-B8 persists guided review packs. WP-B9 adds
local digest-bound release manifests and non-mutating upgrade planning. WP-B10
adds a beginner dry-run planner. WP-B11 adds beginner answer-template creation.
WP-B12 adds the interactive questionnaire wrapper. WP-B13 adds generated
customer-project handoff artifacts. WP-B14 adds human-readable qualification
summaries and handoff qualification. WP-B15 proves the complete beginner
journey.

## Authorities

- Framework package metadata declares reusable capabilities and dependency
  hierarchy. Domain capabilities remain under `nodics.accelerators` and extend
  Commerce/Foundation through package metadata.
- The explicit customer root `package.json` declares
  `nodics.applicationBuilder.presets`, `compositions`, and `frontends`.
  These are application choices, not executable frontend discovery or proof that
  an external renderer has been deployed. Catalogue entries identify their
  evidence as `DECLARED_CUSTOMER_COMPOSITION`.
- Customer data modules opt in with
  `nodics.applicationBuilder.dataPack: true` in their own package metadata.
  Package names carry no implicit data ownership, domain, or frontend policy.
- A solution records project choices and cannot redefine backend dependency
  ownership. `experience.rendererByDomain` and `data.packDomains` bind logical
  rendering and data ownership explicitly; neither is inferred from a brand or
  package-name suffix.

Pass explicit framework, `--frontend`, and `--customer` roots. Optionally use
`--experience` with its existing `apps.json` and `--frontend-code` to select one
frontend. A workspace with multiple storefronts requires explicit selection.
Legacy `--agora`, `--kickoff`, and `--exp` spellings remain input aliases only;
they provide no default source, project policy, or missing-repository fallback.
Missing sources fail in CI exactly as they do locally. Package metadata and
customer declarations participate in the catalogue digest. Tests create real
isolated fixture repositories instead of depending on installed siblings.

## Beginner guided experience

The Builder is first a guided application creator, not a Nodics expert console.
A new user should be able to start from business choices and reach a working
project without understanding module names, dependency graphs, package
metadata, or runtime inheritance.

The guided flow must:

- ask simple business questions: application name, commerce domain, market,
  locale, currency, desired frontends, and sample-data preference;
- present domain presets such as Apparel, Electronics, Telco, and Combined in
  plain language before exposing raw capability codes;
- explain the selected backend, storefront, and data-pack result before any
  write;
- show what will be generated, where it will be written, what remains
  customer-owned, and what can be customized later;
- provide one clear next command at each step instead of requiring the user to
  assemble flags from documentation;
- keep plan, approval, lock, digest, and graph details visible as audit
  evidence, but not as mandatory concepts for the beginner path;
- fail with corrective instructions such as missing repository root, unavailable
  domain preset, unsafe output path, unresolved decision, or stale plan.

Advanced commands may keep explicit roots and JSON documents, but the planned
Builder user experience must include a guided wrapper that creates or updates
those documents from answers. A user should not need to know that Telco extends
Electronics, or that customer data lives in `agora.telco`, for the correct
result to be generated.

`builder:guide` is the initial wrapper. It accepts beginner answers, returns a
full solution document, returns an approval-required plan, and explains the
selected backend/storefront/data result. Without `--workspace` it performs no
writes. With `--workspace=/absolute/absent/review-folder` it writes only review
artifacts: `guided-answers.json`, `solution.json`, `generation-plan.json`,
`beginner-summary.md`, and `builder-guide-report.json`. These files are for
human or AI review; they are not generated backend/frontend application files,
and the plan still requires `builder:approve` before `builder:generate`.
Later interactive or UI flows must delegate to the same guided service instead
of duplicating preset logic.

`builder:dry-run` accepts the same beginner answers and returns a read-only
projection of what would be built. It must not write review files or generated
application files. It must show the beginner questions, selected backend
capabilities, transitive backend dependencies, selected frontends, active
domains, renderer keys, data packs, planned customer project outputs,
ownership rules, validation gates, source digests, and approval state. Telco
must be explained as Telco customer experience plus Electronics backend
behavior; it must not include Electronics data packs or renderers unless the
user selected Electronics or Combined.

`builder:answers-template` creates the same guided answers document from simple
business-facing flags. It may print the JSON only, or write exactly one absent
absolute JSON file when `--output` is supplied. It must reject protected roots,
repository roots, descendant paths inside protected repositories, existing
files, missing output parents, symlinked output parents, invalid presets, and
invalid frontend choices. With `--dry-run=true`, it must delegate to
`builder:dry-run` using the created answers and still avoid generated
application writes.

`builder:questionnaire` asks the beginner questions one at a time, emits a
schema-valid guided answers document, and then optionally performs the same
safe one-file answers write and read-only dry run. Prompts must be written to
stderr and structured JSON to stdout so automation can parse the result. The
questionnaire must reuse `builder:answers-template` normalization and
validation logic instead of maintaining a parallel preset map.

For beginner usage, select a customer-declared preset and explicit source roots.
The preset owns market defaults, stores, catalogs, backend runtime roles,
frontend selections, renderer mappings and data-pack choices. Frontend codes
must be unique even when compared without case, because generated wiring uses
lowercase paths. Unsupported preset, frontend, renderer, domain or pack choices
must fail before generation. A declaration change invalidates the approved plan;
rediscover, review and approve the changed plan before retrying generation.

## Template repository governance

`nodics.exp/apps.json` is a Nodics-owned template and framework catalogue. The
registration rule applies to reusable experience applications, partner starter
templates, and customer-project templates that Nodics publishes under the
Nodics GitHub organization.

When a new reusable Nodics experience app is added under `github.com/Nodics`,
the app remains an independent repository and must be registered in
`nodics.exp/apps.json` so workspace setup, status, fetch, verification, and
Application Builder discovery stay deterministic. The Builder and AI tools must
not treat `nodics.exp` as the source owner for that app.

This governance rule must not be projected onto real customer-owned delivery
projects. A customer project generated from Nodics templates may live in the
customer's own Git organization, monorepo, polyrepo, CI system, naming scheme,
and workspace layout. Customers cannot and should not be required to change
repositories under `github.com/Nodics`. Builder guidance may recommend the
Nodics template layout as a learning path, but generated handoff materials must
make clear that real customer repositories are free to adopt their own
structure while preserving Nodics runtime contracts, ownership boundaries, and
safe extension points.

## Safety and reproducibility

- Validate solution documents against `contracts/applicationBuilder` before
  semantic planning.
- Reject unknown fields, embedded secret-like values, unsafe target paths,
  unresolved material decisions, missing dependencies, selected/excluded
  conflicts, and frontend/data selections unsupported by discovery.
- Resolve transitive dependencies from package metadata. In particular, Telco
  extends Electronics, which extends Commerce.
- Produce only relative, traversal-free planned targets with explicit
  `GENERATED` or `CUSTOMER_OWNED` ownership.
- Plans start in `PENDING`, require approval, expire, and contain source
  digests. The same solution, portable catalogue, and supplied clock must yield
  the same plan.
- Absolute repository roots may appear as discovery provenance but must not
  affect the portable catalogue digest.
- Guided review workspaces must be explicit absent absolute paths, reject
  protected roots, reject symlinked selected parents, write artifacts with
  create-only semantics, and roll back only the review root created by that
  invocation on failure.
- WP-B4 generation requires an approved, unexpired plan whose approval digest
  matches the supplied solution, current catalogue, and canonical plan.
- The output must be an explicit absent absolute path outside protected
  repository and home roots. Reject a symlinked selected parent.
- Create customer-owned locations only when absent and never populate them with
  reusable framework/domain logic. Hash generated artifacts into the lock.
- On failure, remove only the new root created by that generation invocation.
- WP-B5 permits Electronics, Telco, and Combined generation after the same
  approval and containment checks. Backend capabilities must equal the resolved
  dependency closure, while active frontend domains, renderer keys, and customer
  data packs must equal the selected experience rather than every backend
  dependency.
- Telco activates the Telco experience and data pack while resolving Electronics
  as backend behavior. It does not become a second Electronics-Telco domain.
- Combined output must contain each resolved capability, active domain, renderer
  key, and selected customer data pack exactly once.
- WP-B6 qualification converts generated `solution-lock.json` state from
  `NOT_RUN` to `PASSED` or `FAILED` only through a schema-validated
  qualification report.
- Qualification must also write a human-readable Markdown summary beside the
  JSON report. The summary must identify state, scope, passed gates, failed
  gates with diagnostics, handoff artifacts, and next commands.
- Generated-skeleton qualification proves the emitted graph, frontend composition,
  customer-owned extension/data roots, secret-free backend-owned security
  boundary, generated handoff, and generated `npm test`.
- Generated outputs include a self-contained backend HTTP runtime and a starter
  storefront HTTP runtime. Qualification may mark `FULL_GENERATED_APPLICATION`
  only when generated self-tests and generated runtime probes pass.
- Generated outputs must include a beginner `README.md` and a
  machine-readable `builder-handoff.json`. These handoff artifacts must explain
  selected backend capabilities, frontends, active domains, renderer keys,
  data packs, ownership boundaries, safe customization roots, and next
  commands. Generated self-tests must fail when handoff artifacts are missing
  or do not preserve the approved project identity and ownership boundary.
- The complete beginner journey must remain testable as: questionnaire,
  answers, dry-run, review pack, approval, generation, and qualification. Telco
  and Combined are the minimum end-to-end cases because they prove dependency
  closure, selected-domain rendering, data-pack symmetry, and optional supporting frontend
  participation.
- A reference-workspace qualification can attach the separately recorded
  fresh-database nine-runtime evidence. That evidence complements generated
  app runtime proof; it must not be used as a substitute for generated backend
  and storefront probes.

## Registry and upgrade mode

`builder:release-manifest` creates a local digest-bound release manifest from
an approved plan and solution. The local signature uses `LOCAL_SHA256_DIGEST`
so the workspace can prove deterministic integrity without pretending to have a
production release-signing key. Future release infrastructure may replace this
with external signing authority, but must keep the same lock, plan, solution,
and catalogue binding checks.

`builder:upgrade-plan` compares an existing generated `solution-lock.json` with
a target release manifest, approved plan, and solution. It performs no
mutation. Its output must identify package/data-pack changes, reject tampered
release manifests, and preserve the rule that customer-owned files are never
overwritten by Builder upgrade.

## Layered customization

Projects may contribute compatible descriptors or extend merged Builder
services through the normal nTooling service and command contracts. An override
must retain explicit roots, schema and semantic validation, deterministic
dependency resolution, read-only planning, approval requirements, and
non-execution. Customer product/content catalogues and page/component data stay
in their customer-owned data modules; nTooling owns only Builder contracts and tooling.

## Independent customer generation and evidence

`storefront/generated/frontend-composition.ts` is the generated composition
artifact. Earlier plans that target the removed application-labelled filename
must be regenerated and approved; never silently reinterpret an old approved
operation list. Wiring notes are emitted for each selected supporting frontend.
Domain sample product behavior remains in the existing generator, using selected
renderer mappings. `sampleData: false` emits empty product/price/inventory samples.

Customer declarations describe intended wiring. `FULL_GENERATED_APPLICATION`
means the generated standalone starter passed its own tests and HTTP probes.
It does not prove production authentication, database imports, selected external
frontend renderer execution, or the customer's deployed runtime. Operators must
supply separate deployment evidence. Source declarations, starter tests, real
provider tests and deployed-runtime checks are distinct acceptance levels.

The independent-customer contract test uses unrelated codes for frontend,
composition, renderer, store, catalog and data pack. It runs generation and
starter HTTP qualification, rejects undeclared choices and missing CI sources,
and proves metadata edits invalidate plan digests. Customizations must preserve
these checks, dependency closure, approval, containment and existing-file safety.
