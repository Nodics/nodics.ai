# Documentation-content contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

## Module Work Rules

- This repository contains content and release validation only; it is not a runtime or frontend.
- Every document must declare one canonical functional-module owner.
- Technical-module identity is optional detail and never replaces functional ownership.
- Document IDs are stable, globally unique, and must not encode filesystem paths.
- Platform consumes immutable releases; Axis never imports files from this repository directly.
- Backend-importable framework documentation CMS data belongs here, not in
  frontend repositories.
- Author canonical framework documentation under `docs/`; generated CMS
  records remain under the governed `data/core` release tree.
- Axis product documentation belongs to `nodics.platform/modules/axis`.
- `nodics.axis` owns executable documentation renderers only; it must not own
  CMS catalog, Site, page, component, route, or documentation content-pack data.
- Do not refer to legacy source paths, repositories, or runtime assumptions.
- Each independently navigable capability topic needs a dedicated
  **Customize and extend safely** section with project-owned files, a worked
  example, preserved guarantees, rejection/recovery behavior, and tests.
  Explicitly explain non-customizable guarantees rather than inventing an
  extension point. Follow the canonical documentation impact contract.
- Use source-backed diagrams or screen flows for multi-step topics. Screenshots
  must show real, sanitized UI with capture context; they are not mandatory when
  a durable screen flow serves the reader better.
- Report authored, generated/validated, visually reviewed, and published states
  separately. Pack validation is not proof of complete detail across all pages.

Source coverage defaults to metadata-declared module roots within this framework
checkout. It never auto-selects sibling customer/frontend repositories. To audit
another owner, pass explicit `--source-root`, `--catalogue` and `--output-dir`;
its report belongs to that owner and cannot overwrite Framework artifacts.
See the source-backed documentation coverage guide for invocation and boundaries.
`test/sourceCoverageScope.test.mjs` proves sibling independence and output isolation.
