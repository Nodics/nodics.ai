# Nodics Core Agent Contract

- Start from `../AGENTS.md` for repository-wide framework boundaries, then use
  this file for Core-specific behavior.
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
- Apply `../llm/contracts/modularization-phase0-contract.md` before changing
  repository boundaries, module skeletons, customer dependency resolution,
  clean/build behavior, or documentation ownership.
- Add one bootstrap seam at a time with positive, negative, lifecycle,
  configuration-precedence, failure, shutdown, and compatibility tests.
- Do not create a parallel authority when a migrated Nodics contract already
  owns configuration, module discovery, security, lifecycle, or observability.
