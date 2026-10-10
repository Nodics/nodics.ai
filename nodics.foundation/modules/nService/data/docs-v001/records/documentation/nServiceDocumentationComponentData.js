/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentfoundationServiceRuntimeOverrides",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.service-runtime-overrides",
      "title": "Service Runtime and Override Precedence",
      "route": "/docs/framework/foundation-service-runtime-overrides",
      "section": "pipeline-and-business-logic-orchestration",
      "sectionTitle": "Pipeline and Business Logic Orchestration",
      "group": "pipeline-and-business-logic-orchestration",
      "groupTitle": "Pipeline and Business Logic Orchestration",
      "parentId": "pipeline-and-business-logic-orchestration",
      "hierarchyPath": [
        "Pipeline and Business Logic Orchestration",
        "Service Runtime and Override Precedence"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "How generated services, virtual services, module graph resolution, customer overrides, fallback behavior, and extension safety work.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "framework.module-loading-service-precedence",
        "framework.backend-extension-patterns",
        "runtime.governed-change",
        "foundation.module-to-module-communication",
        "routing.api-request-lifecycle"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "vService/package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "nService",
        "vService",
        "override",
        "service-runtime",
        "module-graph"
      ],
      "topicKeywords": [
        "Pipeline and Business Logic Orchestration",
        "Service Runtime and Overrides",
        "Service Runtime and Override Precedence"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "foundationServiceRuntimeOverrides-1-source-map",
          "level": 2
        },
        {
          "text": "Resolution flow",
          "anchor": "foundationServiceRuntimeOverrides-2-resolution-flow",
          "level": 2
        },
        {
          "text": "Precedence contract",
          "anchor": "foundationServiceRuntimeOverrides-3-precedence-contract",
          "level": 2
        },
        {
          "text": "Operational evidence",
          "anchor": "foundationServiceRuntimeOverrides-4-operational-evidence",
          "level": 2
        },
        {
          "text": "Related developer guides",
          "anchor": "foundationServiceRuntimeOverrides-5-related-developer-guides",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "foundationServiceRuntimeOverrides-6-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "foundationServiceRuntimeOverrides-7-implementation-handoff",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationServiceRuntimeOverrides-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationServiceRuntimeOverrides-9-verification",
          "level": 2
        },
        {
          "text": "Separate runtimes and Profile bootstrap",
          "anchor": "foundationServiceRuntimeOverrides-10-separate-runtimes-and-profile-bootstrap",
          "level": 2
        },
        {
          "text": "Repeatable isolated runtime acceptance",
          "anchor": "foundationServiceRuntimeOverrides-11-repeatable-isolated-runtime-acceptance",
          "level": 3
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics services implement behavior behind schemas, routers, pipelines and business operations. The selected runtime builds one effective service object per filename-derived identity: generated baseline members first, then authored contributions in active module index order. A later contribution replaces matching methods while retaining other inherited members. This is load-time composition, not a request-time customer-to-core exception fallback. For beginners, follow the base-and-overlay file example and compare the effective describe and inherited validate methods after preparation. Confirm that the later module is active and has the intended index before diagnosing a missing override. Inspect member-origin evidence and test retained behavior; do not introduce a second service identity or catch-and-fallback path to imitate inheritance."
        },
        {
          "kind": "paragraph",
          "text": "Use this page to understand which service implementation wins. Use `Module-to-Module Communication` when a service needs to call another module through `DefaultModuleService`, especially when the target may be local in one runtime and remote in another."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationServiceRuntimeOverrides-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Service module",
              "`package.json`"
            ],
            [
              "Virtual service module",
              "`vService/package.json`"
            ],
            [
              "Runtime configuration docs",
              "Canonical guide `configuration.runtime-behavior-management`"
            ],
            [
              "Extension patterns",
              "Canonical guide `framework.backend-extension-patterns`"
            ],
            [
              "Developer customization",
              "Canonical guide `framework.customization-guide`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Resolution flow",
          "anchor": "foundationServiceRuntimeOverrides-2-resolution-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Build[\"Selected-server generated common/schema artifacts\"] --> Baseline[\"Load generated Services, Facades, Controllers\"]\n  Baseline --> Indexed[\"Load authored active modules in index order\"]\n  Indexed --> Merge[\"Merge matching identity members\"]\n  Merge --> Hooks[\"Effective init and postInit hooks\"]\n  Hooks --> Invoke[\"Request invokes effective method\"]"
        },
        {
          "kind": "paragraph",
          "text": "DefaultInfraService builds service/facade/controller artifacts from layered common definitions and effective schemas. DefaultFrameworkInitializerService.loadModules validates required selected-server build output on start, loads generated artifacts first, then each indexed module. Each module's nodics.js init precedes its services, pipelines, facades and controllers. Rebuild the selected server after source/schema changes; generated output is not a new authored owner. Missing required generated output rejects startup."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Precedence contract",
          "anchor": "foundationServiceRuntimeOverrides-3-precedence-contract"
        },
        {
          "kind": "paragraph",
          "text": "Reproducible illustration: put the following baseline in an earlier active example module at src/service/defaultGuideExampleService.js, and the second file at the identical relative path in a later-indexed active example module. These are actual JavaScript service exports, not code/overrides registration metadata. They introduce no production service in this documentation task."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  init: function () { return Promise.resolve(true); },\n  postInit: function () { return Promise.resolve(true); },\n  describe: function (request) { return { code: request.code, label: 'base' }; },\n  validate: function (request) { return typeof request.code === 'string' && request.code.length > 0; }\n};"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  describe: function (request) { return { code: request.code, label: 'project' }; }\n};"
        },
        {
          "kind": "paragraph",
          "text": "After composition, DefaultGuideExampleService.describe({code:'example'}) returns {code:'example',label:'project'}, while validate, init and postInit remain inherited. Removing the later active layer and rebuilding/restarting restores label:'base'. A thrown project method error propagates; the loader does not call the previous describe automatically. Preserve authorization, signatures, awaited completion, errors and side effects when overriding a real owner method."
        },
        {
          "kind": "paragraph",
          "text": "initEntities runs the service group, then facades, then controllers; hooks within each group use Promise.all, so services must not depend on another service's iteration order. Finalization similarly executes effective postInit hooks by group. Overriding init/postInit replaces that hook; inherited implementation is not automatically called as a super method."
        },
        {
          "kind": "paragraph",
          "text": "vService is version-aware generated-schema operation behavior, not a mock provider or a remote service resolver. DefaultModelsGetInitializerService keeps HISTORY/omitted mode on getItems; CURRENT requires a versioned model with getCurrentVersionItems. An explicit nonnegative safe-integer versionId selects exact getItems; malformed versions or missing capability reject. Current authoring history is not publication activation. nDynamo schema activation builds models and generated common-derived service/facade/router artifacts through its own pipeline; it is distinct from startup overlays and requires its own governance/qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "foundationServiceRuntimeOverrides-4-operational-evidence"
        },
        {
          "kind": "table",
          "headers": [
            "Question",
            "Concrete evidence"
          ],
          "rows": [
            [
              "Why does describe return project?",
              "Active module index, selected generated directory, SERVICE.DefaultGuideExampleService.xNodics.overrideTrace and memberOrigins.describe.sourceModule."
            ],
            [
              "Which members are inherited?",
              "memberOrigins.validate/init/postInit remain earlier contributors; firstSourceModule is historical origin, not capability ownership."
            ],
            [
              "Is the effective method compatible?",
              "Actual default and later-layer contract tests, lifecycle completion and failure behavior; trace metadata is not a safety verdict."
            ],
            [
              "How is it reverted?",
              "Governed source/module-selection rollback plus selected-server rebuild/restart and requalification; no per-request fallback."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Related developer guides",
          "anchor": "foundationServiceRuntimeOverrides-5-related-developer-guides"
        },
        {
          "kind": "table",
          "headers": [
            "Topic",
            "When to use it"
          ],
          "rows": [
            [
              "`Module-to-Module Communication`",
              "Build local, remote, runtime-registry, or external HTTP calls safely."
            ],
            [
              "`API Request Lifecycle and Handler Pipeline`",
              "Understand how incoming HTTP requests reach service-backed controllers."
            ],
            [
              "`Module Loading and Service Precedence`",
              "Prove why a project override or framework default was selected."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "foundationServiceRuntimeOverrides-6-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Use the narrowest owning service seam in a later active module and the same filename-derived identity. Do not edit generated files, copy an owner into a customer module or assume directory names alone determine precedence. Compare the base-only and base-plus-overlay runtime results, retained methods, replaced hooks and a throwing override. A new service name does not override the old identity. Keep module-to-module local/remote dispatch with DefaultModuleService; that transport selection is independent of service-member inheritance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "foundationServiceRuntimeOverrides-7-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "A service customization is ready only when the developer can identify the default service, the overriding module, the active runtime graph, the contract version, and the rollback path. Business users should see the changed behavior as a normal capability journey. Operators should see selected implementation metadata in production logs or diagnostics. QA should run both default and override paths so future upgrades do not silently change precedence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationServiceRuntimeOverrides-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Changing a default service when a customer override is enough.",
            "Creating a new service name when an override contract already exists.",
            "Hiding selected implementation details from operators.",
            "Putting business decisions inside import data files.",
            "Confusing vService version-aware generated behavior with mock providers or remote dispatch."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationServiceRuntimeOverrides-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "For the illustration, independently qualify baseline label:'base', overlay label:'project', retained validate, effective hook counts, member origins and propagated override failure. Rebuild/restart both selected compositions, preserving unrelated servers. Qualify real vService HISTORY/CURRENT/exact-version reads separately; they are not fallback stubs. Existing remote-runtime qualification and Profile bootstrap boundaries below remain separate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Separate runtimes and Profile bootstrap",
          "anchor": "foundationServiceRuntimeOverrides-10-separate-runtimes-and-profile-bootstrap"
        },
        {
          "kind": "paragraph",
          "text": "A deployed service has two different module lists: the modules it loads locally, and protected remote capabilities it needs to call. Keep local activation in `activeModules`. Add only remote API needs to the existing identity request:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "runtimeIdentity: {\n    instanceCode: 'inventory-replica-1',\n    remoteModules: ['profile']\n}"
        },
        {
          "kind": "paragraph",
          "text": "This requests access; it does not approve access or load Profile. The operator provisions a distinct Profile service principal and retained API-key proof for each instance, then records a direct `RUNTIME_DEPLOYMENT` assignment with the exact project, environment, server, instance, permitted modules and permissions. First start, restart and renewal authenticate that proof against the same owner. An endpoint declaration cannot replace the assignment. A missing remote grant must reject issuance, and an unrelated enterprise or tenant must reject lookup."
        },
        {
          "kind": "paragraph",
          "text": "For remote startup, include `profile` in permitted module scope and `profile.enterprise.search` in approved permissions. The existing `GET /enterprise/get` returns only the authenticated runtime's enterprise code, active state, and tenant code/state/properties. Profile performs the privileged record lookup after checking the runtime context. Tokens retain no broad user groups and do not acquire generic schema CRUD rights. Tenant properties are protected configuration shared only with the authorized runtime."
        },
        {
          "kind": "paragraph",
          "text": "Authority and consumers must use the same distributed authentication namespace. Set `authSecurity.securityStamp.cacheModuleName` to the active Foundation `auth` module when Profile is remote, and configure `cache.auth.channels.auth` with an enabled distributed engine and `fallback: false`. Both principal stamps and revocation markers use that namespace. Keep `profileModuleName` unchanged: it identifies the identity authority, not the local cache client."
        },
        {
          "kind": "paragraph",
          "text": "Configure the listening endpoint and abstract endpoint independently. The latter is the address callers use. A CMS-only Online runtime should declare its Online role and enable `data.dataReleases.destinationEnforced`; it must not install Process or Cron contributions merely because their owning source package is available. Missing required installers remain errors on their intended target."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Repeatable isolated runtime acceptance",
          "anchor": "foundationServiceRuntimeOverrides-11-repeatable-isolated-runtime-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "The framework contains an opt-in test that creates private temporary projects, starts its own loopback MongoDB and Redis, creates fixture-only principals and grants through Profile, and closes its own processes and storage afterwards:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=foundation\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=inventory\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=commerce\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=cms\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=process\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=cluster"
        },
        {
          "kind": "paragraph",
          "text": "The binaries must be on `PATH`, or explicitly selected with `NODICS_MONGOD_BINARY` and `NODICS_REDIS_BINARY`. Optional `NODICS_RUNTIME_ACCEPTANCE_OUTPUT` selects the sanitized evidence directory. Without `--require-live` the test reports that live acceptance was not executed."
        },
        {
          "kind": "paragraph",
          "text": "These scenarios exercise actual generated services, resource initialization, Profile HTTP issuance and rejection, a separate runtime, credential renewal, authority restart, and an injected failure after resources open. They verify that the original failure survives cleanup and that processes exit naturally. The CMS case is Online; Commerce startup does not prove an order, payment or Inventory business operation. The Process composition also proves real registration, required activation data import, Workflow admission, Cron deactivation with completion of admitted work, and deregistration. Every composition changes the persisted deployment grant and proves token rejection and denied renewal on the remote runtime. Provider failover and browser acceptance retain their own tests and evidence."
        },
        {
          "kind": "paragraph",
          "text": "A locally loaded module configured with `servers.<connection>.options.remoteOnly` also uses remote service dispatch. This applies to connection aliases; a missing remote owner fails instead of falling back to local business code. Use the same topology for registration and invocation to avoid advertising or calling a remote capability as a local owner."
        },
        {
          "kind": "paragraph",
          "text": "Background BackOffice contract discovery persists normalized observations using its existing repository system context. A reporting runtime keeps its restricted service token and gains no generic BackOffice CRUD permissions. Automatic safe classification and manual approval retain their existing revision and audit rules; source-instance evidence remains attached to the observation."
        },
        {
          "kind": "paragraph",
          "text": "The cluster composition starts two nodes of the same server concurrently. Each node has its own port, configuration marker, service principal and deployment grant. Both load the same generated directory, perform real operations through a project-defined generated schema service, and reject credentials after their own persisted grant is deactivated. All compositions exercise that project-only schema with create, update, read and removal against disposable MongoDB."
        }
      ],
      "searchText": "Service Runtime and Override Precedence How generated services, virtual services, module graph resolution, customer overrides, fallback behavior, and extension safety work. # Service Runtime and Override Precedence\n\nNodics services implement behavior behind schemas, routers, pipelines and business operations. The selected runtime builds one effective service object per filename-derived identity: generated baseline members first, then authored contributions in active module index order. A later contribution replaces matching methods while retaining other inherited members. This is load-time composition, not a request-time customer-to-core exception fallback. For beginners, follow the base-and-overlay file example and compare the effective describe and inherited validate methods after preparation. Confirm that the later module is active and has the intended index before diagnosing a missing override. Inspect member-origin evidence and test retained behavior; do not introduce a second service identity or catch-and-fallback path to imitate inheritance.\n\nUse this page to understand which service implementation wins. Use `Module-to-Module Communication` when a service needs to call another module through `DefaultModuleService`, especially when the target may be local in one runtime and remote in another.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Service module | `package.json` |\n| Virtual service module | `vService/package.json` |\n| Runtime configuration docs | Canonical guide `configuration.runtime-behavior-management` |\n| Extension patterns | Canonical guide `framework.backend-extension-patterns` |\n| Developer customization | Canonical guide `framework.customization-guide` |\n\n## Resolution flow\n\n```mermaid\nflowchart LR\n  Build[\"Selected-server generated common/schema artifacts\"] --> Baseline[\"Load generated Services, Facades, Controllers\"]\n  Baseline --> Indexed[\"Load authored active modules in index order\"]\n  Indexed --> Merge[\"Merge matching identity members\"]\n  Merge --> Hooks[\"Effective init and postInit hooks\"]\n  Hooks --> Invoke[\"Request invokes effective method\"]\n```\n\nDefaultInfraService builds service/facade/controller artifacts from layered common definitions and effective schemas. DefaultFrameworkInitializerService.loadModules validates required selected-server build output on start, loads generated artifacts first, then each indexed module. Each module's nodics.js init precedes its services, pipelines, facades and controllers. Rebuild the selected server after source/schema changes; generated output is not a new authored owner. Missing required generated output rejects startup.\n\n## Precedence contract\n\nReproducible illustration: put the following baseline in an earlier active example module at src/service/defaultGuideExampleService.js, and the second file at the identical relative path in a later-indexed active example module. These are actual JavaScript service exports, not code/overrides registration metadata. They introduce no production service in this documentation task.\n\n```js\nmodule.exports = {\n  init: function () { return Promise.resolve(true); },\n  postInit: function () { return Promise.resolve(true); },\n  describe: function (request) { return { code: request.code, label: 'base' }; },\n  validate: function (request) { return typeof request.code === 'string' && request.code.length > 0; }\n};\n```\n\n```js\nmodule.exports = {\n  describe: function (request) { return { code: request.code, label: 'project' }; }\n};\n```\n\nAfter composition, DefaultGuideExampleService.describe({code:'example'}) returns {code:'example',label:'project'}, while validate, init and postInit remain inherited. Removing the later active layer and rebuilding/restarting restores label:'base'. A thrown project method error propagates; the loader does not call the previous describe automatically. Preserve authorization, signatures, awaited completion, errors and side effects when overriding a real owner method.\n\ninitEntities runs the service group, then facades, then controllers; hooks within each group use Promise.all, so services must not depend on another service's iteration order. Finalization similarly executes effective postInit hooks by group. Overriding init/postInit replaces that hook; inherited implementation is not automatically called as a super method.\n\nvService is version-aware generated-schema operation behavior, not a mock provider or a remote service resolver. DefaultModelsGetInitializerService keeps HISTORY/omitted mode on getItems; CURRENT requires a versioned model with getCurrentVersionItems. An explicit nonnegative safe-integer versionId selects exact getItems; malformed versions or missing capability reject. Current authoring history is not publication activation. nDynamo schema activation builds models and generated common-derived service/facade/router artifacts through its own pipeline; it is distinct from startup overlays and requires its own governance/qualification.\n\n## Operational evidence\n\n| Question | Concrete evidence |\n| --- | --- |\n| Why does describe return project? | Active module index, selected generated directory, SERVICE.DefaultGuideExampleService.xNodics.overrideTrace and memberOrigins.describe.sourceModule. |\n| Which members are inherited? | memberOrigins.validate/init/postInit remain earlier contributors; firstSourceModule is historical origin, not capability ownership. |\n| Is the effective method compatible? | Actual default and later-layer contract tests, lifecycle completion and failure behavior; trace metadata is not a safety verdict. |\n| How is it reverted? | Governed source/module-selection rollback plus selected-server rebuild/restart and requalification; no per-request fallback. |\n\n## Related developer guides\n\n| Topic | When to use it |\n| --- | --- |\n| `Module-to-Module Communication` | Build local, remote, runtime-registry, or external HTTP calls safely. |\n| `API Request Lifecycle and Handler Pipeline` | Understand how incoming HTTP requests reach service-backed controllers. |\n| `Module Loading and Service Precedence` | Prove why a project override or framework default was selected. |\n\n## Customization and extension guidance\n\nUse the narrowest owning service seam in a later active module and the same filename-derived identity. Do not edit generated files, copy an owner into a customer module or assume directory names alone determine precedence. Compare the base-only and base-plus-overlay runtime results, retained methods, replaced hooks and a throwing override. A new service name does not override the old identity. Keep module-to-module local/remote dispatch with DefaultModuleService; that transport selection is independent of service-member inheritance.\n\n## Implementation handoff\n\nA service customization is ready only when the developer can identify the default service, the overriding module, the active runtime graph, the contract version, and the rollback path. Business users should see the changed behavior as a normal capability journey. Operators should see selected implementation metadata in production logs or diagnostics. QA should run both default and override paths so future upgrades do not silently change precedence.\n\n## Common mistakes\n\n- Changing a default service when a customer override is enough.\n- Creating a new service name when an override contract already exists.\n- Hiding selected implementation details from operators.\n- Putting business decisions inside import data files.\n- Confusing vService version-aware generated behavior with mock providers or remote dispatch.\n\n## Verification\n\nFor the illustration, independently qualify baseline label:'base', overlay label:'project', retained validate, effective hook counts, member origins and propagated override failure. Rebuild/restart both selected compositions, preserving unrelated servers. Qualify real vService HISTORY/CURRENT/exact-version reads separately; they are not fallback stubs. Existing remote-runtime qualification and Profile bootstrap boundaries below remain separate.\n\n## Separate runtimes and Profile bootstrap\n\nA deployed service has two different module lists: the modules it loads locally, and protected remote capabilities it needs to call. Keep local activation in `activeModules`. Add only remote API needs to the existing identity request:\n\n```js\nruntimeIdentity: {\n    instanceCode: 'inventory-replica-1',\n    remoteModules: ['profile']\n}\n```\n\nThis requests access; it does not approve access or load Profile. The operator provisions a distinct Profile service principal and retained API-key proof for each instance, then records a direct `RUNTIME_DEPLOYMENT` assignment with the exact project, environment, server, instance, permitted modules and permissions. First start, restart and renewal authenticate that proof against the same owner. An endpoint declaration cannot replace the assignment. A missing remote grant must reject issuance, and an unrelated enterprise or tenant must reject lookup.\n\nFor remote startup, include `profile` in permitted module scope and `profile.enterprise.search` in approved permissions. The existing `GET /enterprise/get` returns only the authenticated runtime's enterprise code, active state, and tenant code/state/properties. Profile performs the privileged record lookup after checking the runtime context. Tokens retain no broad user groups and do not acquire generic schema CRUD rights. Tenant properties are protected configuration shared only with the authorized runtime.\n\nAuthority and consumers must use the same distributed authentication namespace. Set `authSecurity.securityStamp.cacheModuleName` to the active Foundation `auth` module when Profile is remote, and configure `cache.auth.channels.auth` with an enabled distributed engine and `fallback: false`. Both principal stamps and revocation markers use that namespace. Keep `profileModuleName` unchanged: it identifies the identity authority, not the local cache client.\n\nConfigure the listening endpoint and abstract endpoint independently. The latter is the address callers use. A CMS-only Online runtime should declare its Online role and enable `data.dataReleases.destinationEnforced`; it must not install Process or Cron contributions merely because their owning source package is available. Missing required installers remain errors on their intended target.\n\n### Repeatable isolated runtime acceptance\n\nThe framework contains an opt-in test that creates private temporary projects, starts its own loopback MongoDB and Redis, creates fixture-only principals and grants through Profile, and closes its own processes and storage afterwards:\n\n```bash\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=foundation\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=inventory\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=commerce\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=cms\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=process\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=cluster\n```\n\nThe binaries must be on `PATH`, or explicitly selected with `NODICS_MONGOD_BINARY` and `NODICS_REDIS_BINARY`. Optional `NODICS_RUNTIME_ACCEPTANCE_OUTPUT` selects the sanitized evidence directory. Without `--require-live` the test reports that live acceptance was not executed.\n\nThese scenarios exercise actual generated services, resource initialization, Profile HTTP issuance and rejection, a separate runtime, credential renewal, authority restart, and an injected failure after resources open. They verify that the original failure survives cleanup and that processes exit naturally. The CMS case is Online; Commerce startup does not prove an order, payment or Inventory business operation. The Process composition also proves real registration, required activation data import, Workflow admission, Cron deactivation with completion of admitted work, and deregistration. Every composition changes the persisted deployment grant and proves token rejection and denied renewal on the remote runtime. Provider failover and browser acceptance retain their own tests and evidence.\n\nA locally loaded module configured with `servers.<connection>.options.remoteOnly` also uses remote service dispatch. This applies to connection aliases; a missing remote owner fails instead of falling back to local business code. Use the same topology for registration and invocation to avoid advertising or calling a remote capability as a local owner.\n\nBackground BackOffice contract discovery persists normalized observations using its existing repository system context. A reporting runtime keeps its restricted service token and gains no generic BackOffice CRUD permissions. Automatic safe classification and manual approval retain their existing revision and audit rules; source-instance evidence remains attached to the observation.\n\nThe cluster composition starts two nodes of the same server concurrently. Each node has its own port, configuration marker, service principal and deployment grant. Both load the same generated directory, perform real operations through a project-defined generated schema service, and reject credentials after their own persisted grant is deactivated. All compositions exercise that project-only schema with create, update, read and removal against disposable MongoDB.\n",
      "previous": {
        "title": "NMS Runtime Monitoring",
        "route": "/docs/framework/foundation-nms-runtime-monitoring"
      },
      "next": {
        "title": "Module-to-Module Communication",
        "route": "/docs/framework/foundation-module-to-module-communication"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nService",
        "owner": "nService",
        "sourcePath": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
        "wordCount": 1633,
        "checksum": "bf81c85c7db3a002df9d6bbf65c95d28026c8c16224ebaff2ed68df43b130236"
      },
      "slug": "foundation-service-runtime-overrides",
      "locale": "en",
      "navigationGroup": "Service Runtime and Overrides",
      "navigationGroupCode": "service-runtime-and-overrides",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.module-loading-service-precedence",
          "owner": "config"
        },
        {
          "documentId": "framework.backend-extension-patterns",
          "owner": "nodics.docs"
        },
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        },
        {
          "documentId": "foundation.module-to-module-communication",
          "owner": "nService"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentfoundationModuleToModuleCommunication",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.module-to-module-communication",
      "title": "Module-to-Module Communication",
      "route": "/docs/framework/foundation-module-to-module-communication",
      "section": "pipeline-and-business-logic-orchestration",
      "sectionTitle": "Pipeline and Business Logic Orchestration",
      "group": "pipeline-and-business-logic-orchestration",
      "groupTitle": "Pipeline and Business Logic Orchestration",
      "parentId": "pipeline-and-business-logic-orchestration",
      "hierarchyPath": [
        "Pipeline and Business Logic Orchestration",
        "Module-to-Module Communication"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "How DefaultModuleService invokes local services or remote module APIs through target authority, Runtime Registry, static endpoints, internal auth, retries, circuit breakers, and bounded external HTTP calls.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "foundation.service-runtime-overrides",
        "routing.api-request-lifecycle",
        "framework.module-loading-service-precedence",
        "framework.backend-extension-patterns",
        "runtime.governed-change"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/service/module/defaultModuleService.js",
        "src/lib/moduleConfiguration.js",
        "../nRouter/src/service/router/defaultRouterService.js",
        "test/moduleInvocationContract.test.js",
        "test/moduleTransportResilience.test.js",
        "test/moduleRequestHeaderNormalization.test.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "DefaultModuleService",
        "module communication",
        "invokeModule",
        "targetAuthority",
        "runtime registry",
        "internal auth",
        "circuit breaker"
      ],
      "topicKeywords": [
        "Module-to-Module Communication",
        "DefaultModuleService",
        "Runtime Registry",
        "Target Authority",
        "Internal Module Calls"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "foundationModuleToModuleCommunication-1-source-map",
          "level": 2
        },
        {
          "text": "Invocation model",
          "anchor": "foundationModuleToModuleCommunication-2-invocation-model",
          "level": 2
        },
        {
          "text": "Local invocation",
          "anchor": "foundationModuleToModuleCommunication-3-local-invocation",
          "level": 2
        },
        {
          "text": "Remote invocation",
          "anchor": "foundationModuleToModuleCommunication-4-remote-invocation",
          "level": 2
        },
        {
          "text": "Target authority",
          "anchor": "foundationModuleToModuleCommunication-5-target-authority",
          "level": 2
        },
        {
          "text": "Headers and internal authentication",
          "anchor": "foundationModuleToModuleCommunication-6-headers-and-internal-authentication",
          "level": 2
        },
        {
          "text": "External HTTP requests",
          "anchor": "foundationModuleToModuleCommunication-7-external-http-requests",
          "level": 2
        },
        {
          "text": "Transport resilience and diagnostics",
          "anchor": "foundationModuleToModuleCommunication-8-transport-resilience-and-diagnostics",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "foundationModuleToModuleCommunication-9-customization-and-extension",
          "level": 2
        },
        {
          "text": "Developer examples",
          "anchor": "foundationModuleToModuleCommunication-10-developer-examples",
          "level": 2
        },
        {
          "text": "Operator troubleshooting",
          "anchor": "foundationModuleToModuleCommunication-11-operator-troubleshooting",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationModuleToModuleCommunication-12-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationModuleToModuleCommunication-13-verification",
          "level": 2
        },
        {
          "text": "Local selection and independent deployment acceptance",
          "anchor": "foundationModuleToModuleCommunication-14-local-selection-and-independent-deployment-acceptance",
          "level": 3
        },
        {
          "text": "Runtime credential failure and local regression checks",
          "anchor": "foundationModuleToModuleCommunication-15-runtime-credential-failure-and-local-regression-checks",
          "level": 3
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics modules communicate through `DefaultModuleService` when one capability needs data or behavior owned by another runtime. This page explains local service invocation, remote module invocation, runtime-registry resolution, static endpoint fallback, internal authorization headers, retries, circuit breakers, and safe customization. It is for beginners, business users, developers, operators, architects, QA owners, and AI tools that need to understand how a module calls another module without stealing its authority."
        },
        {
          "kind": "paragraph",
          "text": "The business value is clean ownership. Commerce can ask Profile for enterprise or tenant context, BackOffice can ask WCMS or Process for setup state, and Axis initialization can submit a release to a target runtime. The caller should not copy another module's schema, bypass its API, or assume it owns the target database. `DefaultModuleService.invokeModule` decides whether the target can be called locally in the same process or remotely through an HTTP contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationModuleToModuleCommunication-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Runtime area",
            "Source location",
            "Responsibility"
          ],
          "rows": [
            [
              "Module communication service",
              "`src/service/module/defaultModuleService.js`",
              "Builds local and remote module calls, headers, runtime-registry requests, retries, circuit breakers, and diagnostics."
            ],
            [
              "Module endpoint configuration",
              "`src/lib/moduleConfiguration.js`",
              "Supplies endpoint accessors consumed by router and module communication."
            ],
            [
              "Router URL preparation",
              "`../nRouter/src/service/router/defaultRouterService.js`",
              "Resolves configured module endpoint base URLs for static fallback."
            ],
            [
              "Runtime registry owner resolution",
              "`DefaultRuntimeRegistryResolverService` when available",
              "Selects live owner endpoint and instance metadata for remote authority-aware calls."
            ],
            [
              "Internal authentication",
              "`NODICS.getInternalAuthToken` and authentication provider services",
              "Supplies bearer token for internal remote module calls by tenant."
            ],
            [
              "Transport resilience",
              "`serviceCommunication` configuration",
              "Controls timeout, retry, connection pool, response size, redirects, and circuit breaker behavior."
            ],
            [
              "Contract tests",
              "`test/moduleInvocationContract.test.js` and `moduleTransportResilience.test.js`",
              "Proves local/remote choice, registry owner path, static fallback, missing endpoints, unauthenticated opt-out, timeout, retry, and circuit breaker behavior."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Invocation model",
          "anchor": "foundationModuleToModuleCommunication-2-invocation-model"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, `invokeModule` is the safe doorway for calling another Nodics module. The caller names the target module and desired operation. The service then checks the active runtime graph and target authority."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Caller[\"Owning service\"] --> Invoke[\"DefaultModuleService.invokeModule\"]\n  Invoke --> Active{\"Target module active here?\"}\n  Active -->|yes| Authority{\"Requested authority served here?\"}\n  Authority -->|yes| Local[\"invokeLocalModule -> SERVICE[name][operation]\"]\n  Authority -->|no| Remote[\"invokeRemoteModule\"]\n  Active -->|no| Remote\n  Remote --> Registry{\"Runtime Registry owner?\"}\n  Registry -->|yes| RegistryRequest[\"buildRuntimeRegistryRequest\"]\n  Registry -->|no| Static{\"Configured endpoint alias?\"}\n  Static -->|yes| Build[\"buildRequest via DefaultRouterService.prepareUrl\"]\n  Static -->|no| Error[\"Remote endpoint unavailable\"]\n  RegistryRequest --> Fetch[\"fetch with timeout, retry, circuit breaker\"]\n  Build --> Fetch"
        },
        {
          "kind": "paragraph",
          "text": "Local invocation is an in-process service call. Remote invocation is an HTTP call using a configured endpoint or a Runtime Registry owner endpoint. The caller receives either the local service response, the remote response body, or a selected piece of the response when `responseSelector` is supplied."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Local invocation",
          "anchor": "foundationModuleToModuleCommunication-3-local-invocation"
        },
        {
          "kind": "paragraph",
          "text": "Local invocation is used when the target module is active in the current runtime, the caller did not set `local: false`, and the requested `targetAuthority` matches the current runtime. The service invokes:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "SERVICE[options.serviceName][options.operationName](options.request)"
        },
        {
          "kind": "paragraph",
          "text": "Example:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const reservation = await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'inventory',\n  serviceName: 'DefaultInventoryService',\n  operationName: 'reserve',\n  request: {\n    tenant: 'default',\n    sku: 'SKU-1',\n    quantity: 2\n  }\n});"
        },
        {
          "kind": "paragraph",
          "text": "Use local invocation when both modules are intentionally composed into one runtime and the target behavior belongs to that runtime. Do not use it to reach a schema that is owned by a different runtime role, such as Online publication data from a Staged runtime."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Remote invocation",
          "anchor": "foundationModuleToModuleCommunication-4-remote-invocation"
        },
        {
          "kind": "paragraph",
          "text": "Remote invocation is used when the target module is inactive locally, the caller sets `local: false`, or the target authority belongs to another runtime. Remote calls require `apiName` because the request crosses a process boundary and must use a public or internal API contract."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const enterprise = await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'profile',\n  serviceName: 'DefaultEnterpriseService',\n  operationName: 'get',\n  apiName: '/enterprise',\n  methodName: 'POST',\n  request: {\n    tenant: 'default',\n    query: { code: 'default' }\n  },\n  responseSelector: response => response.result && response.result[0]\n});"
        },
        {
          "kind": "paragraph",
          "text": "Remote invocation first asks Runtime Registry for a live owner when a resolver is available. If Registry returns an owner endpoint, the request context is marked as `runtime-registry` and includes owner metadata such as `instanceId` and `runtimeRole`. If no owner is available, the service falls back to static module endpoint configuration. If neither path exists, it fails with a clear remote endpoint error."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Target authority",
          "anchor": "foundationModuleToModuleCommunication-5-target-authority"
        },
        {
          "kind": "paragraph",
          "text": "`targetAuthority` prevents a local active module from accidentally serving a call that was intended for another runtime role. This matters for Staged and Online separation, Commerce operational and Commerce Staged separation, and future clustered deployments."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'cms',\n  connectionName: 'wcmsOnline',\n  targetAuthority: {\n    runtimeRole: 'ONLINE'\n  },\n  apiName: '/sites/nexus/pages/home',\n  methodName: 'GET',\n  request: {\n    tenant: 'default'\n  }\n});"
        },
        {
          "kind": "paragraph",
          "text": "If the current runtime role does not match the requested authority, Nodics uses remote invocation even when the module name is active locally. This keeps publication boundaries intact: Staged preparation does not silently read or write Online state through local shortcuts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Headers and internal authentication",
          "anchor": "foundationModuleToModuleCommunication-6-headers-and-internal-authentication"
        },
        {
          "kind": "paragraph",
          "text": "Remote module calls normalize headers to modern names:"
        },
        {
          "kind": "table",
          "headers": [
            "Input",
            "Normalized output"
          ],
          "rows": [
            [
              "`authToken` or `Authorization`",
              "`Authorization: Bearer <token>`"
            ],
            [
              "`apiKey` or `x-api-key`",
              "`x-api-key`"
            ],
            [
              "`entCode` or `x-enterprise-code`",
              "`x-enterprise-code`"
            ],
            [
              "`idempotencyKey`",
              "`Idempotency-Key`"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "By default, remote module calls require an internal bearer token. The service derives it from the tenant through `NODICS.getInternalAuthToken`. A caller may pass its own authorization header. A public or explicitly unauthenticated remote call must set `requireInternalAuth: false`; otherwise the absence of an internal token is treated as a configuration problem."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'publicCatalog',\n  apiName: '/health',\n  methodName: 'GET',\n  request: {},\n  requireInternalAuth: false\n});"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "External HTTP requests",
          "anchor": "foundationModuleToModuleCommunication-7-external-http-requests"
        },
        {
          "kind": "paragraph",
          "text": "`buildExternalRequest` exists for controlled calls to absolute external URLs. Use it when the target is not a Nodics module endpoint, such as an approved provider API, a discovery document, or a health endpoint managed outside the module graph."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const request = SERVICE.DefaultModuleService.buildExternalRequest({\n  uri: 'https://provider.example/status',\n  methodName: 'GET',\n  timeoutMs: 1000,\n  maxResponseBytes: 2048,\n  followRedirects: false\n});\n\nconst status = await SERVICE.DefaultModuleService.fetch(request);"
        },
        {
          "kind": "paragraph",
          "text": "External calls must be bounded. Developers should set timeout, maximum response size, redirect policy, authentication policy, and error mapping. Do not hide provider-specific business decisions inside `DefaultModuleService`; provider adapters should own those decisions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Transport resilience and diagnostics",
          "anchor": "foundationModuleToModuleCommunication-8-transport-resilience-and-diagnostics"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultModuleService` initializes shared HTTP/HTTPS agents, retry state, circuit state, and diagnostics. The `serviceCommunication` configuration controls connection pooling, timeout, retry attempts, retryable statuses, retryable error codes, jitter, and circuit breaker behavior."
        },
        {
          "kind": "paragraph",
          "text": "Retries are safe only for `GET`, `HEAD`, `OPTIONS`, or calls with an `Idempotency-Key`. Mutating calls without idempotency evidence are attempted once. Circuit breaker failures are partitioned by target module or origin, so one failing remote owner does not need to block unrelated modules."
        },
        {
          "kind": "paragraph",
          "text": "Operators can use sanitized transport diagnostics to understand request counts, successes, failures, timeouts, retries, circuit rejections, average latency, and the last local/remote resolution decision. Diagnostics must not include secrets, raw payloads, or private response bodies."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "foundationModuleToModuleCommunication-9-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers may customize module communication, but the contract must remain stable."
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Recommended extension",
            "Avoid"
          ],
          "rows": [
            [
              "Change endpoint discovery",
              "Add or override Runtime Registry resolver or module endpoint configuration.",
              "Hardcoding URLs inside business services."
            ],
            [
              "Add provider-specific auth",
              "Implement the provider adapter and pass bounded headers into `buildExternalRequest`.",
              "Teaching `DefaultModuleService` every provider's business rules."
            ],
            [
              "Tighten timeout or response size",
              "Override `serviceCommunication` configuration by environment or server.",
              "Relying on default timeouts for production integrations."
            ],
            [
              "Force remote ownership",
              "Supply `targetAuthority` and `connectionName`.",
              "Calling a local active module when Online or Staged ownership matters."
            ],
            [
              "Customize fetch implementation",
              "Override `DefaultModuleService` in a project layer while preserving `buildRequest`, `buildExternalRequest`, `invokeModule`, and `fetch`.",
              "Changing response shape or error disclosure for one caller only."
            ],
            [
              "Handle remote response shape",
              "Use `responseSelector` near the calling service.",
              "Making downstream controllers know remote response envelopes."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Business logic remains in the owning module. If Commerce needs Profile data, Commerce asks Profile through the module service. Commerce should not copy Profile schemas or read Profile collections directly. If Axis needs setup state, Axis consumes BackOffice contracts; it does not call local files or invent module readiness."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer examples",
          "anchor": "foundationModuleToModuleCommunication-10-developer-examples"
        },
        {
          "kind": "paragraph",
          "text": "BackOffice checking a remote runtime should build an external request with small limits:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const request = SERVICE.DefaultModuleService.buildExternalRequest({\n  uri: registration.healthUrl,\n  methodName: 'GET',\n  timeoutMs: 50,\n  maxResponseBytes: 2048,\n  followRedirects: false,\n  header: {\n    Authorization: 'Bearer ' + internalToken\n  }\n});\n\nreturn SERVICE.DefaultModuleService.fetch(request);"
        },
        {
          "kind": "paragraph",
          "text": "Application initialization targeting another runtime should use `targetAuthority` so Staged, Online, and operational roles do not collapse:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "return SERVICE.DefaultModuleService.invokeModule({\n  moduleName: profile.target.moduleName,\n  connectionName: profile.target.connectionName,\n  targetAuthority: profile.target.authority,\n  apiName: profile.target.apiName,\n  methodName: 'POST',\n  request: {\n    tenant: request.tenant,\n    profileCode: profile.code,\n    releases: plannedReleases\n  },\n  idempotencyKey: request.requestId\n});"
        },
        {
          "kind": "paragraph",
          "text": "The caller owns orchestration, idempotency, and response interpretation. The target module owns validation, persistence, lifecycle transition, and audit."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator troubleshooting",
          "anchor": "foundationModuleToModuleCommunication-11-operator-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely layer",
            "First check"
          ],
          "rows": [
            [
              "Local service unavailable",
              "Local invocation",
              "Confirm target module is active and `serviceName.operationName` exists in `SERVICE`."
            ],
            [
              "Remote endpoint unavailable",
              "Endpoint discovery",
              "Check Runtime Registry owner, static module endpoint alias, `connectionName`, and runtime availability."
            ],
            [
              "Internal service token unavailable",
              "Authentication",
              "Confirm tenant, internal token bootstrap, and whether the call is intentionally unauthenticated."
            ],
            [
              "Remote call times out",
              "Transport",
              "Check target health, timeout config, retry policy, and circuit state."
            ],
            [
              "Mutating remote call was not retried",
              "Idempotency policy",
              "Add an `Idempotency-Key` only when the target operation is safe to retry."
            ],
            [
              "Wrong runtime handled the call",
              "Authority resolution",
              "Check `targetAuthority`, current `runtimeRole`, Registry owner metadata, and static fallback connection."
            ],
            [
              "Error leaks too much detail",
              "Error sanitization",
              "Check `NodicsError.cleanContext`, response handler, and caller-facing message mapping."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationModuleToModuleCommunication-12-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Calling another module's generated service directly when the target is owned by another runtime.",
            "Using local invocation for Online data from a Staged or operational runtime.",
            "Hardcoding localhost URLs in framework or customer business services.",
            "Omitting `apiName` for remote invocation.",
            "Sending remote mutation requests without idempotency evidence and expecting automatic retries.",
            "Setting `requireInternalAuth: false` on a private internal module call.",
            "Copying another module's data into the caller to avoid using the module service contract.",
            "Logging authorization headers, request bodies, or remote private responses in diagnostics."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationModuleToModuleCommunication-13-verification"
        },
        {
          "kind": "paragraph",
          "text": "Module communication changes require local and remote tests. At minimum, verify local active invocation, missing local service error, remote static fallback, Runtime Registry owner selection, `targetAuthority` forcing remote calls, internal authorization header creation, explicit unauthenticated call, missing endpoint error, timeout, retry, circuit breaker, response size limit, redirect policy, response selector behavior, and sanitized error context."
        },
        {
          "kind": "paragraph",
          "text": "Existing starting points are `nService/test/moduleInvocationContract.test.js`, `nService/test/moduleTransportResilience.test.js`, `nService/test/moduleRequestHeaderNormalization.test.js`, and feature tests in BackOffice, Axis initialization, Profile enterprise resolution, and application setup. After documentation changes, maintain canonical CMS data and validate the framework documentation pack:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run validate"
        },
        {
          "kind": "paragraph",
          "text": "For production-like evidence, run two runtimes where the target module is not local to the caller, confirm Runtime Registry or static endpoint selection, inspect transport diagnostics, and prove the caller still receives a stable business response while the target module remains the data and behavior authority."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Local selection and independent deployment acceptance",
          "anchor": "foundationModuleToModuleCommunication-14-local-selection-and-independent-deployment-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "`requiredModules` declares essential local prerequisites. Endpoint entries under `servers` describe remote reachability and do not activate code. Selecting a complete functional group intentionally includes its configured defaults; a split runtime selects its concrete local capabilities through `activeModules`, while `runtimeModuleRoots` supplies the packages available for discovery."
        },
        {
          "kind": "paragraph",
          "text": "The framework selective-runtime contract prepares and loads actual Inventory, Commerce-with-remote-Inventory and CMS-only graphs. Inventory remains the same capability when separated; unselected Product, Process and Waste services do not load. CMS does not inherit Commerce infrastructure merely because its package is installed. Invoke remote work through `DefaultModuleService`, and keep a required remote startup call bounded. An optional absent capability must not create a connection or start work. Business activation prerequisites belong to the existing governed catalogue and are checked before activation."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Runtime credential failure and local regression checks",
          "anchor": "foundationModuleToModuleCommunication-15-runtime-credential-failure-and-local-regression-checks"
        },
        {
          "kind": "paragraph",
          "text": "A missing revocation marker is the canonical cache-miss result. Connection errors, disabled channels and malformed cached data reject authorization. A later stamp read succeeding cannot excuse an earlier failed revocation check."
        },
        {
          "kind": "paragraph",
          "text": "The explicit Redis integration verifies these owners across two processes and measures 1000 JWT verifications per process. Its default local p95 ceiling is 25 ms with exactly two cache reads per verification; override the ceiling through `NODICS_AUTH_RUNTIME_P95_MAX_MS` for a qualified deployment. Report token bursts, CPU/RSS and failure/recovery alongside latency. These synthetic regression limits do not establish production load capacity or network-partition guarantees."
        }
      ],
      "searchText": "Module-to-Module Communication How DefaultModuleService invokes local services or remote module APIs through target authority, Runtime Registry, static endpoints, internal auth, retries, circuit breakers, and bounded external HTTP calls. # Module-to-Module Communication\n\nNodics modules communicate through `DefaultModuleService` when one capability needs data or behavior owned by another runtime. This page explains local service invocation, remote module invocation, runtime-registry resolution, static endpoint fallback, internal authorization headers, retries, circuit breakers, and safe customization. It is for beginners, business users, developers, operators, architects, QA owners, and AI tools that need to understand how a module calls another module without stealing its authority.\n\nThe business value is clean ownership. Commerce can ask Profile for enterprise or tenant context, BackOffice can ask WCMS or Process for setup state, and Axis initialization can submit a release to a target runtime. The caller should not copy another module's schema, bypass its API, or assume it owns the target database. `DefaultModuleService.invokeModule` decides whether the target can be called locally in the same process or remotely through an HTTP contract.\n\n## Source map\n\n| Runtime area | Source location | Responsibility |\n| --- | --- | --- |\n| Module communication service | `src/service/module/defaultModuleService.js` | Builds local and remote module calls, headers, runtime-registry requests, retries, circuit breakers, and diagnostics. |\n| Module endpoint configuration | `src/lib/moduleConfiguration.js` | Supplies endpoint accessors consumed by router and module communication. |\n| Router URL preparation | `../nRouter/src/service/router/defaultRouterService.js` | Resolves configured module endpoint base URLs for static fallback. |\n| Runtime registry owner resolution | `DefaultRuntimeRegistryResolverService` when available | Selects live owner endpoint and instance metadata for remote authority-aware calls. |\n| Internal authentication | `NODICS.getInternalAuthToken` and authentication provider services | Supplies bearer token for internal remote module calls by tenant. |\n| Transport resilience | `serviceCommunication` configuration | Controls timeout, retry, connection pool, response size, redirects, and circuit breaker behavior. |\n| Contract tests | `test/moduleInvocationContract.test.js` and `moduleTransportResilience.test.js` | Proves local/remote choice, registry owner path, static fallback, missing endpoints, unauthenticated opt-out, timeout, retry, and circuit breaker behavior. |\n\n## Invocation model\n\nFor beginners, `invokeModule` is the safe doorway for calling another Nodics module. The caller names the target module and desired operation. The service then checks the active runtime graph and target authority.\n\n```mermaid\nflowchart TD\n  Caller[\"Owning service\"] --> Invoke[\"DefaultModuleService.invokeModule\"]\n  Invoke --> Active{\"Target module active here?\"}\n  Active -->|yes| Authority{\"Requested authority served here?\"}\n  Authority -->|yes| Local[\"invokeLocalModule -> SERVICE[name][operation]\"]\n  Authority -->|no| Remote[\"invokeRemoteModule\"]\n  Active -->|no| Remote\n  Remote --> Registry{\"Runtime Registry owner?\"}\n  Registry -->|yes| RegistryRequest[\"buildRuntimeRegistryRequest\"]\n  Registry -->|no| Static{\"Configured endpoint alias?\"}\n  Static -->|yes| Build[\"buildRequest via DefaultRouterService.prepareUrl\"]\n  Static -->|no| Error[\"Remote endpoint unavailable\"]\n  RegistryRequest --> Fetch[\"fetch with timeout, retry, circuit breaker\"]\n  Build --> Fetch\n```\n\nLocal invocation is an in-process service call. Remote invocation is an HTTP call using a configured endpoint or a Runtime Registry owner endpoint. The caller receives either the local service response, the remote response body, or a selected piece of the response when `responseSelector` is supplied.\n\n## Local invocation\n\nLocal invocation is used when the target module is active in the current runtime, the caller did not set `local: false`, and the requested `targetAuthority` matches the current runtime. The service invokes:\n\n```js\nSERVICE[options.serviceName][options.operationName](options.request)\n```\n\nExample:\n\n```js\nconst reservation = await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'inventory',\n  serviceName: 'DefaultInventoryService',\n  operationName: 'reserve',\n  request: {\n    tenant: 'default',\n    sku: 'SKU-1',\n    quantity: 2\n  }\n});\n```\n\nUse local invocation when both modules are intentionally composed into one runtime and the target behavior belongs to that runtime. Do not use it to reach a schema that is owned by a different runtime role, such as Online publication data from a Staged runtime.\n\n## Remote invocation\n\nRemote invocation is used when the target module is inactive locally, the caller sets `local: false`, or the target authority belongs to another runtime. Remote calls require `apiName` because the request crosses a process boundary and must use a public or internal API contract.\n\n```js\nconst enterprise = await SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'profile',\n  serviceName: 'DefaultEnterpriseService',\n  operationName: 'get',\n  apiName: '/enterprise',\n  methodName: 'POST',\n  request: {\n    tenant: 'default',\n    query: { code: 'default' }\n  },\n  responseSelector: response => response.result && response.result[0]\n});\n```\n\nRemote invocation first asks Runtime Registry for a live owner when a resolver is available. If Registry returns an owner endpoint, the request context is marked as `runtime-registry` and includes owner metadata such as `instanceId` and `runtimeRole`. If no owner is available, the service falls back to static module endpoint configuration. If neither path exists, it fails with a clear remote endpoint error.\n\n## Target authority\n\n`targetAuthority` prevents a local active module from accidentally serving a call that was intended for another runtime role. This matters for Staged and Online separation, Commerce operational and Commerce Staged separation, and future clustered deployments.\n\n```js\nawait SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'cms',\n  connectionName: 'wcmsOnline',\n  targetAuthority: {\n    runtimeRole: 'ONLINE'\n  },\n  apiName: '/sites/nexus/pages/home',\n  methodName: 'GET',\n  request: {\n    tenant: 'default'\n  }\n});\n```\n\nIf the current runtime role does not match the requested authority, Nodics uses remote invocation even when the module name is active locally. This keeps publication boundaries intact: Staged preparation does not silently read or write Online state through local shortcuts.\n\n## Headers and internal authentication\n\nRemote module calls normalize headers to modern names:\n\n| Input | Normalized output |\n| --- | --- |\n| `authToken` or `Authorization` | `Authorization: Bearer <token>` |\n| `apiKey` or `x-api-key` | `x-api-key` |\n| `entCode` or `x-enterprise-code` | `x-enterprise-code` |\n| `idempotencyKey` | `Idempotency-Key` |\n\nBy default, remote module calls require an internal bearer token. The service derives it from the tenant through `NODICS.getInternalAuthToken`. A caller may pass its own authorization header. A public or explicitly unauthenticated remote call must set `requireInternalAuth: false`; otherwise the absence of an internal token is treated as a configuration problem.\n\n```js\nawait SERVICE.DefaultModuleService.invokeModule({\n  moduleName: 'publicCatalog',\n  apiName: '/health',\n  methodName: 'GET',\n  request: {},\n  requireInternalAuth: false\n});\n```\n\n## External HTTP requests\n\n`buildExternalRequest` exists for controlled calls to absolute external URLs. Use it when the target is not a Nodics module endpoint, such as an approved provider API, a discovery document, or a health endpoint managed outside the module graph.\n\n```js\nconst request = SERVICE.DefaultModuleService.buildExternalRequest({\n  uri: 'https://provider.example/status',\n  methodName: 'GET',\n  timeoutMs: 1000,\n  maxResponseBytes: 2048,\n  followRedirects: false\n});\n\nconst status = await SERVICE.DefaultModuleService.fetch(request);\n```\n\nExternal calls must be bounded. Developers should set timeout, maximum response size, redirect policy, authentication policy, and error mapping. Do not hide provider-specific business decisions inside `DefaultModuleService`; provider adapters should own those decisions.\n\n## Transport resilience and diagnostics\n\n`DefaultModuleService` initializes shared HTTP/HTTPS agents, retry state, circuit state, and diagnostics. The `serviceCommunication` configuration controls connection pooling, timeout, retry attempts, retryable statuses, retryable error codes, jitter, and circuit breaker behavior.\n\nRetries are safe only for `GET`, `HEAD`, `OPTIONS`, or calls with an `Idempotency-Key`. Mutating calls without idempotency evidence are attempted once. Circuit breaker failures are partitioned by target module or origin, so one failing remote owner does not need to block unrelated modules.\n\nOperators can use sanitized transport diagnostics to understand request counts, successes, failures, timeouts, retries, circuit rejections, average latency, and the last local/remote resolution decision. Diagnostics must not include secrets, raw payloads, or private response bodies.\n\n## Customization and extension\n\nDevelopers may customize module communication, but the contract must remain stable.\n\n| Need | Recommended extension | Avoid |\n| --- | --- | --- |\n| Change endpoint discovery | Add or override Runtime Registry resolver or module endpoint configuration. | Hardcoding URLs inside business services. |\n| Add provider-specific auth | Implement the provider adapter and pass bounded headers into `buildExternalRequest`. | Teaching `DefaultModuleService` every provider's business rules. |\n| Tighten timeout or response size | Override `serviceCommunication` configuration by environment or server. | Relying on default timeouts for production integrations. |\n| Force remote ownership | Supply `targetAuthority` and `connectionName`. | Calling a local active module when Online or Staged ownership matters. |\n| Customize fetch implementation | Override `DefaultModuleService` in a project layer while preserving `buildRequest`, `buildExternalRequest`, `invokeModule`, and `fetch`. | Changing response shape or error disclosure for one caller only. |\n| Handle remote response shape | Use `responseSelector` near the calling service. | Making downstream controllers know remote response envelopes. |\n\nBusiness logic remains in the owning module. If Commerce needs Profile data, Commerce asks Profile through the module service. Commerce should not copy Profile schemas or read Profile collections directly. If Axis needs setup state, Axis consumes BackOffice contracts; it does not call local files or invent module readiness.\n\n## Developer examples\n\nBackOffice checking a remote runtime should build an external request with small limits:\n\n```js\nconst request = SERVICE.DefaultModuleService.buildExternalRequest({\n  uri: registration.healthUrl,\n  methodName: 'GET',\n  timeoutMs: 50,\n  maxResponseBytes: 2048,\n  followRedirects: false,\n  header: {\n    Authorization: 'Bearer ' + internalToken\n  }\n});\n\nreturn SERVICE.DefaultModuleService.fetch(request);\n```\n\nApplication initialization targeting another runtime should use `targetAuthority` so Staged, Online, and operational roles do not collapse:\n\n```js\nreturn SERVICE.DefaultModuleService.invokeModule({\n  moduleName: profile.target.moduleName,\n  connectionName: profile.target.connectionName,\n  targetAuthority: profile.target.authority,\n  apiName: profile.target.apiName,\n  methodName: 'POST',\n  request: {\n    tenant: request.tenant,\n    profileCode: profile.code,\n    releases: plannedReleases\n  },\n  idempotencyKey: request.requestId\n});\n```\n\nThe caller owns orchestration, idempotency, and response interpretation. The target module owns validation, persistence, lifecycle transition, and audit.\n\n## Operator troubleshooting\n\n| Symptom | Likely layer | First check |\n| --- | --- | --- |\n| Local service unavailable | Local invocation | Confirm target module is active and `serviceName.operationName` exists in `SERVICE`. |\n| Remote endpoint unavailable | Endpoint discovery | Check Runtime Registry owner, static module endpoint alias, `connectionName`, and runtime availability. |\n| Internal service token unavailable | Authentication | Confirm tenant, internal token bootstrap, and whether the call is intentionally unauthenticated. |\n| Remote call times out | Transport | Check target health, timeout config, retry policy, and circuit state. |\n| Mutating remote call was not retried | Idempotency policy | Add an `Idempotency-Key` only when the target operation is safe to retry. |\n| Wrong runtime handled the call | Authority resolution | Check `targetAuthority`, current `runtimeRole`, Registry owner metadata, and static fallback connection. |\n| Error leaks too much detail | Error sanitization | Check `NodicsError.cleanContext`, response handler, and caller-facing message mapping. |\n\n## Common mistakes\n\n- Calling another module's generated service directly when the target is owned by another runtime.\n- Using local invocation for Online data from a Staged or operational runtime.\n- Hardcoding localhost URLs in framework or customer business services.\n- Omitting `apiName` for remote invocation.\n- Sending remote mutation requests without idempotency evidence and expecting automatic retries.\n- Setting `requireInternalAuth: false` on a private internal module call.\n- Copying another module's data into the caller to avoid using the module service contract.\n- Logging authorization headers, request bodies, or remote private responses in diagnostics.\n\n## Verification\n\nModule communication changes require local and remote tests. At minimum, verify local active invocation, missing local service error, remote static fallback, Runtime Registry owner selection, `targetAuthority` forcing remote calls, internal authorization header creation, explicit unauthenticated call, missing endpoint error, timeout, retry, circuit breaker, response size limit, redirect policy, response selector behavior, and sanitized error context.\n\nExisting starting points are `nService/test/moduleInvocationContract.test.js`, `nService/test/moduleTransportResilience.test.js`, `nService/test/moduleRequestHeaderNormalization.test.js`, and feature tests in BackOffice, Axis initialization, Profile enterprise resolution, and application setup. After documentation changes, maintain canonical CMS data and validate the framework documentation pack:\n\n```bash\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run validate\n```\n\nFor production-like evidence, run two runtimes where the target module is not local to the caller, confirm Runtime Registry or static endpoint selection, inspect transport diagnostics, and prove the caller still receives a stable business response while the target module remains the data and behavior authority.\n\n### Local selection and independent deployment acceptance\n\n`requiredModules` declares essential local prerequisites. Endpoint entries under `servers` describe remote reachability and do not activate code. Selecting a complete functional group intentionally includes its configured defaults; a split runtime selects its concrete local capabilities through `activeModules`, while `runtimeModuleRoots` supplies the packages available for discovery.\n\nThe framework selective-runtime contract prepares and loads actual Inventory, Commerce-with-remote-Inventory and CMS-only graphs. Inventory remains the same capability when separated; unselected Product, Process and Waste services do not load. CMS does not inherit Commerce infrastructure merely because its package is installed. Invoke remote work through `DefaultModuleService`, and keep a required remote startup call bounded. An optional absent capability must not create a connection or start work. Business activation prerequisites belong to the existing governed catalogue and are checked before activation.\n\n### Runtime credential failure and local regression checks\n\nA missing revocation marker is the canonical cache-miss result. Connection errors, disabled channels and malformed cached data reject authorization. A later stamp read succeeding cannot excuse an earlier failed revocation check.\n\nThe explicit Redis integration verifies these owners across two processes and measures 1000 JWT verifications per process. Its default local p95 ceiling is 25 ms with exactly two cache reads per verification; override the ceiling through `NODICS_AUTH_RUNTIME_P95_MAX_MS` for a qualified deployment. Report token bursts, CPU/RSS and failure/recovery alongside latency. These synthetic regression limits do not establish production load capacity or network-partition guarantees.\n",
      "previous": {
        "title": "Service Runtime and Override Precedence",
        "route": "/docs/framework/foundation-service-runtime-overrides"
      },
      "next": {
        "title": "Cache Provider Runbooks",
        "route": "/docs/framework/foundation-cache-provider-runbooks"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nService",
        "owner": "nService",
        "sourcePath": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
        "wordCount": 1948,
        "checksum": "e2b6ac42b97bb7225d0b8b95f6c214727476d0dc7cbe3bfc909606930274276e"
      },
      "slug": "foundation-module-to-module-communication",
      "locale": "en",
      "navigationGroup": "Service Runtime and Overrides",
      "navigationGroupCode": "service-runtime-and-overrides",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "foundation.service-runtime-overrides",
          "owner": "nService"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "framework.module-loading-service-precedence",
          "owner": "config"
        },
        {
          "documentId": "framework.backend-extension-patterns",
          "owner": "nodics.docs"
        },
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        }
      ]
    },
    "active": true
  }
};
