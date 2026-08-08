# Module Group Participation Contract

This contract defines the difference between a workspace, a runtime Nodics
module group, a structural Nodics module group, and a concrete runtime module.
The distinction is metadata-driven and applies equally to framework, product,
partner, and customer repositories.

## Workspace Boundary

A workspace is an arbitrary filesystem or IDE container chosen by a developer
or customer. A workspace name such as `nodics.ai`, `workspace`, or `customer`
has no Nodics meaning.

A workspace:

- is not a Nodics module or module group;
- is not required to be a Git repository or package;
- must not own runtime configuration, lifecycle hooks, module indexes, service
  overrides, or BackOffice registration;
- may contain any combination of independently cloned Nodics repositories and
  customer projects;
- may be renamed without changing application behavior.

Runtime code and published repository contracts must never depend on a
workspace directory name.

## Standard Module-Group Shape

Every Nodics module group uses the standard module-shaped boundary:

```text
group/
  package.json
  nodics.js
  README.md
  AGENTS.md
  config/
    properties.js
    prescripts.js
    postscripts.js
  children/
```

Using the same shape does not mean every group participates in runtime. Runtime
participation is declared explicitly in `package.json.nodics`.

## Runtime Module Groups

A runtime group contributes functional availability and may participate in
module activation, configuration layering, lifecycle execution, service merge
order, runtime reporting, and BackOffice registration.

```json
{
  "nodics": {
    "kind": "group",
    "runtimeModule": true,
    "loadableByNodicsModuleLoader": true
  }
}
```

Independently versioned product groups such as `nodics.core` and
`nodics.platform` are runtime groups. A runtime group's `extends` metadata
declares functional availability; numeric module indexes independently control
load and service-merge order.

## Structural Non-Runtime Module Groups

A structural group standardizes organization and tooling without becoming part
of the running application. Customer project `modules/` and `envs/` containers
are structural groups.

```json
{
  "nodics": {
    "kind": "group",
    "runtimeModule": false,
    "loadableByNodicsModuleLoader": false
  }
}
```

The module loader must traverse a structural group to discover eligible child
modules, but it must not register or activate the structural group itself.
Consequently, a structural group:

- must not appear in `activeModules.groups` or `activeModules.modules`;
- must not appear in effective runtime load order;
- must not contribute configuration, pre-scripts, post-scripts, services, or
  other runtime artifacts;
- must not become a parent dependency solely because it contains a child;
- must not be recorded as an active or available runtime module in BackOffice;
- may be inspected by non-runtime tooling for structure, ownership, generation,
  documentation, and governance.

Its child modules retain their own identities and metadata. Servers activate
the required child modules explicitly unless a separate, intentional runtime
group owns their functional activation.

## Customer Project Topology

```text
project/
  package.json                 # project/application module
  modules/                     # structural non-runtime group
    projectCore/               # runtime capability module
    projectApi/                # runtime capability module
    projectInt/                # runtime capability module
  envs/                        # structural non-runtime group
    local/                     # runtime environment module
      platformServer/          # runtime server module
```

The selected runtime hierarchy begins at the concrete environment module, not
at the structural `envs` container. Runtime load order may include the project,
concrete environment, server, and explicitly activated project modules. It must
not include the structural `modules` or `envs` groups.

## Validation Requirements

Changes to discovery, topology, generation, registration, or module metadata
must prove that:

1. runtime groups remain discoverable and activatable;
2. structural groups remain undiscoverable as runtime modules;
3. eligible children below structural groups remain discoverable;
4. structural configuration and lifecycle files are never loaded;
5. workspace names do not affect discovery or startup;
6. active-module and BackOffice catalogues exclude structural groups.

Do not introduce a second folder convention to express the same distinction.
Use the standard Nodics group shape and canonical runtime-participation metadata.
