# Module Structure Contract

Every Nodics module and submodule should be easy for humans and AI agents to
discover, understand, customize, and validate.

Standard structure:

```text
module/
  AGENTS.md
  README.md
  package.json
  config/
  data/       # optional for concrete modules that own init/core/sample import data
  llm/
    README.md
    contracts/
    examples/
    generated/
  src/
  test/
```

`README.md` is the single module-level human entrypoint. `AGENTS.md` is the
AI/developer behavior contract. Detailed permanent human documentation belongs
to the canonical documentation content pack; `llm/` contains nearby
AI-specific guidance, examples, contracts, and generated context.

Module packages must not create a parallel `docs/` directory. The root `docs/`
workspace remains temporary, untracked, non-runtime planning and archive space.
Raw module discovery must continue to skip folders named `docs` so copied
historical material can never become a runtime module source.

`data/` is optional and must be owned by the concrete module whose records are
being imported. Supported module-owned system data directories are `data/init`
for startup/bootstrap data, `data/core` for core/reference imports, and
`data/sample` for demo/sample imports. Do not create empty `data/` folders on
project roots or pure group modules.

Every non-empty published system-data root must contain exactly one aggregate
`data/manifest.json` following `data-manifest-contract.md`. Init, core, sample,
content-pack, and governed source contributions are separate versioned sections
inside that file. Do not create a root `manifest/` directory or per-type
`data/<type>/manifest.json` files.

Canonical source files used to generate importable data must stay inside the
same data ownership tree, for example `data/core/source/...`, while generated
records remain under the matching `data/core/data/...` and
`data/core/headers/...` paths. Do not add module-root source folders such as
`content/` for import-pack authoring unless a documented loader/generator
contract explicitly introduces that folder as a new standard.

`llm/contracts/` and `llm/examples/` are maintained source folders, not
generated output. AI tools and developers must update them when functionality
changes the module contract or recommended customization pattern.

Aggregator modules and their child modules follow the same convention. For
example, `nCache`, `nCache/cache`, `nCache/redisCache`, `nCache/nodeCache`, and
`nCache/hazelcastCache` are independent module boundaries and must link their
guidance through the hierarchy.

Customer/project modules follow the same shape. Customer customization must be
implemented in project modules and layered overrides, not by editing Nodics
framework modules.

Module shape and runtime participation are separate decisions. Runtime product
groups and structural customer `modules/` or `envs/` groups use the same
standard files but different runtime metadata. Follow
`module-group-participation-contract.md`; never infer runtime participation
from a directory name or from the presence of `package.json` and `nodics.js`.

## Loader-Radar Contract

Runtime artifacts must live where the Nodics loader can discover and merge them:

- services: `src/service/**/*Service.js`
- controllers: `src/controller/**/*Controller.js`
- facades: `src/facade/**/*Facade.js`
- route registries: `src/router/routers.js`
- pipeline definitions: `src/pipelines/pipelines.js`
- utility registries: `src/utils/utils.js`, `src/utils/enums.js`, and
  `src/utils/statusDefinitions.js`

Module generation may create `src/service/defaultSampleService.js` as an empty
starter placeholder containing only lifecycle hooks. It is not a required
runtime service and structure validation must not require it after concrete
services are introduced. Do not add business behavior to the sample placeholder.

Every generated module that has `src/utils/` must include `utils.js`,
`enums.js`, and `statusDefinitions.js`. These files are required even when they
start empty, because they tell developers and AI tools where general helpers,
enum definitions, and status/error contracts belong.

These files must export mergeable objects, normally
`module.exports = { methodName: function (...) {} }`, so later-loaded modules can
override one method without copying the full framework implementation. A file
that does not match the loader path and suffix is not a runtime extension point.
Move helper code to a non-loader directory, rename runtime artifacts to match
the loader, or document generator templates with `@layer template` and
`@sourceTemplate`.

Tooling adapters, context generators, debug launchers, and quality checks live
under `src/service` as well, using explicit subfolders such as
`src/service/command`, `src/service/context`, `src/service/debug`, and
`src/service/quality`. They must use `*Service.js` filenames and
`module.exports = { methodName: function (...) {} }` style exports so developers
and AI tools do not invent parallel source structures.

## Configuration Ownership Contract

Every module uses `config/properties.js` as the standard home for configurable
values, policy defaults, command declarations, discovery settings, and
governance gate data. Specialized configuration should be represented as
namespaced property subtrees such as `tooling.commands`,
`tooling.discovery`, or `tooling.documentationGovernance`.

Do not add sibling config files like `config/tooling.js` or
`config/documentation-governance.json` merely to avoid touching
`properties.js`. A new config artifact is valid only when it has a distinct
loader/generator contract that cannot be expressed as properties, and that
exception must be documented in the owning module README and tests.

Project topology modules under `envs/` may resolve local environment values,
secret references, ports, database names, active module lists, and shared
topology helper imports inside `config/properties.js`, because those files are
the runnable environment/server/node composition boundary.
This exception does not apply to framework or business capability modules. Reusable behavior and
large default payloads still belong in module-owned source utilities or
services.

New project, environment, server, and node modules must follow
`modules/nSetup/llm/standards/module-generation-guide.md`. Generation must be driven by module
metadata, active-module registration, layered configuration, source
definitions, tests, documentation, and regenerated artifacts. Do not copy
`nCommon/templates`; active scaffolding comes from maintained module-generation
contracts.
