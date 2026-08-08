'use strict';

/** @description Generated Nodics framework documentation navigation and article content. */
module.exports = {
  "record0": {
    "code": "nodicsDocumentationNavigation",
    "typeCode": "nodicsDocumentationNavigationComponentType",
    "renderer": "documentation.component.navigation",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "title": "Nodics Framework",
      "searchLabel": "Search framework documentation",
      "searchPlaceholder": "Search modules, contracts, registry, and runtime guidance",
      "emptyMessage": "No framework documentation matches your search.",
      "sections": [
        {
          "code": "nodics-docs",
          "title": "Nodics docs",
          "order": 10
        },
        {
          "code": "nodics-core",
          "title": "Nodics core",
          "order": 20
        },
        {
          "code": "nodics-platform",
          "title": "Nodics platform",
          "order": 30
        }
      ],
      "items": [
        {
          "code": "framework.what-is-nodics",
          "title": "What is Nodics?",
          "route": "/docs/framework",
          "section": "nodics-docs",
          "sectionTitle": "Nodics docs",
          "sectionOrder": 10,
          "order": 10,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "Business, beginner, and adoption-oriented introduction to the Nodics enterprise framework.",
          "searchText": "What is Nodics? Business, beginner, and adoption-oriented introduction to the Nodics enterprise framework. # What is Nodics?\n\nNodics is a modular enterprise application framework for building serious\nbusiness platforms without asking every project to reinvent the same\narchitecture. It gives teams a governed backend foundation for APIs, data,\nconfiguration, authentication, permissions, runtime composition, imports,\nexports, content management, scheduled work, events, testing, and operational\ncontracts.\n\nIn plain language, Nodics is an application factory. A factory does not decide\nwhich product your company sells. It gives you repeatable equipment, safety\nrules, quality checks, extension points, and production discipline. Your\nproject still owns its business rules, customer-specific behavior, integrations,\nand user experiences.\n\n## The problem Nodics solves\n\nModern teams can create an MVP very quickly, especially with AI-assisted\ndevelopment. The hard part starts when that MVP becomes a real product. Code\nthat was written only to prove an idea often has no strong module boundaries,\nno tenant model, no safe customization path, no consistent API contracts, weak\nsecurity, duplicated configuration, and limited tests. Every new customer adds\nanother exception. Every exception makes future releases slower and riskier.\n\nNodics turns those repeated scaling problems into explicit contracts. A feature\nbelongs to an owning capability. Configuration has layered scope. Services,\nschemas, routes, APIs, and generated artifacts are created in known places.\nCustomer customizations load after framework behavior instead of editing the\nframework directly. Axis renders employee workspaces, but backend modules keep\nauthority over data and operations.\n\n## Why a business should care\n\nFor a business evaluator, the important point is not the folder structure. The\nimportant point is that Nodics helps teams move from idea to production without\nthrowing away the architecture. It supports faster delivery while keeping\ngovernance, maintainability, tenant isolation, operational visibility, and safe\ncustomer-specific change in view from the beginning.\n\nThis matters when an organization wants one platform to support many\nenterprises, tenants, brands, websites, internal teams, or partner\ncustomizations. The modular approach reduces the cost of change because a\nproject can extend or configure the owner of a behavior instead of copying code\ninto another place. That lowers upgrade risk, reduces duplicate authority, and\nhelps teams reason about who owns what.\n\n## Beginner mental model\n\nImagine a company needs employee login, content management, imports, media,\nscheduled jobs, and APIs. Without a framework, the first team might build login\none way, the second team might build imports another way, and the third team\nmight put customer-specific rules directly into shared code. The application\nworks for a while, then becomes difficult to secure, test, deploy, or extend.\n\nWith Nodics, those concerns have named owners. Profile owns employee identity.\nWCMS owns CMS content. Media owns media records and lifecycle. Cron owns\nscheduled work. BackOffice exposes operational metadata. Axis renders the user\ninterface by consuming authorized backend contracts. A customer project, such\nas Kickoff, composes these capabilities and adds project behavior after the\nframework modules.\n\n## What teams can build\n\nNodics can be used as the backend foundation for multi-tenant business APIs,\nemployee BackOffice applications, CMS-driven websites, governed content and\nmedia operations, data import/export flows, scheduled jobs, and customer\nplatforms that need safe extension. The framework supplies reusable capability\ncontracts; the adopting project supplies the business-specific behavior and\ndeployment decisions.\n\nThe current reference workspace demonstrates this through `nodics.kickoff`,\nwhich starts local Platform, WCMS, and Cron servers, and through `nodics.axis`,\nwhich logs employees in and renders discovered workspaces and documentation.\n\n## What Nodics is not\n\nNodics is not a finished industry product that removes the need for business\nanalysis. It is not a frontend repository. It is not permission to access\nanother module's database directly. It does not make operations automatic:\ncredentials, infrastructure, monitoring, backup, scaling, and production\nsecurity remain deployment responsibilities.\n\nThe promise is more practical: Nodics gives a project a governed model for\nbuilding and evolving enterprise software without scattering ownership.\n\n## Next actions\n\n- Read modular architecture to understand ownership and runtime composition.\n- Follow the local quick start to run Kickoff and Axis.\n- Read customization guidance before changing framework behavior.\n- Read runtime and DevOps operations before planning production topology.\n"
        },
        {
          "code": "framework.modular-architecture",
          "title": "Modular architecture and ownership",
          "route": "/docs/framework/framework-modular-architecture",
          "section": "nodics-core",
          "sectionTitle": "Nodics core",
          "sectionOrder": 20,
          "order": 20,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "How functional modules, technical modules, runtime servers, and customer projects fit together.",
          "searchText": "Modular architecture and ownership How functional modules, technical modules, runtime servers, and customer projects fit together. # Modular architecture and ownership\n\nNodics is organized around ownership. Every meaningful behavior should have a\ncapability owner, and every runtime server should load an explicit chain of\nmodules. This is what lets a local reference project stay small while the same\nframework can later support larger distributed deployments.\n\n## What this is\n\nThe modular architecture defines how framework modules, functional module\ngroups, customer projects, environment modules, server modules, and services\nfit together. It prevents the common failure where code is placed wherever it\nfirst works and nobody can later tell which component owns the behavior.\n\n## Functional modules and technical modules\n\nA functional module is the business-facing capability identity. Examples are\n`nodics.core`, `nodics.platform`, `nodics.wcms`, and `nodics.cron`. Axis and\nBackOffice talk about these capabilities at this level because business users\ndo not need to manage every internal technical module.\n\nA technical module is an implementation unit inside a functional module group.\nFor example, Core contains many technical modules for configuration, data,\nservices, routing, validation, cache, and system behavior. Those modules are\nimportant to developers, but they should not flood the module registry user\nexperience unless a business capability genuinely needs to expose them.\n\n## Runtime server composition\n\nRepository dependencies only make code available. Runtime `extends`\nconfiguration decides what actually loads. A Platform server normally loads\nCore first, Platform second, then project and environment/server modules. A\nWCMS server loads Core, WCMS, and project modules. A Cron server loads Core,\nCron, and project modules.\n\nThe order matters because service override and merge behavior follow runtime\nload order and module indexes. Module hierarchy describes functional\navailability; service precedence describes which implementation wins at\nruntime. These are related but different concepts.\n\n## Customer projects\n\nCustomer projects live outside `nodics.ai`. The reference project is\n`nodics.kickoff`. It shows how a project can compose framework modules, provide\nlocal environment configuration, add project modules, and contribute\nproject-owned documentation without copying framework source.\n\nA future customer extension module such as `kickoff.platform` may customize\nPlatform behavior. That does not rename the functional capability. BackOffice\nand Axis should still present Platform as Platform unless the customer\nintentionally exposes a separate functional module.\n\n## Ownership boundaries\n\n- Framework source belongs in `nodics.ai`.\n- Framework documentation content belongs in `nodics.docs`.\n- Axis product documentation belongs in `nodics.platform/modules/axis`.\n- Customer documentation belongs in the owning customer project.\n- Browser renderers belong in `nodics.axis`.\n- CMS records that are imported into a database must be owned by backend\n  modules or backend projects, never the frontend repository.\n\n## Current capability map\n\nUse this map when deciding where new code, data, or documentation should live.\n\n| Capability | Repository or module owner | Runtime role | Documentation owner |\n| --- | --- | --- | --- |\n| Core framework | `nodics.ai/nodics.core` | Mandatory base for every runtime server | `nodics.docs` |\n| Platform and profile | `nodics.ai/nodics.platform` | Platform server capability for user onboarding, authentication, and registry-facing services | `nodics.docs` for framework behavior; `nodics.platform/modules/axis` for Axis product behavior |\n| Axis backend content | `nodics.ai/nodics.platform/modules/axis` | Backend-owned CMS records that allow the Axis frontend to render product documentation and shell experience | `nodics.platform/modules/axis` |\n| WCMS | `nodics.ai/nodics.wcms` | Content management runtime for sites, catalogs, pages, components, routes, and renderable content | `nodics.docs` |\n| Media | `nodics.ai/nodics.wcms/modules/media` | Governed media and asset lifecycle used by content experiences | `nodics.docs` |\n| Cron | `nodics.ai/nodics.cron` | Optional scheduled-job runtime capability | `nodics.docs` |\n| Framework documentation | `nodics.ai/nodics.docs` | Backend content pack imported into WCMS; not a UI renderer | `nodics.docs` |\n| Axis frontend | `nodics.axis` | Browser renderer for BackOffice, WCMS, docs, and module-owned capabilities | `nodics.platform/modules/axis` for product docs |\n| Kickoff reference project | `nodics.kickoff` | Customer-style project that composes framework servers locally | `nodics.kickoff` |\n\nThe key rule is simple: a frontend may render content, but it should not own\ndatabase-importable content. If a page, component, catalog, route, or\ndocumentation record is imported into WCMS, it must be shipped by the backend\nmodule or project that owns that content.\n\n## Business value\n\nThis architecture helps teams customize without forking. It also supports\nclearer cost control: teams can reuse a capability, configure it, extend it in\na later layer, and only create a new implementation when the existing contract\ncannot satisfy the requirement. That avoids duplicate authority paths and makes\nfuture framework upgrades more realistic.\n\n## Common mistakes\n\n- Copying Core, Platform, or WCMS source into a customer project.\n- Treating a server as the owner of a capability.\n- Exposing every technical module as a business registry item.\n- Putting CMS import data into `nodics.axis`.\n- Renaming a standard functional module because a customer customizes it.\n\n## Next actions\n\nAfter this page, read the local quick start and customization guide. Those\npages show how the architecture becomes concrete commands, files, and project\nrules.\n"
        },
        {
          "code": "framework.local-quick-start",
          "title": "Local quick start with Kickoff and Axis",
          "route": "/docs/framework/framework-local-quick-start",
          "section": "nodics-core",
          "sectionTitle": "Nodics core",
          "sectionOrder": 20,
          "order": 30,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation.",
          "searchText": "Local quick start with Kickoff and Axis Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation. # Local quick start with Kickoff and Axis\n\nThis guide starts the local reference stack from zero. It is written for a\ndeveloper who is new to Nodics and wants to see the framework, BackOffice, WCMS\ndocumentation, and Axis working locally.\n\n## What you will run\n\nThe reference setup uses three projects:\n\n- `nodics.ai` contains framework backend modules.\n- `nodics.kickoff` is the reference customer project and local server owner.\n- `nodics.axis` is the BackOffice frontend.\n\nKickoff starts backend servers. Axis connects to Platform, authenticates an\nemployee, reads the BackOffice bootstrap contract, and renders workspaces and\ndocumentation from registered backend sources.\n\n## Prerequisites\n\nInstall Node.js and npm versions compatible with the repositories. Start\nMongoDB before starting the backend. Elasticsearch and Redis may be needed when\ntheir providers are enabled by configuration; disabled providers may produce\ninformational logs and are not a failure in the reference setup.\n\n## Step 1: configure Kickoff\n\nOpen `nodics.kickoff`:\n\n```bash\ncd ../nodics.kickoff\ncp .env.example .env\n```\n\nEdit `.env`:\n\n```bash\nNODICS_FRAMEWORK_ROOT=../nodics.ai\n```\n\nThis tells Kickoff where the framework checkout lives. The path may be\nabsolute or relative to the Kickoff project root.\n\nGenerate local framework links and install:\n\n```bash\nnpm run configure:framework\nnpm install\n```\n\nThe configure step creates local links under `.nodics/framework`. That folder\nis machine-local and must not be committed.\n\n## Step 2: start backend servers\n\nUse separate terminals from `nodics.kickoff`.\n\nStart Platform:\n\n```bash\nnpm run start:platform\n```\n\nPlatform provides employee authentication, Profile, BackOffice bootstrap,\nruntime module registry, documentation-source registry, and Platform APIs.\nLocal HTTP port: `http://localhost:4300`.\n\nStart WCMS:\n\n```bash\nnpm run start:wcms\n```\n\nWCMS owns CMS sites, content catalogs, pages, components, routes, media, and\ndocumentation content-pack delivery. Local HTTP port:\n`http://localhost:4310`.\n\nStart Cron when scheduled work is needed:\n\n```bash\nnpm run start:cron\n```\n\n## Step 3: start Axis\n\nOpen `nodics.axis`:\n\n```bash\ncd ../nodics.axis\nnpm install\nnpm run dev\n```\n\nOpen `http://localhost:3100`.\n\n## Step 4: log in\n\nUse the reference employee:\n\n```text\nEnterprise: default\nUsername: admin\nPassword: adminPassword\n```\n\nAfter login, open `http://localhost:3100/docs`. You should see Framework,\nSwaggers, Nodics Axis, and Nodics Kickoff.\n\n## Troubleshooting\n\nIf Axis says the BackOffice registry is unavailable, Platform is not reachable\nor still starting. Check the Platform terminal and confirm port `4300`.\n\nIf CMS documentation is unavailable, WCMS is not reachable, the content pack\nhas not been imported, or the imported version is stale. Check port `4310` and\nthe content-pack import status.\n\nIf npm cannot resolve framework packages, rerun `npm run configure:framework`\nafter checking `NODICS_FRAMEWORK_ROOT`.\n\n## Next actions\n\nOnce the reference stack is running, read the customization guide before\nchanging code. Use Axis customization for presentation and project modules for\nbackend behavior.\n"
        },
        {
          "code": "framework.customization-guide",
          "title": "Customization and extension guide",
          "route": "/docs/framework/framework-customization-guide",
          "section": "nodics-core",
          "sectionTitle": "Nodics core",
          "sectionOrder": 20,
          "order": 40,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "How customer projects customize Nodics safely without forking framework authority.",
          "searchText": "Customization and extension guide How customer projects customize Nodics safely without forking framework authority. # Customization and extension guide\n\nNodics is built for customization, but customization must happen in the right\nowner. The safest path is to reuse an existing capability, configure it, extend\nit in a later-loaded module, and create new framework behavior only when the\nexisting contract truly cannot satisfy the requirement.\n\n## What this is\n\nThis guide explains how a customer or partner changes Nodics behavior without\nturning a customer project into a fork of the framework. It applies to backend\ncustomization, Axis presentation customization, and documentation ownership.\n\n## The customization ladder\n\nStart with the least invasive option:\n\n1. Use existing behavior.\n2. Change configuration in the correct project, environment, server, node, or\n   tenant scope.\n3. Add customer project modules under the customer project.\n4. Add a customer extension module that extends a framework functional module.\n5. Create a new implementation only when the existing capability contract is\n   missing or incorrect.\n\nThis ladder protects upgradeability. The later a customization loads, the more\nspecific it is. Framework modules stay reusable; customer modules carry\ncustomer decisions.\n\n## Backend customization\n\nBackend behavior belongs in the backend project or module that owns the\nbusiness rule. In Kickoff, project modules live under `modules/`, while\nenvironment and server composition live under `envs/`.\n\nA future module such as `kickoff.platform` may extend `nodics.platform` to\ncustomize Platform services. The runtime server can load the customer extension\nafter Platform. Service precedence then follows the normal module merge and\nindex order. Axis should still display the functional capability as Platform,\nbecause the customer extension changes implementation, not the business-facing\nidentity.\n\n## Axis customization\n\nAxis is the browser application. It owns renderers, interaction behavior,\nlayout, accessibility, and static recovery. It must not own imported CMS data,\nbackend schemas, permissions, or business rules. If a customer needs a new\nBackOffice page, the backend should expose the authorized navigation,\ncapability metadata, API contract, and CMS content where applicable. Axis then\nrenders that authorized contract.\n\nSimple presentation changes, such as logo, copy, theme, or demo content, should\ncome from backend-owned CMS or configuration where possible. Hard-coding those\nvalues in the frontend makes future customers harder to support.\n\n## Documentation customization\n\nDocumentation follows the owner of the thing being explained:\n\n- framework guidance goes to `nodics.docs`;\n- Axis product guidance goes to `nodics.platform/modules/axis`;\n- project guidance goes to the owning customer project, such as\n  `nodics.kickoff`;\n- generated content records stay under `data/core/data/documentation`;\n- manifests stay under `manifest/docs-content-pack.json`.\n\nDo not put customer project documentation into `nodics.docs`, and do not put\nimportable documentation records into `nodics.axis`.\n\n## Common mistakes\n\n- Editing framework source for one customer.\n- Adding business authorization in the browser.\n- Creating a second module registry or endpoint list in Axis.\n- Moving generated CMS data into a frontend repository.\n- Changing a functional module display name because an implementation was\n  customized.\n- Skipping tests after service override changes.\n\n## Verification\n\nEvery customization should prove success and failure behavior. For backend\nchanges, run the owning module tests and any affected runtime smoke test. For\nAxis changes, run typecheck and focused UI tests. For documentation changes,\nregenerate the owning content pack, validate checksums, import through WCMS,\nand verify the route in Axis.\n"
        },
        {
          "code": "framework.devops-runtime",
          "title": "Runtime and DevOps operations",
          "route": "/docs/framework/framework-devops-runtime",
          "section": "nodics-core",
          "sectionTitle": "Nodics core",
          "sectionOrder": 20,
          "order": 50,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance.",
          "searchText": "Runtime and DevOps operations Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance. # Runtime and DevOps operations\n\nNodics runtime operations are based on explicit server composition and layered\nconfiguration. A runtime server is a process that hosts an effective set of\nactive modules. The module remains the capability owner; the server is the\nruntime grouping.\n\n## Local topology\n\nThe reference local setup uses separate servers:\n\n- Platform on `http://localhost:4300`;\n- WCMS on `http://localhost:4310`;\n- Cron when scheduled behavior is needed;\n- Axis on `http://localhost:3100`.\n\nThis split keeps module boundaries visible. It also prepares the team for a\nfuture topology where different capabilities may run in different processes,\nhosts, containers, or deployment units.\n\n## Configuration layers\n\nNodics configuration is layered. Framework defaults come first. Project,\nenvironment, server, node, tenant, and governed runtime configuration can refine\nbehavior later. A developer should place a property in the narrowest owner that\nneeds it.\n\nUse public browser configuration only for values safe to expose, such as Axis\nbase URLs and client contract versions. Credentials, private keys, service\ntokens, database passwords, and provider secrets belong in protected backend\nconfiguration or deployment secret management.\n\n## Dependencies\n\nMongoDB is the primary local runtime dependency for persisted records.\nElasticsearch is used when search-backed capabilities are enabled. Redis is\nused when Redis-backed cache or session behavior is enabled. Enterprise\nmessaging, external storage, AI providers, or other integrations may be\noptional depending on active modules and configuration.\n\nDisabled providers should fail closed or log that they are disabled. A disabled\noptional provider is not the same as a broken mandatory provider.\n\n## Deployment mindset\n\nStart simple locally. Keep capability ownership correct. Then distribute only\nwhen scale, resilience, security, or team ownership requires it. The runtime\ntopology can change without moving business ownership out of the owning module.\n\nFor production, define:\n\n- which servers run which functional modules;\n- where public and private properties are sourced;\n- how credentials are injected and rotated;\n- how logs, health, audit events, and runtime diagnostics are collected;\n- how content packs, generated artifacts, and database migrations are released;\n- how rollback works for code, configuration, and imported content.\n\n## Monitoring and recovery\n\nPlatform exposes registry and BackOffice projections for active modules. WCMS\nowns content-pack delivery and CMS route resolution. Cron owns scheduled work.\nAxis should show recovery states when these backends are unavailable instead of\ninventing another control plane.\n\nWhen something fails, identify the owner first:\n\n- login or BackOffice bootstrap: Platform/Profile/BackOffice;\n- CMS page delivery or documentation content: WCMS/CMS/content-pack owner;\n- scheduled job execution: Cron;\n- frontend rendering or shell interaction: Axis;\n- customer-specific behavior: customer project module.\n\n## Common mistakes\n\n- Treating environment or server modules as business capability owners.\n- Putting secrets into frontend `.env` files.\n- Deploying generated content without a version change.\n- Relying on process memory instead of durable registration or import history.\n- Ignoring negative tests, recovery states, and rollback behavior.\n\n## Next actions\n\nBefore production, write an environment-specific operations runbook that lists\nserver topology, dependency versions, secrets strategy, health checks,\nmonitoring, backup, restore, content-pack import process, and rollback steps.\n"
        },
        {
          "code": "platform.module-registry",
          "title": "Functional module registry",
          "route": "/docs/framework/platform-module-registry",
          "section": "nodics-platform",
          "sectionTitle": "Nodics platform",
          "sectionOrder": 30,
          "order": 60,
          "audience": [
            "architect",
            "developer",
            "operator"
          ],
          "summary": "Durable project registration and runtime observation rules.",
          "searchText": "Functional module registry Durable project registration and runtime observation rules. # Functional module registry\n\nThe registry separates durable project decisions from ephemeral runtime\nobservations. Restarting a server renews its runtime lease but does not ask the\noperator to register the functional module again.\n\nCore and Platform are protected for a Platform runtime. Optional functional\nmodules move through available, registered, active, inactive, and deregistered\noperator decisions without hot-loading or unloading server code.\n\n"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcoreOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "framework.what-is-nodics",
      "title": "What is Nodics?",
      "route": "/docs/framework",
      "section": "nodics-docs",
      "sectionTitle": "Nodics docs",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "Business, beginner, and adoption-oriented introduction to the Nodics enterprise framework.",
      "headings": [
        "The problem Nodics solves",
        "Why a business should care",
        "Beginner mental model",
        "What teams can build",
        "What Nodics is not",
        "Next actions"
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "What is Nodics?"
        },
        {
          "kind": "paragraph",
          "text": "Nodics is a modular enterprise application framework for building serious business platforms without asking every project to reinvent the same architecture. It gives teams a governed backend foundation for APIs, data, configuration, authentication, permissions, runtime composition, imports, exports, content management, scheduled work, events, testing, and operational contracts."
        },
        {
          "kind": "paragraph",
          "text": "In plain language, Nodics is an application factory. A factory does not decide which product your company sells. It gives you repeatable equipment, safety rules, quality checks, extension points, and production discipline. Your project still owns its business rules, customer-specific behavior, integrations, and user experiences."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The problem Nodics solves"
        },
        {
          "kind": "paragraph",
          "text": "Modern teams can create an MVP very quickly, especially with AI-assisted development. The hard part starts when that MVP becomes a real product. Code that was written only to prove an idea often has no strong module boundaries, no tenant model, no safe customization path, no consistent API contracts, weak security, duplicated configuration, and limited tests. Every new customer adds another exception. Every exception makes future releases slower and riskier."
        },
        {
          "kind": "paragraph",
          "text": "Nodics turns those repeated scaling problems into explicit contracts. A feature belongs to an owning capability. Configuration has layered scope. Services, schemas, routes, APIs, and generated artifacts are created in known places. Customer customizations load after framework behavior instead of editing the framework directly. Axis renders employee workspaces, but backend modules keep authority over data and operations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why a business should care"
        },
        {
          "kind": "paragraph",
          "text": "For a business evaluator, the important point is not the folder structure. The important point is that Nodics helps teams move from idea to production without throwing away the architecture. It supports faster delivery while keeping governance, maintainability, tenant isolation, operational visibility, and safe customer-specific change in view from the beginning."
        },
        {
          "kind": "paragraph",
          "text": "This matters when an organization wants one platform to support many enterprises, tenants, brands, websites, internal teams, or partner customizations. The modular approach reduces the cost of change because a project can extend or configure the owner of a behavior instead of copying code into another place. That lowers upgrade risk, reduces duplicate authority, and helps teams reason about who owns what."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model"
        },
        {
          "kind": "paragraph",
          "text": "Imagine a company needs employee login, content management, imports, media, scheduled jobs, and APIs. Without a framework, the first team might build login one way, the second team might build imports another way, and the third team might put customer-specific rules directly into shared code. The application works for a while, then becomes difficult to secure, test, deploy, or extend."
        },
        {
          "kind": "paragraph",
          "text": "With Nodics, those concerns have named owners. Profile owns employee identity. WCMS owns CMS content. Media owns media records and lifecycle. Cron owns scheduled work. BackOffice exposes operational metadata. Axis renders the user interface by consuming authorized backend contracts. A customer project, such as Kickoff, composes these capabilities and adds project behavior after the framework modules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What teams can build"
        },
        {
          "kind": "paragraph",
          "text": "Nodics can be used as the backend foundation for multi-tenant business APIs, employee BackOffice applications, CMS-driven websites, governed content and media operations, data import/export flows, scheduled jobs, and customer platforms that need safe extension. The framework supplies reusable capability contracts; the adopting project supplies the business-specific behavior and deployment decisions."
        },
        {
          "kind": "paragraph",
          "text": "The current reference workspace demonstrates this through `nodics.kickoff`, which starts local Platform, WCMS, and Cron servers, and through `nodics.axis`, which logs employees in and renders discovered workspaces and documentation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What Nodics is not"
        },
        {
          "kind": "paragraph",
          "text": "Nodics is not a finished industry product that removes the need for business analysis. It is not a frontend repository. It is not permission to access another module's database directly. It does not make operations automatic: credentials, infrastructure, monitoring, backup, scaling, and production security remain deployment responsibilities."
        },
        {
          "kind": "paragraph",
          "text": "The promise is more practical: Nodics gives a project a governed model for building and evolving enterprise software without scattering ownership."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Next actions"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Read modular architecture to understand ownership and runtime composition."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Follow the local quick start to run Kickoff and Axis."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Read customization guidance before changing framework behavior."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Read runtime and DevOps operations before planning production topology."
          ]
        }
      ],
      "searchText": "What is Nodics? Business, beginner, and adoption-oriented introduction to the Nodics enterprise framework. # What is Nodics?\n\nNodics is a modular enterprise application framework for building serious\nbusiness platforms without asking every project to reinvent the same\narchitecture. It gives teams a governed backend foundation for APIs, data,\nconfiguration, authentication, permissions, runtime composition, imports,\nexports, content management, scheduled work, events, testing, and operational\ncontracts.\n\nIn plain language, Nodics is an application factory. A factory does not decide\nwhich product your company sells. It gives you repeatable equipment, safety\nrules, quality checks, extension points, and production discipline. Your\nproject still owns its business rules, customer-specific behavior, integrations,\nand user experiences.\n\n## The problem Nodics solves\n\nModern teams can create an MVP very quickly, especially with AI-assisted\ndevelopment. The hard part starts when that MVP becomes a real product. Code\nthat was written only to prove an idea often has no strong module boundaries,\nno tenant model, no safe customization path, no consistent API contracts, weak\nsecurity, duplicated configuration, and limited tests. Every new customer adds\nanother exception. Every exception makes future releases slower and riskier.\n\nNodics turns those repeated scaling problems into explicit contracts. A feature\nbelongs to an owning capability. Configuration has layered scope. Services,\nschemas, routes, APIs, and generated artifacts are created in known places.\nCustomer customizations load after framework behavior instead of editing the\nframework directly. Axis renders employee workspaces, but backend modules keep\nauthority over data and operations.\n\n## Why a business should care\n\nFor a business evaluator, the important point is not the folder structure. The\nimportant point is that Nodics helps teams move from idea to production without\nthrowing away the architecture. It supports faster delivery while keeping\ngovernance, maintainability, tenant isolation, operational visibility, and safe\ncustomer-specific change in view from the beginning.\n\nThis matters when an organization wants one platform to support many\nenterprises, tenants, brands, websites, internal teams, or partner\ncustomizations. The modular approach reduces the cost of change because a\nproject can extend or configure the owner of a behavior instead of copying code\ninto another place. That lowers upgrade risk, reduces duplicate authority, and\nhelps teams reason about who owns what.\n\n## Beginner mental model\n\nImagine a company needs employee login, content management, imports, media,\nscheduled jobs, and APIs. Without a framework, the first team might build login\none way, the second team might build imports another way, and the third team\nmight put customer-specific rules directly into shared code. The application\nworks for a while, then becomes difficult to secure, test, deploy, or extend.\n\nWith Nodics, those concerns have named owners. Profile owns employee identity.\nWCMS owns CMS content. Media owns media records and lifecycle. Cron owns\nscheduled work. BackOffice exposes operational metadata. Axis renders the user\ninterface by consuming authorized backend contracts. A customer project, such\nas Kickoff, composes these capabilities and adds project behavior after the\nframework modules.\n\n## What teams can build\n\nNodics can be used as the backend foundation for multi-tenant business APIs,\nemployee BackOffice applications, CMS-driven websites, governed content and\nmedia operations, data import/export flows, scheduled jobs, and customer\nplatforms that need safe extension. The framework supplies reusable capability\ncontracts; the adopting project supplies the business-specific behavior and\ndeployment decisions.\n\nThe current reference workspace demonstrates this through `nodics.kickoff`,\nwhich starts local Platform, WCMS, and Cron servers, and through `nodics.axis`,\nwhich logs employees in and renders discovered workspaces and documentation.\n\n## What Nodics is not\n\nNodics is not a finished industry product that removes the need for business\nanalysis. It is not a frontend repository. It is not permission to access\nanother module's database directly. It does not make operations automatic:\ncredentials, infrastructure, monitoring, backup, scaling, and production\nsecurity remain deployment responsibilities.\n\nThe promise is more practical: Nodics gives a project a governed model for\nbuilding and evolving enterprise software without scattering ownership.\n\n## Next actions\n\n- Read modular architecture to understand ownership and runtime composition.\n- Follow the local quick start to run Kickoff and Axis.\n- Read customization guidance before changing framework behavior.\n- Read runtime and DevOps operations before planning production topology.\n",
      "previous": null,
      "next": {
        "title": "Modular architecture and ownership",
        "route": "/docs/framework/framework-modular-architecture"
      },
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.docs",
        "technicalModule": "documentation",
        "path": "content/framework/what-is-nodics.md",
        "wordCount": 658,
        "checksum": "81b00d67fb40f068c67d44c38863cde8bdecf99dc9eb8109a8daeb44ce213a31"
      }
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentframeworkModularArchitecture",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "framework.modular-architecture",
      "title": "Modular architecture and ownership",
      "route": "/docs/framework/framework-modular-architecture",
      "section": "nodics-core",
      "sectionTitle": "Nodics core",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "How functional modules, technical modules, runtime servers, and customer projects fit together.",
      "headings": [
        "What this is",
        "Functional modules and technical modules",
        "Runtime server composition",
        "Customer projects",
        "Ownership boundaries",
        "Current capability map",
        "Business value",
        "Common mistakes",
        "Next actions"
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Modular architecture and ownership"
        },
        {
          "kind": "paragraph",
          "text": "Nodics is organized around ownership. Every meaningful behavior should have a capability owner, and every runtime server should load an explicit chain of modules. This is what lets a local reference project stay small while the same framework can later support larger distributed deployments."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What this is"
        },
        {
          "kind": "paragraph",
          "text": "The modular architecture defines how framework modules, functional module groups, customer projects, environment modules, server modules, and services fit together. It prevents the common failure where code is placed wherever it first works and nobody can later tell which component owns the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Functional modules and technical modules"
        },
        {
          "kind": "paragraph",
          "text": "A functional module is the business-facing capability identity. Examples are `nodics.core`, `nodics.platform`, `nodics.wcms`, and `nodics.cron`. Axis and BackOffice talk about these capabilities at this level because business users do not need to manage every internal technical module."
        },
        {
          "kind": "paragraph",
          "text": "A technical module is an implementation unit inside a functional module group. For example, Core contains many technical modules for configuration, data, services, routing, validation, cache, and system behavior. Those modules are important to developers, but they should not flood the module registry user experience unless a business capability genuinely needs to expose them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime server composition"
        },
        {
          "kind": "paragraph",
          "text": "Repository dependencies only make code available. Runtime `extends` configuration decides what actually loads. A Platform server normally loads Core first, Platform second, then project and environment/server modules. A WCMS server loads Core, WCMS, and project modules. A Cron server loads Core, Cron, and project modules."
        },
        {
          "kind": "paragraph",
          "text": "The order matters because service override and merge behavior follow runtime load order and module indexes. Module hierarchy describes functional availability; service precedence describes which implementation wins at runtime. These are related but different concepts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer projects"
        },
        {
          "kind": "paragraph",
          "text": "Customer projects live outside `nodics.ai`. The reference project is `nodics.kickoff`. It shows how a project can compose framework modules, provide local environment configuration, add project modules, and contribute project-owned documentation without copying framework source."
        },
        {
          "kind": "paragraph",
          "text": "A future customer extension module such as `kickoff.platform` may customize Platform behavior. That does not rename the functional capability. BackOffice and Axis should still present Platform as Platform unless the customer intentionally exposes a separate functional module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership boundaries"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Framework source belongs in `nodics.ai`."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Framework documentation content belongs in `nodics.docs`."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Axis product documentation belongs in `nodics.platform/modules/axis`."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Customer documentation belongs in the owning customer project."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Browser renderers belong in `nodics.axis`."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "CMS records that are imported into a database must be owned by backend"
          ]
        },
        {
          "kind": "paragraph",
          "text": "modules or backend projects, never the frontend repository."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current capability map"
        },
        {
          "kind": "paragraph",
          "text": "Use this map when deciding where new code, data, or documentation should live."
        },
        {
          "kind": "paragraph",
          "text": "| Capability | Repository or module owner | Runtime role | Documentation owner | | --- | --- | --- | --- | | Core framework | `nodics.ai/nodics.core` | Mandatory base for every runtime server | `nodics.docs` | | Platform and profile | `nodics.ai/nodics.platform` | Platform server capability for user onboarding, authentication, and registry-facing services | `nodics.docs` for framework behavior; `nodics.platform/modules/axis` for Axis product behavior | | Axis backend content | `nodics.ai/nodics.platform/modules/axis` | Backend-owned CMS records that allow the Axis frontend to render product documentation and shell experience | `nodics.platform/modules/axis` | | WCMS | `nodics.ai/nodics.wcms` | Content management runtime for sites, catalogs, pages, components, routes, and renderable content | `nodics.docs` | | Media | `nodics.ai/nodics.wcms/modules/media` | Governed media and asset lifecycle used by content experiences | `nodics.docs` | | Cron | `nodics.ai/nodics.cron` | Optional scheduled-job runtime capability | `nodics.docs` | | Framework documentation | `nodics.ai/nodics.docs` | Backend content pack imported into WCMS; not a UI renderer | `nodics.docs` | | Axis frontend | `nodics.axis` | Browser renderer for BackOffice, WCMS, docs, and module-owned capabilities | `nodics.platform/modules/axis` for product docs | | Kickoff reference project | `nodics.kickoff` | Customer-style project that composes framework servers locally | `nodics.kickoff` |"
        },
        {
          "kind": "paragraph",
          "text": "The key rule is simple: a frontend may render content, but it should not own database-importable content. If a page, component, catalog, route, or documentation record is imported into WCMS, it must be shipped by the backend module or project that owns that content."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business value"
        },
        {
          "kind": "paragraph",
          "text": "This architecture helps teams customize without forking. It also supports clearer cost control: teams can reuse a capability, configure it, extend it in a later layer, and only create a new implementation when the existing contract cannot satisfy the requirement. That avoids duplicate authority paths and makes future framework upgrades more realistic."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Copying Core, Platform, or WCMS source into a customer project."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Treating a server as the owner of a capability."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Exposing every technical module as a business registry item."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Putting CMS import data into `nodics.axis`."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Renaming a standard functional module because a customer customizes it."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Next actions"
        },
        {
          "kind": "paragraph",
          "text": "After this page, read the local quick start and customization guide. Those pages show how the architecture becomes concrete commands, files, and project rules."
        }
      ],
      "searchText": "Modular architecture and ownership How functional modules, technical modules, runtime servers, and customer projects fit together. # Modular architecture and ownership\n\nNodics is organized around ownership. Every meaningful behavior should have a\ncapability owner, and every runtime server should load an explicit chain of\nmodules. This is what lets a local reference project stay small while the same\nframework can later support larger distributed deployments.\n\n## What this is\n\nThe modular architecture defines how framework modules, functional module\ngroups, customer projects, environment modules, server modules, and services\nfit together. It prevents the common failure where code is placed wherever it\nfirst works and nobody can later tell which component owns the behavior.\n\n## Functional modules and technical modules\n\nA functional module is the business-facing capability identity. Examples are\n`nodics.core`, `nodics.platform`, `nodics.wcms`, and `nodics.cron`. Axis and\nBackOffice talk about these capabilities at this level because business users\ndo not need to manage every internal technical module.\n\nA technical module is an implementation unit inside a functional module group.\nFor example, Core contains many technical modules for configuration, data,\nservices, routing, validation, cache, and system behavior. Those modules are\nimportant to developers, but they should not flood the module registry user\nexperience unless a business capability genuinely needs to expose them.\n\n## Runtime server composition\n\nRepository dependencies only make code available. Runtime `extends`\nconfiguration decides what actually loads. A Platform server normally loads\nCore first, Platform second, then project and environment/server modules. A\nWCMS server loads Core, WCMS, and project modules. A Cron server loads Core,\nCron, and project modules.\n\nThe order matters because service override and merge behavior follow runtime\nload order and module indexes. Module hierarchy describes functional\navailability; service precedence describes which implementation wins at\nruntime. These are related but different concepts.\n\n## Customer projects\n\nCustomer projects live outside `nodics.ai`. The reference project is\n`nodics.kickoff`. It shows how a project can compose framework modules, provide\nlocal environment configuration, add project modules, and contribute\nproject-owned documentation without copying framework source.\n\nA future customer extension module such as `kickoff.platform` may customize\nPlatform behavior. That does not rename the functional capability. BackOffice\nand Axis should still present Platform as Platform unless the customer\nintentionally exposes a separate functional module.\n\n## Ownership boundaries\n\n- Framework source belongs in `nodics.ai`.\n- Framework documentation content belongs in `nodics.docs`.\n- Axis product documentation belongs in `nodics.platform/modules/axis`.\n- Customer documentation belongs in the owning customer project.\n- Browser renderers belong in `nodics.axis`.\n- CMS records that are imported into a database must be owned by backend\n  modules or backend projects, never the frontend repository.\n\n## Current capability map\n\nUse this map when deciding where new code, data, or documentation should live.\n\n| Capability | Repository or module owner | Runtime role | Documentation owner |\n| --- | --- | --- | --- |\n| Core framework | `nodics.ai/nodics.core` | Mandatory base for every runtime server | `nodics.docs` |\n| Platform and profile | `nodics.ai/nodics.platform` | Platform server capability for user onboarding, authentication, and registry-facing services | `nodics.docs` for framework behavior; `nodics.platform/modules/axis` for Axis product behavior |\n| Axis backend content | `nodics.ai/nodics.platform/modules/axis` | Backend-owned CMS records that allow the Axis frontend to render product documentation and shell experience | `nodics.platform/modules/axis` |\n| WCMS | `nodics.ai/nodics.wcms` | Content management runtime for sites, catalogs, pages, components, routes, and renderable content | `nodics.docs` |\n| Media | `nodics.ai/nodics.wcms/modules/media` | Governed media and asset lifecycle used by content experiences | `nodics.docs` |\n| Cron | `nodics.ai/nodics.cron` | Optional scheduled-job runtime capability | `nodics.docs` |\n| Framework documentation | `nodics.ai/nodics.docs` | Backend content pack imported into WCMS; not a UI renderer | `nodics.docs` |\n| Axis frontend | `nodics.axis` | Browser renderer for BackOffice, WCMS, docs, and module-owned capabilities | `nodics.platform/modules/axis` for product docs |\n| Kickoff reference project | `nodics.kickoff` | Customer-style project that composes framework servers locally | `nodics.kickoff` |\n\nThe key rule is simple: a frontend may render content, but it should not own\ndatabase-importable content. If a page, component, catalog, route, or\ndocumentation record is imported into WCMS, it must be shipped by the backend\nmodule or project that owns that content.\n\n## Business value\n\nThis architecture helps teams customize without forking. It also supports\nclearer cost control: teams can reuse a capability, configure it, extend it in\na later layer, and only create a new implementation when the existing contract\ncannot satisfy the requirement. That avoids duplicate authority paths and makes\nfuture framework upgrades more realistic.\n\n## Common mistakes\n\n- Copying Core, Platform, or WCMS source into a customer project.\n- Treating a server as the owner of a capability.\n- Exposing every technical module as a business registry item.\n- Putting CMS import data into `nodics.axis`.\n- Renaming a standard functional module because a customer customizes it.\n\n## Next actions\n\nAfter this page, read the local quick start and customization guide. Those\npages show how the architecture becomes concrete commands, files, and project\nrules.\n",
      "previous": {
        "title": "What is Nodics?",
        "route": "/docs/framework"
      },
      "next": {
        "title": "Local quick start with Kickoff and Axis",
        "route": "/docs/framework/framework-local-quick-start"
      },
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.core",
        "technicalModule": "nSetup",
        "path": "content/framework/modular-architecture.md",
        "wordCount": 781,
        "checksum": "61b3c9ae0030d24305ac65e96118e8a851a044f50a48c32c210fddc4d9596b7f"
      }
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentframeworkLocalQuickStart",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "framework.local-quick-start",
      "title": "Local quick start with Kickoff and Axis",
      "route": "/docs/framework/framework-local-quick-start",
      "section": "nodics-core",
      "sectionTitle": "Nodics core",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation.",
      "headings": [
        "What you will run",
        "Prerequisites",
        "Step 1: configure Kickoff",
        "Step 2: start backend servers",
        "Step 3: start Axis",
        "Step 4: log in",
        "Troubleshooting",
        "Next actions"
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Local quick start with Kickoff and Axis"
        },
        {
          "kind": "paragraph",
          "text": "This guide starts the local reference stack from zero. It is written for a developer who is new to Nodics and wants to see the framework, BackOffice, WCMS documentation, and Axis working locally."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What you will run"
        },
        {
          "kind": "paragraph",
          "text": "The reference setup uses three projects:"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "`nodics.ai` contains framework backend modules."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "`nodics.kickoff` is the reference customer project and local server owner."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "`nodics.axis` is the BackOffice frontend."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Kickoff starts backend servers. Axis connects to Platform, authenticates an employee, reads the BackOffice bootstrap contract, and renders workspaces and documentation from registered backend sources."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Prerequisites"
        },
        {
          "kind": "paragraph",
          "text": "Install Node.js and npm versions compatible with the repositories. Start MongoDB before starting the backend. Elasticsearch and Redis may be needed when their providers are enabled by configuration; disabled providers may produce informational logs and are not a failure in the reference setup."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 1: configure Kickoff"
        },
        {
          "kind": "paragraph",
          "text": "Open `nodics.kickoff`:"
        },
        {
          "kind": "paragraph",
          "text": "```bash cd ../nodics.kickoff cp .env.example .env ```"
        },
        {
          "kind": "paragraph",
          "text": "Edit `.env`:"
        },
        {
          "kind": "paragraph",
          "text": "```bash NODICS_FRAMEWORK_ROOT=../nodics.ai ```"
        },
        {
          "kind": "paragraph",
          "text": "This tells Kickoff where the framework checkout lives. The path may be absolute or relative to the Kickoff project root."
        },
        {
          "kind": "paragraph",
          "text": "Generate local framework links and install:"
        },
        {
          "kind": "paragraph",
          "text": "```bash npm run configure:framework npm install ```"
        },
        {
          "kind": "paragraph",
          "text": "The configure step creates local links under `.nodics/framework`. That folder is machine-local and must not be committed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 2: start backend servers"
        },
        {
          "kind": "paragraph",
          "text": "Use separate terminals from `nodics.kickoff`."
        },
        {
          "kind": "paragraph",
          "text": "Start Platform:"
        },
        {
          "kind": "paragraph",
          "text": "```bash npm run start:platform ```"
        },
        {
          "kind": "paragraph",
          "text": "Platform provides employee authentication, Profile, BackOffice bootstrap, runtime module registry, documentation-source registry, and Platform APIs. Local HTTP port: `http://localhost:4300`."
        },
        {
          "kind": "paragraph",
          "text": "Start WCMS:"
        },
        {
          "kind": "paragraph",
          "text": "```bash npm run start:wcms ```"
        },
        {
          "kind": "paragraph",
          "text": "WCMS owns CMS sites, content catalogs, pages, components, routes, media, and documentation content-pack delivery. Local HTTP port: `http://localhost:4310`."
        },
        {
          "kind": "paragraph",
          "text": "Start Cron when scheduled work is needed:"
        },
        {
          "kind": "paragraph",
          "text": "```bash npm run start:cron ```"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 3: start Axis"
        },
        {
          "kind": "paragraph",
          "text": "Open `nodics.axis`:"
        },
        {
          "kind": "paragraph",
          "text": "```bash cd ../nodics.axis npm install npm run dev ```"
        },
        {
          "kind": "paragraph",
          "text": "Open `http://localhost:3100`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 4: log in"
        },
        {
          "kind": "paragraph",
          "text": "Use the reference employee:"
        },
        {
          "kind": "paragraph",
          "text": "```text Enterprise: default Username: admin Password: adminPassword ```"
        },
        {
          "kind": "paragraph",
          "text": "After login, open `http://localhost:3100/docs`. You should see Framework, Swaggers, Nodics Axis, and Nodics Kickoff."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting"
        },
        {
          "kind": "paragraph",
          "text": "If Axis says the BackOffice registry is unavailable, Platform is not reachable or still starting. Check the Platform terminal and confirm port `4300`."
        },
        {
          "kind": "paragraph",
          "text": "If CMS documentation is unavailable, WCMS is not reachable, the content pack has not been imported, or the imported version is stale. Check port `4310` and the content-pack import status."
        },
        {
          "kind": "paragraph",
          "text": "If npm cannot resolve framework packages, rerun `npm run configure:framework` after checking `NODICS_FRAMEWORK_ROOT`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Next actions"
        },
        {
          "kind": "paragraph",
          "text": "Once the reference stack is running, read the customization guide before changing code. Use Axis customization for presentation and project modules for backend behavior."
        }
      ],
      "searchText": "Local quick start with Kickoff and Axis Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation. # Local quick start with Kickoff and Axis\n\nThis guide starts the local reference stack from zero. It is written for a\ndeveloper who is new to Nodics and wants to see the framework, BackOffice, WCMS\ndocumentation, and Axis working locally.\n\n## What you will run\n\nThe reference setup uses three projects:\n\n- `nodics.ai` contains framework backend modules.\n- `nodics.kickoff` is the reference customer project and local server owner.\n- `nodics.axis` is the BackOffice frontend.\n\nKickoff starts backend servers. Axis connects to Platform, authenticates an\nemployee, reads the BackOffice bootstrap contract, and renders workspaces and\ndocumentation from registered backend sources.\n\n## Prerequisites\n\nInstall Node.js and npm versions compatible with the repositories. Start\nMongoDB before starting the backend. Elasticsearch and Redis may be needed when\ntheir providers are enabled by configuration; disabled providers may produce\ninformational logs and are not a failure in the reference setup.\n\n## Step 1: configure Kickoff\n\nOpen `nodics.kickoff`:\n\n```bash\ncd ../nodics.kickoff\ncp .env.example .env\n```\n\nEdit `.env`:\n\n```bash\nNODICS_FRAMEWORK_ROOT=../nodics.ai\n```\n\nThis tells Kickoff where the framework checkout lives. The path may be\nabsolute or relative to the Kickoff project root.\n\nGenerate local framework links and install:\n\n```bash\nnpm run configure:framework\nnpm install\n```\n\nThe configure step creates local links under `.nodics/framework`. That folder\nis machine-local and must not be committed.\n\n## Step 2: start backend servers\n\nUse separate terminals from `nodics.kickoff`.\n\nStart Platform:\n\n```bash\nnpm run start:platform\n```\n\nPlatform provides employee authentication, Profile, BackOffice bootstrap,\nruntime module registry, documentation-source registry, and Platform APIs.\nLocal HTTP port: `http://localhost:4300`.\n\nStart WCMS:\n\n```bash\nnpm run start:wcms\n```\n\nWCMS owns CMS sites, content catalogs, pages, components, routes, media, and\ndocumentation content-pack delivery. Local HTTP port:\n`http://localhost:4310`.\n\nStart Cron when scheduled work is needed:\n\n```bash\nnpm run start:cron\n```\n\n## Step 3: start Axis\n\nOpen `nodics.axis`:\n\n```bash\ncd ../nodics.axis\nnpm install\nnpm run dev\n```\n\nOpen `http://localhost:3100`.\n\n## Step 4: log in\n\nUse the reference employee:\n\n```text\nEnterprise: default\nUsername: admin\nPassword: adminPassword\n```\n\nAfter login, open `http://localhost:3100/docs`. You should see Framework,\nSwaggers, Nodics Axis, and Nodics Kickoff.\n\n## Troubleshooting\n\nIf Axis says the BackOffice registry is unavailable, Platform is not reachable\nor still starting. Check the Platform terminal and confirm port `4300`.\n\nIf CMS documentation is unavailable, WCMS is not reachable, the content pack\nhas not been imported, or the imported version is stale. Check port `4310` and\nthe content-pack import status.\n\nIf npm cannot resolve framework packages, rerun `npm run configure:framework`\nafter checking `NODICS_FRAMEWORK_ROOT`.\n\n## Next actions\n\nOnce the reference stack is running, read the customization guide before\nchanging code. Use Axis customization for presentation and project modules for\nbackend behavior.\n",
      "previous": {
        "title": "Modular architecture and ownership",
        "route": "/docs/framework/framework-modular-architecture"
      },
      "next": {
        "title": "Customization and extension guide",
        "route": "/docs/framework/framework-customization-guide"
      },
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.core",
        "technicalModule": "nSetup",
        "path": "content/framework/local-quick-start.md",
        "wordCount": 437,
        "checksum": "320bf1cb1c0ba8af1a1bdb46d2bd9656cbc37237f53d0d4e10d0e7438c9c0a1b"
      }
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentframeworkCustomizationGuide",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "framework.customization-guide",
      "title": "Customization and extension guide",
      "route": "/docs/framework/framework-customization-guide",
      "section": "nodics-core",
      "sectionTitle": "Nodics core",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "How customer projects customize Nodics safely without forking framework authority.",
      "headings": [
        "What this is",
        "The customization ladder",
        "Backend customization",
        "Axis customization",
        "Documentation customization",
        "Common mistakes",
        "Verification"
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Customization and extension guide"
        },
        {
          "kind": "paragraph",
          "text": "Nodics is built for customization, but customization must happen in the right owner. The safest path is to reuse an existing capability, configure it, extend it in a later-loaded module, and create new framework behavior only when the existing contract truly cannot satisfy the requirement."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What this is"
        },
        {
          "kind": "paragraph",
          "text": "This guide explains how a customer or partner changes Nodics behavior without turning a customer project into a fork of the framework. It applies to backend customization, Axis presentation customization, and documentation ownership."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The customization ladder"
        },
        {
          "kind": "paragraph",
          "text": "Start with the least invasive option:"
        },
        {
          "kind": "paragraph",
          "text": "1. Use existing behavior. 2. Change configuration in the correct project, environment, server, node, or tenant scope. 3. Add customer project modules under the customer project. 4. Add a customer extension module that extends a framework functional module. 5. Create a new implementation only when the existing capability contract is missing or incorrect."
        },
        {
          "kind": "paragraph",
          "text": "This ladder protects upgradeability. The later a customization loads, the more specific it is. Framework modules stay reusable; customer modules carry customer decisions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Backend customization"
        },
        {
          "kind": "paragraph",
          "text": "Backend behavior belongs in the backend project or module that owns the business rule. In Kickoff, project modules live under `modules/`, while environment and server composition live under `envs/`."
        },
        {
          "kind": "paragraph",
          "text": "A future module such as `kickoff.platform` may extend `nodics.platform` to customize Platform services. The runtime server can load the customer extension after Platform. Service precedence then follows the normal module merge and index order. Axis should still display the functional capability as Platform, because the customer extension changes implementation, not the business-facing identity."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Axis customization"
        },
        {
          "kind": "paragraph",
          "text": "Axis is the browser application. It owns renderers, interaction behavior, layout, accessibility, and static recovery. It must not own imported CMS data, backend schemas, permissions, or business rules. If a customer needs a new BackOffice page, the backend should expose the authorized navigation, capability metadata, API contract, and CMS content where applicable. Axis then renders that authorized contract."
        },
        {
          "kind": "paragraph",
          "text": "Simple presentation changes, such as logo, copy, theme, or demo content, should come from backend-owned CMS or configuration where possible. Hard-coding those values in the frontend makes future customers harder to support."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation customization"
        },
        {
          "kind": "paragraph",
          "text": "Documentation follows the owner of the thing being explained:"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "framework guidance goes to `nodics.docs`;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Axis product guidance goes to `nodics.platform/modules/axis`;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "project guidance goes to the owning customer project, such as"
          ]
        },
        {
          "kind": "paragraph",
          "text": "`nodics.kickoff`;"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "generated content records stay under `data/core/data/documentation`;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "manifests stay under `manifest/docs-content-pack.json`."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not put customer project documentation into `nodics.docs`, and do not put importable documentation records into `nodics.axis`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Editing framework source for one customer."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Adding business authorization in the browser."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Creating a second module registry or endpoint list in Axis."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Moving generated CMS data into a frontend repository."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Changing a functional module display name because an implementation was"
          ]
        },
        {
          "kind": "paragraph",
          "text": "customized."
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Skipping tests after service override changes."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification"
        },
        {
          "kind": "paragraph",
          "text": "Every customization should prove success and failure behavior. For backend changes, run the owning module tests and any affected runtime smoke test. For Axis changes, run typecheck and focused UI tests. For documentation changes, regenerate the owning content pack, validate checksums, import through WCMS, and verify the route in Axis."
        }
      ],
      "searchText": "Customization and extension guide How customer projects customize Nodics safely without forking framework authority. # Customization and extension guide\n\nNodics is built for customization, but customization must happen in the right\nowner. The safest path is to reuse an existing capability, configure it, extend\nit in a later-loaded module, and create new framework behavior only when the\nexisting contract truly cannot satisfy the requirement.\n\n## What this is\n\nThis guide explains how a customer or partner changes Nodics behavior without\nturning a customer project into a fork of the framework. It applies to backend\ncustomization, Axis presentation customization, and documentation ownership.\n\n## The customization ladder\n\nStart with the least invasive option:\n\n1. Use existing behavior.\n2. Change configuration in the correct project, environment, server, node, or\n   tenant scope.\n3. Add customer project modules under the customer project.\n4. Add a customer extension module that extends a framework functional module.\n5. Create a new implementation only when the existing capability contract is\n   missing or incorrect.\n\nThis ladder protects upgradeability. The later a customization loads, the more\nspecific it is. Framework modules stay reusable; customer modules carry\ncustomer decisions.\n\n## Backend customization\n\nBackend behavior belongs in the backend project or module that owns the\nbusiness rule. In Kickoff, project modules live under `modules/`, while\nenvironment and server composition live under `envs/`.\n\nA future module such as `kickoff.platform` may extend `nodics.platform` to\ncustomize Platform services. The runtime server can load the customer extension\nafter Platform. Service precedence then follows the normal module merge and\nindex order. Axis should still display the functional capability as Platform,\nbecause the customer extension changes implementation, not the business-facing\nidentity.\n\n## Axis customization\n\nAxis is the browser application. It owns renderers, interaction behavior,\nlayout, accessibility, and static recovery. It must not own imported CMS data,\nbackend schemas, permissions, or business rules. If a customer needs a new\nBackOffice page, the backend should expose the authorized navigation,\ncapability metadata, API contract, and CMS content where applicable. Axis then\nrenders that authorized contract.\n\nSimple presentation changes, such as logo, copy, theme, or demo content, should\ncome from backend-owned CMS or configuration where possible. Hard-coding those\nvalues in the frontend makes future customers harder to support.\n\n## Documentation customization\n\nDocumentation follows the owner of the thing being explained:\n\n- framework guidance goes to `nodics.docs`;\n- Axis product guidance goes to `nodics.platform/modules/axis`;\n- project guidance goes to the owning customer project, such as\n  `nodics.kickoff`;\n- generated content records stay under `data/core/data/documentation`;\n- manifests stay under `manifest/docs-content-pack.json`.\n\nDo not put customer project documentation into `nodics.docs`, and do not put\nimportable documentation records into `nodics.axis`.\n\n## Common mistakes\n\n- Editing framework source for one customer.\n- Adding business authorization in the browser.\n- Creating a second module registry or endpoint list in Axis.\n- Moving generated CMS data into a frontend repository.\n- Changing a functional module display name because an implementation was\n  customized.\n- Skipping tests after service override changes.\n\n## Verification\n\nEvery customization should prove success and failure behavior. For backend\nchanges, run the owning module tests and any affected runtime smoke test. For\nAxis changes, run typecheck and focused UI tests. For documentation changes,\nregenerate the owning content pack, validate checksums, import through WCMS,\nand verify the route in Axis.\n",
      "previous": {
        "title": "Local quick start with Kickoff and Axis",
        "route": "/docs/framework/framework-local-quick-start"
      },
      "next": {
        "title": "Runtime and DevOps operations",
        "route": "/docs/framework/framework-devops-runtime"
      },
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.core",
        "technicalModule": "nSetup",
        "path": "content/framework/customization-guide.md",
        "wordCount": 520,
        "checksum": "6c28ade6957c598b9f2e46b39069f7c6ede4aee3ec557851252d72b628b9cc2b"
      }
    },
    "active": true
  },
  "record5": {
    "code": "nodicsDocsComponentframeworkDevopsRuntime",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "framework.devops-runtime",
      "title": "Runtime and DevOps operations",
      "route": "/docs/framework/framework-devops-runtime",
      "section": "nodics-core",
      "sectionTitle": "Nodics core",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance.",
      "headings": [
        "Local topology",
        "Configuration layers",
        "Dependencies",
        "Deployment mindset",
        "Monitoring and recovery",
        "Common mistakes",
        "Next actions"
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Runtime and DevOps operations"
        },
        {
          "kind": "paragraph",
          "text": "Nodics runtime operations are based on explicit server composition and layered configuration. A runtime server is a process that hosts an effective set of active modules. The module remains the capability owner; the server is the runtime grouping."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Local topology"
        },
        {
          "kind": "paragraph",
          "text": "The reference local setup uses separate servers:"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Platform on `http://localhost:4300`;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "WCMS on `http://localhost:4310`;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Cron when scheduled behavior is needed;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Axis on `http://localhost:3100`."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This split keeps module boundaries visible. It also prepares the team for a future topology where different capabilities may run in different processes, hosts, containers, or deployment units."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration layers"
        },
        {
          "kind": "paragraph",
          "text": "Nodics configuration is layered. Framework defaults come first. Project, environment, server, node, tenant, and governed runtime configuration can refine behavior later. A developer should place a property in the narrowest owner that needs it."
        },
        {
          "kind": "paragraph",
          "text": "Use public browser configuration only for values safe to expose, such as Axis base URLs and client contract versions. Credentials, private keys, service tokens, database passwords, and provider secrets belong in protected backend configuration or deployment secret management."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Dependencies"
        },
        {
          "kind": "paragraph",
          "text": "MongoDB is the primary local runtime dependency for persisted records. Elasticsearch is used when search-backed capabilities are enabled. Redis is used when Redis-backed cache or session behavior is enabled. Enterprise messaging, external storage, AI providers, or other integrations may be optional depending on active modules and configuration."
        },
        {
          "kind": "paragraph",
          "text": "Disabled providers should fail closed or log that they are disabled. A disabled optional provider is not the same as a broken mandatory provider."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Deployment mindset"
        },
        {
          "kind": "paragraph",
          "text": "Start simple locally. Keep capability ownership correct. Then distribute only when scale, resilience, security, or team ownership requires it. The runtime topology can change without moving business ownership out of the owning module."
        },
        {
          "kind": "paragraph",
          "text": "For production, define:"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "which servers run which functional modules;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "where public and private properties are sourced;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "how credentials are injected and rotated;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "how logs, health, audit events, and runtime diagnostics are collected;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "how content packs, generated artifacts, and database migrations are released;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "how rollback works for code, configuration, and imported content."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Monitoring and recovery"
        },
        {
          "kind": "paragraph",
          "text": "Platform exposes registry and BackOffice projections for active modules. WCMS owns content-pack delivery and CMS route resolution. Cron owns scheduled work. Axis should show recovery states when these backends are unavailable instead of inventing another control plane."
        },
        {
          "kind": "paragraph",
          "text": "When something fails, identify the owner first:"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "login or BackOffice bootstrap: Platform/Profile/BackOffice;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "CMS page delivery or documentation content: WCMS/CMS/content-pack owner;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "scheduled job execution: Cron;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "frontend rendering or shell interaction: Axis;"
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "customer-specific behavior: customer project module."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes"
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Treating environment or server modules as business capability owners."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Putting secrets into frontend `.env` files."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Deploying generated content without a version change."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Relying on process memory instead of durable registration or import history."
          ]
        },
        {
          "kind": "list",
          "ordered": false,
          "items": [
            "Ignoring negative tests, recovery states, and rollback behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Next actions"
        },
        {
          "kind": "paragraph",
          "text": "Before production, write an environment-specific operations runbook that lists server topology, dependency versions, secrets strategy, health checks, monitoring, backup, restore, content-pack import process, and rollback steps."
        }
      ],
      "searchText": "Runtime and DevOps operations Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance. # Runtime and DevOps operations\n\nNodics runtime operations are based on explicit server composition and layered\nconfiguration. A runtime server is a process that hosts an effective set of\nactive modules. The module remains the capability owner; the server is the\nruntime grouping.\n\n## Local topology\n\nThe reference local setup uses separate servers:\n\n- Platform on `http://localhost:4300`;\n- WCMS on `http://localhost:4310`;\n- Cron when scheduled behavior is needed;\n- Axis on `http://localhost:3100`.\n\nThis split keeps module boundaries visible. It also prepares the team for a\nfuture topology where different capabilities may run in different processes,\nhosts, containers, or deployment units.\n\n## Configuration layers\n\nNodics configuration is layered. Framework defaults come first. Project,\nenvironment, server, node, tenant, and governed runtime configuration can refine\nbehavior later. A developer should place a property in the narrowest owner that\nneeds it.\n\nUse public browser configuration only for values safe to expose, such as Axis\nbase URLs and client contract versions. Credentials, private keys, service\ntokens, database passwords, and provider secrets belong in protected backend\nconfiguration or deployment secret management.\n\n## Dependencies\n\nMongoDB is the primary local runtime dependency for persisted records.\nElasticsearch is used when search-backed capabilities are enabled. Redis is\nused when Redis-backed cache or session behavior is enabled. Enterprise\nmessaging, external storage, AI providers, or other integrations may be\noptional depending on active modules and configuration.\n\nDisabled providers should fail closed or log that they are disabled. A disabled\noptional provider is not the same as a broken mandatory provider.\n\n## Deployment mindset\n\nStart simple locally. Keep capability ownership correct. Then distribute only\nwhen scale, resilience, security, or team ownership requires it. The runtime\ntopology can change without moving business ownership out of the owning module.\n\nFor production, define:\n\n- which servers run which functional modules;\n- where public and private properties are sourced;\n- how credentials are injected and rotated;\n- how logs, health, audit events, and runtime diagnostics are collected;\n- how content packs, generated artifacts, and database migrations are released;\n- how rollback works for code, configuration, and imported content.\n\n## Monitoring and recovery\n\nPlatform exposes registry and BackOffice projections for active modules. WCMS\nowns content-pack delivery and CMS route resolution. Cron owns scheduled work.\nAxis should show recovery states when these backends are unavailable instead of\ninventing another control plane.\n\nWhen something fails, identify the owner first:\n\n- login or BackOffice bootstrap: Platform/Profile/BackOffice;\n- CMS page delivery or documentation content: WCMS/CMS/content-pack owner;\n- scheduled job execution: Cron;\n- frontend rendering or shell interaction: Axis;\n- customer-specific behavior: customer project module.\n\n## Common mistakes\n\n- Treating environment or server modules as business capability owners.\n- Putting secrets into frontend `.env` files.\n- Deploying generated content without a version change.\n- Relying on process memory instead of durable registration or import history.\n- Ignoring negative tests, recovery states, and rollback behavior.\n\n## Next actions\n\nBefore production, write an environment-specific operations runbook that lists\nserver topology, dependency versions, secrets strategy, health checks,\nmonitoring, backup, restore, content-pack import process, and rollback steps.\n",
      "previous": {
        "title": "Customization and extension guide",
        "route": "/docs/framework/framework-customization-guide"
      },
      "next": {
        "title": "Functional module registry",
        "route": "/docs/framework/platform-module-registry"
      },
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.core",
        "technicalModule": "nSetup",
        "path": "content/framework/devops-runtime.md",
        "wordCount": 482,
        "checksum": "8ccd54a42f1747c282623a66a519d28ae67c7e1d6b19d6fcf3c27474938fa152"
      }
    },
    "active": true
  },
  "record6": {
    "code": "nodicsDocsComponentplatformModuleRegistry",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "platform.module-registry",
      "title": "Functional module registry",
      "route": "/docs/framework/platform-module-registry",
      "section": "nodics-platform",
      "sectionTitle": "Nodics platform",
      "audience": [
        "architect",
        "developer",
        "operator"
      ],
      "summary": "Durable project registration and runtime observation rules.",
      "headings": [],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Functional module registry"
        },
        {
          "kind": "paragraph",
          "text": "The registry separates durable project decisions from ephemeral runtime observations. Restarting a server renews its runtime lease but does not ask the operator to register the functional module again."
        },
        {
          "kind": "paragraph",
          "text": "Core and Platform are protected for a Platform runtime. Optional functional modules move through available, registered, active, inactive, and deregistered operator decisions without hot-loading or unloading server code."
        }
      ],
      "searchText": "Functional module registry Durable project registration and runtime observation rules. # Functional module registry\n\nThe registry separates durable project decisions from ephemeral runtime\nobservations. Restarting a server renews its runtime lease but does not ask the\noperator to register the functional module again.\n\nCore and Platform are protected for a Platform runtime. Optional functional\nmodules move through available, registered, active, inactive, and deregistered\noperator decisions without hot-loading or unloading server code.\n\n",
      "previous": {
        "title": "Runtime and DevOps operations",
        "route": "/docs/framework/framework-devops-runtime"
      },
      "next": null,
      "source": {
        "repository": "nodics.docs",
        "functionalModule": "nodics.platform",
        "technicalModule": "backoffice",
        "path": "content/nodics.platform/module-registry.md",
        "wordCount": 60,
        "checksum": "7714491571118789efc97f1f7395666fbfaf32c0ebd90424e2fc5371306f7cde"
      }
    },
    "active": true
  }
};
