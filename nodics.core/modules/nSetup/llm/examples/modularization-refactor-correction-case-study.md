# Modularization Refactor Correction Case Study

This case study captures durable lessons from the Nodics modularization
refactor. It is intentionally written as a standard for future AI tools and
developers, not as a transcript of a chat.

The main lesson is simple:

```text
In Nodics, what to write, where to write it, and how to write it are all part
of the implementation contract.
```

An idea can be correct and still be harmful when it is placed in the wrong
repository, module, folder, data package, contract, or runtime layer.

## Example Corrections And Durable Rules

| Correction pattern | What went wrong | Durable Nodics rule |
| --- | --- | --- |
| Root workspace versus capability owner | A grouping/root folder started to look like runtime or LLM authority. | Root guidance is allowed only at the actual repository root. Functional behavior, data, and module guidance belong in owning modules. Do not create accidental authorities. |
| Tool bridges | A root `CONVENTIONS.md` bridge was added without proving it needed root-level auto-discovery. | Root bridge files are only for tools that conventionally auto-discover them. Optional bridge templates belong under nSetup templates. |
| Backend data ownership | Browser-rendered Axis screens began to blur CMS, documentation, catalog, page, or component record ownership. | Backend-importable records belong in backend modules or backend content packages. Axis owns rendering and interaction, not persisted backend data. |
| Documentation ownership | Framework, Axis, and customer project documentation were mixed. | Framework documentation belongs in `nodics.docs`; Axis-specific backend documentation belongs in the platform Axis backend module; customer project documentation belongs in the owning customer backend project. |
| Module identity versus customer customization | Customer extension modules risked changing the displayed functional module identity. | Customer modules may extend or customize framework implementation, but the functional capability identity remains the standard framework identity unless a genuinely new capability is created. |
| Properties versus status definitions | Stable statuses and reason codes could be placed in properties because both are "values." | Configurable policy goes in layered `config/properties.js`; stable statuses, reason codes, errors, and lifecycle vocabulary go in `src/utils/statusDefinitions.js`. |
| Scope drift | A focused modularization task expanded into unrelated Commerce cleanup. | Do not broaden into unrelated validation or metadata cleanup without explicit approval. Record the blocker and keep the requested slice focused. |
| Validator drift | Governance validation still expected old paths after module restructuring. | When guidance or module paths move, update validators, manifests, generated context, and references together; stale tooling must not silently define architecture. |

## Mandatory What / Where / How Check

Before writing code, data, documentation, or guidance, answer:

1. **What is changing?**
   - capability behavior;
   - runtime topology;
   - module metadata;
   - configurable property;
   - stable status/error definition;
   - backend import data;
   - frontend renderer;
   - public documentation;
   - AI/developer guidance;
   - generated artifact source;
   - test or release gate.

2. **Where does it belong?**
   - `nodics.ai` root only for repository-level human/AI entrypoints;
   - `nodics.core/modules/nSetup/llm/contracts` for permanent AI/developer
     rules;
   - `nodics.core/modules/nSetup/llm/standards` for concrete structure,
     coding, generation, and lifecycle standards;
   - `nodics.core/modules/nSetup/llm/playbooks` for repeatable work
     procedures;
   - `nodics.core/modules/nSetup/llm/examples` for recommended implementation
     examples and case studies;
   - owning framework module for default backend behavior or data;
   - owning customer backend project for customer-specific behavior or
     documentation;
   - frontend repository only for browser rendering, interaction, accessibility,
     static recovery, and client-side state.

3. **How must it be written?**
   - loader-visible source path;
   - mergeable export style;
   - layered property namespace when configurable;
   - status definitions for stable vocabulary;
   - source definition before generated artifact;
   - file-level and function-level documentation;
   - default behavior tests;
   - later-layer override/customization tests;
   - updated README, AGENTS, contracts, examples, generated context, and public
     documentation when behavior or guidance changes.

## Refactor Acceptance Rule

A refactor is not accepted only because files moved or tests start. It is
accepted when the new shape makes future changes easier and safer:

- a new developer can identify the owning module quickly;
- an AI tool can find the correct contract without reading chat history;
- the customization path is explicit;
- root files do not become duplicate authorities;
- validators and manifests agree with the new structure;
- backend data stays backend-owned;
- frontend rendering stays frontend-owned;
- generated artifacts remain generated from source;
- focused validation proves the changed slice;
- known unrelated failures are reported instead of hidden.

## Bad Response Pattern

Avoid this pattern:

```text
The user asked for X. I created a file that seems related.
```

Use this pattern:

```text
The user asked for X. I identified the existing owner Y. The change belongs in
artifact Z because Nodics loads/merges/validates that artifact. I wrote it in
the customization-safe style, updated the discovery contract, and proved the
affected slice. Unrelated gate failures are reported separately.
```

This is the expected standard for Nodics refactoring work.
