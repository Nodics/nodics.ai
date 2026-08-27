# Axis Implementation And Documentation Contract

Axis is a reusable frontend framework application, not a one-off admin screen.
Partners, developers, and AI tools must be able to extend it without seeing the
entire repository or moving backend authority into the browser.

For beginners, this contract is the first safety rail before changing Axis. It
explains how to decide whether a requirement belongs in the browser, backend,
CMS content, generated data, or customer project layer. Business users should
receive clear journeys and safe operations; developers should receive source
ownership, extension points, and tests; operators should receive configuration,
availability, recovery, and verification evidence.

## Local Discovery Chain

For every feature, read:

1. root `AGENTS.md`;
2. this contract and the feature-delivery checklist;
3. the nearest feature source and focused tests;
4. the consuming Nodics API/OpenAPI/CMS contract;
5. the feature guide linked from the root README.

Critical rules must be repeated concisely near the implementation and protected
by TypeScript, schema validation, linting, or focused tests. A conversation or
temporary plan is never an implementation authority.

## Repository Ownership

Axis owns:

- rendering, interaction, responsive/WebView behavior, and accessibility;
- typed client contract consumption;
- browser routing and presentation state;
- TanStack Query server-state coordination;
- Axis-owned CMS renderer implementations and typed registries;
- loading, empty, unauthorized, incompatible, failure, and recovery views.

Nodics owns:

- business rules and authoritative validation;
- authentication and authorization enforcement;
- persistence, workflows, pipelines, events, jobs, and integrations;
- secrets, tenant governance, AI execution, tool execution, and audit;
- backend schemas, APIs, configuration, runtime contracts, and business docs.

When both repositories change, analyze and test each boundary separately.

## AI and developer role stack

Axis work must be reviewed through several roles before a change is accepted:

| Role | Axis responsibility |
| --- | --- |
| Business analyst | Confirm the operator journey, dashboard usefulness, form flow, and error/recovery wording from the user’s perspective. |
| Enterprise architect | Protect the browser/backend boundary, runtime module discovery, tenant context, security, and release topology. |
| Nodics framework expert | Know which contract is owned by Platform, Profile, BackOffice, WCMS, Media, Cron, documentation packs, or a customer project. |
| Domain expert | Avoid hardcoding one industry workflow when the component should work for commerce, content, workflow, media, logistics, telco, or another domain. |
| Principal frontend engineer | Write typed, accessible, responsive React code with clear renderer registration and customization seams. |
| Quality analyst and tester | Verify refresh behavior, deep links, unavailable modules, unauthorized operations, long labels, empty data, and regression paths. |
| TechOps/DevOps reviewer | Keep public configuration safe, smoke tests runnable, local setup repeatable, and operational troubleshooting visible. |

The practical rule is simple: Axis may make a capability usable, but it must
not make itself the authority for that capability. If a frontend shortcut would
invent backend state, duplicate module discovery, bypass permission checks, or
store generated CMS data, the change belongs somewhere else.

## Placement Rules

- Application composition belongs under `src/app`.
- Feature interaction belongs in a named feature boundary, not a generic
  utilities folder.
- CMS page, template, and component renderers follow the paths defined in
  `AGENTS.md`, with one renderer implementation per file.
- Backend logical keys map through typed registries. CMS data never supplies
  executable JavaScript.
- Configurable page copy comes from CMS component properties. Page and
  component renderers consume typed labels, headings, placeholders, help text,
  empty-state text, action captions, and fragments rather than defining
  business-facing copy in JSX.
- Reusable interaction behavior is implemented once and composed everywhere.
  Query builders, media selectors, relationship selectors, record browsers,
  and similar repeated controls must be modeled as reusable CMS component
  contracts and Axis-owned shared renderers or primitives. Do not fork a
  page-local implementation when a generic component already exists. Schema
  data querying uses the `axis.component.schema-query-builder` renderer key,
  so Schema Workbench, Imports and Exports, and future schema-backed pages
  share one governed query-building experience.
- Error ownership remains layered: the owning backend module supplies stable
  domain codes and safe messages, CMS supplies configurable presentation copy,
  and Axis supplies only generic browser or transport fallbacks needed when
  the backend is unavailable. Axis never interprets English error text.
- Locale, channel, and backend-resolved fallback are part of the CMS delivery
  contract. Axis preserves that context, supports translated text expansion
  and text direction, and uses locale-aware formatting without creating a
  parallel backend translation catalogue.
- Runtime values come from validated Axis configuration and backend contracts.
  They do not belong in scattered constants or `package.json`.
- Raw identifiers remain separate from display labels. Humanization is a
  presentation fallback after contract validation, never a transformation of
  request, authorization, cache, storage, audit, or telemetry identity. A
  backend-provided localized display name always takes precedence.
- Secrets never belong in frontend source, `.env`, generated browser config,
  storage, URLs, telemetry, or logs.

## Required Feature Documentation

Every significant feature guide explains:

- purpose and current implemented scope;
- backend authority and contract version;
- source/component/client/test map;
- setup and runtime configuration;
- permissions and security;
- keyboard, screen reader, responsive, touch, reduced-motion, and WebView
  behavior;
- success, unauthorized/invalid, boundary/responsive, failure/recovery, and
  supported customization examples;
- troubleshooting and verification;
- known limitations and safe fallback.

Business workflows and backend customization belong in Nodics documentation.
Axis guides link to them and focus on frontend setup and contribution.

## Customize and extend safely

Every feature guide includes this section. It
shows the smallest supported project-owned Axis customization, identifies the
backend contract and security boundary that remain authoritative, lists
prohibited frontend shortcuts or parallel authorities, and names the focused
positive, rejected, boundary, integration, and regression tests. Explaining
only the out-of-the-box screen or workflow is incomplete.

## Canonical Source and Generated Data

Axis documentation that becomes backend CMS records is authored as granular,
reviewable pages in `nodics.platform/modules/axis` under
`docs`. The deterministic documentation generator creates CMS
page, component, navigation, route, search, and immutable manifest data under
`data/core` and the documentation section in `data/manifest.json` in the same module.

The generator is executable repository tooling and lives beside the authored
content at `scripts/generate-documentation-content.mjs`.
It must not be placed under `config`, because configuration files remain
declarative values only.

Do not hand-edit generated CMS article records. Do not maintain a shorter
generated summary beside a richer project guide. Every implemented feature
must update its canonical source page and regenerate the content pack in the
same change:

```bash
npm run docs:generate
npm run docs:check
```

The migration register records the original README/docs evidence, canonical
source, destination route, source hash, headings, word count, and disposition.
README or legacy docs may be reduced only after all substantive guidance is
mapped, generated, reviewed in Axis, and protected by content-preservation
tests.

Every project and module retains a concise high-level `README.md` after detailed
guidance migrates. It remains the repository entry point for purpose, ownership,
implemented capabilities, setup, verification, extension boundaries, and links
to canonical pages. It must not become a second copy of the complete
operational and developer guides. Legacy detailed `docs/` files may be retired
only after the migration register records their hashes, word counts, headings,
canonical destinations, and the generated and rendered verification gates pass.
After retirement, do not recreate a parallel `docs/` directory. The frontend
project keeps one concise `README.md`; backend-importable detailed permanent
guidance belongs only under `nodics.platform/modules/axis/docs`
and its generated `data/core` projection.

## Required Examples

### Successful

An authorized employee loads a backend descriptor, Axis validates it, maps its
renderer key to an Axis-owned component, and displays the result.

### Unauthorized

The backend denies an operation. Axis presents an accessible unauthorized state
and does not infer authorization from menu visibility.

### Boundary

The same feature remains usable with keyboard and touch in desktop, tablet, and
mobile WebView layouts, including long labels, empty data, and bounded payloads.

### Failure And Recovery

When BackOffice or a target module is unavailable, Axis presents a safe
recovery state, avoids stale privileged data, and retries through the same
authoritative contract.

### Customization

A partner adds an Axis-owned renderer and registry manifest for a backend
logical component key. The partner does not download code from CMS or add
business validation to the renderer.

An administrator changes a component label or locale-specific content in the
authoritative CMS catalog. The same allowlisted Axis renderer displays the
resolved value without a frontend rebuild. Missing or malformed required
properties produce the renderer's safe generic fallback and never execute
backend-supplied markup or code.

A validated fallback identifier such as `axisContentCatalog` may be displayed
as `Axis Content Catalog`. The raw code remains unchanged wherever identity or
backend communication is involved.

## Acceptance

A feature is complete only when:

- repository ownership is explicit;
- the backend contract and security boundary are preserved;
- strict TypeScript and validation cover external data;
- accessibility and responsive states are implemented;
- focused positive, negative, boundary, failure, integration, and regression
  tests pass;
- implemented documentation and known limitations are current;
- `npm run verify` passes at the release-oriented gate.

## Continue

- [Feature Delivery Checklist](feature-delivery-checklist.md)
- [Architecture And Ownership](architecture-and-ownership.md)
- [CMS Delivery And Renderers](cms-delivery-and-renderers.md)
- [Axis README](../README.md)

## Common mistakes

- Treating documentation as a final polish task. In Nodics, documentation is
  part of the contract because Axis, BackOffice, generated content packs, and
  future AI tools depend on clear ownership instructions.
- Writing code without first deciding whether the behavior belongs to
  framework source, a backend module, the Axis frontend, or a customer project.
- Moving generated data by hand instead of changing canonical source and
  running the generator.
- Introducing a second source of truth for route labels, registry lifecycle,
  documentation products, API categories, or module health.
- Using example project names in reusable contracts where the same rule must
  work for any customer project.

## Verification

Contract changes are accepted when the source file, generated artifact,
validator, runtime behavior, and user-facing documentation all tell the same
story. Run the focused package test first, then the wider Platform, Axis, docs,
LLM, and fresh-bootstrap checks that match the changed ownership surface.
