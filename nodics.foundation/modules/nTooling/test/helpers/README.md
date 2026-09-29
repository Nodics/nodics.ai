# Isolated Project Contracts

Use `environmentFixture.cjs` for disposable deployment metadata and layered
properties. Owner tests must work without a customer checkout or fixed sibling
layout. Supply explicit project, environment and server coordinates.

`projectRuntimePreparation.cjs` delegates to the existing nTooling configuration
probe and nRouter exposure consumer. It discovers and validates configuration;
it does not call `prepareStart`, run pre-scripts, create runtime logs, start
providers or open listeners. Run it in an isolated test process because nConfig
creates global registries. The caller selects expected exposure categories and
asserts customer composition; the helper owns generic selection and non-runtime
module exclusions. Missing servers, invalid coordinates and disabled exposure
are failures. No additional scenario registry or topology authority is involved.

Focused preparation and lifecycle contracts:

```sh
node --test nodics.foundation/modules/nTooling/test/projectRuntimePreparationContract.test.js nodics.foundation/modules/nTooling/test/projectTopologyLifecycleContract.test.mjs nodics.foundation/modules/nTooling/test/projectContainerContracts.test.mjs
```

Container contracts use independent renamed profiles and offline archive files
to check selection, checksum failure, missing archives and unconfirmed restore
denial. They never execute Docker. Topology contracts check dependency order,
PID ownership and empty-topology preflight without probing deployment ports.
These checks are isolated contract evidence, not live deployment acceptance.

`generatedRuntime.cjs` runs the real nConfig utility/entity loader, nDatabase
schema materializer and nService generator in an isolated child and disposable
project. Owner suites supply module roots, selections, schemas and expected
entity names. Generated get/save methods are loaded from the canonical selected
server path, never a legacy framework `src/service/gen` directory. The child
rejects network connections/listeners; it never runs post-init providers or
persists records. Success and failure both remove only their temporary project.
Loyalty and Waste own their schema inventories and service-only exceptions;
the driver has no customer identities or domain defaults. Configuration-only
customer tests still qualify actual environment/module/database/port choices.

Topology smoke consumes `assertTopologyReadiness` with explicit runtime codes.
It observes an already-owned supervisor and its non-exited children, validates
dependency order, and probes nSystem `data.status: UP` plus supplemental checks.
It never launches, adopts or stops processes. Transport failures, malformed
responses and `success: true` alone are not readiness. Live smoke requires an
operator-started topology and is separate from offline lifecycle contracts.
