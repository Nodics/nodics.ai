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
    "code": "nodicsDocsComponentframeworkRuntimeServerComposition",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.runtime-server-composition",
      "title": "Runtime Server Composition",
      "route": "/docs/framework/framework-runtime-server-composition",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Runtime Server Composition"
      ],
      "hierarchyDepth": 2,
      "documentType": "concept",
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
      "summary": "How project topology composes framework modules into Platform, WCMS, Process, and other runtime servers.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "foundation.overview",
        "framework.customization-guide",
        "platform.module-registry"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "runtime-server-composition",
        "server-topology",
        "platform-wcms-process"
      ],
      "topicKeywords": [
        "Framework Architecture and Design",
        "Modularity and Ownership",
        "Runtime Server Composition"
      ],
      "headings": [
        {
          "text": "Runtime model",
          "anchor": "frameworkRuntimeServerComposition-1-runtime-model",
          "level": 2
        },
        {
          "text": "Composition decisions",
          "anchor": "frameworkRuntimeServerComposition-2-composition-decisions",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "frameworkRuntimeServerComposition-3-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operator view",
          "anchor": "frameworkRuntimeServerComposition-4-operator-view",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "frameworkRuntimeServerComposition-5-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "frameworkRuntimeServerComposition-6-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Runtime server composition explains how Nodics turns framework modules and project modules into running services. A beginner often looks at repository folders and assumes that every available module is active. That is not the Nodics model. Repository code only makes a capability available. Runtime composition decides which capabilities load into a specific server, in which order, and with which project or environment customizations."
        },
        {
          "kind": "paragraph",
          "text": "For business users, this matters because the same framework can support a small local evaluation and a larger enterprise deployment without changing the capability ownership model. For developers and operators, it explains where a change belongs and which server must load it before the behavior exists."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime model",
          "anchor": "frameworkRuntimeServerComposition-1-runtime-model"
        },
        {
          "kind": "paragraph",
          "text": "Platform, WCMS, Process, and other servers are composition targets. Platform usually handles employee identity, profile, BackOffice metadata, module registry, and API discovery. WCMS handles sites, catalogs, pages, components, routes, media, and documentation delivery. Process handles workflow, human tasks, scheduled automation, and cron-related runtime behavior. A customer project decides which modules extend each server for a given environment."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Project[\"Customer project\"] --> Platform[\"Platform server\"]\n  Project --> WCMS[\"WCMS server\"]\n  Project --> Process[\"Process server\"]\n  Framework[\"Framework modules\"] --> Platform\n  Framework --> WCMS\n  Framework --> Process\n  Extensions[\"Project and environment modules\"] --> Platform\n  Extensions --> WCMS\n  Extensions --> Process"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Composition decisions",
          "anchor": "frameworkRuntimeServerComposition-2-composition-decisions"
        },
        {
          "kind": "table",
          "headers": [
            "Decision",
            "Business impact",
            "Technical impact"
          ],
          "rows": [
            [
              "Load Platform",
              "Axis login, registry, profile, and administration are available.",
              "Platform modules and project platform extensions must load."
            ],
            [
              "Load WCMS",
              "Public content, documentation, media, and site routes can be delivered.",
              "WCMS schemas, services, routes, and content packs must load."
            ],
            [
              "Load Process",
              "Approval tasks, workflows, and scheduled automation can run.",
              "Process and cron modules must load with task persistence and worker settings."
            ],
            [
              "Add project extension",
              "Customer behavior appears without forking framework source.",
              "Later-loaded modules override or extend framework services."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "frameworkRuntimeServerComposition-3-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "A project should customize composition through project-owned configuration and modules. If a capability is not needed, it should not be forced into the runtime only because its code exists in the framework. If a capability is needed by a public application, it must be registered and loaded before related content data is imported. Agora commerce data, for example, should not be treated as complete unless the commerce capabilities it depends on are active."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator view",
          "anchor": "frameworkRuntimeServerComposition-4-operator-view"
        },
        {
          "kind": "paragraph",
          "text": "Operators should verify composition by checking server status, loaded module lists, logs, generated routes, module registry state, and health endpoints. When a server fails, the question is not only \"which process stopped?\" It is \"which composed capability was responsible for the failed route, import, job, or publication state?\""
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkRuntimeServerComposition-5-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Assuming every module in the framework checkout is active in every server.",
            "Importing data for a capability before the capability is registered and loaded.",
            "Treating local topology as the only production topology.",
            "Hiding customer-specific runtime decisions in unsourced environment files.",
            "Editing a framework module when a project extension should own the change."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkRuntimeServerComposition-6-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify composition from a fresh schema by starting the topology, checking the loaded modules for each server, opening Axis Module Registry, importing only data packs whose capabilities are active, and confirming that public apps show Online content only after the relevant WCMS publication path succeeds."
        }
      ],
      "searchText": "Runtime Server Composition How project topology composes framework modules into Platform, WCMS, Process, and other runtime servers. # Runtime Server Composition\n\nRuntime server composition explains how Nodics turns framework modules and project modules into running services. A beginner often looks at repository folders and assumes that every available module is active. That is not the Nodics model. Repository code only makes a capability available. Runtime composition decides which capabilities load into a specific server, in which order, and with which project or environment customizations.\n\nFor business users, this matters because the same framework can support a small local evaluation and a larger enterprise deployment without changing the capability ownership model. For developers and operators, it explains where a change belongs and which server must load it before the behavior exists.\n\n## Runtime model\n\nPlatform, WCMS, Process, and other servers are composition targets. Platform usually handles employee identity, profile, BackOffice metadata, module registry, and API discovery. WCMS handles sites, catalogs, pages, components, routes, media, and documentation delivery. Process handles workflow, human tasks, scheduled automation, and cron-related runtime behavior. A customer project decides which modules extend each server for a given environment.\n\n```mermaid\nflowchart TD\n  Project[\"Customer project\"] --> Platform[\"Platform server\"]\n  Project --> WCMS[\"WCMS server\"]\n  Project --> Process[\"Process server\"]\n  Framework[\"Framework modules\"] --> Platform\n  Framework --> WCMS\n  Framework --> Process\n  Extensions[\"Project and environment modules\"] --> Platform\n  Extensions --> WCMS\n  Extensions --> Process\n```\n\n## Composition decisions\n\n| Decision | Business impact | Technical impact |\n| --- | --- | --- |\n| Load Platform | Axis login, registry, profile, and administration are available. | Platform modules and project platform extensions must load. |\n| Load WCMS | Public content, documentation, media, and site routes can be delivered. | WCMS schemas, services, routes, and content packs must load. |\n| Load Process | Approval tasks, workflows, and scheduled automation can run. | Process and cron modules must load with task persistence and worker settings. |\n| Add project extension | Customer behavior appears without forking framework source. | Later-loaded modules override or extend framework services. |\n\n## Customization and extension\n\nA project should customize composition through project-owned configuration and modules. If a capability is not needed, it should not be forced into the runtime only because its code exists in the framework. If a capability is needed by a public application, it must be registered and loaded before related content data is imported. Agora commerce data, for example, should not be treated as complete unless the commerce capabilities it depends on are active.\n\n## Operator view\n\nOperators should verify composition by checking server status, loaded module lists, logs, generated routes, module registry state, and health endpoints. When a server fails, the question is not only \"which process stopped?\" It is \"which composed capability was responsible for the failed route, import, job, or publication state?\"\n\n## Common mistakes\n\n- Assuming every module in the framework checkout is active in every server.\n- Importing data for a capability before the capability is registered and loaded.\n- Treating local topology as the only production topology.\n- Hiding customer-specific runtime decisions in unsourced environment files.\n- Editing a framework module when a project extension should own the change.\n\n## Verification\n\nVerify composition from a fresh schema by starting the topology, checking the loaded modules for each server, opening Axis Module Registry, importing only data packs whose capabilities are active, and confirming that public apps show Online content only after the relevant WCMS publication path succeeds.\n",
      "previous": {
        "title": "Modular architecture and ownership",
        "route": "/docs/framework/framework-modular-architecture"
      },
      "next": {
        "title": "Module Loading and Service Precedence",
        "route": "/docs/framework/framework-module-loading-service-precedence"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "config",
        "owner": "config",
        "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "wordCount": 517,
        "checksum": "1324b171c3f261bda0d82e217be0c82ec26728f8ac858b893b903d0ccb9f0adf"
      },
      "slug": "framework-runtime-server-composition",
      "locale": "en",
      "navigationGroup": "Modularity and Ownership",
      "navigationGroupCode": "modularity-and-ownership",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentframeworkModuleLoadingServicePrecedence",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.module-loading-service-precedence",
      "title": "Module Loading and Service Precedence",
      "route": "/docs/framework/framework-module-loading-service-precedence",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Module Loading and Service Precedence"
      ],
      "hierarchyDepth": 2,
      "documentType": "concept",
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
      "summary": "How runtime loading order, service overrides, and project layers decide which implementation is active.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "foundation.overview",
        "framework.customization-guide",
        "platform.module-registry",
        "foundation.module-to-module-communication",
        "routing.api-request-lifecycle"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "module-loading",
        "service-precedence",
        "override-order"
      ],
      "topicKeywords": [
        "Framework Architecture and Design",
        "Modularity and Ownership",
        "Service Precedence"
      ],
      "headings": [
        {
          "text": "Loading order",
          "anchor": "frameworkModuleLoadingServicePrecedence-1-loading-order",
          "level": 2
        },
        {
          "text": "Business and developer impact",
          "anchor": "frameworkModuleLoadingServicePrecedence-2-business-and-developer-impact",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "frameworkModuleLoadingServicePrecedence-3-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operator view",
          "anchor": "frameworkModuleLoadingServicePrecedence-4-operator-view",
          "level": 2
        },
        {
          "text": "Reader and implementation contract",
          "anchor": "frameworkModuleLoadingServicePrecedence-5-reader-and-implementation-contract",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "frameworkModuleLoadingServicePrecedence-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "frameworkModuleLoadingServicePrecedence-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Module loading and service precedence explain which implementation wins when framework and project modules provide related behavior. This topic is separate from the business module hierarchy. A capability such as Platform, WCMS, Commerce, or Process may be visible to business users as one capability, while developers still need to know the exact technical module and service order used at runtime."
        },
        {
          "kind": "paragraph",
          "text": "The beginner rule is: the later, more specific layer may extend or override the earlier framework layer when the module is composed into the same runtime. That is how customer projects customize behavior without renaming the framework capability or modifying shared framework source."
        },
        {
          "kind": "paragraph",
          "text": "Service precedence answers which local implementation wins. It does not decide whether a call should stay local or cross to another runtime. Use `Module-to-Module Communication` for that local-versus-remote decision and `API Request Lifecycle and Handler Pipeline` for incoming HTTP request processing before a controller calls services."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Loading order",
          "anchor": "frameworkModuleLoadingServicePrecedence-1-loading-order"
        },
        {
          "kind": "paragraph",
          "text": "For services/facades/controllers, the selected server's generated baseline loads before indexed authored modules. Later contributions replace matching members, not the entire service. Exact index and xNodics.memberOrigins/overrideTrace explain effective behavior; project/environment/server naming alone is not precedence authority."
        },
        {
          "kind": "paragraph",
          "text": "Runtime loading starts with foundational modules, then loads functional capabilities, then project, environment, and server-specific modules. The exact composition is declared by the project. Service precedence follows that load order, so a project service can replace or extend a framework service when the contract allows it."
        },
        {
          "kind": "paragraph",
          "text": "For the full startup timeline, including raw module discovery, active module resolution, dotted numeric index sorting, pre-scripts, module `nodics.js` hooks, post-scripts, initial data import, and listener startup, use `Framework Startup Lifecycle`."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Core[\"Core foundation\"] --> Capability[\"Framework capability\"]\n  Capability --> Project[\"Project extension\"]\n  Project --> Environment[\"Environment override\"]\n  Environment --> Server[\"Server-specific behavior\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business and developer impact",
          "anchor": "frameworkModuleLoadingServicePrecedence-2-business-and-developer-impact"
        },
        {
          "kind": "table",
          "headers": [
            "Reader",
            "Why precedence matters"
          ],
          "rows": [
            [
              "Business user",
              "A customer can receive tailored behavior while still using the standard capability."
            ],
            [
              "Developer",
              "The correct customization point is the later project module, not a direct framework edit."
            ],
            [
              "Operator",
              "Runtime logs and loaded-module evidence explain why a specific implementation handled a request."
            ],
            [
              "QA owner",
              "Tests must prove both default framework behavior and project override behavior."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "frameworkModuleLoadingServicePrecedence-3-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Use the same filename-derived service identity in a later-indexed active module; export the methods to change, not service/extends metadata. The primary foundation.service-runtime-overrides guide shows a full two-layer example and effective member-origin diagnostics. The following later src/service/defaultGuideExampleService.js replaces describe while preserving earlier validate/init/postInit members:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  describe: function (request) { return { code: request.code, label: 'project' }; }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Configuration uses its existing owner switches; pipeline orchestration uses its existing definition nodes. No per-request fallback to the base method occurs if the override throws. Qualify the base and overlay compositions after selected-server rebuild/restart; do not copy the whole framework owner."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator view",
          "anchor": "frameworkModuleLoadingServicePrecedence-4-operator-view"
        },
        {
          "kind": "paragraph",
          "text": "When production behavior differs from the default framework, operators should be able to see which module supplied the active service. Logs, runtime module lists, configuration source, and generated context should all point to the same owner. That evidence matters during incidents, upgrades, and rollback."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkModuleLoadingServicePrecedence-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should finish this topic understanding that a customization does not become active only because a file exists. The module must be part of the runtime graph, and the runtime graph must load it after the framework behavior it extends. A business user should understand that the customer can keep a standard capability name while receiving tailored behavior. A developer should know where the override lives, which service contract it replaces or extends, and which generated artifacts or tests need to be updated. An operator should know how to prove the active implementation from logs, module loading output, configuration source, and runtime health evidence."
        },
        {
          "kind": "paragraph",
          "text": "Document every precedence-sensitive change with the same shape: business reason, owning capability, base implementation, project implementation, activation configuration, server graph, rollback path, and verification command. Without that evidence, a future maintainer cannot tell whether a different result is expected customization or accidental drift."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkModuleLoadingServicePrecedence-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Confusing functional module hierarchy with service precedence.",
            "Renaming a capability because a project overrides one implementation detail.",
            "Adding duplicate services without knowing which one wins.",
            "Testing only the default service and forgetting the project override path.",
            "Documenting an override without explaining runtime and rollback impact."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkModuleLoadingServicePrecedence-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify precedence by checking the composed module order, confirming the active service implementation, running the framework default tests, running the project override tests, and proving the browser or API behavior uses the expected service. The documentation must identify the owning capability, the override path, and the rollback path."
        }
      ],
      "searchText": "Module Loading and Service Precedence How runtime loading order, service overrides, and project layers decide which implementation is active. # Module Loading and Service Precedence\n\nModule loading and service precedence explain which implementation wins when framework and project modules provide related behavior. This topic is separate from the business module hierarchy. A capability such as Platform, WCMS, Commerce, or Process may be visible to business users as one capability, while developers still need to know the exact technical module and service order used at runtime.\n\nThe beginner rule is: the later, more specific layer may extend or override the earlier framework layer when the module is composed into the same runtime. That is how customer projects customize behavior without renaming the framework capability or modifying shared framework source.\n\nService precedence answers which local implementation wins. It does not decide whether a call should stay local or cross to another runtime. Use `Module-to-Module Communication` for that local-versus-remote decision and `API Request Lifecycle and Handler Pipeline` for incoming HTTP request processing before a controller calls services.\n\n## Loading order\n\nFor services/facades/controllers, the selected server's generated baseline loads before indexed authored modules. Later contributions replace matching members, not the entire service. Exact index and xNodics.memberOrigins/overrideTrace explain effective behavior; project/environment/server naming alone is not precedence authority.\n\nRuntime loading starts with foundational modules, then loads functional capabilities, then project, environment, and server-specific modules. The exact composition is declared by the project. Service precedence follows that load order, so a project service can replace or extend a framework service when the contract allows it.\n\nFor the full startup timeline, including raw module discovery, active module resolution, dotted numeric index sorting, pre-scripts, module `nodics.js` hooks, post-scripts, initial data import, and listener startup, use `Framework Startup Lifecycle`.\n\n```mermaid\nflowchart LR\n  Core[\"Core foundation\"] --> Capability[\"Framework capability\"]\n  Capability --> Project[\"Project extension\"]\n  Project --> Environment[\"Environment override\"]\n  Environment --> Server[\"Server-specific behavior\"]\n```\n\n## Business and developer impact\n\n| Reader | Why precedence matters |\n| --- | --- |\n| Business user | A customer can receive tailored behavior while still using the standard capability. |\n| Developer | The correct customization point is the later project module, not a direct framework edit. |\n| Operator | Runtime logs and loaded-module evidence explain why a specific implementation handled a request. |\n| QA owner | Tests must prove both default framework behavior and project override behavior. |\n\n## Customization and extension\n\nUse the same filename-derived service identity in a later-indexed active module; export the methods to change, not service/extends metadata. The primary foundation.service-runtime-overrides guide shows a full two-layer example and effective member-origin diagnostics. The following later src/service/defaultGuideExampleService.js replaces describe while preserving earlier validate/init/postInit members:\n\n```js\nmodule.exports = {\n  describe: function (request) { return { code: request.code, label: 'project' }; }\n};\n```\n\nConfiguration uses its existing owner switches; pipeline orchestration uses its existing definition nodes. No per-request fallback to the base method occurs if the override throws. Qualify the base and overlay compositions after selected-server rebuild/restart; do not copy the whole framework owner.\n\n## Operator view\n\nWhen production behavior differs from the default framework, operators should be able to see which module supplied the active service. Logs, runtime module lists, configuration source, and generated context should all point to the same owner. That evidence matters during incidents, upgrades, and rollback.\n\n## Reader and implementation contract\n\nA beginner should finish this topic understanding that a customization does not become active only because a file exists. The module must be part of the runtime graph, and the runtime graph must load it after the framework behavior it extends. A business user should understand that the customer can keep a standard capability name while receiving tailored behavior. A developer should know where the override lives, which service contract it replaces or extends, and which generated artifacts or tests need to be updated. An operator should know how to prove the active implementation from logs, module loading output, configuration source, and runtime health evidence.\n\nDocument every precedence-sensitive change with the same shape: business reason, owning capability, base implementation, project implementation, activation configuration, server graph, rollback path, and verification command. Without that evidence, a future maintainer cannot tell whether a different result is expected customization or accidental drift.\n\n## Common mistakes\n\n- Confusing functional module hierarchy with service precedence.\n- Renaming a capability because a project overrides one implementation detail.\n- Adding duplicate services without knowing which one wins.\n- Testing only the default service and forgetting the project override path.\n- Documenting an override without explaining runtime and rollback impact.\n\n## Verification\n\nVerify precedence by checking the composed module order, confirming the active service implementation, running the framework default tests, running the project override tests, and proving the browser or API behavior uses the expected service. The documentation must identify the owning capability, the override path, and the rollback path.\n",
      "previous": {
        "title": "Runtime Server Composition",
        "route": "/docs/framework/framework-runtime-server-composition"
      },
      "next": {
        "title": "Architecture Decision Guide",
        "route": "/docs/framework/framework-architecture-decision-guide"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "config",
        "owner": "config",
        "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "wordCount": 755,
        "checksum": "a133e75dd0bb45c7209193d20b44628b7f61decb7955e993c58490743518d2b5"
      },
      "slug": "framework-module-loading-service-precedence",
      "locale": "en",
      "navigationGroup": "Modularity and Ownership",
      "navigationGroupCode": "modularity-and-ownership",
      "navigationGroupOrder": 10,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        },
        {
          "documentId": "foundation.module-to-module-communication",
          "owner": "nService"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentconfigurationRuntimeBehaviorManagement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "configuration.runtime-behavior-management",
      "title": "Application Configuration and Runtime Behavior Management",
      "route": "/docs/framework/configuration-runtime-behavior-management",
      "section": "application-configuration-and-runtime-behavior-management",
      "sectionTitle": "Application Configuration and Runtime Behavior Management",
      "group": "application-configuration-and-runtime-behavior-management",
      "groupTitle": "Application Configuration and Runtime Behavior Management",
      "parentId": "application-configuration-and-runtime-behavior-management",
      "hierarchyPath": [
        "Application Configuration and Runtime Behavior Management",
        "Application Configuration and Runtime Behavior Management"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
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
      "summary": "How configuration layers, provider choices, runtime settings, and project overrides change Nodics behavior safely.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "foundation.overview",
        "configuration.framework-startup-lifecycle",
        "cache.runtime-state-management",
        "foundation.error-handling-status-codes",
        "routing.api-governance",
        "runtime.governed-change"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
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
        "application-configuration-and-runtime-behavior-management",
        "configuration-layers-and-behavior",
        "application-configuration-and-runtime-behavior-management"
      ],
      "topicKeywords": [
        "Application Configuration and Runtime Behavior Management",
        "Configuration Layers and Behavior",
        "Application Configuration and Runtime Behavior Management"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "configurationRuntimeBehaviorManagement-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "configurationRuntimeBehaviorManagement-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "configurationRuntimeBehaviorManagement-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "configurationRuntimeBehaviorManagement-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "configurationRuntimeBehaviorManagement-5-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Rejected placement",
          "anchor": "configurationRuntimeBehaviorManagement-6-rejected-placement",
          "level": 3
        },
        {
          "text": "Operations and governance",
          "anchor": "configurationRuntimeBehaviorManagement-7-operations-and-governance",
          "level": 2
        },
        {
          "text": "Migration and rollback",
          "anchor": "configurationRuntimeBehaviorManagement-8-migration-and-rollback",
          "level": 3
        },
        {
          "text": "Common mistakes",
          "anchor": "configurationRuntimeBehaviorManagement-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "configurationRuntimeBehaviorManagement-10-verification",
          "level": 2
        },
        {
          "text": "Capability inventories and project tooling",
          "anchor": "configurationRuntimeBehaviorManagement-11-capability-inventories-and-project-tooling",
          "level": 2
        },
        {
          "text": "Installed project command",
          "anchor": "configurationRuntimeBehaviorManagement-12-installed-project-command",
          "level": 2
        },
        {
          "text": "Declarative property bindings",
          "anchor": "configurationRuntimeBehaviorManagement-13-declarative-property-bindings",
          "level": 2
        },
        {
          "text": "Build exclusion and interrupted-build recovery",
          "anchor": "configurationRuntimeBehaviorManagement-14-build-exclusion-and-interrupted-build-recovery",
          "level": 3
        },
        {
          "text": "Generated output containment",
          "anchor": "configurationRuntimeBehaviorManagement-15-generated-output-containment",
          "level": 3
        },
        {
          "text": "Defaults that stay with their owners",
          "anchor": "configurationRuntimeBehaviorManagement-16-defaults-that-stay-with-their-owners",
          "level": 2
        },
        {
          "text": "Customize and extend safely: exact collections",
          "anchor": "configurationRuntimeBehaviorManagement-17-customize-and-extend-safely-exact-collections",
          "level": 3
        },
        {
          "text": "Runtime callback authority",
          "anchor": "configurationRuntimeBehaviorManagement-18-runtime-callback-authority",
          "level": 2
        },
        {
          "text": "Minimal topology and shared deployment references",
          "anchor": "configurationRuntimeBehaviorManagement-19-minimal-topology-and-shared-deployment-references",
          "level": 2
        },
        {
          "text": "Consumer defaults and property ownership",
          "anchor": "configurationRuntimeBehaviorManagement-20-consumer-defaults-and-property-ownership",
          "level": 3
        },
        {
          "text": "Origins from configured frontend endpoints",
          "anchor": "configurationRuntimeBehaviorManagement-21-origins-from-configured-frontend-endpoints",
          "level": 2
        },
        {
          "text": "Mandatory configuration ownership restrictions",
          "anchor": "configurationRuntimeBehaviorManagement-22-mandatory-configuration-ownership-restrictions",
          "level": 2
        },
        {
          "text": "MongoDB default database names",
          "anchor": "configurationRuntimeBehaviorManagement-23-mongodb-default-database-names",
          "level": 2
        },
        {
          "text": "Redis default prefix",
          "anchor": "configurationRuntimeBehaviorManagement-24-redis-default-prefix",
          "level": 2
        },
        {
          "text": "Capability-owned acceptance tooling",
          "anchor": "configurationRuntimeBehaviorManagement-25-capability-owned-acceptance-tooling",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics supplies reusable capability defaults. A customer chooses the capabilities and business policy it needs; an operator supplies deployment values. Keeping those decisions separate makes a project easier to understand and upgrade. Environment, server and node properties should express intentional differences, not a copied configuration manual."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, start with one already working server. Identify the capability's configuration owner, change one supported value and run preparation before starting the runtime. Expand the change only after that smallest example works."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "configurationRuntimeBehaviorManagement-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "A partner should be able to answer three questions before editing a value: what behavior changes, who owns it, and which runtime should see it. For example, changing a catalogue candidate limit is a Product policy decision; changing a listening port is a deployment decision. Both use configuration, but they belong at different boundaries and have different verification needs."
        },
        {
          "kind": "table",
          "headers": [
            "Reader",
            "Start here"
          ],
          "rows": [
            [
              "Business evaluator",
              "Choose the desired capability and business outcome; technical defaults should not become mandatory setup questions."
            ],
            [
              "Application developer",
              "Find the owning capability and its supported keys, then write the smallest customer override."
            ],
            [
              "Administrator/operator",
              "Supply endpoints, required secret references and deployment policy at the environment/server boundary."
            ],
            [
              "Framework maintainer or AI tool",
              "Prove ownership, activation, index order, merge behavior and compatibility before relocating configuration."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "configurationRuntimeBehaviorManagement-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "nConfig owns loading and the runtime registry. Each capability owns the meaning, defaults and validation of its configuration. Foundation is the common framework dependency, but that does not make every setting a Foundation-owned setting."
        },
        {
          "kind": "table",
          "headers": [
            "Configuration or behavior",
            "Authoritative home"
          ],
          "rows": [
            [
              "Cookie defaults and session policy",
              "Profile capability"
            ],
            [
              "Catalogue limits and discovery behavior",
              "Product capability"
            ],
            [
              "Customer store identity and application choices",
              "Customer project/application configuration"
            ],
            [
              "Shared customer administration descriptors",
              "A project configuration module explicitly selected by the administrative runtime"
            ],
            [
              "Standard CORS and database defaults",
              "Owning framework capabilities (nRouter and MongoDB)"
            ],
            [
              "Changed CORS origins and database deployment settings",
              "Environment configuration"
            ],
            [
              "Active module composition, ports and isolated database names",
              "Server configuration"
            ],
            [
              "Instance-specific differences",
              "Node configuration"
            ],
            [
              "Shared build/start/validation mechanics",
              "Foundation's non-runtime nTooling package"
            ],
            [
              "Development principles and contracts",
              "Foundation's non-runtime nSetup package"
            ],
            [
              "Governed tenant/runtime changes",
              "Existing tenant and persisted-configuration mechanisms"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A module containing only configuration does not start an independent server. However, `runtimeModule: false` has a specific meaning: runtime discovery and activation exclude that package. Extending Foundation does not automatically load non-runtime children's properties. nTooling reads its own tooling configuration through its declared entry point; that is different from runtime capability inheritance. Do not make runtime configuration depend on activating nTooling or nSetup."
        },
        {
          "kind": "paragraph",
          "text": "Shared tooling should receive the selected project root, environment, server and optional node through the existing command context. It should derive canonical identities from package/topology metadata and resolve deployment values from their owners. Moving customer-specific script logic into Foundation without removing hardcoded customer names is not reusable tooling."
        },
        {
          "kind": "paragraph",
          "text": "The established loading sequence is:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "nConfig base properties;",
            "active module `config/properties.js` files in module index order;",
            "configured `externalPropertyFile` entries;",
            "tenant properties through the existing enterprise/tenant mechanism;",
            "persisted runtime configuration through its governed lifecycle."
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Base[\"nConfig base\"] --> Modules[\"Active properties in index order\"]\n  Modules --> External[\"External properties\"]\n  External --> Tenant[\"Tenant properties\"]\n  Tenant --> Persisted[\"Governed persisted configuration\"]"
        },
        {
          "kind": "paragraph",
          "text": "The selected topology layers are project, environment, server, then optional node. Their indexes must preserve that sequence. A custom capability under `modules/` does not automatically precede a server: its actual index determines when its properties load. Place shared defaults before the intended override layers and verify the prepared runtime. Preserve the existing metadata and loader contracts rather than introducing another configuration registry."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "configurationRuntimeBehaviorManagement-3-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Classify every proposed setting before adding it:"
        },
        {
          "kind": "table",
          "headers": [
            "Category",
            "Customer action",
            "Example"
          ],
          "rows": [
            [
              "Required deployment input",
              "Provide the real value/reference through the supported environment mechanism.",
              "Database target or credential reference"
            ],
            [
              "Inherited default",
              "Omit it when the owner's policy is suitable.",
              "Profile refresh-cookie name or Product read-page limit"
            ],
            [
              "Optional advanced override",
              "Declare only the changed key and explain the reason.",
              "A larger Product candidate budget"
            ],
            [
              "Intentional compatibility/security pin",
              "Keep the explicit value with an owner and review trigger.",
              "A provider sandbox restriction during qualification"
            ],
            [
              "Generated/runtime state",
              "Let its established lifecycle manage it.",
              "Logs, generated files or persisted runtime settings"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not move development credentials, sample store names, customer URLs or machine-local paths into reusable framework defaults. A value matching the framework can still be wrongly owned. Correct the framework owner and preserve that customer's choice explicitly during migration."
        },
        {
          "kind": "paragraph",
          "text": "Omission means inheritance. It does not remove an inherited property. Current nConfig uses Lodash `merge`; nested objects merge recursively and arrays merge by position. For example:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "merge({}, {targets: ['first', 'second']}, {targets: ['replacement']});\n// {targets: ['replacement', 'second']}"
        },
        {
          "kind": "paragraph",
          "text": "An empty or shorter array is not a universal disable/delete operation. Use the owning capability's supported enablement/removal contract, or retain the full intended declaration and verify the effective result. This is especially important for reset targets, activation lists and data-package inventories."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "configurationRuntimeBehaviorManagement-4-customization-and-extension"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "configurationRuntimeBehaviorManagement-5-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Suppose an existing server already activates Product and needs a larger catalogue candidate budget. Its override can be this small:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n    product: {\n        discovery: {\n            catalogue: {maximumCandidates: 800}\n        }\n    }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This example shows a configuration difference, not a complete new server. Retain that server's existing composition and deployment settings. Product's other catalogue defaults remain inherited. Validate the resulting configuration and measure query cost before production tuning."
        },
        {
          "kind": "paragraph",
          "text": "For a value shared by several customer runtimes, use the owning active customer module and an index before its intended environment/server overrides. Select that module only where it is needed. Do not activate a WCMS or Commerce module merely to obtain an administration descriptor, because its dependencies can change the runtime graph. Customer administration composition may share such descriptors while the framework retains orchestration, permissions and imports."
        },
        {
          "kind": "paragraph",
          "text": "A later node can override one scalar without repeating the server:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n    product: {discovery: {catalogue: {maximumCandidates: 400}}}\n};"
        },
        {
          "kind": "paragraph",
          "text": "Build and start the intended server/node through the established project command path. Confirm the node belongs to the selected server and verify its prepared configuration. Configuration changes do not, by themselves, grant access, create stores, install data or activate an application."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Rejected placement",
          "anchor": "configurationRuntimeBehaviorManagement-6-rejected-placement"
        },
        {
          "kind": "paragraph",
          "text": "Copying an entire Profile configuration into an environment freezes defaults that should be inherited. Moving a customer's application profiles into a Foundation default makes unrelated customers inherit that customer's policy. Replacing a large properties file with a large sibling helper retains the same maintenance burden. Correct each case by moving data to its owner and keeping only intentional differences at the consuming boundary."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "configurationRuntimeBehaviorManagement-7-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Startup-only properties require the owning runtime's normal restart/deployment procedure. Runtime-refreshable values use the existing governed APIs and permissions. Editing a source file does not prove that a running process has loaded it. Keep secret values out of logs, documentation and comparison reports."
        },
        {
          "kind": "paragraph",
          "text": "Preserve explicit operational safeguards during refactoring:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "module activation and API exposure retain their existing authority;",
            "local reset opt-in, environment allowlist, confirmation and service inventory remain governed by their owning reset contracts;",
            "data-package declarations do not trigger imports on their own;",
            "remote endpoint declarations do not activate the remote capability locally;",
            "later tenant and persisted configuration remain separate from authored defaults."
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Migration and rollback",
          "anchor": "configurationRuntimeBehaviorManagement-8-migration-and-rollback"
        },
        {
          "kind": "paragraph",
          "text": "Capture the effective prepared configuration before moving values. Check every affected runtime, including an unselected runtime and relevant optional compositions. Compare the result after the change and account for intentional module additions separately. Do not publish secret-bearing snapshots."
        },
        {
          "kind": "paragraph",
          "text": "Cart and Shopping List require explicit store context and no longer consume `customerApi.defaultStoreCode`. Keep the application's store choice at the customer boundary and send it with operations; moving a sample identity into a framework fallback is not valid configuration inheritance. Existing carts are not rewritten: retain saved IDs and plan explicit migration for callers that previously relied on fallback selection. Identifier validation does not replace Store master-data, tenant, ownership or selling-context checks."
        },
        {
          "kind": "paragraph",
          "text": "To roll back a configuration relocation, restore its previous declarations and module selection together, then run preparation and focused acceptance again. Do not remove a shared module while leaving consumers dependent on its values. Roll back only the scoped change; preserve unrelated work and runtime data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "configurationRuntimeBehaviorManagement-9-common-mistakes"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely cause",
            "Recovery"
          ],
          "rows": [
            [
              "Moved defaults disappear",
              "Their owner is inactive or non-runtime.",
              "Check metadata and the effective module list; use the proper runtime owner."
            ],
            [
              "A server override loses",
              "A defaults module loads later by index.",
              "Correct ordering and test the selected topology."
            ],
            [
              "An unwanted array entry remains",
              "A shorter array was merged by index.",
              "Use supported removal semantics or a complete verified declaration."
            ],
            [
              "Unrelated runtimes receive application profiles",
              "A shared module was selected too broadly.",
              "Restrict composition and verify an unselected runtime."
            ],
            [
              "Local values appear in another environment",
              "Deployment choices were promoted to shared defaults.",
              "Restore the values to their environment/server owner."
            ],
            [
              "Source looks correct but live behavior differs",
              "The process is stale or a later runtime layer overrides it.",
              "Inspect the actual runtime, later configuration and normal restart path."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "configurationRuntimeBehaviorManagement-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "From the framework repository, run the focused loading and validation contracts:"
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "node nodics.foundation/modules/nConfig/test/configurationOwnershipContract.test.js\nnode nodics.foundation/modules/nConfig/test/configurationValidation.test.js\nnode --test nodics.commerce/modules/checkout/modules/cart/test/cartCustomerApiContract.test.js\nnpm run llm:generate\nnpm run llm:validate\nnpm --prefix nodics.docs test\nnpm run quality:docs"
        },
        {
          "kind": "paragraph",
          "text": "Also run the consuming project's real `prepareStart` scenarios and tests for its explicit overrides. Preparation proves configuration resolution and module composition; it does not prove network connectivity, database operations, authenticated browser acceptance or a running deployment. Report those levels of evidence separately."
        },
        {
          "kind": "paragraph",
          "text": "Continue with Framework Startup Lifecycle for startup sequencing and Governed Runtime Change for persisted settings and runtime permissions. The permanent implementation rule is `nodics.foundation/modules/nSetup/llm/contracts/customer-config-classification-contract.md`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Capability inventories and project tooling",
          "anchor": "configurationRuntimeBehaviorManagement-11-capability-inventories-and-project-tooling"
        },
        {
          "kind": "paragraph",
          "text": "A capability can declare inert maintenance metadata in its own configuration. For Local reset, use `localResetProvider.contributions.<module>.serviceNames` with keyed booleans. A server selects only intended modules, for example `modules: { inventory: true, cms: false }`, and can remove an optional inherited service with `serviceOverrides: { DefaultInventoryAdjustmentService: false }`. Enablement, environment allowlist, service-token authority, confirmation, maximum scope and required services remain nSystem checks. This is never an automatic inventory of all database collections. Search targets remain explicit."
        },
        {
          "kind": "paragraph",
          "text": "Initialization uses the existing nImport release manifests and category/destination selection. A Foundation profile may select Core releases without copying every capability's record definitions into server properties. Keep application-specific bundles, labels and deployment targets in project layers."
        },
        {
          "kind": "paragraph",
          "text": "Project command execution remains in nTooling. Applications declare their own server aliases, customer acceptance scripts and media seeds through `nodics.project.json` tooling commands and script ownership. Generic commands do not assume a named storefront or website. Documentation generation uses the application catalogue's `publication` identifiers, routes, labels and channels. Use stable record prefixes; changing a prefix is a content-identity change rather than a cosmetic rename. The data-manifest tool only refreshes declared development checksums and refuses to rewrite an immutable release after content changes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Installed project command",
          "anchor": "configurationRuntimeBehaviorManagement-12-installed-project-command"
        },
        {
          "kind": "paragraph",
          "text": "Foundation's package `bin.nodics` points to the existing nTooling project bridge. A declared compatible Foundation dependency installs `node_modules/.bin/nodics`; normal npm scripts resolve it automatically. The bridge reads the chosen project's `.env`, resolves its configured framework checkout or its own checkout, and dispatches to the existing tooling registry. No project-owned JavaScript launcher is required. Local checkout dependencies remain explicit `file:` references in package/lockfiles; this is not an unpinned package fetch or a claim of a published npm release."
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "npm exec -- nodics start --env qa --server jobs --node worker1\nnpm exec -- nodics build --env qa --server jobs\nnpm exec -- nodics clean --env qa --server jobs\nnpm exec -- nodics project:validate"
        },
        {
          "kind": "paragraph",
          "text": "`--env` aliases `--environment`; `--project` aliases `--home`. Target options accept both `--name=value` and `--name value`. Duplicate or missing target values fail. Start resolves the explicit server through its existing package topology; optional nodes use nConfig's existing node selector. Build/clean require a server and retain server-owned output shared by nodes. They do not infer an environment-wide build. CLI targets take precedence over environment-file defaults. Selection is restored after an awaited runtime lifecycle, including failure. Credentials stay in the existing external/environment/secret authority and are never CLI examples."
        },
        {
          "kind": "paragraph",
          "text": "The same registry still accepts its existing command names. Customer acceptance aliases remain opt-in `project:run` commands. Qualification/release commands retain the framework home established by the project bridge. Changing command packaging does not imply permission to run a deployment, release, reset or live acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Declarative property bindings",
          "anchor": "configurationRuntimeBehaviorManagement-13-declarative-property-bindings"
        },
        {
          "kind": "paragraph",
          "text": "Project, environment, server, node and tenant property contributions resolve through nConfig at the existing load boundary before the usual layered merge. The same resolver supplies the existing nTooling environment composition helper. Configuration files export data; they do not execute project composition loops, read sibling environment builders, or implement their own environment resolver. This does not add another configuration store, provider registry or load order."
        },
        {
          "kind": "paragraph",
          "text": "Use an explicit `$config` object only when a value needs resolution:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "`env`: `name`, optional `fallback` and `type` (`string`, `number`, `boolean`). Names are explicit uppercase environment variable names. Unset/empty values use the fallback; absent fallbacks omit the contribution. Booleans accept only `true`/`false`, and numbers must be finite. Secret values stay in the deployment environment; errors name the field without printing its value.",
            "`ref`: `path` as an array of keys (preferred for keys containing dots), or a dotted path. Reads the current contribution plus earlier effective properties, returns an independent value, and rejects missing/cyclic/unsafe references.",
            "`context`: one of `projectCode`, `environmentCode`, `serverCode`, `nodeCode` from the selected runtime.",
            "`path`: a `base` of `project`, `framework`, `environment`, `server`, `file`, or a binding that resolves to an absolute path, plus a `relative` string. This supports explicit sibling checkout paths; it is not a filesystem sandbox.",
            "`composition`: the effective `activeModules.compositions` entry selected by `name` and optional `field`. Its declared `environmentVariable` chooses domains; `emptySelections` declares aliases, with only `none` supplied by default. No application identity or environment-variable name is inferred by nConfig.",
            "`selected`: composition `name`, array `field`, `includes`, `value`, optional `otherwise`. An omitted alternative omits that property/array contribution.",
            "`all`: a bounded nonempty `values` array of boolean values or bindings."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Bindings inside arrays may declare `spread: true` to expand an array result. Spread is rejected outside arrays or for a non-array result. Unknown operators, unrecognized operator fields, invalid values, unsafe paths, and resolution beyond 64 levels/250,000 nodes reject loading. These are finite value operators, not an expression language: no script, function, arbitrary provider or code evaluation."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n    database: {\n        default: { mongodb: { master: {\n            URI: { $config: 'env', name: 'DATABASE_URI' },\n            databaseName: 'warehouseQa'\n        } } },\n        inventory: { $config: 'ref', path: ['database', 'default'] }\n    },\n    activeModules: { modules: [\n        'warehouseRuntime',\n        { $config: 'composition', name: 'business', field: 'projectPacks', spread: true }\n    ] }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Later layers can replace a binding with a literal or change its referenced source. Resolution does not mutate imported source objects, and resolved arrays still follow the existing subsequent merge-by-index behavior. Required values remain subject to their owning capability's validation. Validate both effective runtime settings and rejection paths; importing a property file directly in a test observes declarations rather than resolved settings."
        },
        {
          "kind": "paragraph",
          "text": "Regression coverage: `configurationBindingContract.test.js` exercises the real nConfig server/configuration load paths, nested overrides, independent copies, custom domains, environment/conditional values, cycles and malformed bindings. Customer acceptance should include every supported environment and composition, ports/routes, authority maps, secret overrides and empty selections. Binding resolution itself performs no business writes or network calls."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Build exclusion and interrupted-build recovery",
          "anchor": "configurationRuntimeBehaviorManagement-14-build-exclusion-and-interrupted-build-recovery"
        },
        {
          "kind": "paragraph",
          "text": "A build or clean acquires an atomic filesystem lock adjacent to the selected server's `generated/build.json`. The lock covers entity generation, module hooks and completion-manifest publication. A second writer for the same server fails before cleanup; another server may proceed in a separate process. Startup also rejects a held lock or missing/stale completion manifest."
        },
        {
          "kind": "paragraph",
          "text": "Normal failure releases the lock and preserves the original error. A killed process may leave the lock behind. Verify that the original writer has stopped, remove only that server's `generated/build.json.lock` directory, and rebuild the selected server. Never remove a live writer's lock or use a timeout to assume that it is safe. This mechanism protects local filesystem build ownership; it does not replace deployment rollout coordination or certify network-filesystem locking semantics."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Generated output containment",
          "anchor": "configurationRuntimeBehaviorManagement-15-generated-output-containment"
        },
        {
          "kind": "paragraph",
          "text": "Build and clean first check every generated path before acquiring their server lock or modifying files. A server must lie within the selected project, and links below that project root cannot redirect generated output. A symlinked project checkout itself is supported. If a generated folder or its parent is a symlink, correct the server layout and rerun the same selected-server command; do not remove unrelated data or bypass the check. This protects other servers and shared framework sources while keeping one generated set for all nodes of the server."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Defaults that stay with their owners",
          "anchor": "configurationRuntimeBehaviorManagement-16-defaults-that-stay-with-their-owners"
        },
        {
          "kind": "paragraph",
          "text": "A project selects its business and deployment choices while the owning capability supplies technical defaults. The following examples show the important boundaries."
        },
        {
          "kind": "table",
          "headers": [
            "Configuration",
            "Inherited owner behavior",
            "Project or deployment choice"
          ],
          "rows": [
            [
              "API exposure",
              "Each capability declares its categories; nRouter enforces them",
              "Intentional category denies or an explicit compatibility exception"
            ],
            [
              "Copilot conversation API",
              "Disabled until selected",
              "`copilot.api.enabled`, authorized sources and qualified providers"
            ],
            [
              "Application preparation",
              "BackOffice target mechanics and nImport profile templates",
              "Target connection, enabled profiles, exact approved releases"
            ],
            [
              "Database and search",
              "Existing consumer default merge",
              "Participating modules, isolated databases, provider and fallback policy"
            ],
            [
              "Runtime authority",
              "nService resolves only explicitly selected context defaults",
              "Common context and exact schema/module exceptions"
            ],
            [
              "Local reset",
              "Inert owner inventories and transport defaults",
              "Explicit enablement, targets, environment allowlist and confirmations"
            ],
            [
              "Shipping and returns",
              "Fulfillment validates the method contract",
              "Offered methods, prices, currency, promises and eligibility"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely: exact collections",
          "anchor": "configurationRuntimeBehaviorManagement-17-customize-and-extend-safely-exact-collections"
        },
        {
          "kind": "paragraph",
          "text": "A shorter ordinary array still has legacy positional merge behavior. Declare a complete selection explicitly:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  fulfillmentCore: { customerShipping: { methods: {\n    $config: 'replace',\n    value: [{ code: 'LOCAL_COURIER', price: '4.00', currency: 'GBP', requiresAddress: true }]\n  } } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use `value: []` to select no methods. To change entries by identity, use `{ $config: 'keyed', key: 'code', entries: [{ code: 'LOCAL_COURIER', enabled: false }], remove: ['PICKUP'] }`. Existing identities keep their order; new identities append. Reordering uses complete replacement. A nested source `paths` list also needs replacement when reducing its scope. Duplicate identities, simultaneous update/removal and malformed operations fail before configuration changes. Other tenants retain their own settings; a failed all-tenant update publishes none of its candidates."
        },
        {
          "kind": "paragraph",
          "text": "API categories and enablement are separate from permission. An unknown category is denied by default; migrating older custom routes requires declaring their category in the customer capability. Copilot's API switch is `copilot.api.enabled`; remove retired `copilot.enabled` and `copilot.core.enabled` switches."
        },
        {
          "kind": "paragraph",
          "text": "A shared endpoint binding resolves when its server contribution loads. Override `servers.<alias>` in a later node when changing that node's destination. BackOffice targets and nImport profile templates resolve at consumption time, so their owning defaults can combine with later deployment selections without forward references during discovery."
        },
        {
          "kind": "paragraph",
          "text": "Framework shipping and return lists are empty until a store selects them. Package and content metadata does not select a release version: approved immutable version pins remain explicit. A remote workflow uses an allowed protocol and connection alias; the target domain retains validation, permissions and persistence."
        },
        {
          "kind": "paragraph",
          "text": "When migrating, first preserve a configuration/consumer comparison, then remove repeated declarations, run the focused owner and customer tests, and restart through the existing lifecycle path. A rejected configuration update preserves the previous effective value; a stale running process is not evidence that new source values were applied. Never dump credentials or complete effective configuration into diagnostics."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime callback authority",
          "anchor": "configurationRuntimeBehaviorManagement-18-runtime-callback-authority"
        },
        {
          "kind": "paragraph",
          "text": "A module's transport settings select a peer; they do not prove a business action was approved. Remote Process actions use the existing scoped service identity and a current single-claim execution held by Process. Receiving domains claim authoritative context, enforce their own revision/lifecycle rules and preserve idempotency on governed retries. Human access tokens and supplied decision payloads cannot substitute for that boundary. Task and immutable execution records remain under the owning lifecycle APIs, including generic CRUD denial."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Minimal topology and shared deployment references",
          "anchor": "configurationRuntimeBehaviorManagement-19-minimal-topology-and-shared-deployment-references"
        },
        {
          "kind": "paragraph",
          "text": "A partner supplies each deployment value once and inherits general capability defaults. nConfig automatically activates the selected environment, server and node; `activeModules.modules` contains additional capabilities/providers only. This also applies to generated topologies, including an empty optional selection. A server inherits its environment's unchanged database URI while retaining its isolated database name and intentional exceptions."
        },
        {
          "kind": "paragraph",
          "text": "Peer aliases reference a canonical environment endpoint through existing `ref` bindings. Keep each alias's `remoteOnly`, advertised address and protocol shape; an HTTP-only alias must not acquire HTTPS fields during cleanup. Change the canonical endpoint before environment loading, or override the actual `servers.<alias>.endpoint` in a later node/tenant contribution. Missing or cyclic references fail preparation. References are resolved values, not live links."
        },
        {
          "kind": "paragraph",
          "text": "Retain equal security, authority and provider qualification pins only with their purpose and review trigger documented. Do not infer credentials, grants, ports, publication permission or reset scope from names. Before adopting a reduction, compare prepared module graphs and effective values, then exercise empty/reordered composition, canonical endpoint changes and later consumer overrides. Preparation is not live provider or authenticated deployment acceptance."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Consumer defaults and property ownership",
          "anchor": "configurationRuntimeBehaviorManagement-20-consumer-defaults-and-property-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Check the consumer before copying configuration. Database/search modules merge selected module entries with the environment/default connection, so participation can remain explicit without repeating connection values. Environment-level release class and shared provider addresses stay in the environment. Capabilities that are not active must not gain configuration merely to make a file look complete."
        },
        {
          "kind": "paragraph",
          "text": "For CORS, nRouter owns header baselines and empty `allowedHeaderOverrides` / `exposedHeaderOverrides` maps. An application declares only additions/removals as header-name booleans. Baseline names match case-insensitively; keep map key spelling consistent across layers and reject conflicting case variants. An override does not enable CORS, permit an origin or allow credentials. Explicit list replacement and normal nConfig collection semantics remain available."
        },
        {
          "kind": "paragraph",
          "text": "A complete refactor classifies every remaining declaration and validates the actual consumers. Raw configuration equality alone misses copied defaults and can also mistake safe representation changes for changed runtime behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Origins from configured frontend endpoints",
          "anchor": "configurationRuntimeBehaviorManagement-21-origins-from-configured-frontend-endpoints"
        },
        {
          "kind": "paragraph",
          "text": "nRouter constructs browser origins from `httpHardening.cors.originEndpoints`, using framework `originDefaults` of HTTP and localhost for structured `{ code, port }` entries. A keyed endpoint map also accepts full origin URLs. nRouter supplies enabled CORS and standard localhost application origins (Axis 3100, Nexus 3200, Agora 3300/3400/3500, Circa 3600). Deployments declare only changed origins or restrictions in existing security properties. nRouter never reads frontend lifecycle metadata. Backend startup and API tests require no frontend repository or running UI. Host and port values must be the published frontend addresses seen by the browser, including reverse-proxy or container mapping."
        },
        {
          "kind": "paragraph",
          "text": "For a custom project/environment, override `originDefaults.host` and `.protocol` for structured endpoints, or supply exact URL endpoint values. Replace the endpoint collection using `$config: 'replace'` when changing the deployment. `originEndpointOverrides: { store: false }` denies the named frontend and follows its changed host/port. Explicit allowed origins remain additive; every explicit or endpoint denial wins. Clear obsolete identity overrides when replacing sources. CORS activates for declared browser endpoints, with credential support and exact origin enforcement. Explicit false disables it; no declared endpoints grants no origins."
        },
        {
          "kind": "paragraph",
          "text": "Only declared sources are used. No request header or backend-listener discovery can grant an origin. Missing endpoint fields, duplicate frontend codes, unknown restriction codes, malformed ports/URLs and unsafe endpoint data reject. Source metadata is read at configuration load; later resolved property changes are observed by the router. Authored endpoint edits require normal configuration reload."
        },
        {
          "kind": "paragraph",
          "text": "The complete Local and custom-HTTPS examples, explicit-origin alternative and collection replacement guidance are in `nRouter/llm/examples/README.md#configure-browser-origins`; the exact behavior and failure contract is in `nRouter/llm/contracts/README.md#configured-browser-origin-construction`. Project owners supply deployment choices; framework maintainers own construction, validation and regression coverage. Operators validate browser access after the normal build/restart; prepared configuration checks alone do not prove deployment."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Mandatory configuration ownership restrictions",
          "anchor": "configurationRuntimeBehaviorManagement-22-mandatory-configuration-ownership-restrictions"
        },
        {
          "kind": "paragraph",
          "text": "Framework providers own Local infrastructure defaults, including Elasticsearch at `http://localhost:9200`. A Local customer inherits them. Other environments supply only actual connection differences. Runtime composition and deployment credentials remain explicit; framework policy must not be copied into customer layers."
        },
        {
          "kind": "paragraph",
          "text": "The environment descriptor and profile binding are retired. nConfig projects peer endpoints from their owning server properties while preserving contribution timing, node overrides and cycle checks. Existing metadata supplies module identity and package versions. Optional application composition uses `activeModules.compositions`."
        },
        {
          "kind": "paragraph",
          "text": "nAuth binds deployment secrets through existing configuration inputs and keeps bootstrap proof separate from current runtime proof. Shared auth state remains strict; no compatibility bypass or credential rotation is part of cleanup. Profile owns initializer identity checks and runtime grants. nImport uses `environment.class` and permits authorized manual Sample execution while only Init can run on startup. Project validation and principle audit enforce the nSetup configuration restrictions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "MongoDB default database names",
          "anchor": "configurationRuntimeBehaviorManagement-23-mongodb-default-database-names"
        },
        {
          "kind": "paragraph",
          "text": "The MongoDB adapter under nDatabase supplies `masterLocal` and `testLocal` at `database.default.mongodb.master.databaseName` and `.test.databaseName`. Projects and Local environments omit unchanged values. Server/node/tenant layers retain explicitly isolated names, and container deployments retain their genuine connection and database differences. Changing defaults does not rename or migrate existing databases; an explicit override continues to select its existing database."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Redis default prefix",
          "anchor": "configurationRuntimeBehaviorManagement-24-redis-default-prefix"
        },
        {
          "kind": "paragraph",
          "text": "The nCache Redis provider supplies `localRuntimeAuth` at `cache.default.engines.redis.options.prefix`. Redis remains disabled by default; a Local environment selecting the provider enables it with `enabled: true` and inherits unchanged options. Later layers may override the prefix for deployment isolation. Engine startup and channel/module/tenant key construction continue to follow nCache's existing behavior; this option does not enable an engine or channel."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Capability-owned acceptance tooling",
          "anchor": "configurationRuntimeBehaviorManagement-25-capability-owned-acceptance-tooling"
        },
        {
          "kind": "paragraph",
          "text": "Shared acceptance defaults live in the owning module: nTooling supplies common journey selection, Waste Core supplies Waste checks, BackOffice supplies registry checks, and CMS supplies guided publication mechanics. The existing tooling reader merges these inert contributions before project and deployment overrides. `projectRuntime` selects a declared server by code or semantic role; missing or ambiguous matches fail. Ports, labels and launch commands come from that server. Enabled initialization profiles come from its data-release configuration. Reading these defaults never starts services, imports data or activates optional modules."
        },
        {
          "kind": "paragraph",
          "text": "The Nexus accelerator illustrates content ownership: `nexusCore` supplies inert administrative/acceptance descriptors, while `nexus.web` owns immutable reference releases and CMS/media defaults. Platform selects only the descriptor capability; WCMS and Engagement select their required content contribution. Customer projects keep application overrides and explicit composition, with one source owner per pack."
        }
      ],
      "searchText": "Application Configuration and Runtime Behavior Management How configuration layers, provider choices, runtime settings, and project overrides change Nodics behavior safely. # Application Configuration and Runtime Behavior Management\n\nNodics supplies reusable capability defaults. A customer chooses the capabilities and business policy it needs; an operator supplies deployment values. Keeping those decisions separate makes a project easier to understand and upgrade. Environment, server and node properties should express intentional differences, not a copied configuration manual.\n\nFor beginners, start with one already working server. Identify the capability's configuration owner, change one supported value and run preparation before starting the runtime. Expand the change only after that smallest example works.\n\n## Business context\n\nA partner should be able to answer three questions before editing a value: what behavior changes, who owns it, and which runtime should see it. For example, changing a catalogue candidate limit is a Product policy decision; changing a listening port is a deployment decision. Both use configuration, but they belong at different boundaries and have different verification needs.\n\n| Reader | Start here |\n| --- | --- |\n| Business evaluator | Choose the desired capability and business outcome; technical defaults should not become mandatory setup questions. |\n| Application developer | Find the owning capability and its supported keys, then write the smallest customer override. |\n| Administrator/operator | Supply endpoints, required secret references and deployment policy at the environment/server boundary. |\n| Framework maintainer or AI tool | Prove ownership, activation, index order, merge behavior and compatibility before relocating configuration. |\n\n## Journey and ownership\n\nnConfig owns loading and the runtime registry. Each capability owns the meaning, defaults and validation of its configuration. Foundation is the common framework dependency, but that does not make every setting a Foundation-owned setting.\n\n| Configuration or behavior | Authoritative home |\n| --- | --- |\n| Cookie defaults and session policy | Profile capability |\n| Catalogue limits and discovery behavior | Product capability |\n| Customer store identity and application choices | Customer project/application configuration |\n| Shared customer administration descriptors | A project configuration module explicitly selected by the administrative runtime |\n| Standard CORS and database defaults | Owning framework capabilities (nRouter and MongoDB) |\n| Changed CORS origins and database deployment settings | Environment configuration |\n| Active module composition, ports and isolated database names | Server configuration |\n| Instance-specific differences | Node configuration |\n| Shared build/start/validation mechanics | Foundation's non-runtime nTooling package |\n| Development principles and contracts | Foundation's non-runtime nSetup package |\n| Governed tenant/runtime changes | Existing tenant and persisted-configuration mechanisms |\n\nA module containing only configuration does not start an independent server. However, `runtimeModule: false` has a specific meaning: runtime discovery and activation exclude that package. Extending Foundation does not automatically load non-runtime children's properties. nTooling reads its own tooling configuration through its declared entry point; that is different from runtime capability inheritance. Do not make runtime configuration depend on activating nTooling or nSetup.\n\nShared tooling should receive the selected project root, environment, server and optional node through the existing command context. It should derive canonical identities from package/topology metadata and resolve deployment values from their owners. Moving customer-specific script logic into Foundation without removing hardcoded customer names is not reusable tooling.\n\nThe established loading sequence is:\n\n1. nConfig base properties;\n2. active module `config/properties.js` files in module index order;\n3. configured `externalPropertyFile` entries;\n4. tenant properties through the existing enterprise/tenant mechanism;\n5. persisted runtime configuration through its governed lifecycle.\n\n```mermaid\nflowchart LR\n  Base[\"nConfig base\"] --> Modules[\"Active properties in index order\"]\n  Modules --> External[\"External properties\"]\n  External --> Tenant[\"Tenant properties\"]\n  Tenant --> Persisted[\"Governed persisted configuration\"]\n```\n\nThe selected topology layers are project, environment, server, then optional node. Their indexes must preserve that sequence. A custom capability under `modules/` does not automatically precede a server: its actual index determines when its properties load. Place shared defaults before the intended override layers and verify the prepared runtime. Preserve the existing metadata and loader contracts rather than introducing another configuration registry.\n\n## Data and configuration detail\n\nClassify every proposed setting before adding it:\n\n| Category | Customer action | Example |\n| --- | --- | --- |\n| Required deployment input | Provide the real value/reference through the supported environment mechanism. | Database target or credential reference |\n| Inherited default | Omit it when the owner's policy is suitable. | Profile refresh-cookie name or Product read-page limit |\n| Optional advanced override | Declare only the changed key and explain the reason. | A larger Product candidate budget |\n| Intentional compatibility/security pin | Keep the explicit value with an owner and review trigger. | A provider sandbox restriction during qualification |\n| Generated/runtime state | Let its established lifecycle manage it. | Logs, generated files or persisted runtime settings |\n\nDo not move development credentials, sample store names, customer URLs or machine-local paths into reusable framework defaults. A value matching the framework can still be wrongly owned. Correct the framework owner and preserve that customer's choice explicitly during migration.\n\nOmission means inheritance. It does not remove an inherited property. Current nConfig uses Lodash `merge`; nested objects merge recursively and arrays merge by position. For example:\n\n```js\nmerge({}, {targets: ['first', 'second']}, {targets: ['replacement']});\n// {targets: ['replacement', 'second']}\n```\n\nAn empty or shorter array is not a universal disable/delete operation. Use the owning capability's supported enablement/removal contract, or retain the full intended declaration and verify the effective result. This is especially important for reset targets, activation lists and data-package inventories.\n\n## Customization and extension\n\n### Customize and extend safely\n\nSuppose an existing server already activates Product and needs a larger catalogue candidate budget. Its override can be this small:\n\n```js\nmodule.exports = {\n    product: {\n        discovery: {\n            catalogue: {maximumCandidates: 800}\n        }\n    }\n};\n```\n\nThis example shows a configuration difference, not a complete new server. Retain that server's existing composition and deployment settings. Product's other catalogue defaults remain inherited. Validate the resulting configuration and measure query cost before production tuning.\n\nFor a value shared by several customer runtimes, use the owning active customer module and an index before its intended environment/server overrides. Select that module only where it is needed. Do not activate a WCMS or Commerce module merely to obtain an administration descriptor, because its dependencies can change the runtime graph. Customer administration composition may share such descriptors while the framework retains orchestration, permissions and imports.\n\nA later node can override one scalar without repeating the server:\n\n```js\nmodule.exports = {\n    product: {discovery: {catalogue: {maximumCandidates: 400}}}\n};\n```\n\nBuild and start the intended server/node through the established project command path. Confirm the node belongs to the selected server and verify its prepared configuration. Configuration changes do not, by themselves, grant access, create stores, install data or activate an application.\n\n### Rejected placement\n\nCopying an entire Profile configuration into an environment freezes defaults that should be inherited. Moving a customer's application profiles into a Foundation default makes unrelated customers inherit that customer's policy. Replacing a large properties file with a large sibling helper retains the same maintenance burden. Correct each case by moving data to its owner and keeping only intentional differences at the consuming boundary.\n\n## Operations and governance\n\nStartup-only properties require the owning runtime's normal restart/deployment procedure. Runtime-refreshable values use the existing governed APIs and permissions. Editing a source file does not prove that a running process has loaded it. Keep secret values out of logs, documentation and comparison reports.\n\nPreserve explicit operational safeguards during refactoring:\n\n- module activation and API exposure retain their existing authority;\n- local reset opt-in, environment allowlist, confirmation and service inventory remain governed by their owning reset contracts;\n- data-package declarations do not trigger imports on their own;\n- remote endpoint declarations do not activate the remote capability locally;\n- later tenant and persisted configuration remain separate from authored defaults.\n\n### Migration and rollback\n\nCapture the effective prepared configuration before moving values. Check every affected runtime, including an unselected runtime and relevant optional compositions. Compare the result after the change and account for intentional module additions separately. Do not publish secret-bearing snapshots.\n\nCart and Shopping List require explicit store context and no longer consume `customerApi.defaultStoreCode`. Keep the application's store choice at the customer boundary and send it with operations; moving a sample identity into a framework fallback is not valid configuration inheritance. Existing carts are not rewritten: retain saved IDs and plan explicit migration for callers that previously relied on fallback selection. Identifier validation does not replace Store master-data, tenant, ownership or selling-context checks.\n\nTo roll back a configuration relocation, restore its previous declarations and module selection together, then run preparation and focused acceptance again. Do not remove a shared module while leaving consumers dependent on its values. Roll back only the scoped change; preserve unrelated work and runtime data.\n\n## Common mistakes\n\n| Symptom | Likely cause | Recovery |\n| --- | --- | --- |\n| Moved defaults disappear | Their owner is inactive or non-runtime. | Check metadata and the effective module list; use the proper runtime owner. |\n| A server override loses | A defaults module loads later by index. | Correct ordering and test the selected topology. |\n| An unwanted array entry remains | A shorter array was merged by index. | Use supported removal semantics or a complete verified declaration. |\n| Unrelated runtimes receive application profiles | A shared module was selected too broadly. | Restrict composition and verify an unselected runtime. |\n| Local values appear in another environment | Deployment choices were promoted to shared defaults. | Restore the values to their environment/server owner. |\n| Source looks correct but live behavior differs | The process is stale or a later runtime layer overrides it. | Inspect the actual runtime, later configuration and normal restart path. |\n\n## Verification\n\nFrom the framework repository, run the focused loading and validation contracts:\n\n```sh\nnode nodics.foundation/modules/nConfig/test/configurationOwnershipContract.test.js\nnode nodics.foundation/modules/nConfig/test/configurationValidation.test.js\nnode --test nodics.commerce/modules/checkout/modules/cart/test/cartCustomerApiContract.test.js\nnpm run llm:generate\nnpm run llm:validate\nnpm --prefix nodics.docs test\nnpm run quality:docs\n```\n\nAlso run the consuming project's real `prepareStart` scenarios and tests for its explicit overrides. Preparation proves configuration resolution and module composition; it does not prove network connectivity, database operations, authenticated browser acceptance or a running deployment. Report those levels of evidence separately.\n\nContinue with Framework Startup Lifecycle for startup sequencing and Governed Runtime Change for persisted settings and runtime permissions. The permanent implementation rule is `nodics.foundation/modules/nSetup/llm/contracts/customer-config-classification-contract.md`.\n\n## Capability inventories and project tooling\n\nA capability can declare inert maintenance metadata in its own configuration. For Local reset, use `localResetProvider.contributions.<module>.serviceNames` with keyed booleans. A server selects only intended modules, for example `modules: { inventory: true, cms: false }`, and can remove an optional inherited service with `serviceOverrides: { DefaultInventoryAdjustmentService: false }`. Enablement, environment allowlist, service-token authority, confirmation, maximum scope and required services remain nSystem checks. This is never an automatic inventory of all database collections. Search targets remain explicit.\n\nInitialization uses the existing nImport release manifests and category/destination selection. A Foundation profile may select Core releases without copying every capability's record definitions into server properties. Keep application-specific bundles, labels and deployment targets in project layers.\n\nProject command execution remains in nTooling. Applications declare their own server aliases, customer acceptance scripts and media seeds through `nodics.project.json` tooling commands and script ownership. Generic commands do not assume a named storefront or website. Documentation generation uses the application catalogue's `publication` identifiers, routes, labels and channels. Use stable record prefixes; changing a prefix is a content-identity change rather than a cosmetic rename. The data-manifest tool only refreshes declared development checksums and refuses to rewrite an immutable release after content changes.\n\n## Installed project command\n\nFoundation's package `bin.nodics` points to the existing nTooling project bridge. A declared compatible Foundation dependency installs `node_modules/.bin/nodics`; normal npm scripts resolve it automatically. The bridge reads the chosen project's `.env`, resolves its configured framework checkout or its own checkout, and dispatches to the existing tooling registry. No project-owned JavaScript launcher is required. Local checkout dependencies remain explicit `file:` references in package/lockfiles; this is not an unpinned package fetch or a claim of a published npm release.\n\n```sh\nnpm exec -- nodics start --env qa --server jobs --node worker1\nnpm exec -- nodics build --env qa --server jobs\nnpm exec -- nodics clean --env qa --server jobs\nnpm exec -- nodics project:validate\n```\n\n`--env` aliases `--environment`; `--project` aliases `--home`. Target options accept both `--name=value` and `--name value`. Duplicate or missing target values fail. Start resolves the explicit server through its existing package topology; optional nodes use nConfig's existing node selector. Build/clean require a server and retain server-owned output shared by nodes. They do not infer an environment-wide build. CLI targets take precedence over environment-file defaults. Selection is restored after an awaited runtime lifecycle, including failure. Credentials stay in the existing external/environment/secret authority and are never CLI examples.\n\nThe same registry still accepts its existing command names. Customer acceptance aliases remain opt-in `project:run` commands. Qualification/release commands retain the framework home established by the project bridge. Changing command packaging does not imply permission to run a deployment, release, reset or live acceptance.\n\n## Declarative property bindings\n\nProject, environment, server, node and tenant property contributions resolve through nConfig at the existing load boundary before the usual layered merge. The same resolver supplies the existing nTooling environment composition helper. Configuration files export data; they do not execute project composition loops, read sibling environment builders, or implement their own environment resolver. This does not add another configuration store, provider registry or load order.\n\nUse an explicit `$config` object only when a value needs resolution:\n\n- `env`: `name`, optional `fallback` and `type` (`string`, `number`, `boolean`). Names are explicit uppercase environment variable names. Unset/empty values use the fallback; absent fallbacks omit the contribution. Booleans accept only `true`/`false`, and numbers must be finite. Secret values stay in the deployment environment; errors name the field without printing its value.\n- `ref`: `path` as an array of keys (preferred for keys containing dots), or a dotted path. Reads the current contribution plus earlier effective properties, returns an independent value, and rejects missing/cyclic/unsafe references.\n- `context`: one of `projectCode`, `environmentCode`, `serverCode`, `nodeCode` from the selected runtime.\n- `path`: a `base` of `project`, `framework`, `environment`, `server`, `file`, or a binding that resolves to an absolute path, plus a `relative` string. This supports explicit sibling checkout paths; it is not a filesystem sandbox.\n- `composition`: the effective `activeModules.compositions` entry selected by `name` and optional `field`. Its declared `environmentVariable` chooses domains; `emptySelections` declares aliases, with only `none` supplied by default. No application identity or environment-variable name is inferred by nConfig.\n- `selected`: composition `name`, array `field`, `includes`, `value`, optional `otherwise`. An omitted alternative omits that property/array contribution.\n- `all`: a bounded nonempty `values` array of boolean values or bindings.\n\nBindings inside arrays may declare `spread: true` to expand an array result. Spread is rejected outside arrays or for a non-array result. Unknown operators, unrecognized operator fields, invalid values, unsafe paths, and resolution beyond 64 levels/250,000 nodes reject loading. These are finite value operators, not an expression language: no script, function, arbitrary provider or code evaluation.\n\n```js\nmodule.exports = {\n    database: {\n        default: { mongodb: { master: {\n            URI: { $config: 'env', name: 'DATABASE_URI' },\n            databaseName: 'warehouseQa'\n        } } },\n        inventory: { $config: 'ref', path: ['database', 'default'] }\n    },\n    activeModules: { modules: [\n        'warehouseRuntime',\n        { $config: 'composition', name: 'business', field: 'projectPacks', spread: true }\n    ] }\n};\n```\n\nLater layers can replace a binding with a literal or change its referenced source. Resolution does not mutate imported source objects, and resolved arrays still follow the existing subsequent merge-by-index behavior. Required values remain subject to their owning capability's validation. Validate both effective runtime settings and rejection paths; importing a property file directly in a test observes declarations rather than resolved settings.\n\nRegression coverage: `configurationBindingContract.test.js` exercises the real nConfig server/configuration load paths, nested overrides, independent copies, custom domains, environment/conditional values, cycles and malformed bindings. Customer acceptance should include every supported environment and composition, ports/routes, authority maps, secret overrides and empty selections. Binding resolution itself performs no business writes or network calls.\n\n### Build exclusion and interrupted-build recovery\n\nA build or clean acquires an atomic filesystem lock adjacent to the selected server's `generated/build.json`. The lock covers entity generation, module hooks and completion-manifest publication. A second writer for the same server fails before cleanup; another server may proceed in a separate process. Startup also rejects a held lock or missing/stale completion manifest.\n\nNormal failure releases the lock and preserves the original error. A killed process may leave the lock behind. Verify that the original writer has stopped, remove only that server's `generated/build.json.lock` directory, and rebuild the selected server. Never remove a live writer's lock or use a timeout to assume that it is safe. This mechanism protects local filesystem build ownership; it does not replace deployment rollout coordination or certify network-filesystem locking semantics.\n\n### Generated output containment\n\nBuild and clean first check every generated path before acquiring their server lock or modifying files. A server must lie within the selected project, and links below that project root cannot redirect generated output. A symlinked project checkout itself is supported. If a generated folder or its parent is a symlink, correct the server layout and rerun the same selected-server command; do not remove unrelated data or bypass the check. This protects other servers and shared framework sources while keeping one generated set for all nodes of the server.\n\n## Defaults that stay with their owners\n\nA project selects its business and deployment choices while the owning capability supplies technical defaults. The following examples show the important boundaries.\n\n| Configuration | Inherited owner behavior | Project or deployment choice |\n| --- | --- | --- |\n| API exposure | Each capability declares its categories; nRouter enforces them | Intentional category denies or an explicit compatibility exception |\n| Copilot conversation API | Disabled until selected | `copilot.api.enabled`, authorized sources and qualified providers |\n| Application preparation | BackOffice target mechanics and nImport profile templates | Target connection, enabled profiles, exact approved releases |\n| Database and search | Existing consumer default merge | Participating modules, isolated databases, provider and fallback policy |\n| Runtime authority | nService resolves only explicitly selected context defaults | Common context and exact schema/module exceptions |\n| Local reset | Inert owner inventories and transport defaults | Explicit enablement, targets, environment allowlist and confirmations |\n| Shipping and returns | Fulfillment validates the method contract | Offered methods, prices, currency, promises and eligibility |\n\n### Customize and extend safely: exact collections\n\nA shorter ordinary array still has legacy positional merge behavior. Declare a complete selection explicitly:\n\n```js\nmodule.exports = {\n  fulfillmentCore: { customerShipping: { methods: {\n    $config: 'replace',\n    value: [{ code: 'LOCAL_COURIER', price: '4.00', currency: 'GBP', requiresAddress: true }]\n  } } }\n};\n```\n\nUse `value: []` to select no methods. To change entries by identity, use `{ $config: 'keyed', key: 'code', entries: [{ code: 'LOCAL_COURIER', enabled: false }], remove: ['PICKUP'] }`. Existing identities keep their order; new identities append. Reordering uses complete replacement. A nested source `paths` list also needs replacement when reducing its scope. Duplicate identities, simultaneous update/removal and malformed operations fail before configuration changes. Other tenants retain their own settings; a failed all-tenant update publishes none of its candidates.\n\nAPI categories and enablement are separate from permission. An unknown category is denied by default; migrating older custom routes requires declaring their category in the customer capability. Copilot's API switch is `copilot.api.enabled`; remove retired `copilot.enabled` and `copilot.core.enabled` switches.\n\nA shared endpoint binding resolves when its server contribution loads. Override `servers.<alias>` in a later node when changing that node's destination. BackOffice targets and nImport profile templates resolve at consumption time, so their owning defaults can combine with later deployment selections without forward references during discovery.\n\nFramework shipping and return lists are empty until a store selects them. Package and content metadata does not select a release version: approved immutable version pins remain explicit. A remote workflow uses an allowed protocol and connection alias; the target domain retains validation, permissions and persistence.\n\nWhen migrating, first preserve a configuration/consumer comparison, then remove repeated declarations, run the focused owner and customer tests, and restart through the existing lifecycle path. A rejected configuration update preserves the previous effective value; a stale running process is not evidence that new source values were applied. Never dump credentials or complete effective configuration into diagnostics.\n\n## Runtime callback authority\n\nA module's transport settings select a peer; they do not prove a business action was approved. Remote Process actions use the existing scoped service identity and a current single-claim execution held by Process. Receiving domains claim authoritative context, enforce their own revision/lifecycle rules and preserve idempotency on governed retries. Human access tokens and supplied decision payloads cannot substitute for that boundary. Task and immutable execution records remain under the owning lifecycle APIs, including generic CRUD denial.\n\n## Minimal topology and shared deployment references\n\nA partner supplies each deployment value once and inherits general capability defaults. nConfig automatically activates the selected environment, server and node; `activeModules.modules` contains additional capabilities/providers only. This also applies to generated topologies, including an empty optional selection. A server inherits its environment's unchanged database URI while retaining its isolated database name and intentional exceptions.\n\nPeer aliases reference a canonical environment endpoint through existing `ref` bindings. Keep each alias's `remoteOnly`, advertised address and protocol shape; an HTTP-only alias must not acquire HTTPS fields during cleanup. Change the canonical endpoint before environment loading, or override the actual `servers.<alias>.endpoint` in a later node/tenant contribution. Missing or cyclic references fail preparation. References are resolved values, not live links.\n\nRetain equal security, authority and provider qualification pins only with their purpose and review trigger documented. Do not infer credentials, grants, ports, publication permission or reset scope from names. Before adopting a reduction, compare prepared module graphs and effective values, then exercise empty/reordered composition, canonical endpoint changes and later consumer overrides. Preparation is not live provider or authenticated deployment acceptance.\n\n### Consumer defaults and property ownership\n\nCheck the consumer before copying configuration. Database/search modules merge selected module entries with the environment/default connection, so participation can remain explicit without repeating connection values. Environment-level release class and shared provider addresses stay in the environment. Capabilities that are not active must not gain configuration merely to make a file look complete.\n\nFor CORS, nRouter owns header baselines and empty `allowedHeaderOverrides` / `exposedHeaderOverrides` maps. An application declares only additions/removals as header-name booleans. Baseline names match case-insensitively; keep map key spelling consistent across layers and reject conflicting case variants. An override does not enable CORS, permit an origin or allow credentials. Explicit list replacement and normal nConfig collection semantics remain available.\n\nA complete refactor classifies every remaining declaration and validates the actual consumers. Raw configuration equality alone misses copied defaults and can also mistake safe representation changes for changed runtime behavior.\n\n## Origins from configured frontend endpoints\n\nnRouter constructs browser origins from `httpHardening.cors.originEndpoints`, using framework `originDefaults` of HTTP and localhost for structured `{ code, port }` entries. A keyed endpoint map also accepts full origin URLs. nRouter supplies enabled CORS and standard localhost application origins (Axis 3100, Nexus 3200, Agora 3300/3400/3500, Circa 3600). Deployments declare only changed origins or restrictions in existing security properties. nRouter never reads frontend lifecycle metadata. Backend startup and API tests require no frontend repository or running UI. Host and port values must be the published frontend addresses seen by the browser, including reverse-proxy or container mapping.\n\nFor a custom project/environment, override `originDefaults.host` and `.protocol` for structured endpoints, or supply exact URL endpoint values. Replace the endpoint collection using `$config: 'replace'` when changing the deployment. `originEndpointOverrides: { store: false }` denies the named frontend and follows its changed host/port. Explicit allowed origins remain additive; every explicit or endpoint denial wins. Clear obsolete identity overrides when replacing sources. CORS activates for declared browser endpoints, with credential support and exact origin enforcement. Explicit false disables it; no declared endpoints grants no origins.\n\nOnly declared sources are used. No request header or backend-listener discovery can grant an origin. Missing endpoint fields, duplicate frontend codes, unknown restriction codes, malformed ports/URLs and unsafe endpoint data reject. Source metadata is read at configuration load; later resolved property changes are observed by the router. Authored endpoint edits require normal configuration reload.\n\nThe complete Local and custom-HTTPS examples, explicit-origin alternative and collection replacement guidance are in `nRouter/llm/examples/README.md#configure-browser-origins`; the exact behavior and failure contract is in `nRouter/llm/contracts/README.md#configured-browser-origin-construction`. Project owners supply deployment choices; framework maintainers own construction, validation and regression coverage. Operators validate browser access after the normal build/restart; prepared configuration checks alone do not prove deployment.\n\n## Mandatory configuration ownership restrictions\n\nFramework providers own Local infrastructure defaults, including Elasticsearch at `http://localhost:9200`. A Local customer inherits them. Other environments supply only actual connection differences. Runtime composition and deployment credentials remain explicit; framework policy must not be copied into customer layers.\n\nThe environment descriptor and profile binding are retired. nConfig projects peer endpoints from their owning server properties while preserving contribution timing, node overrides and cycle checks. Existing metadata supplies module identity and package versions. Optional application composition uses `activeModules.compositions`.\n\nnAuth binds deployment secrets through existing configuration inputs and keeps bootstrap proof separate from current runtime proof. Shared auth state remains strict; no compatibility bypass or credential rotation is part of cleanup. Profile owns initializer identity checks and runtime grants. nImport uses `environment.class` and permits authorized manual Sample execution while only Init can run on startup. Project validation and principle audit enforce the nSetup configuration restrictions.\n\n## MongoDB default database names\n\nThe MongoDB adapter under nDatabase supplies `masterLocal` and `testLocal` at `database.default.mongodb.master.databaseName` and `.test.databaseName`. Projects and Local environments omit unchanged values. Server/node/tenant layers retain explicitly isolated names, and container deployments retain their genuine connection and database differences. Changing defaults does not rename or migrate existing databases; an explicit override continues to select its existing database.\n\n## Redis default prefix\n\nThe nCache Redis provider supplies `localRuntimeAuth` at `cache.default.engines.redis.options.prefix`. Redis remains disabled by default; a Local environment selecting the provider enables it with `enabled: true` and inherits unchanged options. Later layers may override the prefix for deployment isolation. Engine startup and channel/module/tenant key construction continue to follow nCache's existing behavior; this option does not enable an engine or channel.\n\n## Capability-owned acceptance tooling\n\nShared acceptance defaults live in the owning module: nTooling supplies common journey selection, Waste Core supplies Waste checks, BackOffice supplies registry checks, and CMS supplies guided publication mechanics. The existing tooling reader merges these inert contributions before project and deployment overrides. `projectRuntime` selects a declared server by code or semantic role; missing or ambiguous matches fail. Ports, labels and launch commands come from that server. Enabled initialization profiles come from its data-release configuration. Reading these defaults never starts services, imports data or activates optional modules.\n\nThe Nexus accelerator illustrates content ownership: `nexusCore` supplies inert administrative/acceptance descriptors, while `nexus.web` owns immutable reference releases and CMS/media defaults. Platform selects only the descriptor capability; WCMS and Engagement select their required content contribution. Customer projects keep application overrides and explicit composition, with one source owner per pack.\n",
      "previous": {
        "title": "Security, Identity, and Access Governance",
        "route": "/docs/framework/security-identity-access-governance"
      },
      "next": {
        "title": "Framework Startup Lifecycle",
        "route": "/docs/framework/configuration-framework-startup-lifecycle"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "config",
        "owner": "config",
        "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "wordCount": 4301,
        "checksum": "fb41624abd367eacd67b3f72dea7d6d8a50509fb24448f065e43bcb27932bc85"
      },
      "slug": "configuration-runtime-behavior-management",
      "locale": "en",
      "navigationGroup": "Configuration Layers and Behavior",
      "navigationGroupCode": "configuration-layers-and-behavior",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "configuration.framework-startup-lifecycle",
          "owner": "config"
        },
        {
          "documentId": "cache.runtime-state-management",
          "owner": "cache"
        },
        {
          "documentId": "foundation.error-handling-status-codes",
          "owner": "nCommon"
        },
        {
          "documentId": "routing.api-governance",
          "owner": "router"
        },
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentconfigurationFrameworkStartupLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "configuration.framework-startup-lifecycle",
      "title": "Framework Startup Lifecycle",
      "route": "/docs/framework/configuration-framework-startup-lifecycle",
      "section": "application-configuration-and-runtime-behavior-management",
      "sectionTitle": "Application Configuration and Runtime Behavior Management",
      "group": "application-configuration-and-runtime-behavior-management",
      "groupTitle": "Application Configuration and Runtime Behavior Management",
      "parentId": "application-configuration-and-runtime-behavior-management",
      "hierarchyPath": [
        "Application Configuration and Runtime Behavior Management",
        "Framework Startup Lifecycle"
      ],
      "hierarchyDepth": 2,
      "documentType": "configuration",
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
      "summary": "Step-by-step startup path from runtime launch through nConfig module discovery, configuration loading, lifecycle hooks, init data import, identity bootstrap, and server readiness.",
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
        "configuration.runtime-behavior-management",
        "framework.module-loading-service-precedence",
        "routing.api-request-lifecycle",
        "foundation.error-handling-status-codes",
        "pipeline.business-logic-orchestration",
        "data.import-export-migration",
        "framework.local-quick-start"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../nodics.js",
        "nodics.js",
        "bin/nodics.js",
        "bin/config.js",
        "src/utils/utils.js",
        "src/service/DefaultFrameworkInitializerService.js",
        "src/service/DefaultScriptsHandlerService.js",
        "src/service/defaultFilesLoaderService.js",
        "src/service/defaultEnumService.js",
        "src/service/defaultClassesHandlerService.js",
        "../nDatabase/database/src/service/connection/defaultDatabaseConnectionHandlerService.js",
        "../nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService.js",
        "../nData/nImport/import/src/service/import/defaultImportService.js",
        "../nData/nImport/import/src/pipelines/pipelines.js",
        "../nRouter/src/service/router/defaultRouterService.js",
        "../../../nodics.platform/modules/profile/nodics.js",
        "../../../nodics.platform/modules/profile/src/service/profile/defaultProfileService.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "framework-startup",
        "nConfig",
        "prepareStart",
        "module-discovery",
        "module-index",
        "activeModules",
        "properties",
        "prescripts",
        "postscripts",
        "nodics.js",
        "initRequired",
        "init-v001",
        "mandatoryBootstrapServices",
        "startServers"
      ],
      "topicKeywords": [
        "Application Configuration and Runtime Behavior Management",
        "Configuration Layers and Behavior",
        "Framework Startup Lifecycle",
        "nConfig startup"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "configurationFrameworkStartupLifecycle-1-business-context",
          "level": 2
        },
        {
          "text": "Entry point",
          "anchor": "configurationFrameworkStartupLifecycle-2-entry-point",
          "level": 2
        },
        {
          "text": "Full startup flow",
          "anchor": "configurationFrameworkStartupLifecycle-3-full-startup-flow",
          "level": 2
        },
        {
          "text": "Module discovery contract",
          "anchor": "configurationFrameworkStartupLifecycle-4-module-discovery-contract",
          "level": 2
        },
        {
          "text": "Active module resolution",
          "anchor": "configurationFrameworkStartupLifecycle-5-active-module-resolution",
          "level": 2
        },
        {
          "text": "Configuration loading",
          "anchor": "configurationFrameworkStartupLifecycle-6-configuration-loading",
          "level": 2
        },
        {
          "text": "File and artifact loading",
          "anchor": "configurationFrameworkStartupLifecycle-7-file-and-artifact-loading",
          "level": 2
        },
        {
          "text": "Module-level lifecycle hook",
          "anchor": "configurationFrameworkStartupLifecycle-8-module-level-lifecycle-hook",
          "level": 2
        },
        {
          "text": "Pre-scripts",
          "anchor": "configurationFrameworkStartupLifecycle-9-pre-scripts",
          "level": 2
        },
        {
          "text": "Post-scripts",
          "anchor": "configurationFrameworkStartupLifecycle-10-post-scripts",
          "level": 2
        },
        {
          "text": "Entity lifecycle hooks",
          "anchor": "configurationFrameworkStartupLifecycle-11-entity-lifecycle-hooks",
          "level": 2
        },
        {
          "text": "Fresh schema and init data",
          "anchor": "configurationFrameworkStartupLifecycle-12-fresh-schema-and-init-data",
          "level": 2
        },
        {
          "text": "Mandatory bootstrap reconcilers",
          "anchor": "configurationFrameworkStartupLifecycle-13-mandatory-bootstrap-reconcilers",
          "level": 2
        },
        {
          "text": "Internal identity and tenant context",
          "anchor": "configurationFrameworkStartupLifecycle-14-internal-identity-and-tenant-context",
          "level": 2
        },
        {
          "text": "Router startup and readiness",
          "anchor": "configurationFrameworkStartupLifecycle-15-router-startup-and-readiness",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "configurationFrameworkStartupLifecycle-16-operations-and-governance",
          "level": 2
        },
        {
          "text": "Customization decision guide",
          "anchor": "configurationFrameworkStartupLifecycle-17-customization-decision-guide",
          "level": 2
        },
        {
          "text": "Safe pre-module-load customization",
          "anchor": "configurationFrameworkStartupLifecycle-18-safe-pre-module-load-customization",
          "level": 2
        },
        {
          "text": "Safe post-module-load customization",
          "anchor": "configurationFrameworkStartupLifecycle-19-safe-post-module-load-customization",
          "level": 2
        },
        {
          "text": "Troubleshooting",
          "anchor": "configurationFrameworkStartupLifecycle-20-troubleshooting",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "configurationFrameworkStartupLifecycle-21-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "configurationFrameworkStartupLifecycle-22-verification",
          "level": 2
        },
        {
          "text": "Proving completed startup and failure cleanup",
          "anchor": "configurationFrameworkStartupLifecycle-23-proving-completed-startup-and-failure-cleanup",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Framework startup explains what happens after a Nodics runtime is launched and before the server begins accepting API traffic. This page is for beginners, developers, operators, architects, QA owners, and AI tools that need to understand how modules, configuration, services, pipelines, schemas, initial data, authentication, tenants, and HTTP listeners become one running Nodics server."
        },
        {
          "kind": "paragraph",
          "text": "The short mental model is: a start command selects a runtime, nConfig discovers loadable modules, the selected modules are sorted by index, layered files are merged into runtime registries, lifecycle hooks run, required initial data is imported, internal identity is prepared, and only then router-enabled modules start HTTP and HTTPS listeners."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "configurationFrameworkStartupLifecycle-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "Startup is a business concern because the first few seconds decide whether the application is safe to use. If the wrong module loads first, a project override may not apply. If properties are loaded from the wrong layer, a server can connect to the wrong database. If init data is skipped on a fresh schema, Axis login, module registry, publishing, and content journeys may fail."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Startup answer"
          ],
          "rows": [
            [
              "First setup should be predictable",
              "Fresh schema detection imports required `init-v001` data before users operate the system."
            ],
            [
              "Customer projects should be customizable",
              "Project, environment, server, node, and later module layers can extend framework defaults."
            ],
            [
              "Operators need confidence",
              "Logs show selected paths, configuration precedence, module order, and server listeners."
            ],
            [
              "Developers need safe extension points",
              "`nodics.js`, `config/prescripts.js`, and `config/postscripts.js` provide controlled hooks."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Entry point",
          "anchor": "configurationFrameworkStartupLifecycle-2-entry-point"
        },
        {
          "kind": "paragraph",
          "text": "In a deployed or generated project, `npm run start` should be a thin wrapper around the Nodics launcher. The launcher ultimately calls `nodics.foundation/nodics.js` and its `start(options)` method."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const path = require('path');\nconst nodics = require('./nodics.foundation/nodics');\n\nnodics.start({\n  NODICS_HOME: path.resolve(__dirname, 'nodics.foundation'),\n  CUSTOM_HOME: __dirname,\n  MODULE_ROOTS: [\n    path.resolve(__dirname, 'nodics.foundation'),\n    __dirname\n  ],\n  defaultEnvironment: 'local',\n  defaultServer: 'platformServer'\n});"
        },
        {
          "kind": "paragraph",
          "text": "`NODICS_HOME` points to the framework foundation root. `CUSTOM_HOME` points to the project or runtime root. `MODULE_ROOTS` tells Nodics which independently versioned roots to scan for loadable packages. `defaultEnvironment` and `defaultServer` are fallback selections; command-line or environment variables can still select a different runtime."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "ENV=local SERVER=platformServer node server.js\nS=platformServer E=local node server.js\nSERVER=platformServer NODE=platformNode01 node server.js"
        },
        {
          "kind": "paragraph",
          "text": "The framework root package `nodics.ai` is intentionally not a runtime module. It is a repository boundary and tooling owner. Runtime startup begins from concrete functional modules and project/server composition."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Full startup flow",
          "anchor": "configurationFrameworkStartupLifecycle-3-full-startup-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Start[\"Start command\"] --> Foundation[\"nodics.foundation/nodics.start\"]\n  Foundation --> Prepare[\"nConfig.prepareStart\"]\n  Prepare --> Discover[\"Discover package.json module metadata\"]\n  Discover --> Select[\"Resolve ENV, SERVER, optional NODE\"]\n  Select --> Active[\"Resolve active modules, parents, dependencies\"]\n  Active --> Index[\"Sort by dotted numeric index\"]\n  Index --> Config[\"Load configuration and external properties\"]\n  Config --> Scripts[\"Run pre-scripts\"]\n  Scripts --> Utilities[\"Load enums, classes, utils\"]\n  Utilities --> Modules[\"Load module nodics.js and artifacts\"]\n  Modules --> Entities[\"Run service/facade/controller init and postInit\"]\n  Entities --> ModulePost[\"Run module postInit hooks\"]\n  ModulePost --> PostScripts[\"Run post-scripts\"]\n  PostScripts --> InitCheck{\"Init data required?\"}\n  InitCheck -->|\"yes\"| ImportInit[\"Import init-v001 data\"]\n  InitCheck -->|\"no\"| Bootstrap[\"Mandatory bootstrap reconcilers\"]\n  ImportInit --> Bootstrap\n  Bootstrap --> Identity[\"Internal auth token and tenant build\"]\n  Identity --> Routers[\"Start router-enabled HTTP/HTTPS listeners\"]\n  Routers --> Ready[\"Runtime marked started\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Step",
            "Runtime action",
            "Source owner"
          ],
          "rows": [
            [
              "1. Start",
              "Project script or process calls `nodics.start(options)`.",
              "Project runtime wrapper"
            ],
            [
              "2. Prepare globals",
              "`NODICS`, `CONFIG`, `SERVICE`, `PIPELINE`, `FACADE`, `CONTROLLER`, `CLASSES`, `ENUMS`, and `TEST` are created or reset.",
              "`nConfig`"
            ],
            [
              "3. Discover modules",
              "`MODULE_ROOTS` are scanned recursively for loadable `package.json` metadata.",
              "`nConfig` utility"
            ],
            [
              "4. Resolve topology",
              "`ENV`, `SERVER`, and optional `NODE` select project, environment/server-root, server, and node paths.",
              "`nConfig`"
            ],
            [
              "5. Load base server properties",
              "Project, environment, server, and optional node properties are merged to decide activation.",
              "`nConfig`"
            ],
            [
              "6. Resolve active modules",
              "Configured groups/modules, selected runtime modules, parent modules, and required modules become the active list.",
              "`nConfig`"
            ],
            [
              "7. Sort index",
              "Active modules are sorted by dotted numeric `index`; duplicate indexes fail startup.",
              "`nConfig`"
            ],
            [
              "8. Load metadata",
              "Active module metadata is copied into `NODICS.modules`.",
              "`nConfig`"
            ],
            [
              "9. Load configuration",
              "Active `config/properties.js` files and external property files merge into `CONFIG`.",
              "`nConfig`"
            ],
            [
              "10. Run pre-scripts",
              "Active `config/prescripts.js` functions execute after configuration and before utilities/modules load.",
              "Active modules"
            ],
            [
              "11. Load utilities",
              "Enums, classes, and shared utils are loaded from active modules.",
              "`nConfig`"
            ],
            [
              "12. Load module artifacts",
              "Module `nodics.js.init`, services, pipelines, facades, and controllers load in index order.",
              "Active modules"
            ],
            [
              "13. Init entities",
              "Loaded services, facades, and controllers run `init`.",
              "Active modules"
            ],
            [
              "14. Post-init entities",
              "Loaded services, facades, and controllers run `postInit`.",
              "Active modules"
            ],
            [
              "15. Post-init modules",
              "Module `nodics.js.postInit` runs in index order.",
              "Active modules"
            ],
            [
              "16. Run post-scripts",
              "Active `config/postscripts.js` functions execute after modules/entities are ready.",
              "Active modules"
            ],
            [
              "17. Import init data",
              "If `NODICS.initRequired` is true, active module `data/init-v001` releases import.",
              "`nData` import"
            ],
            [
              "18. Reconcile mandatory records",
              "Configured mandatory bootstrap services create or repair required platform records.",
              "Owning modules"
            ],
            [
              "19. Prepare identity",
              "Internal service token is issued locally or fetched from remote profile.",
              "`profile`, `nAuth`, `nService`"
            ],
            [
              "20. Build tenants",
              "Enterprise and tenant context is built for request processing.",
              "`profile`"
            ],
            [
              "21. Start listeners",
              "Router-enabled modules attach routers and start HTTP/HTTPS listeners.",
              "`nRouter`"
            ],
            [
              "22. Mark ready",
              "Runtime lifecycle is marked started and readiness contributors can report healthy state.",
              "`nConfig`, `nSystem`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Module discovery contract",
          "anchor": "configurationFrameworkStartupLifecycle-4-module-discovery-contract"
        },
        {
          "kind": "paragraph",
          "text": "Startup discovers modules by scanning each configured module root for `package.json`. A package participates in Nodics runtime loading only when it has canonical Nodics metadata and is not explicitly excluded."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"name\": \"profile\",\n  \"index\": \"100.20\",\n  \"nodics\": {\n    \"kind\": \"capability\",\n    \"displayName\": \"Profile\",\n    \"owns\": [\"identity\", \"tenant\", \"employee\"],\n    \"runtime\": {\n      \"router\": true,\n      \"publish\": false,\n      \"web\": false\n    }\n  },\n  \"requiredModules\": [\"nDatabase\", \"nRouter\"]\n}"
        },
        {
          "kind": "table",
          "headers": [
            "Metadata",
            "Meaning"
          ],
          "rows": [
            [
              "`name`",
              "Runtime module identity. Server and node names may be scoped when duplicate names exist in different environments."
            ],
            [
              "`index`",
              "Dotted numeric load order. Earlier indexes load first; later indexes can override merge-friendly artifacts."
            ],
            [
              "`nodics.kind`",
              "Package role such as `application`, `group`, `environment`, `server`, `node`, or `capability`."
            ],
            [
              "`nodics.runtime`",
              "Declares runtime surfaces such as router, publish, and web."
            ],
            [
              "`runtimeModule: false` or `nodics.loadableByNodicsModuleLoader: false`",
              "Excludes a package from runtime loading."
            ],
            [
              "`requiredModules`",
              "Declares local in-process dependencies that must be active and load earlier."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not use package dependency order as startup order. `package.json` dependencies make code available to npm; Nodics module `index` and active runtime composition decide runtime order."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Active module resolution",
          "anchor": "configurationFrameworkStartupLifecycle-5-active-module-resolution"
        },
        {
          "kind": "paragraph",
          "text": "Active modules come from several sources:"
        },
        {
          "kind": "table",
          "headers": [
            "Source",
            "How it participates"
          ],
          "rows": [
            [
              "Selected runtime hierarchy",
              "The selected environment/server-root, server, and optional node are activated explicitly."
            ],
            [
              "`activeModules.groups`",
              "Group modules can be activated and may include selector syntax for explicit child activation."
            ],
            [
              "`activeModules.modules`",
              "Concrete capability/project modules are activated explicitly."
            ],
            [
              "Parent hierarchy",
              "Parent modules inside the selected runtime boundary are added when required."
            ],
            [
              "`requiredModules`",
              "Required local dependencies are added and validated."
            ],
            [
              "Publish-enabled modules",
              "Publish modules may load when publication support is enabled."
            ],
            [
              "Always-loadable modules",
              "Foundation modules needed by the runtime load when their metadata allows it."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "After activation, `DefaultFrameworkInitializerService.loadModuleIndex` builds a map keyed by module index and sorts it numerically. This sorted map is the contract used by file loading, module initialization, service precedence, pipeline precedence, class loading, and controller/facade registration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration loading",
          "anchor": "configurationFrameworkStartupLifecycle-6-configuration-loading"
        },
        {
          "kind": "paragraph",
          "text": "Configuration is loaded in two important passes."
        },
        {
          "kind": "paragraph",
          "text": "The first pass loads selected runtime properties so startup can determine active modules:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "project config      <project>/config/properties.js\nenvironment config  <environment-or-server-root>/config/properties.js\nserver config       <server>/config/properties.js\nnode config         <node>/config/properties.js"
        },
        {
          "kind": "paragraph",
          "text": "The second pass loads every active module's `config/properties.js` in module index order, then external property files."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  activeModules: {\n    groups: ['nodics.foundation', 'nodics.platform'],\n    modules: ['axis', 'profile', 'backoffice']\n  },\n  servers: {\n    default: {\n      endpoint: {\n        httpHost: 'localhost',\n        httpPort: 3010\n      }\n    }\n  },\n  externalPropertyFile: [\n    '/secure/local/private-properties.js'\n  ]\n};"
        },
        {
          "kind": "paragraph",
          "text": "Keep committed properties declarative. Secrets and machine-specific values belong in private local or environment-specific property files."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "File and artifact loading",
          "anchor": "configurationFrameworkStartupLifecycle-7-file-and-artifact-loading"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultFilesLoaderService` loads matching files from indexed active modules. Most registries use merge behavior, so later modules can extend or override earlier definitions."
        },
        {
          "kind": "table",
          "headers": [
            "Artifact",
            "Location",
            "Runtime registry"
          ],
          "rows": [
            [
              "Properties",
              "`config/properties.js`",
              "`CONFIG`"
            ],
            [
              "Pre-start scripts",
              "`config/prescripts.js`",
              "`NODICS.preScripts`"
            ],
            [
              "Post-start scripts",
              "`config/postscripts.js`",
              "`NODICS.postScripts`"
            ],
            [
              "Enums",
              "`src/utils/enums.js`",
              "`ENUMS`"
            ],
            [
              "Classes",
              "`src/lib/**/*.js`, excluding `classes.js`",
              "`CLASSES`"
            ],
            [
              "Class generalizers",
              "`src/lib/classes.js`",
              "Mutates or extends `CLASSES`"
            ],
            [
              "Utilities",
              "`src/utils/utils.js`",
              "`UTILS`"
            ],
            [
              "Services",
              "`src/service/**/*Service.js`",
              "`SERVICE`"
            ],
            [
              "Pipelines",
              "`src/pipelines/*Definition.js`, `src/pipelines/pipelines.js`",
              "`PIPELINE`"
            ],
            [
              "Facades",
              "`src/facade/**/*Facade.js`",
              "`FACADE`"
            ],
            [
              "Controllers",
              "`src/controller/**/*Controller.js`",
              "`CONTROLLER`"
            ],
            [
              "Routers",
              "`src/router/routers.js` and generated schema routes",
              "Module routers"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Later modules should override through the same artifact type they are customizing. For example, do not change a controller just to alter business logic that belongs in a service or pipeline node."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Module-level lifecycle hook",
          "anchor": "configurationFrameworkStartupLifecycle-8-module-level-lifecycle-hook"
        },
        {
          "kind": "paragraph",
          "text": "Every module can define `nodics.js`. The module loader calls `init` before loading that module's services, pipelines, facades, and controllers. It calls `postInit` later, after all entities have loaded and their own init/postInit hooks have run."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  init: function (moduleObject) {\n    return new Promise((resolve, reject) => {\n      // Runs while this module is being loaded.\n      // Use this for lightweight module-level preparation.\n      resolve(true);\n    });\n  },\n\n  postInit: function (moduleObject) {\n    return new Promise((resolve, reject) => {\n      // Runs after services, pipelines, facades, and controllers are available.\n      // Use this when the hook needs SERVICE, PIPELINE, FACADE, or CONTROLLER.\n      resolve(true);\n    });\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use `nodics.js.init` when the behavior belongs to the module itself and must run before that module's artifacts are loaded. Use `nodics.js.postInit` when the behavior needs other loaded services or must register runtime contributors. Profile uses module `postInit` to decide whether bootstrap data is required when a fresh schema has no enterprise or bootstrap employee data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Pre-scripts",
          "anchor": "configurationFrameworkStartupLifecycle-9-pre-scripts"
        },
        {
          "kind": "paragraph",
          "text": "Every active module may contribute `config/prescripts.js`. nConfig loads pre-scripts after effective configuration is available and before enums, classes, modules, services, pipelines, facades, and controllers are loaded."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  verifyLocalMediaPath: function () {\n    const media = CONFIG.get('media') || {};\n    if (!media.localRoot) {\n      throw new Error('media.localRoot must be configured before startup');\n    }\n  },\n\n  prepareDiagnosticContext: function () {\n    NODICS.LOG && NODICS.LOG.info('Preparing local diagnostic context');\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Pre-scripts are useful for validation or environment preparation that must happen before module artifacts load. They should be quick, deterministic, and idempotent. They should not call business services because `SERVICE` has not been loaded yet."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Post-scripts",
          "anchor": "configurationFrameworkStartupLifecycle-10-post-scripts"
        },
        {
          "kind": "paragraph",
          "text": "Every active module may contribute `config/postscripts.js`. nConfig loads post-scripts during `config.start`, then the framework coordinator executes them after module and entity post-initialization is complete."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  verifyRuntimeContracts: function () {\n    if (!SERVICE.DefaultRouterService) {\n      throw new Error('Router service must be available before server startup');\n    }\n    if (!PIPELINE.systemDataImportInitializerPipeline) {\n      throw new Error('System data import initializer pipeline is not available');\n    }\n  },\n\n  registerSupportBanner: function () {\n    const support = CONFIG.get('support') || {};\n    if (support.enabled) {\n      SERVICE.DefaultLoggerService\n        .createLogger('StartupSupport')\n        .info('Support profile active: ' + support.profile);\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Post-scripts can read loaded services, pipelines, facades, controllers, enums, classes, and configuration. They still run before startup init data import and before HTTP listeners start, so they are a good place for runtime contract checks that should block an unsafe server from becoming reachable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Entity lifecycle hooks",
          "anchor": "configurationFrameworkStartupLifecycle-11-entity-lifecycle-hooks"
        },
        {
          "kind": "paragraph",
          "text": "After all active module artifacts are loaded, Nodics initializes entities in this order:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "services.init\nfacades.init\ncontrollers.init\nservices.postInit\nfacades.postInit\ncontrollers.postInit\nmodule nodics.js.postInit"
        },
        {
          "kind": "paragraph",
          "text": "Service `init` should register providers, lifecycle contributors, health checks, and in-memory policy defaults. Service `postInit` should run only when the service needs all services/facades/controllers to be available first."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  init: function () {\n    if (SERVICE.DefaultRuntimeLifecycleService) {\n      SERVICE.DefaultRuntimeLifecycleService.registerContributor('myProvider', {\n        order: 700,\n        shutdown: () => this.close()\n      });\n    }\n    return Promise.resolve(true);\n  },\n\n  postInit: function () {\n    return this.verifyProviderCanServeCurrentTenant();\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Do not start unmanaged timers or background jobs directly from arbitrary service init hooks. Scheduled work should normally be represented by cron job data and executed through the Process/Cron module lifecycle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fresh schema and init data",
          "anchor": "configurationFrameworkStartupLifecycle-12-fresh-schema-and-init-data"
        },
        {
          "kind": "paragraph",
          "text": "Startup imports initialization data only when `NODICS.initRequired` is true. In the current profile-owned bootstrap path, profile module `postInit` checks the profile database. It treats startup as requiring init data when collections are missing, enterprise records are missing, or the default bootstrap employee is missing."
        },
        {
          "kind": "paragraph",
          "text": "When init is required, the framework coordinator calls:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "SERVICE.DefaultImportService.importInitData({\n  tenant: CONFIG.get('defaultTenant') || 'default',\n  modules: NODICS.getActiveModules()\n});"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultImportService.importInitData` sets `request.dataType = 'init'`, runs `systemDataImportInitializerPipeline`, and then dispatches finalized records through `processDataImportPipeline`."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  InitRequired[\"NODICS.initRequired = true\"] --> ImportInit[\"importInitData\"]\n  ImportInit --> SystemPipeline[\"systemDataImportInitializerPipeline\"]\n  SystemPipeline --> Headers[\"Load headers\"]\n  SystemPipeline --> Records[\"Load records\"]\n  Headers --> ProcessPipeline[\"processDataImportPipeline\"]\n  Records --> ProcessPipeline\n  ProcessPipeline --> Models[\"Schema model writes\"]"
        },
        {
          "kind": "paragraph",
          "text": "Startup evaluates versioned Init releases on every boot through `DefaultDataReleaseService.installStartupReleases()`. Current releases are skipped and new deltas complete before readiness. `NODICS.isInitRequired()` still serves owning bootstrap/schema checks; it is not the release skip ledger. Editing an already applied Init release without a new version fails startup."
        },
        {
          "kind": "paragraph",
          "text": "The release data involved here lives under active module folders such as:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "data/\n  init-v001/\n    headers/\n    records/"
        },
        {
          "kind": "paragraph",
          "text": "This startup import is for mandatory initialization. Core and sample data are governed data release operations and should be triggered intentionally through the import/release process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Mandatory bootstrap reconcilers",
          "anchor": "configurationFrameworkStartupLifecycle-13-mandatory-bootstrap-reconcilers"
        },
        {
          "kind": "paragraph",
          "text": "After init data import, Nodics runs configured mandatory bootstrap services. These are ordered, idempotent services declared through `mandatoryBootstrapServices`. They are intended for records that must exist for the runtime to remain operable even if a data release is incomplete."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  mandatoryBootstrapServices: {\n    defaultIdentity: {\n      enabled: true,\n      order: 100,\n      service: 'DefaultMandatoryIdentityBootstrapService'\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Each configured service must expose `reconcile(request)`."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  reconcile: function (request) {\n    return SERVICE.DefaultEmployeeService.saveOrUpdate({\n      tenant: request.tenant,\n      model: {\n        loginId: 'admin',\n        active: true\n      }\n    });\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Reconcilers must be idempotent. They should create or repair required records, not blindly insert duplicates."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Internal identity and tenant context",
          "anchor": "configurationFrameworkStartupLifecycle-14-internal-identity-and-tenant-context"
        },
        {
          "kind": "paragraph",
          "text": "After bootstrap reconciliation, startup prepares internal service identity. If profile is active locally, Nodics verifies the default employee by API key and issues a service token through `DefaultServiceTokenService`. If profile is remote, Nodics fetches an internal token from the configured profile endpoint."
        },
        {
          "kind": "paragraph",
          "text": "Then `DefaultEnterpriseHandlerService.buildEnterprises()` builds active enterprise and tenant context. That is why init data and identity bootstrap must complete before the server is marked ready."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Router startup and readiness",
          "anchor": "configurationFrameworkStartupLifecycle-15-router-startup-and-readiness"
        },
        {
          "kind": "paragraph",
          "text": "Only after the framework lifecycle completes does `DefaultRouterService` start HTTP and HTTPS listeners. It loops over active modules, checks whether each module is router-enabled, attaches the prepared module router, and starts the configured ports."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "SERVICE.DefaultRouterService.startServers().then(() => {\n  NODICS.setEndTime(new Date());\n  SERVICE.DefaultRuntimeLifecycleService.markStarted({ reason: 'startup' });\n});"
        },
        {
          "kind": "paragraph",
          "text": "If listener startup fails, startup waits for sibling bind results and closes listeners that opened successfully. The runtime transitions to `failed`, drains and closes registered resources, then rejects with the original error. The launcher reports a nonzero process outcome after cleanup. `start()` returns a promise so callers and tests can await that entire outcome."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "configurationFrameworkStartupLifecycle-16-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators should treat startup output as runtime evidence, not console noise. The startup log should identify the selected `NODICS_HOME`, environment path, server root, server path, optional node path, log path, configuration loading contract, and the active module order from top to bottom. Those lines are the first proof that the process is running the intended project and not a stale checkout, wrong environment, or wrong server composition."
        },
        {
          "kind": "table",
          "headers": [
            "Operator check",
            "Evidence to collect"
          ],
          "rows": [
            [
              "Correct runtime selected",
              "`NODICS_ENV`, `SERVER_ROOT`, `SERVER`, optional `NODE`, and port bindings."
            ],
            [
              "Correct module graph",
              "Active module list with dotted numeric indexes and no duplicate indexes."
            ],
            [
              "Correct configuration",
              "Logged configuration precedence and expected external property files."
            ],
            [
              "Fresh schema handled",
              "Init-required log, `init-v001` import result, and mandatory bootstrap reconciler result."
            ],
            [
              "Identity ready",
              "Internal service token creation or remote profile token retrieval."
            ],
            [
              "Tenant context ready",
              "Enterprise/tenant build result and readiness health contributor state."
            ],
            [
              "Server reachable",
              "HTTP/HTTPS listener logs and runtime lifecycle `started` state."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "If startup fails, preserve the first meaningful error and the selected runtime paths before retrying. Retrying without checking the selected environment, module index, database, and init data state can hide the real cause and create partial bootstrap data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization decision guide",
          "anchor": "configurationFrameworkStartupLifecycle-17-customization-decision-guide"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Use",
            "Why"
          ],
          "rows": [
            [
              "Validate local files or environment before services load",
              "`config/prescripts.js`",
              "Configuration exists, but services are not loaded yet."
            ],
            [
              "Prepare lightweight module state before its artifacts load",
              "Module `nodics.js.init`",
              "The behavior belongs to that module's load boundary."
            ],
            [
              "Register health, lifecycle, provider, or service-owned startup state",
              "Service `init`",
              "The service owns the runtime contributor."
            ],
            [
              "Verify loaded registries before HTTP starts",
              "`config/postscripts.js`",
              "Services and pipelines are available, but traffic is not open."
            ],
            [
              "Decide whether first startup needs mandatory data",
              "Module `nodics.js.postInit` or an owning bootstrap service",
              "The check needs loaded models/services."
            ],
            [
              "Create or repair required records idempotently",
              "`mandatoryBootstrapServices`",
              "Keeps safety-critical bootstrap repair governed and repeatable."
            ],
            [
              "Change business behavior",
              "Service, pipeline, validator, provider, or data release",
              "Avoids putting business logic into startup glue."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe pre-module-load customization",
          "anchor": "configurationFrameworkStartupLifecycle-18-safe-pre-module-load-customization"
        },
        {
          "kind": "paragraph",
          "text": "Use `config/prescripts.js` when you need a hook before module artifacts load. This is the closest supported extension point to \"pre module load\"."
        },
        {
          "kind": "paragraph",
          "text": "Good pre-script responsibilities:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "validate required property values;",
            "ensure a local folder exists when the folder path is configured;",
            "register simple diagnostic markers;",
            "fail fast when the selected runtime is unsafe."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Avoid in pre-scripts:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "calling `SERVICE` methods;",
            "starting servers or timers;",
            "importing business data;",
            "mutating active module lists after they have already been resolved;",
            "hiding tenant or security defaults outside properties."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe post-module-load customization",
          "anchor": "configurationFrameworkStartupLifecycle-19-safe-post-module-load-customization"
        },
        {
          "kind": "paragraph",
          "text": "Use `config/postscripts.js` or module `nodics.js.postInit` when the behavior needs loaded services or registries."
        },
        {
          "kind": "paragraph",
          "text": "Good post-module-load responsibilities:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "verify a required service or pipeline exists;",
            "register runtime readiness contributors through a service;",
            "run idempotent checks that should block HTTP startup on failure;",
            "prepare module-local caches from already-loaded configuration."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Avoid in post-scripts:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "inserting business records that belong in data releases or bootstrap reconcilers;",
            "doing long-running network work without timeout or observable failure;",
            "silently swallowing errors that should block startup;",
            "creating background schedulers outside Process/Cron."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting",
          "anchor": "configurationFrameworkStartupLifecycle-20-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely area",
            "What to check"
          ],
          "rows": [
            [
              "`Default server is not configured`",
              "Startup selection",
              "Pass `SERVER`/`S` or configure `defaultServer`."
            ],
            [
              "`Ambiguous server`",
              "Environment selection",
              "Pass `ENV`/`E` when a server name exists in multiple environments."
            ],
            [
              "`active module references unknown module`",
              "Active module config",
              "Check `activeModules.groups`, `activeModules.modules`, aliases, and module roots."
            ],
            [
              "Duplicate module index",
              "Module metadata",
              "Ensure each active runtime module has a unique dotted numeric `index`."
            ],
            [
              "Required module inactive",
              "Dependency contract",
              "Activate the dependency locally or redesign as a remote API dependency."
            ],
            [
              "Service override not active",
              "Index and active module list",
              "Confirm the project module is active and loads after the base service."
            ],
            [
              "Init data not imported on fresh schema",
              "Profile/bootstrap check",
              "Check profile collections, enterprise records, and bootstrap employee."
            ],
            [
              "Server never opens port",
              "Router config",
              "Check `servers.default.endpoint.httpPort`, router-enabled metadata, and listener errors."
            ],
            [
              "Axis login fails after fresh schema",
              "Init data or identity bootstrap",
              "Check `init-v001` import, mandatory bootstrap services, and internal token creation."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "configurationFrameworkStartupLifecycle-21-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Assuming `npm install` dependency order controls runtime override order.",
            "Putting business records into startup scripts instead of data releases.",
            "Using pre-scripts for service calls before services are loaded.",
            "Updating root `nodics.ai` as if it were a runtime module.",
            "Activating remote-only modules as local required modules.",
            "Adding a project override without assigning a later module index.",
            "Swallowing startup errors and allowing an unsafe server to listen.",
            "Forgetting that startup import covers `init` data, not every `core` or `sample` release."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "configurationFrameworkStartupLifecycle-22-verification"
        },
        {
          "kind": "paragraph",
          "text": "For startup or nConfig changes, verify at least:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm run validate:root\nnpm run quality:docs\nnpm --prefix nodics.docs test"
        },
        {
          "kind": "paragraph",
          "text": "For code changes that affect module discovery, ordering, properties, or lifecycle hooks, add focused tests around `nConfig` and run the relevant runtime prepare/start path against a fresh schema. For changes that affect initial data, also run the import suite and manually verify Axis login, dashboard guidance, module registry, imports/exports, and publishing pages."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Proving completed startup and failure cleanup",
          "anchor": "configurationFrameworkStartupLifecycle-23-proving-completed-startup-and-failure-cleanup"
        },
        {
          "kind": "paragraph",
          "text": "For an operator, readiness means required setup and configured listener binds completed. An informational log from an earlier phase does not establish that. For a module author, return the promise for each required operation and register resource cleanup through `DefaultRuntimeLifecycleService` before opening the resource. A project can customize deadlines and owner implementations through existing layers, while retaining this completion rule."
        },
        {
          "kind": "paragraph",
          "text": "Consider a runtime with HTTP and a database connection. HTTP binds successfully, but another configured listener fails because its port is occupied. Startup waits for pending sibling binds, closes opened listeners, drains other registered work and closes database handles. It reports the occupied-port error even if a cleanup hook also fails. The cleanup error remains diagnostic evidence."
        },
        {
          "kind": "table",
          "headers": [
            "Scenario",
            "Expected result",
            "Evidence"
          ],
          "rows": [
            [
              "Required async pre/post script pending",
              "Later lifecycle stages wait.",
              "Phase trace before and after promise completion."
            ],
            [
              "Required enterprise or search initialization fails",
              "No ready state; registered resources close.",
              "Original failure plus cleanup results."
            ],
            [
              "One listener opens after a sibling already failed",
              "The late listener also closes.",
              "Retained listener handles and closed state."
            ],
            [
              "Cleanup hook throws or exceeds its deadline",
              "Later cleanup contributors still run.",
              "Separate cleanup failure and subsequent close results."
            ],
            [
              "Token rotation is in flight at shutdown",
              "No new refresh starts; drain awaits active refresh within its deadline.",
              "Timer cleared and refresh settled."
            ],
            [
              "Tenant enables startup jobs",
              "Job creation completes once through Cron.",
              "Owning job service result; no enterprise-owned repeat timer."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For a failed required import, cleanup does not undo successful database writes. Retry safety belongs to the immutable release and owning import operation. Provider-specific cancellation and rollback must be qualified separately; a timeout cannot stop arbitrary code that does not cooperate with cancellation. The focused lifecycle tests exercise completion and failure ordering with controlled resources; they are not live authentication or database recovery proof."
        }
      ],
      "searchText": "Framework Startup Lifecycle Step-by-step startup path from runtime launch through nConfig module discovery, configuration loading, lifecycle hooks, init data import, identity bootstrap, and server readiness. # Framework Startup Lifecycle\n\nFramework startup explains what happens after a Nodics runtime is launched and before the server begins accepting API traffic. This page is for beginners, developers, operators, architects, QA owners, and AI tools that need to understand how modules, configuration, services, pipelines, schemas, initial data, authentication, tenants, and HTTP listeners become one running Nodics server.\n\nThe short mental model is: a start command selects a runtime, nConfig discovers loadable modules, the selected modules are sorted by index, layered files are merged into runtime registries, lifecycle hooks run, required initial data is imported, internal identity is prepared, and only then router-enabled modules start HTTP and HTTPS listeners.\n\n## Business context\n\nStartup is a business concern because the first few seconds decide whether the application is safe to use. If the wrong module loads first, a project override may not apply. If properties are loaded from the wrong layer, a server can connect to the wrong database. If init data is skipped on a fresh schema, Axis login, module registry, publishing, and content journeys may fail.\n\n| Business need | Startup answer |\n| --- | --- |\n| First setup should be predictable | Fresh schema detection imports required `init-v001` data before users operate the system. |\n| Customer projects should be customizable | Project, environment, server, node, and later module layers can extend framework defaults. |\n| Operators need confidence | Logs show selected paths, configuration precedence, module order, and server listeners. |\n| Developers need safe extension points | `nodics.js`, `config/prescripts.js`, and `config/postscripts.js` provide controlled hooks. |\n\n## Entry point\n\nIn a deployed or generated project, `npm run start` should be a thin wrapper around the Nodics launcher. The launcher ultimately calls `nodics.foundation/nodics.js` and its `start(options)` method.\n\n```js\nconst path = require('path');\nconst nodics = require('./nodics.foundation/nodics');\n\nnodics.start({\n  NODICS_HOME: path.resolve(__dirname, 'nodics.foundation'),\n  CUSTOM_HOME: __dirname,\n  MODULE_ROOTS: [\n    path.resolve(__dirname, 'nodics.foundation'),\n    __dirname\n  ],\n  defaultEnvironment: 'local',\n  defaultServer: 'platformServer'\n});\n```\n\n`NODICS_HOME` points to the framework foundation root. `CUSTOM_HOME` points to the project or runtime root. `MODULE_ROOTS` tells Nodics which independently versioned roots to scan for loadable packages. `defaultEnvironment` and `defaultServer` are fallback selections; command-line or environment variables can still select a different runtime.\n\n```bash\nENV=local SERVER=platformServer node server.js\nS=platformServer E=local node server.js\nSERVER=platformServer NODE=platformNode01 node server.js\n```\n\nThe framework root package `nodics.ai` is intentionally not a runtime module. It is a repository boundary and tooling owner. Runtime startup begins from concrete functional modules and project/server composition.\n\n## Full startup flow\n\n```mermaid\nflowchart TD\n  Start[\"Start command\"] --> Foundation[\"nodics.foundation/nodics.start\"]\n  Foundation --> Prepare[\"nConfig.prepareStart\"]\n  Prepare --> Discover[\"Discover package.json module metadata\"]\n  Discover --> Select[\"Resolve ENV, SERVER, optional NODE\"]\n  Select --> Active[\"Resolve active modules, parents, dependencies\"]\n  Active --> Index[\"Sort by dotted numeric index\"]\n  Index --> Config[\"Load configuration and external properties\"]\n  Config --> Scripts[\"Run pre-scripts\"]\n  Scripts --> Utilities[\"Load enums, classes, utils\"]\n  Utilities --> Modules[\"Load module nodics.js and artifacts\"]\n  Modules --> Entities[\"Run service/facade/controller init and postInit\"]\n  Entities --> ModulePost[\"Run module postInit hooks\"]\n  ModulePost --> PostScripts[\"Run post-scripts\"]\n  PostScripts --> InitCheck{\"Init data required?\"}\n  InitCheck -->|\"yes\"| ImportInit[\"Import init-v001 data\"]\n  InitCheck -->|\"no\"| Bootstrap[\"Mandatory bootstrap reconcilers\"]\n  ImportInit --> Bootstrap\n  Bootstrap --> Identity[\"Internal auth token and tenant build\"]\n  Identity --> Routers[\"Start router-enabled HTTP/HTTPS listeners\"]\n  Routers --> Ready[\"Runtime marked started\"]\n```\n\n| Step | Runtime action | Source owner |\n| --- | --- | --- |\n| 1. Start | Project script or process calls `nodics.start(options)`. | Project runtime wrapper |\n| 2. Prepare globals | `NODICS`, `CONFIG`, `SERVICE`, `PIPELINE`, `FACADE`, `CONTROLLER`, `CLASSES`, `ENUMS`, and `TEST` are created or reset. | `nConfig` |\n| 3. Discover modules | `MODULE_ROOTS` are scanned recursively for loadable `package.json` metadata. | `nConfig` utility |\n| 4. Resolve topology | `ENV`, `SERVER`, and optional `NODE` select project, environment/server-root, server, and node paths. | `nConfig` |\n| 5. Load base server properties | Project, environment, server, and optional node properties are merged to decide activation. | `nConfig` |\n| 6. Resolve active modules | Configured groups/modules, selected runtime modules, parent modules, and required modules become the active list. | `nConfig` |\n| 7. Sort index | Active modules are sorted by dotted numeric `index`; duplicate indexes fail startup. | `nConfig` |\n| 8. Load metadata | Active module metadata is copied into `NODICS.modules`. | `nConfig` |\n| 9. Load configuration | Active `config/properties.js` files and external property files merge into `CONFIG`. | `nConfig` |\n| 10. Run pre-scripts | Active `config/prescripts.js` functions execute after configuration and before utilities/modules load. | Active modules |\n| 11. Load utilities | Enums, classes, and shared utils are loaded from active modules. | `nConfig` |\n| 12. Load module artifacts | Module `nodics.js.init`, services, pipelines, facades, and controllers load in index order. | Active modules |\n| 13. Init entities | Loaded services, facades, and controllers run `init`. | Active modules |\n| 14. Post-init entities | Loaded services, facades, and controllers run `postInit`. | Active modules |\n| 15. Post-init modules | Module `nodics.js.postInit` runs in index order. | Active modules |\n| 16. Run post-scripts | Active `config/postscripts.js` functions execute after modules/entities are ready. | Active modules |\n| 17. Import init data | If `NODICS.initRequired` is true, active module `data/init-v001` releases import. | `nData` import |\n| 18. Reconcile mandatory records | Configured mandatory bootstrap services create or repair required platform records. | Owning modules |\n| 19. Prepare identity | Internal service token is issued locally or fetched from remote profile. | `profile`, `nAuth`, `nService` |\n| 20. Build tenants | Enterprise and tenant context is built for request processing. | `profile` |\n| 21. Start listeners | Router-enabled modules attach routers and start HTTP/HTTPS listeners. | `nRouter` |\n| 22. Mark ready | Runtime lifecycle is marked started and readiness contributors can report healthy state. | `nConfig`, `nSystem` |\n\n## Module discovery contract\n\nStartup discovers modules by scanning each configured module root for `package.json`. A package participates in Nodics runtime loading only when it has canonical Nodics metadata and is not explicitly excluded.\n\n```json\n{\n  \"name\": \"profile\",\n  \"index\": \"100.20\",\n  \"nodics\": {\n    \"kind\": \"capability\",\n    \"displayName\": \"Profile\",\n    \"owns\": [\"identity\", \"tenant\", \"employee\"],\n    \"runtime\": {\n      \"router\": true,\n      \"publish\": false,\n      \"web\": false\n    }\n  },\n  \"requiredModules\": [\"nDatabase\", \"nRouter\"]\n}\n```\n\n| Metadata | Meaning |\n| --- | --- |\n| `name` | Runtime module identity. Server and node names may be scoped when duplicate names exist in different environments. |\n| `index` | Dotted numeric load order. Earlier indexes load first; later indexes can override merge-friendly artifacts. |\n| `nodics.kind` | Package role such as `application`, `group`, `environment`, `server`, `node`, or `capability`. |\n| `nodics.runtime` | Declares runtime surfaces such as router, publish, and web. |\n| `runtimeModule: false` or `nodics.loadableByNodicsModuleLoader: false` | Excludes a package from runtime loading. |\n| `requiredModules` | Declares local in-process dependencies that must be active and load earlier. |\n\nDo not use package dependency order as startup order. `package.json` dependencies make code available to npm; Nodics module `index` and active runtime composition decide runtime order.\n\n## Active module resolution\n\nActive modules come from several sources:\n\n| Source | How it participates |\n| --- | --- |\n| Selected runtime hierarchy | The selected environment/server-root, server, and optional node are activated explicitly. |\n| `activeModules.groups` | Group modules can be activated and may include selector syntax for explicit child activation. |\n| `activeModules.modules` | Concrete capability/project modules are activated explicitly. |\n| Parent hierarchy | Parent modules inside the selected runtime boundary are added when required. |\n| `requiredModules` | Required local dependencies are added and validated. |\n| Publish-enabled modules | Publish modules may load when publication support is enabled. |\n| Always-loadable modules | Foundation modules needed by the runtime load when their metadata allows it. |\n\nAfter activation, `DefaultFrameworkInitializerService.loadModuleIndex` builds a map keyed by module index and sorts it numerically. This sorted map is the contract used by file loading, module initialization, service precedence, pipeline precedence, class loading, and controller/facade registration.\n\n## Configuration loading\n\nConfiguration is loaded in two important passes.\n\nThe first pass loads selected runtime properties so startup can determine active modules:\n\n```text\nproject config      <project>/config/properties.js\nenvironment config  <environment-or-server-root>/config/properties.js\nserver config       <server>/config/properties.js\nnode config         <node>/config/properties.js\n```\n\nThe second pass loads every active module's `config/properties.js` in module index order, then external property files.\n\n```js\nmodule.exports = {\n  activeModules: {\n    groups: ['nodics.foundation', 'nodics.platform'],\n    modules: ['axis', 'profile', 'backoffice']\n  },\n  servers: {\n    default: {\n      endpoint: {\n        httpHost: 'localhost',\n        httpPort: 3010\n      }\n    }\n  },\n  externalPropertyFile: [\n    '/secure/local/private-properties.js'\n  ]\n};\n```\n\nKeep committed properties declarative. Secrets and machine-specific values belong in private local or environment-specific property files.\n\n## File and artifact loading\n\n`DefaultFilesLoaderService` loads matching files from indexed active modules. Most registries use merge behavior, so later modules can extend or override earlier definitions.\n\n| Artifact | Location | Runtime registry |\n| --- | --- | --- |\n| Properties | `config/properties.js` | `CONFIG` |\n| Pre-start scripts | `config/prescripts.js` | `NODICS.preScripts` |\n| Post-start scripts | `config/postscripts.js` | `NODICS.postScripts` |\n| Enums | `src/utils/enums.js` | `ENUMS` |\n| Classes | `src/lib/**/*.js`, excluding `classes.js` | `CLASSES` |\n| Class generalizers | `src/lib/classes.js` | Mutates or extends `CLASSES` |\n| Utilities | `src/utils/utils.js` | `UTILS` |\n| Services | `src/service/**/*Service.js` | `SERVICE` |\n| Pipelines | `src/pipelines/*Definition.js`, `src/pipelines/pipelines.js` | `PIPELINE` |\n| Facades | `src/facade/**/*Facade.js` | `FACADE` |\n| Controllers | `src/controller/**/*Controller.js` | `CONTROLLER` |\n| Routers | `src/router/routers.js` and generated schema routes | Module routers |\n\nLater modules should override through the same artifact type they are customizing. For example, do not change a controller just to alter business logic that belongs in a service or pipeline node.\n\n## Module-level lifecycle hook\n\nEvery module can define `nodics.js`. The module loader calls `init` before loading that module's services, pipelines, facades, and controllers. It calls `postInit` later, after all entities have loaded and their own init/postInit hooks have run.\n\n```js\nmodule.exports = {\n  init: function (moduleObject) {\n    return new Promise((resolve, reject) => {\n      // Runs while this module is being loaded.\n      // Use this for lightweight module-level preparation.\n      resolve(true);\n    });\n  },\n\n  postInit: function (moduleObject) {\n    return new Promise((resolve, reject) => {\n      // Runs after services, pipelines, facades, and controllers are available.\n      // Use this when the hook needs SERVICE, PIPELINE, FACADE, or CONTROLLER.\n      resolve(true);\n    });\n  }\n};\n```\n\nUse `nodics.js.init` when the behavior belongs to the module itself and must run before that module's artifacts are loaded. Use `nodics.js.postInit` when the behavior needs other loaded services or must register runtime contributors. Profile uses module `postInit` to decide whether bootstrap data is required when a fresh schema has no enterprise or bootstrap employee data.\n\n## Pre-scripts\n\nEvery active module may contribute `config/prescripts.js`. nConfig loads pre-scripts after effective configuration is available and before enums, classes, modules, services, pipelines, facades, and controllers are loaded.\n\n```js\nmodule.exports = {\n  verifyLocalMediaPath: function () {\n    const media = CONFIG.get('media') || {};\n    if (!media.localRoot) {\n      throw new Error('media.localRoot must be configured before startup');\n    }\n  },\n\n  prepareDiagnosticContext: function () {\n    NODICS.LOG && NODICS.LOG.info('Preparing local diagnostic context');\n  }\n};\n```\n\nPre-scripts are useful for validation or environment preparation that must happen before module artifacts load. They should be quick, deterministic, and idempotent. They should not call business services because `SERVICE` has not been loaded yet.\n\n## Post-scripts\n\nEvery active module may contribute `config/postscripts.js`. nConfig loads post-scripts during `config.start`, then the framework coordinator executes them after module and entity post-initialization is complete.\n\n```js\nmodule.exports = {\n  verifyRuntimeContracts: function () {\n    if (!SERVICE.DefaultRouterService) {\n      throw new Error('Router service must be available before server startup');\n    }\n    if (!PIPELINE.systemDataImportInitializerPipeline) {\n      throw new Error('System data import initializer pipeline is not available');\n    }\n  },\n\n  registerSupportBanner: function () {\n    const support = CONFIG.get('support') || {};\n    if (support.enabled) {\n      SERVICE.DefaultLoggerService\n        .createLogger('StartupSupport')\n        .info('Support profile active: ' + support.profile);\n    }\n  }\n};\n```\n\nPost-scripts can read loaded services, pipelines, facades, controllers, enums, classes, and configuration. They still run before startup init data import and before HTTP listeners start, so they are a good place for runtime contract checks that should block an unsafe server from becoming reachable.\n\n## Entity lifecycle hooks\n\nAfter all active module artifacts are loaded, Nodics initializes entities in this order:\n\n```text\nservices.init\nfacades.init\ncontrollers.init\nservices.postInit\nfacades.postInit\ncontrollers.postInit\nmodule nodics.js.postInit\n```\n\nService `init` should register providers, lifecycle contributors, health checks, and in-memory policy defaults. Service `postInit` should run only when the service needs all services/facades/controllers to be available first.\n\n```js\nmodule.exports = {\n  init: function () {\n    if (SERVICE.DefaultRuntimeLifecycleService) {\n      SERVICE.DefaultRuntimeLifecycleService.registerContributor('myProvider', {\n        order: 700,\n        shutdown: () => this.close()\n      });\n    }\n    return Promise.resolve(true);\n  },\n\n  postInit: function () {\n    return this.verifyProviderCanServeCurrentTenant();\n  }\n};\n```\n\nDo not start unmanaged timers or background jobs directly from arbitrary service init hooks. Scheduled work should normally be represented by cron job data and executed through the Process/Cron module lifecycle.\n\n## Fresh schema and init data\n\nStartup imports initialization data only when `NODICS.initRequired` is true. In the current profile-owned bootstrap path, profile module `postInit` checks the profile database. It treats startup as requiring init data when collections are missing, enterprise records are missing, or the default bootstrap employee is missing.\n\nWhen init is required, the framework coordinator calls:\n\n```js\nSERVICE.DefaultImportService.importInitData({\n  tenant: CONFIG.get('defaultTenant') || 'default',\n  modules: NODICS.getActiveModules()\n});\n```\n\n`DefaultImportService.importInitData` sets `request.dataType = 'init'`, runs `systemDataImportInitializerPipeline`, and then dispatches finalized records through `processDataImportPipeline`.\n\n```mermaid\nflowchart LR\n  InitRequired[\"NODICS.initRequired = true\"] --> ImportInit[\"importInitData\"]\n  ImportInit --> SystemPipeline[\"systemDataImportInitializerPipeline\"]\n  SystemPipeline --> Headers[\"Load headers\"]\n  SystemPipeline --> Records[\"Load records\"]\n  Headers --> ProcessPipeline[\"processDataImportPipeline\"]\n  Records --> ProcessPipeline\n  ProcessPipeline --> Models[\"Schema model writes\"]\n```\n\nStartup evaluates versioned Init releases on every boot through `DefaultDataReleaseService.installStartupReleases()`. Current releases are skipped and new deltas complete before readiness. `NODICS.isInitRequired()` still serves owning bootstrap/schema checks; it is not the release skip ledger. Editing an already applied Init release without a new version fails startup.\n\nThe release data involved here lives under active module folders such as:\n\n```text\ndata/\n  init-v001/\n    headers/\n    records/\n```\n\nThis startup import is for mandatory initialization. Core and sample data are governed data release operations and should be triggered intentionally through the import/release process.\n\n## Mandatory bootstrap reconcilers\n\nAfter init data import, Nodics runs configured mandatory bootstrap services. These are ordered, idempotent services declared through `mandatoryBootstrapServices`. They are intended for records that must exist for the runtime to remain operable even if a data release is incomplete.\n\n```js\nmodule.exports = {\n  mandatoryBootstrapServices: {\n    defaultIdentity: {\n      enabled: true,\n      order: 100,\n      service: 'DefaultMandatoryIdentityBootstrapService'\n    }\n  }\n};\n```\n\nEach configured service must expose `reconcile(request)`.\n\n```js\nmodule.exports = {\n  reconcile: function (request) {\n    return SERVICE.DefaultEmployeeService.saveOrUpdate({\n      tenant: request.tenant,\n      model: {\n        loginId: 'admin',\n        active: true\n      }\n    });\n  }\n};\n```\n\nReconcilers must be idempotent. They should create or repair required records, not blindly insert duplicates.\n\n## Internal identity and tenant context\n\nAfter bootstrap reconciliation, startup prepares internal service identity. If profile is active locally, Nodics verifies the default employee by API key and issues a service token through `DefaultServiceTokenService`. If profile is remote, Nodics fetches an internal token from the configured profile endpoint.\n\nThen `DefaultEnterpriseHandlerService.buildEnterprises()` builds active enterprise and tenant context. That is why init data and identity bootstrap must complete before the server is marked ready.\n\n## Router startup and readiness\n\nOnly after the framework lifecycle completes does `DefaultRouterService` start HTTP and HTTPS listeners. It loops over active modules, checks whether each module is router-enabled, attaches the prepared module router, and starts the configured ports.\n\n```js\nSERVICE.DefaultRouterService.startServers().then(() => {\n  NODICS.setEndTime(new Date());\n  SERVICE.DefaultRuntimeLifecycleService.markStarted({ reason: 'startup' });\n});\n```\n\nIf listener startup fails, startup waits for sibling bind results and closes listeners that opened successfully. The runtime transitions to `failed`, drains and closes registered resources, then rejects with the original error. The launcher reports a nonzero process outcome after cleanup. `start()` returns a promise so callers and tests can await that entire outcome.\n\n## Operations and governance\n\nOperators should treat startup output as runtime evidence, not console noise. The startup log should identify the selected `NODICS_HOME`, environment path, server root, server path, optional node path, log path, configuration loading contract, and the active module order from top to bottom. Those lines are the first proof that the process is running the intended project and not a stale checkout, wrong environment, or wrong server composition.\n\n| Operator check | Evidence to collect |\n| --- | --- |\n| Correct runtime selected | `NODICS_ENV`, `SERVER_ROOT`, `SERVER`, optional `NODE`, and port bindings. |\n| Correct module graph | Active module list with dotted numeric indexes and no duplicate indexes. |\n| Correct configuration | Logged configuration precedence and expected external property files. |\n| Fresh schema handled | Init-required log, `init-v001` import result, and mandatory bootstrap reconciler result. |\n| Identity ready | Internal service token creation or remote profile token retrieval. |\n| Tenant context ready | Enterprise/tenant build result and readiness health contributor state. |\n| Server reachable | HTTP/HTTPS listener logs and runtime lifecycle `started` state. |\n\nIf startup fails, preserve the first meaningful error and the selected runtime paths before retrying. Retrying without checking the selected environment, module index, database, and init data state can hide the real cause and create partial bootstrap data.\n\n## Customization decision guide\n\n| Need | Use | Why |\n| --- | --- | --- |\n| Validate local files or environment before services load | `config/prescripts.js` | Configuration exists, but services are not loaded yet. |\n| Prepare lightweight module state before its artifacts load | Module `nodics.js.init` | The behavior belongs to that module's load boundary. |\n| Register health, lifecycle, provider, or service-owned startup state | Service `init` | The service owns the runtime contributor. |\n| Verify loaded registries before HTTP starts | `config/postscripts.js` | Services and pipelines are available, but traffic is not open. |\n| Decide whether first startup needs mandatory data | Module `nodics.js.postInit` or an owning bootstrap service | The check needs loaded models/services. |\n| Create or repair required records idempotently | `mandatoryBootstrapServices` | Keeps safety-critical bootstrap repair governed and repeatable. |\n| Change business behavior | Service, pipeline, validator, provider, or data release | Avoids putting business logic into startup glue. |\n\n## Safe pre-module-load customization\n\nUse `config/prescripts.js` when you need a hook before module artifacts load. This is the closest supported extension point to \"pre module load\".\n\nGood pre-script responsibilities:\n\n- validate required property values;\n- ensure a local folder exists when the folder path is configured;\n- register simple diagnostic markers;\n- fail fast when the selected runtime is unsafe.\n\nAvoid in pre-scripts:\n\n- calling `SERVICE` methods;\n- starting servers or timers;\n- importing business data;\n- mutating active module lists after they have already been resolved;\n- hiding tenant or security defaults outside properties.\n\n## Safe post-module-load customization\n\nUse `config/postscripts.js` or module `nodics.js.postInit` when the behavior needs loaded services or registries.\n\nGood post-module-load responsibilities:\n\n- verify a required service or pipeline exists;\n- register runtime readiness contributors through a service;\n- run idempotent checks that should block HTTP startup on failure;\n- prepare module-local caches from already-loaded configuration.\n\nAvoid in post-scripts:\n\n- inserting business records that belong in data releases or bootstrap reconcilers;\n- doing long-running network work without timeout or observable failure;\n- silently swallowing errors that should block startup;\n- creating background schedulers outside Process/Cron.\n\n## Troubleshooting\n\n| Symptom | Likely area | What to check |\n| --- | --- | --- |\n| `Default server is not configured` | Startup selection | Pass `SERVER`/`S` or configure `defaultServer`. |\n| `Ambiguous server` | Environment selection | Pass `ENV`/`E` when a server name exists in multiple environments. |\n| `active module references unknown module` | Active module config | Check `activeModules.groups`, `activeModules.modules`, aliases, and module roots. |\n| Duplicate module index | Module metadata | Ensure each active runtime module has a unique dotted numeric `index`. |\n| Required module inactive | Dependency contract | Activate the dependency locally or redesign as a remote API dependency. |\n| Service override not active | Index and active module list | Confirm the project module is active and loads after the base service. |\n| Init data not imported on fresh schema | Profile/bootstrap check | Check profile collections, enterprise records, and bootstrap employee. |\n| Server never opens port | Router config | Check `servers.default.endpoint.httpPort`, router-enabled metadata, and listener errors. |\n| Axis login fails after fresh schema | Init data or identity bootstrap | Check `init-v001` import, mandatory bootstrap services, and internal token creation. |\n\n## Common mistakes\n\n- Assuming `npm install` dependency order controls runtime override order.\n- Putting business records into startup scripts instead of data releases.\n- Using pre-scripts for service calls before services are loaded.\n- Updating root `nodics.ai` as if it were a runtime module.\n- Activating remote-only modules as local required modules.\n- Adding a project override without assigning a later module index.\n- Swallowing startup errors and allowing an unsafe server to listen.\n- Forgetting that startup import covers `init` data, not every `core` or `sample` release.\n\n## Verification\n\nFor startup or nConfig changes, verify at least:\n\n```bash\nnpm run validate:root\nnpm run quality:docs\nnpm --prefix nodics.docs test\n```\n\nFor code changes that affect module discovery, ordering, properties, or lifecycle hooks, add focused tests around `nConfig` and run the relevant runtime prepare/start path against a fresh schema. For changes that affect initial data, also run the import suite and manually verify Axis login, dashboard guidance, module registry, imports/exports, and publishing pages.\n\n## Proving completed startup and failure cleanup\n\nFor an operator, readiness means required setup and configured listener binds completed. An informational log from an earlier phase does not establish that. For a module author, return the promise for each required operation and register resource cleanup through `DefaultRuntimeLifecycleService` before opening the resource. A project can customize deadlines and owner implementations through existing layers, while retaining this completion rule.\n\nConsider a runtime with HTTP and a database connection. HTTP binds successfully, but another configured listener fails because its port is occupied. Startup waits for pending sibling binds, closes opened listeners, drains other registered work and closes database handles. It reports the occupied-port error even if a cleanup hook also fails. The cleanup error remains diagnostic evidence.\n\n| Scenario | Expected result | Evidence |\n| --- | --- | --- |\n| Required async pre/post script pending | Later lifecycle stages wait. | Phase trace before and after promise completion. |\n| Required enterprise or search initialization fails | No ready state; registered resources close. | Original failure plus cleanup results. |\n| One listener opens after a sibling already failed | The late listener also closes. | Retained listener handles and closed state. |\n| Cleanup hook throws or exceeds its deadline | Later cleanup contributors still run. | Separate cleanup failure and subsequent close results. |\n| Token rotation is in flight at shutdown | No new refresh starts; drain awaits active refresh within its deadline. | Timer cleared and refresh settled. |\n| Tenant enables startup jobs | Job creation completes once through Cron. | Owning job service result; no enterprise-owned repeat timer. |\n\nFor a failed required import, cleanup does not undo successful database writes. Retry safety belongs to the immutable release and owning import operation. Provider-specific cancellation and rollback must be qualified separately; a timeout cannot stop arbitrary code that does not cooperate with cancellation. The focused lifecycle tests exercise completion and failure ordering with controlled resources; they are not live authentication or database recovery proof.\n",
      "previous": {
        "title": "Application Configuration and Runtime Behavior Management",
        "route": "/docs/framework/configuration-runtime-behavior-management"
      },
      "next": {
        "title": "Routing and API Governance",
        "route": "/docs/framework/routing-api-governance"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "config",
        "owner": "config",
        "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "wordCount": 3402,
        "checksum": "c5bc1401f1771e8a44956c2205735bde6c3278d5ca7e17191e2d9d003d3dbba2"
      },
      "slug": "configuration-framework-startup-lifecycle",
      "locale": "en",
      "navigationGroup": "Configuration Layers and Behavior",
      "navigationGroupCode": "configuration-layers-and-behavior",
      "navigationGroupOrder": 10,
      "navigationOrder": 15,
      "references": [
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "framework.module-loading-service-precedence",
          "owner": "config"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "foundation.error-handling-status-codes",
          "owner": "nCommon"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        },
        {
          "documentId": "data.import-export-migration",
          "owner": "import"
        },
        {
          "documentId": "framework.local-quick-start",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentruntimeGovernedChange",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "runtime.governed-change",
      "title": "Governed Runtime Change Capability",
      "route": "/docs/framework/runtime-governed-change",
      "section": "runtime-governance-and-dynamic-change-management",
      "sectionTitle": "Runtime Governance and Dynamic Change Management",
      "group": "runtime-governance-and-dynamic-change-management",
      "groupTitle": "Runtime Governance and Dynamic Change Management",
      "parentId": "runtime-governance-and-dynamic-change-management",
      "hierarchyPath": [
        "Runtime Governance and Dynamic Change Management",
        "Governed Runtime Change Capability"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "How Nodics handles runtime configuration and business behavior changes across clustered nodes through governed APIs and event propagation.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "configuration.runtime-behavior-management",
        "events.messaging-cluster-coordination",
        "pipeline.business-logic-orchestration"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
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
        "runtime-governance-and-dynamic-change-management",
        "governed-runtime-change",
        "governed-runtime-change-capability"
      ],
      "topicKeywords": [
        "Runtime Governance and Dynamic Change Management",
        "Governed Runtime Change",
        "Governed Runtime Change Capability"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "runtimeGovernedChange-1-business-context",
          "level": 2
        },
        {
          "text": "Runtime model",
          "anchor": "runtimeGovernedChange-2-runtime-model",
          "level": 2
        },
        {
          "text": "Lifecycle and node safety",
          "anchor": "runtimeGovernedChange-3-lifecycle-and-node-safety",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "runtimeGovernedChange-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "runtimeGovernedChange-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "runtimeGovernedChange-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "runtimeGovernedChange-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Governed runtime change is the Nodics capability for changing selected application behavior while the platform is running, without asking an operator to edit each node manually. It is important for business users because runtime change supports faster reaction to operational needs. It is important for developers because the change still has to respect ownership, validation, event propagation, lifecycle state, and rollback boundaries. This page is for beginners, administrators, developers, operators, QA owners, architects, and AI tools that need to understand what can safely change at runtime and how that change moves across a clustered installation."
        },
        {
          "kind": "paragraph",
          "text": "The principle is simple: a runtime change is still a governed change. It must have a source record, an owning capability, a validation path, a propagation mechanism, and evidence that every affected node has refreshed the right local state. Nodics already uses this pattern for runtime schema and router contributions, pipeline definitions, event listeners, API key refresh, and other behavior that is stored in local registries after startup."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "runtimeGovernedChange-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is avoiding slow and unsafe operations. In a clustered deployment, changing a route policy, schema contribution, pipeline step, API key, or listener on only one node creates inconsistent customer experience. One node may accept a request that another node rejects. One node may run a new business rule while another still uses the old one. Governed runtime change gives Axis and backend services a controlled way to update behavior and notify the runtime."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Runtime-change answer"
          ],
          "rows": [
            [
              "Change behavior without node-by-node manual work",
              "Persist the governed record once and propagate a change event."
            ],
            [
              "Keep customization auditable",
              "Store source, owner, approval, actor, changed fields, and validation result."
            ],
            [
              "Avoid uncontrolled production drift",
              "Merge runtime records through known registries and lifecycle services."
            ],
            [
              "Support business agility",
              "Let approved changes become active without waiting for a full rebuild when the capability supports runtime refresh."
            ],
            [
              "Help support teams troubleshoot",
              "Capture runtime state, event delivery, node id, module, tenant, and validation evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime model",
          "anchor": "runtimeGovernedChange-2-runtime-model"
        },
        {
          "kind": "paragraph",
          "text": "Nodics runtime behavior is assembled from file-based module contributions and, where supported, persisted runtime records. `DefaultFilesLoaderService` loads governed files from indexed modules, applies merge or replace policies, and adds override trace metadata. Runtime registry merging records the source module and runtime source so developers can explain why the effective behavior looks the way it does."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Axis[\"Axis governed update\"] --> API[\"Owning API/service\"]\n  API --> Persist[\"Persisted runtime record\"]\n  Persist --> Event[\"Runtime change event\"]\n  Event --> NodeA[\"Node A listener\"]\n  Event --> NodeB[\"Node B listener\"]\n  NodeA --> RegistryA[\"Local registry refresh\"]\n  NodeB --> RegistryB[\"Local registry refresh\"]\n  RegistryA --> BehaviorA[\"Effective behavior\"]\n  RegistryB --> BehaviorB[\"Effective behavior\"]"
        },
        {
          "kind": "paragraph",
          "text": "Runtime schema governance supports merge and replace modes. It can remove properties through `$override.removeProperties` and can require an explicit breaking-change flag for risky changes. Router governance has similar traceable behavior for route keys, methods, controllers, operations, secured state, access groups, and removed routes. The same contract shape applies to business-runtime records such as pipelines and event listeners: a persisted record changes the effective in-memory registry, and event listeners refresh or remove entries after save/update/removal."
        },
        {
          "kind": "table",
          "headers": [
            "Runtime area",
            "Current mechanism",
            "What changes locally"
          ],
          "rows": [
            [
              "Schema contribution",
              "Governed file and runtime schema registry merge",
              "Generated model behavior, validation, collection options, and trace metadata."
            ],
            [
              "Router contribution",
              "Governed file and runtime router registry merge",
              "Route availability, handler binding, security, and access groups."
            ],
            [
              "Pipeline definition",
              "File definitions plus persisted `PipelineModel` entries",
              "Business flow nodes, success branches, nested pipeline calls, and error routing."
            ],
            [
              "Event listener definition",
              "File listeners plus persisted listener records",
              "Local event registration, active listeners, and node-specific handling."
            ],
            [
              "API key and configuration refresh",
              "Domain event listeners",
              "Local authentication or runtime configuration cache refresh."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle and node safety",
          "anchor": "runtimeGovernedChange-3-lifecycle-and-node-safety"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultRuntimeLifecycleService` owns the process lifecycle states used during startup, readiness, degraded operation, draining, stopping, and failure. It accepts contributors with stable order values and executes lifecycle hooks with timeouts. Database connections and messaging clients register lifecycle contributors so the platform can drain work and close external resources in a controlled way."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "runtimeChange: {\n  source: 'axis',\n  owner: 'configuration',\n  code: 'routerConfiguration',\n  approval: 'required',\n  propagation: 'event',\n  rollback: 'restore-previous-version'\n}"
        },
        {
          "kind": "paragraph",
          "text": "For operators, this means a runtime change should not be documented as only a save operation. The documentation must say whether the change is startup-only, runtime-refreshable, requires event propagation, requires cache invalidation, or requires a controlled restart. If multiple nodes are running, the page must also explain how a partial propagation failure is identified."
        },
        {
          "kind": "table",
          "headers": [
            "Lifecycle concern",
            "Documentation requirement"
          ],
          "rows": [
            [
              "Startup loading",
              "Identify file-based contributions and persisted runtime records."
            ],
            [
              "Readiness",
              "Explain which external clients, database connections, or registries must be ready."
            ],
            [
              "Draining",
              "State whether in-flight consumers, cron jobs, or pipelines must complete first."
            ],
            [
              "Shutdown",
              "Mention lifecycle contributor behavior when the capability owns external handles."
            ],
            [
              "Recovery",
              "Explain whether the next startup reloads persisted records or only file definitions."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "runtimeGovernedChange-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should add runtime-customizable behavior only through an owning capability. A project may add a new schema property, router entry, listener, pipeline node, cache provider setting, or validation rule when the owning service supports it. The page must identify the project-layer override path, the runtime record type if one exists, the event that refreshes local state, and the exact rollback action."
        },
        {
          "kind": "table",
          "headers": [
            "Customization goal",
            "Recommended path",
            "Required explanation"
          ],
          "rows": [
            [
              "Add a schema property",
              "Project-layer schema contribution or governed runtime schema record.",
              "Merge mode, validation, collection impact, and breaking-change risk."
            ],
            [
              "Change a route policy",
              "Governed router contribution.",
              "Route key, secured flag, access groups, controller operation, and propagation event."
            ],
            [
              "Change business flow",
              "Pipeline file or persisted pipeline model.",
              "Start node, changed nodes, branch behavior, test scenario, and rollback."
            ],
            [
              "Refresh local security state",
              "Authorized API plus event listener.",
              "Actor, affected key/configuration, nodes notified, and cache invalidation."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "runtimeGovernedChange-5-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Every governed runtime-change page must include an operational matrix. The matrix helps business users understand approval impact and helps operators avoid silent drift. A change that modifies behavior for pricing, checkout, publication, workflow, authentication, cron responsibility, or data access is high impact and should have explicit approval and regression evidence."
        },
        {
          "kind": "table",
          "headers": [
            "Failure mode",
            "Symptom",
            "Troubleshooting step"
          ],
          "rows": [
            [
              "Event did not reach a node",
              "Different nodes show different behavior.",
              "Compare node id, event log, listener registration, and local registry state."
            ],
            [
              "Breaking schema change rejected",
              "Runtime merge warning or validation failure.",
              "Check `$override.allowBreakingChanges` and migration readiness."
            ],
            [
              "Route override not applied",
              "API still uses previous handler or access policy.",
              "Check effective router registry and override trace metadata."
            ],
            [
              "Pipeline change stale",
              "New branch works on one node only.",
              "Verify persisted pipeline codes and pipeline update event handling."
            ],
            [
              "Lifecycle drain interrupted",
              "Consumers or connections close during active work.",
              "Review runtime lifecycle state and contributor timeout logs."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "runtimeGovernedChange-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating runtime change as a shortcut around validation.",
            "Updating Axis UI metadata without updating the backend-owned capability record.",
            "Forgetting that each node has local in-memory registries that must refresh.",
            "Documenting only the happy path and skipping rollback or partial-propagation checks.",
            "Mixing startup-only configuration with runtime-refreshable configuration.",
            "Hiding source ownership by using only friendly labels and no source map.",
            "Changing behavior that affects checkout, pricing, publication, or security without approval evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "runtimeGovernedChange-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification must cover both the document and the runtime behavior. The document must include the business problem, owning capability, source record, flow diagram, configuration table, code example, troubleshooting matrix, extension path, risk notes, common mistakes, and validation commands. The implementation must prove that a saved or updated record refreshes the effective registry and that a removed or inactive record is no longer used."
        },
        {
          "kind": "paragraph",
          "text": "Useful focused checks include runtime override governance tests, configuration ownership contract tests, runtime lifecycle service tests, pipeline runtime change tests, event listener update tests, EMS message processing tests, and documentation catalogue validation. Production-like validation should also confirm that unauthorized users cannot trigger runtime changes, Online content does not expose Staged records, and cluster propagation leaves every active node with the same effective behavior."
        }
      ],
      "searchText": "Governed Runtime Change Capability How Nodics handles runtime configuration and business behavior changes across clustered nodes through governed APIs and event propagation. # Governed Runtime Change Capability\n\nGoverned runtime change is the Nodics capability for changing selected application behavior while the platform is running, without asking an operator to edit each node manually. It is important for business users because runtime change supports faster reaction to operational needs. It is important for developers because the change still has to respect ownership, validation, event propagation, lifecycle state, and rollback boundaries. This page is for beginners, administrators, developers, operators, QA owners, architects, and AI tools that need to understand what can safely change at runtime and how that change moves across a clustered installation.\n\nThe principle is simple: a runtime change is still a governed change. It must have a source record, an owning capability, a validation path, a propagation mechanism, and evidence that every affected node has refreshed the right local state. Nodics already uses this pattern for runtime schema and router contributions, pipeline definitions, event listeners, API key refresh, and other behavior that is stored in local registries after startup.\n\n## Business context\n\nThe business problem is avoiding slow and unsafe operations. In a clustered deployment, changing a route policy, schema contribution, pipeline step, API key, or listener on only one node creates inconsistent customer experience. One node may accept a request that another node rejects. One node may run a new business rule while another still uses the old one. Governed runtime change gives Axis and backend services a controlled way to update behavior and notify the runtime.\n\n| Business need | Runtime-change answer |\n| --- | --- |\n| Change behavior without node-by-node manual work | Persist the governed record once and propagate a change event. |\n| Keep customization auditable | Store source, owner, approval, actor, changed fields, and validation result. |\n| Avoid uncontrolled production drift | Merge runtime records through known registries and lifecycle services. |\n| Support business agility | Let approved changes become active without waiting for a full rebuild when the capability supports runtime refresh. |\n| Help support teams troubleshoot | Capture runtime state, event delivery, node id, module, tenant, and validation evidence. |\n\n## Runtime model\n\nNodics runtime behavior is assembled from file-based module contributions and, where supported, persisted runtime records. `DefaultFilesLoaderService` loads governed files from indexed modules, applies merge or replace policies, and adds override trace metadata. Runtime registry merging records the source module and runtime source so developers can explain why the effective behavior looks the way it does.\n\n```mermaid\nflowchart LR\n  Axis[\"Axis governed update\"] --> API[\"Owning API/service\"]\n  API --> Persist[\"Persisted runtime record\"]\n  Persist --> Event[\"Runtime change event\"]\n  Event --> NodeA[\"Node A listener\"]\n  Event --> NodeB[\"Node B listener\"]\n  NodeA --> RegistryA[\"Local registry refresh\"]\n  NodeB --> RegistryB[\"Local registry refresh\"]\n  RegistryA --> BehaviorA[\"Effective behavior\"]\n  RegistryB --> BehaviorB[\"Effective behavior\"]\n```\n\nRuntime schema governance supports merge and replace modes. It can remove properties through `$override.removeProperties` and can require an explicit breaking-change flag for risky changes. Router governance has similar traceable behavior for route keys, methods, controllers, operations, secured state, access groups, and removed routes. The same contract shape applies to business-runtime records such as pipelines and event listeners: a persisted record changes the effective in-memory registry, and event listeners refresh or remove entries after save/update/removal.\n\n| Runtime area | Current mechanism | What changes locally |\n| --- | --- | --- |\n| Schema contribution | Governed file and runtime schema registry merge | Generated model behavior, validation, collection options, and trace metadata. |\n| Router contribution | Governed file and runtime router registry merge | Route availability, handler binding, security, and access groups. |\n| Pipeline definition | File definitions plus persisted `PipelineModel` entries | Business flow nodes, success branches, nested pipeline calls, and error routing. |\n| Event listener definition | File listeners plus persisted listener records | Local event registration, active listeners, and node-specific handling. |\n| API key and configuration refresh | Domain event listeners | Local authentication or runtime configuration cache refresh. |\n\n## Lifecycle and node safety\n\n`DefaultRuntimeLifecycleService` owns the process lifecycle states used during startup, readiness, degraded operation, draining, stopping, and failure. It accepts contributors with stable order values and executes lifecycle hooks with timeouts. Database connections and messaging clients register lifecycle contributors so the platform can drain work and close external resources in a controlled way.\n\n```js\nruntimeChange: {\n  source: 'axis',\n  owner: 'configuration',\n  code: 'routerConfiguration',\n  approval: 'required',\n  propagation: 'event',\n  rollback: 'restore-previous-version'\n}\n```\n\nFor operators, this means a runtime change should not be documented as only a save operation. The documentation must say whether the change is startup-only, runtime-refreshable, requires event propagation, requires cache invalidation, or requires a controlled restart. If multiple nodes are running, the page must also explain how a partial propagation failure is identified.\n\n| Lifecycle concern | Documentation requirement |\n| --- | --- |\n| Startup loading | Identify file-based contributions and persisted runtime records. |\n| Readiness | Explain which external clients, database connections, or registries must be ready. |\n| Draining | State whether in-flight consumers, cron jobs, or pipelines must complete first. |\n| Shutdown | Mention lifecycle contributor behavior when the capability owns external handles. |\n| Recovery | Explain whether the next startup reloads persisted records or only file definitions. |\n\n## Customization and extension\n\nDevelopers should add runtime-customizable behavior only through an owning capability. A project may add a new schema property, router entry, listener, pipeline node, cache provider setting, or validation rule when the owning service supports it. The page must identify the project-layer override path, the runtime record type if one exists, the event that refreshes local state, and the exact rollback action.\n\n| Customization goal | Recommended path | Required explanation |\n| --- | --- | --- |\n| Add a schema property | Project-layer schema contribution or governed runtime schema record. | Merge mode, validation, collection impact, and breaking-change risk. |\n| Change a route policy | Governed router contribution. | Route key, secured flag, access groups, controller operation, and propagation event. |\n| Change business flow | Pipeline file or persisted pipeline model. | Start node, changed nodes, branch behavior, test scenario, and rollback. |\n| Refresh local security state | Authorized API plus event listener. | Actor, affected key/configuration, nodes notified, and cache invalidation. |\n\n## Operations and governance\n\nEvery governed runtime-change page must include an operational matrix. The matrix helps business users understand approval impact and helps operators avoid silent drift. A change that modifies behavior for pricing, checkout, publication, workflow, authentication, cron responsibility, or data access is high impact and should have explicit approval and regression evidence.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Event did not reach a node | Different nodes show different behavior. | Compare node id, event log, listener registration, and local registry state. |\n| Breaking schema change rejected | Runtime merge warning or validation failure. | Check `$override.allowBreakingChanges` and migration readiness. |\n| Route override not applied | API still uses previous handler or access policy. | Check effective router registry and override trace metadata. |\n| Pipeline change stale | New branch works on one node only. | Verify persisted pipeline codes and pipeline update event handling. |\n| Lifecycle drain interrupted | Consumers or connections close during active work. | Review runtime lifecycle state and contributor timeout logs. |\n\n## Common mistakes\n\n- Treating runtime change as a shortcut around validation.\n- Updating Axis UI metadata without updating the backend-owned capability record.\n- Forgetting that each node has local in-memory registries that must refresh.\n- Documenting only the happy path and skipping rollback or partial-propagation checks.\n- Mixing startup-only configuration with runtime-refreshable configuration.\n- Hiding source ownership by using only friendly labels and no source map.\n- Changing behavior that affects checkout, pricing, publication, or security without approval evidence.\n\n## Verification\n\nVerification must cover both the document and the runtime behavior. The document must include the business problem, owning capability, source record, flow diagram, configuration table, code example, troubleshooting matrix, extension path, risk notes, common mistakes, and validation commands. The implementation must prove that a saved or updated record refreshes the effective registry and that a removed or inactive record is no longer used.\n\nUseful focused checks include runtime override governance tests, configuration ownership contract tests, runtime lifecycle service tests, pipeline runtime change tests, event listener update tests, EMS message processing tests, and documentation catalogue validation. Production-like validation should also confirm that unauthorized users cannot trigger runtime changes, Online content does not expose Staged records, and cluster propagation leaves every active node with the same effective behavior.\n",
      "previous": {
        "title": "Error Handling and Status Codes",
        "route": "/docs/framework/foundation-error-handling-status-codes"
      },
      "next": {
        "title": "Localization and Internationalization",
        "route": "/docs/framework/localization-internationalization"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "config",
        "owner": "config",
        "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
        "wordCount": 1282,
        "checksum": "07fba0e1d51410d70ad61804682e02408a941f6b3158741d5c517c8c895cbf94"
      },
      "slug": "runtime-governed-change",
      "locale": "en",
      "navigationGroup": "Governed Runtime Change",
      "navigationGroupCode": "governed-runtime-change",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "events.messaging-cluster-coordination",
          "owner": "emsClient"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        }
      ]
    },
    "active": true
  }
};
