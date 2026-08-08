# Nodics Core Agent Contract

- Start from `../AGENTS.md` for repository-wide framework boundaries, then use
  this file for Core-specific behavior.
- Required Reading Order: read root `README.md`, root `AGENTS.md`, this Core
  README/AGENTS pair, every applicable ancestor module README/AGENTS file, the
  nearest owning module README/AGENTS file, relevant `llm/contracts`,
  `llm/examples`, generated context, and
  `modules/nSetup/llm/ai-enablement-index.md` before non-trivial
  implementation.
- Operating Modes And Authority: classify work as explain, discover, plan,
  implement, review, or operate before acting. Role language does not authorize
  edits, runtime/data mutation, publishing, deployment, commits, or risk
  acceptance by itself.
- Pre-Implementation Study Gate: for non-trivial changes, record compact
  evidence of the business outcome, owning module/layer, studied sources,
  current behavior, reuse/extension path, affected contracts, security/tenant/
  data/UX/API/release impact, assumptions, intended files, and validation
  route.
- AI tools must work as a Nodics delivery expert council, not a generic coding
  assistant.
- Design every module for partial discovery. Critical ownership, dependency,
  security, persistence, extension, and testing rules must exist in the nearest
  `AGENTS.md`, README, `llm/contracts`, `llm/examples`, generated context, and
  focused tests. Do not hide a mandatory rule only in a distant guide, prompt,
  temporary plan, or prior conversation.
- Preserve the nearest `AGENTS.md`, README, `llm/contracts`, `llm/examples`, generated
  context route so partial discovery works for both humans and AI tools.
- Significant capability documentation must include successful, rejected,
  boundary/scale, failure/recovery, and later-layer customization use cases for
  business evaluators, business users, administrators/operators, partner
  developers, framework maintainers, and AI tools.
- Treat pre-existing sibling legacy repositories as outside this product's
  source, runtime, documentation, BackOffice, and compatibility authority.
- Treat `nodics.ai` as the backend/framework repository root. Do not make
  runtime code depend on a customer's project being parallel to that checkout.
- Runtime modules in this repository provide reusable framework behavior to
  product runtimes; product business behavior remains outside Core.
- Non-runtime packages may live under `modules` when Core is their authoritative
  distribution point, but they must be excluded from runtime discovery and
  activation through package metadata.
- Keep frontend code, documentation content, and customer code outside Core.
- Apply `modules/nSetup/llm/contracts/module-group-participation-contract.md`,
  `modules/nSetup/llm/contracts/module-structure-contract.md`, and
  `modules/nSetup/llm/standards/nodics-structure-matrix.md` before changing
  repository boundaries, module skeletons, customer dependency resolution,
  clean/build behavior, or documentation ownership.
- Use `modules/nSetup/llm/records/phase0/` only as historical modularization
  traceability, not as the permanent coding contract.

### New Module Acceptance Gate

- Creating or materially reshaping a module is never a freehand file-copy task.
- Run `npm run structure:audit -- --fail` before adding behavior.
- Run `npm run module:metadata`; if it rewrites a change, fix the owning
  normalizer or source rule instead of fighting generated output.
- Nodics must guide new developers into the correct module shape through
  module standards, generated metadata, examples, and focused validation.

- Add one bootstrap seam at a time with positive, negative, lifecycle,
  configuration-precedence, failure, shutdown, and compatibility tests.
- Do not create a parallel authority when a migrated Nodics contract already
  owns configuration, module discovery, security, lifecycle, or observability.
