# Documentation Impact Contract

Every functional change must evaluate documentation and AI-guidance impact.

Update the affected artifacts when behavior, extension contracts,
configuration, API shape, schema behavior, router behavior, service behavior,
pipeline behavior, security, cache behavior, build behavior, or generated
artifacts change.

Review:

- `AGENTS.md` for AI/developer rules and extension boundaries.
- `README.md` for module purpose, usage, capabilities, and extension points.
- `docs/` for architecture, runtime contracts, lifecycle, operations, and
  troubleshooting.
- `llm/` for AI guidance, examples, checklists, generated summaries, and module
  context.
- `llm/contracts/` for behavior rules, extension boundaries, override
  contracts, security expectations, validation rules, testing obligations, and
  generated-artifact responsibilities.
- `llm/examples/` for correct customization, extension, configuration, testing,
  usage, and migration examples that future AI agents should prefer.
- `test/` for behavior contracts.
- `config/`, schemas, routers, services, pipelines, and data for layered
  defaults and override points.

AI-assisted changes must treat AI-facing files as first-class deliverables.
When an AI tool implements or changes functionality, it must update affected
module `AGENTS.md`, `llm/contracts/`, `llm/examples/`, and generated LLM context
where the module behavior, extension path, or recommended implementation pattern
changes.

Not every change updates every file. Every change must make an explicit
documentation-impact decision. Generated documentation and generated LLM context
must be recreated from source definitions.

Canonical public documentation content belongs in the separate documentation project
repository and is projected into Nodics CMS through the governed content-pack
contract. Retired `gDocs` content may remain only as temporary migration
evidence under ignored root `docs/`; it is not the authority for new public
guidance and must not be reintroduced as a runtime or documentation module.
Root `docs/` is temporary, untracked, and non-runtime unless implemented
material is explicitly promoted. The Nodics root README remains the repository
entry point and must link readers toward canonical capability journeys for
business evaluators, beginners, builders, architects, security reviewers, and
operators. Public task pages must link to their next useful action and owning
module detail.

Run Nodics documentation-governance checks for repository links, ownership,
module coverage, and generated AI context. Run the the documentation project coverage, depth,
content-pack, and link checks when canonical public content changes. Neither
repository may create a second public documentation authority.

Promotion is evidence-based. Canonical the documentation project content, module
`README.md`, canonical documentation content, and generated context must describe functionality
that exists in authoritative source/configuration/runtime contracts and has
appropriate validation evidence. Keep proposals, future architecture,
unresolved decisions, backlogs, and action plans under root `docs/` while they
remain unimplemented. When implementation differs from a plan, update the
temporary plan first; promote only the behavior that was actually implemented
and verified. Do not create permanent public documentation merely to preserve a
future idea.

## Distributed Discovery Contract

Nodics cannot assume that a developer or AI tool reads the complete
documentation set. Every implementation boundary must be safe when discovered
from the nearest files only.

The minimum local discovery chain is:

1. root `AGENTS.md` defines platform-wide non-negotiable principles;
2. the nearest module-group and module `AGENTS.md` define ownership,
   dependencies, invariants, prohibited bypasses, and extension rules;
3. the module `README.md` explains the capability, configuration, source map,
   supported customization, and verification entry points;
4. `llm/contracts/` states executable behavior and placement rules;
5. `llm/examples/` demonstrates the smallest supported layered customization;
6. generated module context reports current source-derived ownership and gaps;
7. focused tests enforce the rules that must not depend on contributor memory.

Do not place a critical rule only in a distant public guide, planning document,
prompt, or generated summary. Repeat a concise local rule when it is necessary
to make the module safe in isolation, while linking to the canonical detailed
contract instead of copying its complete text.

## Documentation Detail Preservation Contract

Documentation is a product capability, not a short summary of source code.
Human contributors, partners, generators, migration tools, and AI tools must
preserve or increase useful verified detail whenever documentation is created,
restructured, migrated, or updated.

The following rules are mandatory:

1. Never reduce a complete guide merely to make it shorter, easier to generate,
   visually simpler, or compliant with a minimum word count.
2. Preserve verified business context, beginner explanations, terminology,
   concepts, architecture, configuration, defaults, precedence, extension
   points, examples, tables, security, tenant behavior, performance,
   observability, operations, failures, recovery, troubleshooting, limitations,
   and verification whenever applicable.
3. Capability-first restructuring may change titles, grouping, sequence, and
   language. It must not silently discard unique knowledge from an
   authoritative or reviewed migration source.
4. Keep stronger explanations, scenarios, decisions, and limitations already
   added to a canonical destination. A synchronization tool may replace only
   content attributed to the same recorded evidence source.
5. Do not invent behavior to make a page appear complete. Verify claims against
   current source, properties, schemas, routes, services, tests, module
   technical documentation, and controlled runtime evidence.
6. State whether behavior is implemented, configurable, guarded,
   provider-dependent, scaffolded, deprecated, or planned. Planned behavior
   remains outside published runtime documentation until its implementation and
   tests exist.
7. Write for partial discovery. A reader arriving through search must
   understand purpose, prerequisites, authority, context, expected result,
   limitations, and the next action without reading the whole repository.
8. Reuse and extend an existing canonical page before adding another
   authority. Do not create parallel guides, terminology sources, configuration
   authorities, migration paths, or generated content paths.
9. Removing documented behavior requires evidence of a governed implementation
   removal, a reviewed correction of inaccurate or unsafe guidance, a named
   canonical destination preserving the knowledge, or an explicit archive or
   reject decision with a reason.
10. Page splitting, navigation redesign, rewording, or generator convenience is
    not sufficient reason to remove detail.
11. Every overview begins by defining the topic in plain language, using a
    familiar analogy, explaining why an application needs it, and walking
    through a small example before business outcomes, architecture,
    configuration, or operations. Do not assume a graduate, evaluator, or
    first-time reader already knows the underlying technology.
12. Navigation expresses the learning journey, not implementation containment.
    Framework orientation belongs in discovery; capability hubs remain owned
    by the capability section instead of becoming children of one architecture
    article.
13. Preserve reviewed diagrams and images as governed structured media with
    alternative text, integrity evidence, safe transport, and responsive
    rendering. Do not leave image Markdown as visible text, copy canonical
    media into each frontend, or silently discard it during generation.
14. Inline presentation syntax is a bounded declarative contract. Consumers
    may render allowlisted links, emphasis, and inline code, but must reject raw
    HTML, executable markup, unsafe URL schemes, and arbitrary styles.
15. Complex process documentation must use diagrams when they make the
    relationship materially easier to understand. Pipelines, workflows,
    import/export lifecycles, publishing flows, authentication boundaries,
    provider routing, event delivery, and runtime startup sequences should
    include a small declarative diagram when the reader would otherwise need to
    mentally connect three or more dependent steps. The diagram must be paired
    with plain-language explanation, stable step names, accessible alternative
    text or equivalent prose, and source-backed behavior. Do not add diagrams
    as decoration, and do not use diagrams to hide unsupported or planned
    behavior inside published documentation.
16. Every strict enterprise documentation topic must declare
    `visualRequirements` in catalogue metadata. These requirements are the
    authoring contract for the page, not optional decoration. Architecture
    topics need architecture or module-hierarchy diagrams; runtime and
    integration topics need sequence, data-flow, lifecycle, provider-routing,
    or event-flow diagrams; schema and configuration topics need schema models
    plus configuration tables; Axis and business-user topics need screen flows,
    screenshots, or equivalent UI journey visuals; troubleshooting topics need
    matrices or decision trees; commerce, order, publishing, cron, workflow,
    import/export, and pipeline topics need lifecycle or state diagrams. Tables
    should explain comparisons, configuration choices, ownership boundaries,
    risks, or operating decisions. Screenshots and code-snippet images should
    be governed media with alt text and source evidence when they are used.
    Text-only pages are incomplete when a visual would reduce ambiguity for a
    business user, administrator, developer, operator, QA owner, or AI tool.
17. Published documentation pages must follow the Nodics page anatomy contract.
    Each page needs a clear title, detailed summary, breadcrumbs or hierarchy
    context, audience/maturity/lifecycle/access metadata, the declared visual
    contract, business perspective, technical perspective, configuration or
    source map where applicable, customization and extension guidance,
    operational/security notes, troubleshooting, verification, and related
    topics. The order may change for readability, but the reader needs must be
    covered before a page is considered complete.
18. Documentation renderers must be declarative consumers of backend-owned CMS
    content. Axis and Nexus may render Mermaid diagrams, tables, images,
    screenshots, code blocks, command blocks, callouts, links, breadcrumbs,
    table-of-contents navigation, previous/next links, hierarchy dashboards,
    badges, and search filters. They must not execute markup from CMS content,
    accept arbitrary renderer URLs, invent navigation hierarchy, or bypass page
    access and lifecycle metadata.
19. Section, group, subgroup, and topic landing areas are documentation
    dashboards. They must summarize child navigation, supported journeys,
    audience intent, maturity/access signals, important risks, and related
    next steps instead of acting as empty folders. Dashboards are backend
    content records and must be editable and publishable through the same
    governed documentation workflow as pages.
20. Catalogue metadata is the source contract for publication and rendering.
    A strict page must carry hierarchy, parent, order, document type, audience,
    business audience, technical audience, source owner, source path, evidence,
    access mode, public/authenticated flags, roles/groups/permissions,
    lifecycle state, maturity state, implementation state, rendering component,
    related pages, search keywords, topic keywords, visual requirements, and
    generated checksums where applicable.
21. Axis and Nexus have separate presentation responsibilities but one content
    truth. Axis renders authenticated documentation, management previews,
    authoring validation, and role-aware navigation. Nexus renders only public
    Online documentation. Both consumers must preserve backend-provided page
    anatomy, visual blocks, hierarchy, related links, search metadata, and
    visibility boundaries.
22. Documentation management is a governed business capability. Axis may give
    authors and administrators a workspace for editable navigation hierarchy,
    section/group/subgroup/topic dashboards, page metadata, visual
    requirements, access policy, preview, validation, and review submission.
    The editable records must remain backend-owned CMS/documentation content
    records in the content catalog. Axis must not replace them with local JSON,
    hardcoded menus, browser-only drafts, or an alternate publication path.
23. Every documentation item that can affect a reader's journey must be
    publishable. Changing a documentation product, navigation, node,
    dashboard, page metadata, route, template, component, access policy, search
    metadata, or rendered article content must create or update the
    publication-state evidence needed for staged review, approval, Online
    activation, audit history, and rollback/reference to the previous Online
    version where available.
24. Documentation roles are least-privilege roles. A read-only Axis viewer may
    read authorized Axis applications and documentation but must not receive
    authoring, operational, approval, publication, runtime mutation, or import
    execution permissions. A documentation author may create/update
    documentation drafts, navigation, dashboards, visual contracts, and review
    requests, but admin/super-admin authority remains responsible for approval
    and Online publication unless a customer layer explicitly defines a
    different governed role.
25. Search preparation is metadata, not search authority. Catalogue records
    must provide title, summary, keywords, facets, access mode, lifecycle
    state, and normalized search text so current keyword search and future
    Elasticsearch projection can reuse the same source. The content catalog
    remains the source of truth even when an external index later renders
    faster search results.

Minimum word and section counts are lower-bound defect detectors only. They do
not prove accuracy, usefulness, audience completeness, evidence coverage, or
source preservation.

## Benchmark-Informed Documentation Experience Contract

Nodics documentation must feel like a guided product experience, not a source
tree dump. Mature enterprise platforms usually help readers through a few
repeatable journeys before they expose deep internals: get started, learn the
capability map, use the product, administer it, extend it, integrate it,
operate it, troubleshoot it, and then move into reference material. Nodics must
use the same reader-friendly discipline while preserving its own terminology,
runtime contracts, and modular ownership rules.

Every public documentation entry point, especially a repository `README.md`,
top-level documentation landing page, capability overview, or customer project
guide, must answer these questions in order:

1. What is this, in plain language?
2. Who is it for: business evaluator, developer, architect, administrator,
   operator, tester, partner, or AI tool?
3. What business problem does it solve?
4. Why was the Nodics approach chosen instead of a one-off project structure,
   hardcoded customization, or copied service implementation?
5. What can a reader build, run, configure, or evaluate today?
6. What is included out of the box and what remains project-owned,
   provider-owned, optional, scaffolded, or future?
7. What is the shortest safe path to see it running locally?
8. What should the reader see when the setup is successful?
9. Where should each reader go next?

The first ten minutes of a new reader's journey are contractual. A developer
opening the framework on GitHub must understand why Nodics exists, what
repositories are needed, how to configure the local reference project, which
servers to start, how to log in to Axis, and how to open documentation without
having to reverse-engineer module internals. A business evaluator must
understand the business value, adoption model, customization value,
multi-enterprise and multi-tenant direction, governance benefits, and
operational confidence before seeing low-level folders. An operator must see
the runtime topology, prerequisites, public versus private configuration,
health expectations, and troubleshooting path.

Use role-based pathways when a page has more than one audience:

| Reader | First questions the documentation must answer |
| --- | --- |
| Business evaluator | What problem is solved? What outcomes improve? Why is this safer than a one-off build? What can be demonstrated today? |
| Developer | What do I clone or install? What commands do I run? Which module owns the behavior? Where do I customize safely? How do I test it? |
| Enterprise architect | What are the module boundaries? How is ownership enforced? How do extension, runtime loading, security, tenancy, and integration fit together? |
| Administrator or business user | Which screens exist? Which actions are safe? What data is initialized? What can be configured from Axis? |
| DevOps or TechOps | Which services run? Which dependencies are mandatory? Which configuration is secret? How do we monitor, recover, scale, and release? |
| Tester or QA engineer | What are the happy paths, boundary cases, regression risks, and acceptance checks? |
| AI tool | What is the nearest authority? What may be changed? What must not be invented? Which generated artifacts and tests prove the change? |

Each major page must provide at least one concrete example that follows a
reader through a realistic sequence. The example must include:

- a starting situation;
- the reason the user needs the capability;
- the Nodics-owned module or project that owns the behavior;
- the safe action path;
- the expected visible result;
- the common mistake to avoid;
- the next deeper topic.

Diagrams, images, screenshots, and tables are required when they materially
reduce beginner confusion. Use them for journeys, module relationships,
runtime startup, import/export lifecycle, publishing, authentication
boundaries, workflow, provider routing, release flow, data ownership, or any
concept with three or more dependent steps. Diagrams must be paired with prose
so that the page remains accessible and source-control friendly.

Do not write competitor-copy documentation or unverified comparison claims.
External enterprise documentation may inspire structure, reader pathways, and
onboarding sequence, but Nodics documentation must make only Nodics-verified
claims. When comparing approaches, compare patterns such as monolith-first
projects, copied customer forks, hardcoded configuration, ungoverned
microservices, or frontend-owned business authority.

## GitHub Landing Page Contract

The root `README.md` of the framework repository is the first product doorway.
It must be understandable to a reader who has never seen Nodics, has not read
`AGENTS.md`, and may not know the domain. It must not begin as an internal
module inventory unless the business and developer orientation already exists.

The landing page must contain, in this order or an equivalent reader-friendly
flow:

1. one-paragraph product definition;
2. business problem and outcomes;
3. why Nodics is different from ordinary application projects;
4. audience paths for business, developer, architect, operator, tester, and AI
   contributors;
5. what can be run locally today;
6. exact repository/workspace expectation;
7. prerequisites and dependency choices;
8. local quick start commands;
9. expected login, URLs, and visible result;
10. documentation and Swagger/API discovery path;
11. customization model;
12. repository/module ownership map;
13. validation and contribution expectations.

If the repository is a framework root rather than a runtime functional module,
the README must say that plainly. It must also explain that partner or customer
projects may use their own workspace layout and resolve the framework through
configured package dependencies or a framework-root setup step.

## Documentation Quality Rubric

Every public or CMS-importable documentation pack must be useful to three
reader mindsets. A page may emphasize one mindset, but the complete pack for a
framework module, product module, or customer project must cover all three.

1. Business and adoption mindset:
   - explain the business problem and why the capability exists;
   - describe the outcomes, cost/risk reduction, scalability, governance,
     multi-enterprise or multi-tenant value, customization value, and adoption
     path;
   - compare the Nodics approach with common project failure modes such as
     scattered code, hard-coded customer behavior, late security, and
     throwaway MVP architecture;
   - state limitations honestly so evaluation remains credible.
2. Developer and implementation mindset:
   - explain concepts with beginner-level language before internal terms;
   - show where source files, configuration, schemas, services, routes,
     generated artifacts, tests, and extension points live;
   - provide step-by-step examples for local setup, adding a module, extending
     a module, overriding a service through load order, and validating the
     change;
   - call out common mistakes, unsafe shortcuts, and required verification.
3. DevOps and production mindset:
   - explain runtime topology, server composition, environment/server/node
     configuration, public versus private properties, dependency choices,
     deployment flow, release lifecycle, health, logs, monitoring, backup,
     recovery, scaling, and rollback;
   - distinguish mandatory prerequisites from optional providers;
   - describe how local consolidated execution can evolve into distributed
     runtime processes without changing capability ownership.

A major documentation page should normally include these sections or their
equivalents:

- what this is;
- why it exists;
- what problem it solves;
- who uses it;
- how it works conceptually;
- how to use it step by step;
- how to customize or extend it safely;
- configuration and runtime notes;
- code or command examples;
- operations, security, and troubleshooting notes;
- limitations and common mistakes;
- related modules, pages, or next actions.

Documentation should be beginner-friendly enough for a new business user,
developer, or operator to follow without prior Nodics or enterprise-domain
knowledge. Use diagrams, tables, screenshots, and examples when a concept is
harder to understand in prose alone. The first-level Axis documentation
navigation may show Framework, Swaggers, Nodics Axis, and customer project
guides, but physical content ownership remains with the framework, product
backend module, or customer project that owns the subject.

## Documentation Generation and Review Contract

Before creating or changing canonical public documentation:

1. identify the capability, owner, primary reader intent, and applicable
   audiences;
2. search existing canonical content and technical evidence before adding a
   page;
3. collect current implementation, configuration, schema, API, event, test,
   operational, and module-owned evidence;
4. reconcile conflicts using Nodics-owned runtime contracts as the behavior
   authority;
5. document the applicable business, beginner, developer, architecture,
   security, tenancy, performance, observability, operations, failure,
   recovery, customization, and verification concerns;
6. include a recognizable end-to-end example plus rejected, boundary, failure,
   and recovery behavior where the capability changes data, access, money,
   publishing, workflow, external systems, or runtime state;
7. include a declarative process diagram for non-trivial pipelines, workflows,
   lifecycle orchestration, import/export, provider routing, publishing,
   authentication, or runtime startup flows when the visual materially improves
   comprehension;
8. declare and satisfy `visualRequirements` for the topic type, including
   diagrams, tables, screenshots, schema models, screen flows, decision trees,
   command examples, or code examples where they are needed for comprehension;
9. verify that the page anatomy, hierarchy dashboard, renderer contract,
   access state, lifecycle state, related-topic links, and search metadata are
   present in generated records and consumer rendering;
10. explain the smallest supported later-loaded project customization without
   editing Nodics framework source or creating a parallel authority;
11. record evidence, ownership, maturity, limitations, and last verification;
12. update all affected destinations when one implementation change affects
   multiple audiences or contracts;
13. regenerate derived content and run Nodics plus the documentation project validation
    proportionate to the change.

## Customization-First Documentation Rule

The primary adoption outcome of Nodics documentation is that a partner,
developer, or AI tool can understand an implemented capability and customize
it safely without editing framework-owned source. Every capability and
functionality page family must therefore document:

1. what the out-of-the-box capability owns and guarantees;
2. the supported later-loaded project, module, provider, configuration,
   schema, service, facade, controller, pipeline, event, renderer, or data
   extension point, as applicable;
3. the smallest complete customization example with exact files, properties,
   registrations, commands, and expected result;
4. which contract is preserved and which behavior the custom layer may replace
   or compose;
5. prohibited shortcuts, including framework edits, copied loaders, duplicate
   registries, parallel persistence, client-side business authority, and
   bypassed security or validation;
6. positive, rejected, boundary, integration, and regression tests proving the
   customization against the effective layered runtime;
7. upgrade, rollback, troubleshooting, and compatibility implications.

If an implemented capability has no safe extension point, its documentation
must state that limitation explicitly and the capability is not considered
partner-customizable. A high-level sentence saying that Nodics is extensible
does not satisfy this rule.

Every implemented module or application feature must update its granular
canonical structured documentation source in the same change. The generated
CMS page, component, navigation, route, search, and manifest records are
derived release artifacts; they must never become a shorter hand-maintained
documentation authority beside a richer README or the canonical content pack.

A generator must be deterministic and expose a check mode that fails when
committed CMS import data is stale. Migration or retirement requires a register
that maps every reviewed README/docs source to a canonical destination with a
disposition, content hash, substantive headings, and detail evidence.
README/docs content may be reduced only after source coverage, detail
preservation, generated-pack validation, link/media validation, and rendered
frontend review pass. Moving evidence to untracked root `docs/` before this
gate is content loss, not migration.

Every module and project keeps a concise high-level `README.md` after detailed
content moves into the canonical documentation pack. It must summarize purpose,
ownership, implemented capabilities, setup, verification, safe extension
boundaries, and links to the canonical detail. Migration may retire duplicated
retired module documentation after the evidence gates pass, but it must never
leave a module without its local README entry point or create a parallel
module-level documentation tree outside an explicit backend documentation
owner's governed `docs/` source catalogue.

## Project Documentation Content-Pack Contract

Every backend project, frontend project, reusable application, and implemented
functionality must ship documentation proportionate to what it contributes.
Documentation is part of feature acceptance; tests and source code alone do not
make a capability adoptable.

A backend owner that supplies CMS-importable documentation data uses this
stable source and generated-release shape:

```text
project/
  docs/
    catalogue.json
    pages/
  data/
    core-v001/
      headers/
      records/
        documentation/
    manifest.json
```

`docs/catalogue.json` is the authored catalogue authority and `docs/pages/`
contains canonical documentation source. `data/manifest.json` is the aggregate
release authority; its named documentation section describes the immutable
content pack. Do not introduce a parallel documentation manifest or authored
source beneath generated/runtime data. Generated `data/core-v001` is committed,
deterministic, and directly consumable by the existing Nodics content-pack and
`nImport` contracts. The backend owner owns its source-controlled release; CMS
is the runtime projection.

Documentation ownership follows the backend owner of the thing being
documented:

- framework-level Nodics documentation belongs to `nodics.docs`;
- Axis product documentation belongs to the backend `axis` module under
  `nodics.platform`;
- customer/project documentation belongs to the owning customer backend
  project;
- future customer module overlays may contribute their own documentation from
  the owning project module, but they must not rename the standard functional
  module identity they customize.

Project-specific setup, demo business flows, sample data, project modules,
custom API behavior, customer onboarding, and project extension guidance belong
in the owning customer backend project using the same `docs/`,
`data/core-v001/records/documentation`,
`data/core-v001/headers`, and the documentation section in `data/manifest.json`.
Do not
place customer project documentation in `nodics.docs`, the Platform `axis`
module, or the `nodics.axis` frontend repository.

The project must declare one canonical structured documentation source outside
generated record/header files. Authored source stays under the backend owner's
`docs/` tree, while generated records stay under `data/core-v001/records/...` and
`data/core-v001/headers/...`. Content should be split into
independently navigable pages at the level users search, learn, operate,
troubleshoot, customize, and verify a capability. One coarse project overview
or one summary page per module does not satisfy the contract when richer
implemented feature guidance exists.

Frontend startup may discover documentation-pack status and present authorized
Import or Update actions. A frontend must never read sibling files, write CMS
records, connect to the database, or automatically mutate persistent
documentation merely because the browser application started. Nodics backend
configuration owns pack discovery, compatibility, checksum validation,
permissions, startup policy, locking, import history, and import execution.

Each project or reusable application guide must cover, where applicable:

1. project purpose, supported business outcomes, users, and explicit
   limitations;
2. repository ownership and the boundary between framework, project backend,
   frontend presentation, CMS content, and generated artifacts;
3. the technology stack, exact supported version ranges, runtime requirements,
   dependency policy, build toolchain, and upgrade procedure;
4. installation, configuration, environment variables, local start, production
   build, deployment shape, and compatibility matrix;
5. route and page organization, navigation ownership, layouts, templates,
   slots, components, loading/empty/error/recovery states, and responsive or
   mobile-WebView behavior;
6. one-renderer-per-file organization, typed renderer registry, logical
   renderer keys, contract versions, supported channels, deprecation behavior,
   unknown-renderer failure behavior, and focused mirrored tests;
7. how backend CMS page, template, slot, component, type-code, and renderer
   models map to frontend-owned implementations without sending executable
   frontend code from the backend;
8. API and OpenAPI dependencies, authentication, authorization, tenant and
   enterprise context, browser-session security, error-code handling, and
   frontend versus backend validation responsibilities;
9. server-state and presentation-state ownership, caching, localization,
   accessibility, keyboard/touch behavior, performance, security headers, and
   safe rendering constraints;
10. supported project customization and extension paths, including what later
    layers may replace and which framework or backend authorities they must not
    bypass;
11. observability, diagnostics, failure modes, troubleshooting, recovery,
    migration, rollback, and operational ownership;
12. positive, negative, permission, boundary, responsive, contract,
    integration, regression, and production-build verification with exact
    commands and expected results.

For every implemented project functionality, include a dedicated
**Customize and extend safely** section. It must identify the authoritative
owner, show the smallest supported project-owned customization, name the files
that belong in the custom project, state what must not be copied or bypassed,
and provide the tests that protect the extension across framework upgrades.

When one functionality spans repositories, each repository documents only its
owned implementation boundary and links to the canonical end-to-end capability
journey. Do not duplicate business authority in a frontend guide or frontend
implementation detail in a backend module guide.

For a migration or merge, every reviewed source receives a disposition and
destination or an archive/reject reason. Mapped instructional sources must keep
their substantive headings and detailed content. Links are normalized to
canonical routes, and generated CMS blocks are reviewed in addition to authored
structured source.

## Capability Documentation Acceptance Matrix

Every implemented end-to-end capability must address these audiences:

| Audience | Required explanation |
| --- | --- |
| Business evaluator | Problem, business value, supported decisions, limitations, cost/risk impact, and realistic use cases. |
| Business user | Prerequisites, terminology, roles, step-by-step happy path, rejected path, failure, retry, recovery, and expected result. |
| Administrator/operator | Configuration, permissions, secrets, limits, monitoring, alerts, backup/restore, migration, rollback, and troubleshooting. |
| Application developer/partner | Owning repository/module/layer, contracts, APIs, schemas, events, configuration, extension example, prohibited bypasses, and tests. |
| Framework maintainer/AI tool | Authority map, dependency direction, loader path, override boundary, generated impact, invariants, and acceptance proof. |

If an audience or concern is not applicable, the owning documentation must say
why. Silence is not evidence that impact was considered.

Every backend-owned top-level documentation navigation section must contain at
least one authored page before the catalogue is publishable. Empty sections are
not allowed because every section, group, subgroup, and topic must be able to
render a useful dashboard or summary area for business users, developers,
operators, QA owners, and AI tools.

## Use-Case And Example Contract

Documentation must teach with concrete, named scenarios rather than only list
types and methods. Each significant capability needs:

- one smallest successful example;
- one rejected or unauthorized example;
- one boundary or scale example;
- one failure and recovery example;
- one later-loaded project customization example;
- exact files, properties, permissions, commands, requests, and expected
  outcomes where applicable.

Examples must call authoritative APIs and services. They must not normalize
direct database edits, copied framework services, inline secrets, generated
file edits, or parallel loaders as customization techniques.
