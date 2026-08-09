/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Process documentation navigation and article content. */
module.exports = {
  "record0": {
    "code": "processDocumentationNavigation",
    "typeCode": "processDocumentationNavigationComponentType",
    "renderer": "documentation.component.navigation",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "title": "Nodics Process",
      "searchLabel": "Search process documentation",
      "searchPlaceholder": "Search process, workflow, tasks, triggers, and automation guidance",
      "emptyMessage": "No process documentation matches your search.",
      "sections": [
        {
          "code": "process-fundamentals",
          "title": "Process Fundamentals",
          "order": 10
        },
        {
          "code": "process-operations",
          "title": "Process Operations",
          "order": 20
        },
        {
          "code": "build-and-extend",
          "title": "Build and Extend",
          "order": 30
        },
        {
          "code": "operate",
          "title": "Operate",
          "order": 40
        }
      ],
      "items": [
        {
          "code": "overview",
          "title": "Business Process and Automation Overview",
          "route": "/docs/framework/process",
          "section": "process-fundamentals",
          "sectionTitle": "Process Fundamentals",
          "sectionOrder": 10,
          "order": 10,
          "audience": [
            "business-user",
            "developer",
            "operator",
            "architect",
            "ai-tool"
          ],
          "summary": "Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules.",
          "searchText": "Business Process and Automation Overview Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules. # Business Process and Automation Overview\n\n`nodics.process` is the standard Nodics functional module group for business\nprocesses, workflows, task orchestration, runtime instances, audit evidence,\nand future automation design. It exists because most enterprise applications do\nnot run as one simple button click. A content approval, onboarding request,\norder exception, document review, refund approval, or partner activation often\nneeds multiple steps, people, systems, deadlines, decisions, retries, and audit\nrecords.\n\nFor a business user, Process answers: \"What work is moving, who needs to act,\nwhat is delayed, and what evidence do we have?\" For a developer, Process\nanswers: \"How do I model orchestration without hardcoding the flow into one\ndomain service?\" For an operator, Process answers: \"Which instances are\nrunning, which tasks are stuck, which triggers are related to schedules, and\nwhat happened when something failed?\"\n\n## Beginner mental model\n\nImagine a simple content approval:\n\n1. A page is submitted.\n2. A reviewer checks it.\n3. The reviewer approves or rejects it.\n4. The system records who acted and when.\n5. The page can continue to publication or return for changes.\n\nWithout a process engine, each application might write that flow in its own\nservice. That makes every flow difficult to inspect, customize, test, and\noperate. `nodics.process` gives Nodics one governed place to model the flow,\npublish versions, start runtime instances, create human tasks, and record audit\nevents.\n\n```mermaid\nflowchart LR\n  Business[\"Business user\"] --> Axis[\"Axis process console\"]\n  Axis --> ProcessApi[\"nodics.process APIs\"]\n  ProcessApi --> Definition[\"Draft definition\"]\n  Definition --> Version[\"Immutable published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Task --> Audit[\"Audit timeline\"]\n```\n\nAxis is the console. It is not the engine. The backend owns every state change.\n\n## Where Process fits in Nodics\n\n`nodics.process` is a module group like `nodics.platform`, `nodics.wcms`, and\n`nodics.cron`. Runtime implementation lives under `modules/workflow`, and that\ncapability is split into three technical modules:\n\n| Layer | Module | Responsibility |\n| --- | --- | --- |\n| Schema | `flowSchema` | Process definitions, versions, instances, tasks, triggers, audit events, statuses, and errors. |\n| Core behavior | `flowCore` | Graph validation, definition lifecycle, runtime lifecycle, task movement, audit writing, and future execution providers. |\n| API | `flowApi` | Secured routes, controllers, facades, help metadata, permission contracts, and BackOffice-facing API projection. |\n\nThis structure keeps the module customizable. A customer overlay can override a\nsingle assignment method, add a validation rule, or change SLA policy without\ncopying the whole Process module.\n\n## Business value\n\nProcess reduces cost and risk in three practical ways:\n\n- Business teams can see work as a lifecycle instead of searching logs or\n  asking developers which status field matters.\n- Developers can create reusable orchestration without mixing workflow logic\n  into commerce, content, profile, media, or customer-specific modules.\n- Operators can monitor running instances, tasks, scheduled relationships, and\n  audit events using one consistent model.\n\nThis is especially important for partners who want one server topology for\nbusiness process and automation. A `processServer` can compose\n`nodics.process`, `nodics.cron`, and `nodics.core`, while each module still\nkeeps its own ownership boundary.\n\n## Relationship with Cron\n\nProcess may reference scheduled triggers, but Cron owns job scheduling.\n\n```mermaid\nflowchart TD\n  Trigger[\"Process trigger metadata\"] --> Reference[\"cronJobCode reference\"]\n  Reference --> Cron[\"nodics.cron job lifecycle\"]\n  Cron --> Fire[\"Schedule fires\"]\n  Fire --> Process[\"Start process instance\"]\n```\n\nThe important rule: Process owns orchestration state; Cron owns scheduler state.\nSharing a runtime server does not mean mixing responsibilities.\n\n## Relationship with domain modules\n\nProcess does not own commerce refunds, CMS publishing, profile onboarding,\nmedia storage, or logistics shipment rules. Those domain modules own their\nbusiness actions. Process may orchestrate the steps and wait for tasks, but the\ndomain module must still validate and execute its own operation.\n\nExample:\n\n| Need | Owner |\n| --- | --- |\n| Decide whether a refund is allowed | Commerce module |\n| Ask a manager to approve the refund | Process task |\n| Schedule a nightly reconciliation flow | Cron job plus Process trigger metadata |\n| Show the task to an employee | Axis process console |\n| Persist instance and audit history | Process backend |\n\n## What exists in the current MVP\n\nThe current Process foundation supports:\n\n- draft process definition creation;\n- backend graph validation;\n- immutable publish versioning;\n- prepare-next-draft behavior;\n- start published process instance;\n- create first human task for a TASK node;\n- claim, assign, complete, and cancel tasks;\n- cancel running or waiting instances;\n- instance detail with tasks and audit timeline;\n- scheduled trigger metadata list;\n- Axis console projection for definitions, instances, tasks, triggers, and\n  timeline evidence.\n\nThe current runtime intentionally keeps execution small: START -> TASK -> END\nis supported as the first reliable path. Complex gateways, domain action\nexecution, compensation, retries, timers, and BPMN import/export can be added\nlater as governed extensions after the foundation is proven.\n\n## Extension direction\n\nFuture modules or customer projects should extend Process through:\n\n- graph validation policy;\n- task assignment policy;\n- SLA and escalation policy;\n- domain action execution providers;\n- trigger providers;\n- audit redaction policy;\n- Axis renderer components that call backend-owned Process APIs.\n\nDo not put process runtime rules into Axis. The browser can edit and display a\ngraph, but backend validation and execution remain authoritative.\n"
        },
        {
          "code": "runtime-lifecycle",
          "title": "Runtime Instance and Task Lifecycle",
          "route": "/docs/framework/process/runtime-lifecycle",
          "section": "process-operations",
          "sectionTitle": "Process Operations",
          "sectionOrder": 20,
          "order": 20,
          "audience": [
            "business-user",
            "administrator",
            "developer",
            "operator",
            "tester"
          ],
          "summary": "Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships.",
          "searchText": "Runtime Instance and Task Lifecycle Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships. # Runtime Instance and Task Lifecycle\n\nThis page explains the lifecycle that turns a designed process into operational\nwork. It is written for a beginner, so it starts with the simple path before\nexplaining where developers and operators customize behavior.\n\n## Lifecycle summary\n\n```mermaid\nstateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance\n```\n\nEvery arrow is a backend operation. Axis buttons call these APIs, but Axis does\nnot update the database directly and does not invent the next state.\n\n## Definition lifecycle\n\nA process starts as a draft. Drafts can be edited because business users and\ndevelopers often need multiple rounds of naming, description, category, graph\nlayout, and validation. A draft cannot become operational until the backend\ngraph validator accepts it.\n\nThe first supported graph shape is intentionally small:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]\n```\n\nThis proves the foundation before advanced behavior is added. The backend\nchecks stable node codes, supported node types, one START node, at least one END\nnode, valid transitions, duplicate node codes, and unsafe executable action\nreferences.\n\nWhen a draft is published, the backend creates an immutable\n`processDefinitionVersion`. Later draft edits must not mutate version 1. This\nis critical for audit: if a process instance ran yesterday, operators must know\nexactly which published graph version it used.\n\n## Starting an instance\n\nStarting a process requires a published definition. The request can specify a\ndefinition code and optional version. If no version is supplied, the backend\nuses the current published version from the definition aggregate.\n\nExample request:\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}\n```\n\nThe backend creates:\n\n- one `processInstance`;\n- a `process.instance.started` audit event;\n- the first `processTask` when the graph reaches a TASK node;\n- a `process.task.created` audit event.\n\n## Task lifecycle\n\nHuman tasks are operational work items. They can be open, claimed, completed,\ncancelled, or escalated.\n\nRuntime mutation routes use dedicated Process permissions. This keeps\ndefinition governance, instance control, human-task operations, and trigger\nmanagement separate even when the reference admin can exercise all of them.\nCustomer projects can assign these permissions to narrower user groups later.\n\n| Action | API | Permission | Allowed from | Result |\n| --- | --- | --- | --- | --- |\n| Start instance | `POST /instances` | `process.instance.start` | Published version | Instance starts and first task may be created. |\n| Claim | `POST /tasks/:taskCode/claim` | `process.task.claim` | `OPEN` | Task becomes `CLAIMED` and assignee is recorded. |\n| Assign | `POST /tasks/:taskCode/assign` | `process.task.assign` | `OPEN`, `CLAIMED`, `ESCALATED` | Assignee changes while task remains actionable. |\n| Complete | `POST /tasks/:taskCode/complete` | `process.task.complete` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `COMPLETED`; instance moves to next node. |\n| Cancel task | `POST /tasks/:taskCode/cancel` | `process.task.cancel` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `CANCELLED` without cancelling the whole instance. |\n| Cancel instance | `POST /instances/:instanceCode/cancel` | `process.instance.cancel` | `CREATED`, `RUNNING`, `WAITING` | Instance becomes `CANCELLED`; open tasks are cancelled. |\n\nCompleting the current MVP task moves the instance to END and marks it\n`COMPLETED`. Later versions can add gateways, multiple tasks, automated domain\nactions, timers, retries, and compensation.\n\n## Instance detail and audit\n\nOperators need evidence, not just status. The detail API returns the instance,\nits tasks, and its audit timeline.\n\n```http\nGET /nodics/process/v0/instances/contentApproval-001/detail\n```\n\nThe response gives Axis enough information to show:\n\n- current instance status;\n- definition and version;\n- current node;\n- all related tasks;\n- timeline events such as instance started, task created, task claimed, task\n  completed, and instance completed.\n\nAudit data must stay bounded and redacted. It should explain what happened\nwithout storing secrets or large raw payloads.\n\n## Scheduled triggers\n\nScheduled automation is represented as Process trigger metadata. A trigger may\nreference a Cron job code, but actual scheduling, firing, retries, and job\nlifecycle stay in `nodics.cron`.\n\nThis split helps a business user see automation relationships from the Process\nconsole while preserving module ownership:\n\n| Concern | Owner |\n| --- | --- |\n| Trigger relationship to a process | `nodics.process` |\n| Cron expression, job enablement, scheduler runtime | `nodics.cron` |\n| Starting an instance when schedule fires | Process API called by authorized runtime integration |\n| Showing relationship in Axis | `nodics.axis` frontend projection |\n\nThe trigger metadata lifecycle uses `process.trigger.manage` for create,\nupdate, activation, pause, and archive operations. Archiving is preferred over\ndelete so operators can still explain why a scheduled automation relationship\nused to exist.\n\n## QA checklist\n\nThe runtime foundation is healthy when:\n\n1. A draft can be created and validated.\n2. A valid draft can publish version 1.\n3. Version 1 remains immutable after preparing version 2 draft.\n4. A published definition can start a runtime instance.\n5. The first TASK node creates an OPEN task.\n6. Claiming the task records assignee and audit evidence.\n7. Completing the task advances the instance to END and COMPLETED.\n8. Instance detail returns tasks and audit timeline.\n9. Invalid task transitions fail with stable Process errors.\n10. Axis refreshes after each operation without calculating runtime state locally.\n\n## Customization examples\n\nA customer project can customize without editing the standard Process source:\n\n- override task assignment policy to assign by enterprise, site, queue, or role;\n- add SLA due-date calculation using project-level properties;\n- add graph validation rules for domain action references;\n- add a provider that executes ACTION nodes through a domain module facade;\n- add escalation rules that create events or Cron-backed reminders;\n- enrich Axis cards using backend-owned API data.\n\nThe key principle stays the same: Process owns orchestration state, domain\nmodules own business actions, Cron owns scheduling, and Axis renders authorized\ncontracts.\n"
        },
        {
          "code": "business-value",
          "title": "Business Value and Adoption Model",
          "route": "/docs/framework/process/business-value",
          "section": "process-fundamentals",
          "sectionTitle": "Process Fundamentals",
          "sectionOrder": 10,
          "order": 30,
          "audience": [
            "business-user",
            "administrator",
            "architect"
          ],
          "summary": "Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance.",
          "searchText": "Business Value and Adoption Model Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance. # Business Value and Adoption Model\n\nNodics Process exists to make business operations visible, governed, reusable,\nand changeable without scattering workflow rules across many domain services.\nA beginner can think of it as the operating playbook for work that crosses\npeople, systems, approvals, time, and exceptions.\n\n## The business problem\n\nMost enterprises already have processes, but those processes are often hidden:\n\n- an approval rule lives in one service;\n- a retry rule lives in a scheduler;\n- an escalation rule lives in an email template;\n- a support team tracks manual work in a spreadsheet;\n- a developer knows which service has to be called next.\n\nThat structure works until the business asks simple questions:\n\n| Business question | Without Process | With Nodics Process |\n| --- | --- | --- |\n| Where is this onboarding request stuck? | Ask several teams and inspect logs. | Open the instance and task timeline. |\n| Who owns the next action? | Read custom code or tribal knowledge. | The current task shows assignee/queue. |\n| Can we change the approval path? | Deploy risky domain-service changes. | Update and publish a governed definition version. |\n| Which version ran last month? | Difficult to prove. | Immutable version and audit evidence are stored. |\n| Can operations pause automation? | Maybe, if the scheduler has a switch. | Trigger metadata is visible and governed. |\n\n## What Process gives business users\n\nProcess gives business users a shared language:\n\n- **definition**: the designed workflow;\n- **version**: the published immutable contract that actually ran;\n- **instance**: one running or completed business case;\n- **task**: one human action waiting for a person, queue, or team;\n- **trigger**: a relationship saying automation can start a process;\n- **audit event**: evidence of what changed and who did it.\n\n```mermaid\nflowchart LR\n  Idea[\"Business policy\"] --> Definition[\"Process definition\"]\n  Definition --> Version[\"Published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Instance --> Audit[\"Audit timeline\"]\n  Trigger[\"Scheduled trigger metadata\"] --> Instance\n```\n\n## Why this reduces cost\n\nThe cost benefit is not only automation. The real saving comes from reducing\nthe number of places where people have to look, change, test, and explain a\nbusiness process.\n\nProcess helps reduce operating cost by:\n\n1. making work state visible;\n2. reducing custom one-off orchestration code;\n3. separating workflow orchestration from domain action ownership;\n4. preserving version history for audit and rollback discussions;\n5. allowing standard Axis screens to manage definitions, tasks, and triggers.\n\nIt can also reduce capital expenditure because partner projects can reuse the\nsame Process engine instead of building a new workflow layer for every domain.\n\n## Adoption path\n\nStart small. A good first process has one start, one human task, and one end.\n\n```mermaid\nflowchart LR\n  Start[\"Start\"] --> Review[\"Business review task\"]\n  Review --> End[\"End\"]\n```\n\nOnce that works, add richer behavior in layers:\n\n1. add assignment policy;\n2. add SLA and escalation;\n3. add scheduled trigger metadata;\n4. add domain action providers;\n5. add gateway rules;\n6. add analytics and operational dashboards.\n\nThis avoids the classic workflow failure: trying to model the whole company on\nday one.\n\n## Business-user acceptance\n\nA business user should be able to:\n\n- see active process definitions;\n- understand which workflows are drafts and which are published;\n- open a task list and know who must act next;\n- see whether scheduled automation is active or paused;\n- understand that Process coordinates work while domain modules still own\n  actual business behavior.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [Process and Cron Shared Runtime](process-cron-runtime.md)\n"
        },
        {
          "code": "developer-customization",
          "title": "Developer Customization Guide",
          "route": "/docs/framework/process/developer-customization",
          "section": "build-and-extend",
          "sectionTitle": "Build and Extend",
          "sectionOrder": 30,
          "order": 40,
          "audience": [
            "developer",
            "architect",
            "ai-tool"
          ],
          "summary": "Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely.",
          "searchText": "Developer Customization Guide Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely. # Developer Customization Guide\n\nThis guide explains where developers should extend Process behavior. The most\nimportant rule is simple: Process owns orchestration state, but domain modules\nown business action behavior.\n\n## Where code belongs\n\n| Need | Owning place |\n| --- | --- |\n| Process schemas and status definitions | `nodics.process/modules/workflow/modules/flowSchema` |\n| Runtime lifecycle, validation, assignment, audit | `nodics.process/modules/workflow/modules/flowCore` |\n| HTTP routes, controllers, facades | `nodics.process/modules/workflow/modules/flowApi` |\n| Cron job definitions and scheduler execution | `nodics.cron` |\n| Order, commerce, content, profile, media side effects | Owning domain module |\n| Customer-specific policy override | Customer module loaded after framework module |\n| Browser rendering and editor interactions | `nodics.axis` |\n\nDo not put runtime source directly under `nodics.process/src`. The module group\nroot is for composition, contracts, package metadata, documentation, and shared\ndefaults.\n\n## Customization-first approach\n\nBefore writing new code, ask:\n\n1. Can this be changed by a property?\n2. Can this be changed by a provider?\n3. Can this be changed by an interceptor or pipeline?\n4. Can a customer module override only one service method?\n5. Is a new framework feature actually needed?\n\nExample: a customer wants task assignment to go to a site-specific queue.\n\nDo not edit the standard Process task lifecycle directly. Instead, create a\ncustomer module that overrides assignment policy and loads after Process.\n\n```js\n/*\n    Customer Project - Process Customization\n */\n\n'use strict';\n\n/**\n * @module customer.process/src/service/defaultCustomerTaskAssignmentService\n * @description Resolves task assignee from enterprise, site, and process category.\n * @override Loaded after nodics.process to customize assignment without forking framework source.\n */\nmodule.exports = {\n    resolveAssignee: function (request, taskModel) {\n        const site = request.runtimeOperation && request.runtimeOperation.site;\n        if (site === 'uae-store') return 'uaeOperationsQueue';\n        return taskModel.assignee || 'defaultProcessQueue';\n    }\n};\n```\n\n## Domain action boundary\n\nProcess can decide that an ACTION node should be executed. It must not directly\nown a commerce refund, media upload, content publication, logistics shipment,\nor telco provisioning command.\n\n```mermaid\nflowchart LR\n  Process[\"Process engine\"] --> Contract[\"Domain action contract\"]\n  Contract --> Commerce[\"Commerce module\"]\n  Contract --> Media[\"Media module\"]\n  Contract --> Wcms[\"WCMS module\"]\n  Contract --> Profile[\"Profile module\"]\n```\n\nThe Process engine should store orchestration evidence. The domain module\nshould validate permissions, data, side effects, rollback, and audit for its\nown action.\n\n## API extension rule\n\nAdd a Process API only when:\n\n- the behavior is process-owned;\n- route permission is added to the identity catalog;\n- status codes live in `statusDefinitions.js`;\n- controller/facade/service layers remain separated;\n- tests cover positive, negative, boundary, and permission behavior.\n\n## Generated artifacts\n\nGenerated service/facade files are loader-visible runtime artifacts. If the\ngenerator is available for the affected schema, regenerate from schema source.\nIf a generated-style file must be repaired manually during migration, mirror\nthe nearest generated artifact exactly and add tests that prove the runtime\nservice is available.\n\n## Developer acceptance checklist\n\n- Source is in the nearest owning module.\n- No customer-specific rule is hardcoded in standard Process.\n- Axis is not storing workflow truth.\n- New permissions exist in the identity catalog.\n- Status/error codes live in status definitions.\n- Fresh bootstrap and live smoke prove the change.\n\n## Continue\n\n- [Visual Workflow Designer Contract](visual-designer.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n"
        },
        {
          "code": "devops-topology",
          "title": "DevOps and Runtime Topology",
          "route": "/docs/framework/process/devops-topology",
          "section": "operate",
          "sectionTitle": "Operate",
          "sectionOrder": 40,
          "order": 50,
          "audience": [
            "operator",
            "developer",
            "architect"
          ],
          "summary": "Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes.",
          "searchText": "DevOps and Runtime Topology Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes. # DevOps and Runtime Topology\n\nOperations teams need Process to be understandable after deployment, not only\nduring development. This page explains how Process should be deployed, observed,\ntested, and sustained.\n\n## Runtime shape\n\nIn local Kickoff, Process runs in the Business Process & Automation runtime.\nThat server can include `nodics.process`, `nodics.cron`, and `nodics.core`.\n\n```mermaid\nflowchart TB\n  Axis[\"nodics.axis browser\"] --> Platform[\"Platform server\"]\n  Axis --> Wcms[\"WCMS server\"]\n  Axis --> ProcessServer[\"Process server\"]\n  ProcessServer --> Process[\"nodics.process\"]\n  ProcessServer --> Cron[\"nodics.cron\"]\n  ProcessServer --> Core[\"nodics.core\"]\n  Process --> Mongo[\"Process database\"]\n  Cron --> Mongo\n```\n\nSharing a runtime is a deployment decision, not an ownership merge. Process\nstill owns process instances, tasks, triggers, and audit. Cron still owns job\ndefinitions, scheduler state, firing, retry, and job execution lifecycle.\n\n## Fresh bootstrap evidence\n\nThe local fresh acceptance test drops only local Kickoff databases, starts the\nruntime servers, imports documentation packs, verifies Axis routes, logs in as\nadmin, exercises Process APIs, and runs Cron lifecycle operations.\n\nThis is the minimum confidence gate before saying the local stack is healthy.\n\n## What to monitor\n\n| Signal | Why it matters |\n| --- | --- |\n| Process server readiness | Axis process screens depend on this API. |\n| Definition publish failures | Bad graph contracts block operations. |\n| Waiting task count | Shows work stuck with humans or queues. |\n| Failed/cancelled instance count | Reveals broken policy or domain integration. |\n| Trigger status distribution | Shows scheduled automation posture. |\n| Audit event volume | Confirms runtime evidence is being written. |\n\n## Failure and recovery\n\nIf Axis can load but Process APIs fail, Axis should show recovery or unavailable\nstates. Do not fake process data in the browser.\n\nIf Process starts but trigger creation fails, check:\n\n1. `flowSchema` includes the `processTrigger` schema;\n2. generated trigger service/facade artifacts are loader-visible;\n3. route permissions exist in the identity catalog;\n4. the referenced definition exists and is safe to use;\n5. fresh acceptance passes from zero database state.\n\n## Release discipline\n\nProcess changes are release-sensitive because they can affect long-running\ninstances. Always ask:\n\n- Is the schema backward compatible?\n- Are published versions immutable?\n- Can older instances still be inspected?\n- Does a new route have a dedicated permission?\n- Does the change preserve tenant and audit boundaries?\n- Can a customer override the behavior without editing framework source?\n\n## Continue\n\n- [Process and Cron Shared Runtime](process-cron-runtime.md)\n- [Developer Customization Guide](developer-customization.md)\n"
        },
        {
          "code": "process-cron-runtime",
          "title": "Process and Cron Shared Runtime",
          "route": "/docs/framework/process/process-cron-runtime",
          "section": "operate",
          "sectionTitle": "Operate",
          "sectionOrder": 40,
          "order": 60,
          "audience": [
            "administrator",
            "operator",
            "developer",
            "architect"
          ],
          "summary": "Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries.",
          "searchText": "Process and Cron Shared Runtime Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries. # Process and Cron Shared Runtime\n\nProcess and Cron can run together in one runtime server when a partner wants a\nsmaller topology. This is useful for local development, small installations, or\ncustomers who want business process automation and scheduled jobs without\nrunning many microservice processes.\n\n## The key rule\n\nShared runtime does not mean shared ownership.\n\n| Concern | Owner |\n| --- | --- |\n| Process definitions | `nodics.process` |\n| Published workflow versions | `nodics.process` |\n| Runtime instances and tasks | `nodics.process` |\n| Trigger relationship metadata | `nodics.process` |\n| Cron job definition | `nodics.cron` |\n| Scheduler firing and retries | `nodics.cron` |\n| Domain business action | Domain module |\n| UI rendering | `nodics.axis` |\n\n## Example topology\n\n```mermaid\nflowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.core\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  ProcessServer --> Cron[\"includes nodics.cron\"]\n  Process --> Trigger[\"processTrigger metadata\"]\n  Cron --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job\n```\n\nThe trigger can reference a Cron job code. It does not become the Cron job.\nCron still decides when the job fires. When a Cron-owned job wants to start a\nprocess, it calls the Process API with a secured runtime identity.\n\n## Why this is attractive for partners\n\nPartners often start with one server for operational simplicity. Later they may\nsplit runtimes when scale, isolation, or team ownership requires it. Nodics\nshould support both without changing functional module identity.\n\nThis keeps the mental model stable:\n\n- Process console shows workflows and automation relationships.\n- Cron console shows jobs and scheduler behavior.\n- Axis can place both under \"Business Process & Automation\".\n- Backend ownership still protects maintainability.\n\n## Safe lifecycle behavior\n\nCron can be registered, activated, deactivated, and deregistered through the\nmodule registry. Process APIs should remain reachable even when Cron is\nderegistered, because Process definitions and tasks are not owned by Cron.\n\nThe local acceptance smoke proves this by exercising Process runtime first and\nthen verifying the Cron registry lifecycle.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n"
        },
        {
          "code": "visual-designer",
          "title": "Visual Workflow Designer Contract",
          "route": "/docs/framework/process/visual-designer",
          "section": "build-and-extend",
          "sectionTitle": "Build and Extend",
          "sectionOrder": 30,
          "order": 70,
          "audience": [
            "business-user",
            "developer",
            "tester",
            "ai-tool"
          ],
          "summary": "Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer.",
          "searchText": "Visual Workflow Designer Contract Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer. # Visual Workflow Designer Contract\n\nThe visual workflow designer lets a business user or developer edit a process\ngraph through Axis. The important contract is that Axis is an editor, not the\nruntime authority.\n\n## Ownership model\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version\n```\n\nAxis can display nodes, edges, positions, labels, and selection state. The\nbackend validates whether the graph is executable.\n\n## MVP graph contract\n\nThe first designer contract supports:\n\n- one `START` node;\n- one or more `TASK` nodes;\n- one or more `END` nodes;\n- transitions with stable codes, source, and target;\n- optional designer metadata for browser positions.\n\n```json\n{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}\n```\n\n## What the browser may do\n\nAxis may:\n\n- render a node palette;\n- show a canvas preview;\n- let the user select nodes;\n- collect labels and basic properties;\n- send draft graph data to Process APIs;\n- show backend validation diagnostics.\n\nAxis must not:\n\n- execute process logic;\n- calculate runtime state;\n- bypass backend validation;\n- store workflow definitions in browser storage as authority;\n- create a parallel workflow registry.\n\n## Designer acceptance\n\nThe designer foundation is healthy when:\n\n1. A user can see START, TASK, and END nodes.\n2. A user can inspect selected node details.\n3. Saving calls the Process draft API.\n4. Validation calls the Process graph validator.\n5. Publishing remains a separate backend-owned action.\n6. The same graph can be verified through API tests and fresh acceptance.\n\n## Continue\n\n- [Developer Customization Guide](developer-customization.md)\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "processDocumentationComponentoverview",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "overview",
      "title": "Business Process and Automation Overview",
      "route": "/docs/framework/process",
      "section": "process-fundamentals",
      "sectionTitle": "Process Fundamentals",
      "audience": [
        "business-user",
        "developer",
        "operator",
        "architect",
        "ai-tool"
      ],
      "summary": "Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules.",
      "headings": [
        {
          "text": "Beginner mental model",
          "anchor": "overview-1-beginner-mental-model",
          "level": 2
        },
        {
          "text": "Where Process fits in Nodics",
          "anchor": "overview-2-where-process-fits-in-nodics",
          "level": 2
        },
        {
          "text": "Business value",
          "anchor": "overview-3-business-value",
          "level": 2
        },
        {
          "text": "Relationship with Cron",
          "anchor": "overview-4-relationship-with-cron",
          "level": 2
        },
        {
          "text": "Relationship with domain modules",
          "anchor": "overview-5-relationship-with-domain-modules",
          "level": 2
        },
        {
          "text": "What exists in the current MVP",
          "anchor": "overview-6-what-exists-in-the-current-mvp",
          "level": 2
        },
        {
          "text": "Extension direction",
          "anchor": "overview-7-extension-direction",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "`nodics.process` is the standard Nodics functional module group for business processes, workflows, task orchestration, runtime instances, audit evidence, and future automation design. It exists because most enterprise applications do not run as one simple button click. A content approval, onboarding request, order exception, document review, refund approval, or partner activation often needs multiple steps, people, systems, deadlines, decisions, retries, and audit records."
        },
        {
          "kind": "paragraph",
          "text": "For a business user, Process answers: \"What work is moving, who needs to act, what is delayed, and what evidence do we have?\" For a developer, Process answers: \"How do I model orchestration without hardcoding the flow into one domain service?\" For an operator, Process answers: \"Which instances are running, which tasks are stuck, which triggers are related to schedules, and what happened when something failed?\""
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model",
          "anchor": "overview-1-beginner-mental-model"
        },
        {
          "kind": "paragraph",
          "text": "Imagine a simple content approval:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A page is submitted.",
            "A reviewer checks it.",
            "The reviewer approves or rejects it.",
            "The system records who acted and when.",
            "The page can continue to publication or return for changes."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Without a process engine, each application might write that flow in its own service. That makes every flow difficult to inspect, customize, test, and operate. `nodics.process` gives Nodics one governed place to model the flow, publish versions, start runtime instances, create human tasks, and record audit events."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Business[\"Business user\"] --> Axis[\"Axis process console\"]\n  Axis --> ProcessApi[\"nodics.process APIs\"]\n  ProcessApi --> Definition[\"Draft definition\"]\n  Definition --> Version[\"Immutable published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Task --> Audit[\"Audit timeline\"]"
        },
        {
          "kind": "paragraph",
          "text": "Axis is the console. It is not the engine. The backend owns every state change."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Where Process fits in Nodics",
          "anchor": "overview-2-where-process-fits-in-nodics"
        },
        {
          "kind": "paragraph",
          "text": "`nodics.process` is a module group like `nodics.platform`, `nodics.wcms`, and `nodics.cron`. Runtime implementation lives under `modules/workflow`, and that capability is split into three technical modules:"
        },
        {
          "kind": "table",
          "headers": [
            "Layer",
            "Module",
            "Responsibility"
          ],
          "rows": [
            [
              "Schema",
              "`flowSchema`",
              "Process definitions, versions, instances, tasks, triggers, audit events, statuses, and errors."
            ],
            [
              "Core behavior",
              "`flowCore`",
              "Graph validation, definition lifecycle, runtime lifecycle, task movement, audit writing, and future execution providers."
            ],
            [
              "API",
              "`flowApi`",
              "Secured routes, controllers, facades, help metadata, permission contracts, and BackOffice-facing API projection."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This structure keeps the module customizable. A customer overlay can override a single assignment method, add a validation rule, or change SLA policy without copying the whole Process module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business value",
          "anchor": "overview-3-business-value"
        },
        {
          "kind": "paragraph",
          "text": "Process reduces cost and risk in three practical ways:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Business teams can see work as a lifecycle instead of searching logs or asking developers which status field matters.",
            "Developers can create reusable orchestration without mixing workflow logic into commerce, content, profile, media, or customer-specific modules.",
            "Operators can monitor running instances, tasks, scheduled relationships, and audit events using one consistent model."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is especially important for partners who want one server topology for business process and automation. A `processServer` can compose `nodics.process`, `nodics.cron`, and `nodics.core`, while each module still keeps its own ownership boundary."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Relationship with Cron",
          "anchor": "overview-4-relationship-with-cron"
        },
        {
          "kind": "paragraph",
          "text": "Process may reference scheduled triggers, but Cron owns job scheduling."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Trigger[\"Process trigger metadata\"] --> Reference[\"cronJobCode reference\"]\n  Reference --> Cron[\"nodics.cron job lifecycle\"]\n  Cron --> Fire[\"Schedule fires\"]\n  Fire --> Process[\"Start process instance\"]"
        },
        {
          "kind": "paragraph",
          "text": "The important rule: Process owns orchestration state; Cron owns scheduler state. Sharing a runtime server does not mean mixing responsibilities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Relationship with domain modules",
          "anchor": "overview-5-relationship-with-domain-modules"
        },
        {
          "kind": "paragraph",
          "text": "Process does not own commerce refunds, CMS publishing, profile onboarding, media storage, or logistics shipment rules. Those domain modules own their business actions. Process may orchestrate the steps and wait for tasks, but the domain module must still validate and execute its own operation."
        },
        {
          "kind": "paragraph",
          "text": "Example:"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Owner"
          ],
          "rows": [
            [
              "Decide whether a refund is allowed",
              "Commerce module"
            ],
            [
              "Ask a manager to approve the refund",
              "Process task"
            ],
            [
              "Schedule a nightly reconciliation flow",
              "Cron job plus Process trigger metadata"
            ],
            [
              "Show the task to an employee",
              "Axis process console"
            ],
            [
              "Persist instance and audit history",
              "Process backend"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What exists in the current MVP",
          "anchor": "overview-6-what-exists-in-the-current-mvp"
        },
        {
          "kind": "paragraph",
          "text": "The current Process foundation supports:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "draft process definition creation;",
            "backend graph validation;",
            "immutable publish versioning;",
            "prepare-next-draft behavior;",
            "start published process instance;",
            "create first human task for a TASK node;",
            "claim, assign, complete, and cancel tasks;",
            "cancel running or waiting instances;",
            "instance detail with tasks and audit timeline;",
            "scheduled trigger metadata list;",
            "Axis console projection for definitions, instances, tasks, triggers, and timeline evidence."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The current runtime intentionally keeps execution small: START -> TASK -> END is supported as the first reliable path. Complex gateways, domain action execution, compensation, retries, timers, and BPMN import/export can be added later as governed extensions after the foundation is proven."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Extension direction",
          "anchor": "overview-7-extension-direction"
        },
        {
          "kind": "paragraph",
          "text": "Future modules or customer projects should extend Process through:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "graph validation policy;",
            "task assignment policy;",
            "SLA and escalation policy;",
            "domain action execution providers;",
            "trigger providers;",
            "audit redaction policy;",
            "Axis renderer components that call backend-owned Process APIs."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not put process runtime rules into Axis. The browser can edit and display a graph, but backend validation and execution remain authoritative."
        }
      ],
      "searchText": "Business Process and Automation Overview Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules. # Business Process and Automation Overview\n\n`nodics.process` is the standard Nodics functional module group for business\nprocesses, workflows, task orchestration, runtime instances, audit evidence,\nand future automation design. It exists because most enterprise applications do\nnot run as one simple button click. A content approval, onboarding request,\norder exception, document review, refund approval, or partner activation often\nneeds multiple steps, people, systems, deadlines, decisions, retries, and audit\nrecords.\n\nFor a business user, Process answers: \"What work is moving, who needs to act,\nwhat is delayed, and what evidence do we have?\" For a developer, Process\nanswers: \"How do I model orchestration without hardcoding the flow into one\ndomain service?\" For an operator, Process answers: \"Which instances are\nrunning, which tasks are stuck, which triggers are related to schedules, and\nwhat happened when something failed?\"\n\n## Beginner mental model\n\nImagine a simple content approval:\n\n1. A page is submitted.\n2. A reviewer checks it.\n3. The reviewer approves or rejects it.\n4. The system records who acted and when.\n5. The page can continue to publication or return for changes.\n\nWithout a process engine, each application might write that flow in its own\nservice. That makes every flow difficult to inspect, customize, test, and\noperate. `nodics.process` gives Nodics one governed place to model the flow,\npublish versions, start runtime instances, create human tasks, and record audit\nevents.\n\n```mermaid\nflowchart LR\n  Business[\"Business user\"] --> Axis[\"Axis process console\"]\n  Axis --> ProcessApi[\"nodics.process APIs\"]\n  ProcessApi --> Definition[\"Draft definition\"]\n  Definition --> Version[\"Immutable published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Task --> Audit[\"Audit timeline\"]\n```\n\nAxis is the console. It is not the engine. The backend owns every state change.\n\n## Where Process fits in Nodics\n\n`nodics.process` is a module group like `nodics.platform`, `nodics.wcms`, and\n`nodics.cron`. Runtime implementation lives under `modules/workflow`, and that\ncapability is split into three technical modules:\n\n| Layer | Module | Responsibility |\n| --- | --- | --- |\n| Schema | `flowSchema` | Process definitions, versions, instances, tasks, triggers, audit events, statuses, and errors. |\n| Core behavior | `flowCore` | Graph validation, definition lifecycle, runtime lifecycle, task movement, audit writing, and future execution providers. |\n| API | `flowApi` | Secured routes, controllers, facades, help metadata, permission contracts, and BackOffice-facing API projection. |\n\nThis structure keeps the module customizable. A customer overlay can override a\nsingle assignment method, add a validation rule, or change SLA policy without\ncopying the whole Process module.\n\n## Business value\n\nProcess reduces cost and risk in three practical ways:\n\n- Business teams can see work as a lifecycle instead of searching logs or\n  asking developers which status field matters.\n- Developers can create reusable orchestration without mixing workflow logic\n  into commerce, content, profile, media, or customer-specific modules.\n- Operators can monitor running instances, tasks, scheduled relationships, and\n  audit events using one consistent model.\n\nThis is especially important for partners who want one server topology for\nbusiness process and automation. A `processServer` can compose\n`nodics.process`, `nodics.cron`, and `nodics.core`, while each module still\nkeeps its own ownership boundary.\n\n## Relationship with Cron\n\nProcess may reference scheduled triggers, but Cron owns job scheduling.\n\n```mermaid\nflowchart TD\n  Trigger[\"Process trigger metadata\"] --> Reference[\"cronJobCode reference\"]\n  Reference --> Cron[\"nodics.cron job lifecycle\"]\n  Cron --> Fire[\"Schedule fires\"]\n  Fire --> Process[\"Start process instance\"]\n```\n\nThe important rule: Process owns orchestration state; Cron owns scheduler state.\nSharing a runtime server does not mean mixing responsibilities.\n\n## Relationship with domain modules\n\nProcess does not own commerce refunds, CMS publishing, profile onboarding,\nmedia storage, or logistics shipment rules. Those domain modules own their\nbusiness actions. Process may orchestrate the steps and wait for tasks, but the\ndomain module must still validate and execute its own operation.\n\nExample:\n\n| Need | Owner |\n| --- | --- |\n| Decide whether a refund is allowed | Commerce module |\n| Ask a manager to approve the refund | Process task |\n| Schedule a nightly reconciliation flow | Cron job plus Process trigger metadata |\n| Show the task to an employee | Axis process console |\n| Persist instance and audit history | Process backend |\n\n## What exists in the current MVP\n\nThe current Process foundation supports:\n\n- draft process definition creation;\n- backend graph validation;\n- immutable publish versioning;\n- prepare-next-draft behavior;\n- start published process instance;\n- create first human task for a TASK node;\n- claim, assign, complete, and cancel tasks;\n- cancel running or waiting instances;\n- instance detail with tasks and audit timeline;\n- scheduled trigger metadata list;\n- Axis console projection for definitions, instances, tasks, triggers, and\n  timeline evidence.\n\nThe current runtime intentionally keeps execution small: START -> TASK -> END\nis supported as the first reliable path. Complex gateways, domain action\nexecution, compensation, retries, timers, and BPMN import/export can be added\nlater as governed extensions after the foundation is proven.\n\n## Extension direction\n\nFuture modules or customer projects should extend Process through:\n\n- graph validation policy;\n- task assignment policy;\n- SLA and escalation policy;\n- domain action execution providers;\n- trigger providers;\n- audit redaction policy;\n- Axis renderer components that call backend-owned Process APIs.\n\nDo not put process runtime rules into Axis. The browser can edit and display a\ngraph, but backend validation and execution remain authoritative.\n",
      "previous": null,
      "next": {
        "title": "Runtime Instance and Task Lifecycle",
        "route": "/docs/framework/process/runtime-lifecycle"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/process-overview.md",
        "wordCount": 808,
        "checksum": "755f7a72c7f104ca279248098895dba68d1bb93ab48e3c164d894e6fb07803e0"
      }
    },
    "active": true
  },
  "record2": {
    "code": "processDocumentationComponentruntimeLifecycle",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "runtime-lifecycle",
      "title": "Runtime Instance and Task Lifecycle",
      "route": "/docs/framework/process/runtime-lifecycle",
      "section": "process-operations",
      "sectionTitle": "Process Operations",
      "audience": [
        "business-user",
        "administrator",
        "developer",
        "operator",
        "tester"
      ],
      "summary": "Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships.",
      "headings": [
        {
          "text": "Lifecycle summary",
          "anchor": "runtimeLifecycle-1-lifecycle-summary",
          "level": 2
        },
        {
          "text": "Definition lifecycle",
          "anchor": "runtimeLifecycle-2-definition-lifecycle",
          "level": 2
        },
        {
          "text": "Starting an instance",
          "anchor": "runtimeLifecycle-3-starting-an-instance",
          "level": 2
        },
        {
          "text": "Task lifecycle",
          "anchor": "runtimeLifecycle-4-task-lifecycle",
          "level": 2
        },
        {
          "text": "Instance detail and audit",
          "anchor": "runtimeLifecycle-5-instance-detail-and-audit",
          "level": 2
        },
        {
          "text": "Scheduled triggers",
          "anchor": "runtimeLifecycle-6-scheduled-triggers",
          "level": 2
        },
        {
          "text": "QA checklist",
          "anchor": "runtimeLifecycle-7-qa-checklist",
          "level": 2
        },
        {
          "text": "Customization examples",
          "anchor": "runtimeLifecycle-8-customization-examples",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This page explains the lifecycle that turns a designed process into operational work. It is written for a beginner, so it starts with the simple path before explaining where developers and operators customize behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle summary",
          "anchor": "runtimeLifecycle-1-lifecycle-summary"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance"
        },
        {
          "kind": "paragraph",
          "text": "Every arrow is a backend operation. Axis buttons call these APIs, but Axis does not update the database directly and does not invent the next state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Definition lifecycle",
          "anchor": "runtimeLifecycle-2-definition-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "A process starts as a draft. Drafts can be edited because business users and developers often need multiple rounds of naming, description, category, graph layout, and validation. A draft cannot become operational until the backend graph validator accepts it."
        },
        {
          "kind": "paragraph",
          "text": "The first supported graph shape is intentionally small:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]"
        },
        {
          "kind": "paragraph",
          "text": "This proves the foundation before advanced behavior is added. The backend checks stable node codes, supported node types, one START node, at least one END node, valid transitions, duplicate node codes, and unsafe executable action references."
        },
        {
          "kind": "paragraph",
          "text": "When a draft is published, the backend creates an immutable `processDefinitionVersion`. Later draft edits must not mutate version 1. This is critical for audit: if a process instance ran yesterday, operators must know exactly which published graph version it used."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Starting an instance",
          "anchor": "runtimeLifecycle-3-starting-an-instance"
        },
        {
          "kind": "paragraph",
          "text": "Starting a process requires a published definition. The request can specify a definition code and optional version. If no version is supplied, the backend uses the current published version from the definition aggregate."
        },
        {
          "kind": "paragraph",
          "text": "Example request:"
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The backend creates:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "one `processInstance`;",
            "a `process.instance.started` audit event;",
            "the first `processTask` when the graph reaches a TASK node;",
            "a `process.task.created` audit event."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Task lifecycle",
          "anchor": "runtimeLifecycle-4-task-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "Human tasks are operational work items. They can be open, claimed, completed, cancelled, or escalated."
        },
        {
          "kind": "paragraph",
          "text": "Runtime mutation routes use dedicated Process permissions. This keeps definition governance, instance control, human-task operations, and trigger management separate even when the reference admin can exercise all of them. Customer projects can assign these permissions to narrower user groups later."
        },
        {
          "kind": "table",
          "headers": [
            "Action",
            "API",
            "Permission",
            "Allowed from",
            "Result"
          ],
          "rows": [
            [
              "Start instance",
              "`POST /instances`",
              "`process.instance.start`",
              "Published version",
              "Instance starts and first task may be created."
            ],
            [
              "Claim",
              "`POST /tasks/:taskCode/claim`",
              "`process.task.claim`",
              "`OPEN`",
              "Task becomes `CLAIMED` and assignee is recorded."
            ],
            [
              "Assign",
              "`POST /tasks/:taskCode/assign`",
              "`process.task.assign`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Assignee changes while task remains actionable."
            ],
            [
              "Complete",
              "`POST /tasks/:taskCode/complete`",
              "`process.task.complete`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Task becomes `COMPLETED`; instance moves to next node."
            ],
            [
              "Cancel task",
              "`POST /tasks/:taskCode/cancel`",
              "`process.task.cancel`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Task becomes `CANCELLED` without cancelling the whole instance."
            ],
            [
              "Cancel instance",
              "`POST /instances/:instanceCode/cancel`",
              "`process.instance.cancel`",
              "`CREATED`, `RUNNING`, `WAITING`",
              "Instance becomes `CANCELLED`; open tasks are cancelled."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Completing the current MVP task moves the instance to END and marks it `COMPLETED`. Later versions can add gateways, multiple tasks, automated domain actions, timers, retries, and compensation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Instance detail and audit",
          "anchor": "runtimeLifecycle-5-instance-detail-and-audit"
        },
        {
          "kind": "paragraph",
          "text": "Operators need evidence, not just status. The detail API returns the instance, its tasks, and its audit timeline."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "GET /nodics/process/v0/instances/contentApproval-001/detail"
        },
        {
          "kind": "paragraph",
          "text": "The response gives Axis enough information to show:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "current instance status;",
            "definition and version;",
            "current node;",
            "all related tasks;",
            "timeline events such as instance started, task created, task claimed, task completed, and instance completed."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Audit data must stay bounded and redacted. It should explain what happened without storing secrets or large raw payloads."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scheduled triggers",
          "anchor": "runtimeLifecycle-6-scheduled-triggers"
        },
        {
          "kind": "paragraph",
          "text": "Scheduled automation is represented as Process trigger metadata. A trigger may reference a Cron job code, but actual scheduling, firing, retries, and job lifecycle stay in `nodics.cron`."
        },
        {
          "kind": "paragraph",
          "text": "This split helps a business user see automation relationships from the Process console while preserving module ownership:"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Owner"
          ],
          "rows": [
            [
              "Trigger relationship to a process",
              "`nodics.process`"
            ],
            [
              "Cron expression, job enablement, scheduler runtime",
              "`nodics.cron`"
            ],
            [
              "Starting an instance when schedule fires",
              "Process API called by authorized runtime integration"
            ],
            [
              "Showing relationship in Axis",
              "`nodics.axis` frontend projection"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The trigger metadata lifecycle uses `process.trigger.manage` for create, update, activation, pause, and archive operations. Archiving is preferred over delete so operators can still explain why a scheduled automation relationship used to exist."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "QA checklist",
          "anchor": "runtimeLifecycle-7-qa-checklist"
        },
        {
          "kind": "paragraph",
          "text": "The runtime foundation is healthy when:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A draft can be created and validated.",
            "A valid draft can publish version 1.",
            "Version 1 remains immutable after preparing version 2 draft.",
            "A published definition can start a runtime instance.",
            "The first TASK node creates an OPEN task.",
            "Claiming the task records assignee and audit evidence.",
            "Completing the task advances the instance to END and COMPLETED.",
            "Instance detail returns tasks and audit timeline.",
            "Invalid task transitions fail with stable Process errors.",
            "Axis refreshes after each operation without calculating runtime state locally."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization examples",
          "anchor": "runtimeLifecycle-8-customization-examples"
        },
        {
          "kind": "paragraph",
          "text": "A customer project can customize without editing the standard Process source:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "override task assignment policy to assign by enterprise, site, queue, or role;",
            "add SLA due-date calculation using project-level properties;",
            "add graph validation rules for domain action references;",
            "add a provider that executes ACTION nodes through a domain module facade;",
            "add escalation rules that create events or Cron-backed reminders;",
            "enrich Axis cards using backend-owned API data."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The key principle stays the same: Process owns orchestration state, domain modules own business actions, Cron owns scheduling, and Axis renders authorized contracts."
        }
      ],
      "searchText": "Runtime Instance and Task Lifecycle Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships. # Runtime Instance and Task Lifecycle\n\nThis page explains the lifecycle that turns a designed process into operational\nwork. It is written for a beginner, so it starts with the simple path before\nexplaining where developers and operators customize behavior.\n\n## Lifecycle summary\n\n```mermaid\nstateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance\n```\n\nEvery arrow is a backend operation. Axis buttons call these APIs, but Axis does\nnot update the database directly and does not invent the next state.\n\n## Definition lifecycle\n\nA process starts as a draft. Drafts can be edited because business users and\ndevelopers often need multiple rounds of naming, description, category, graph\nlayout, and validation. A draft cannot become operational until the backend\ngraph validator accepts it.\n\nThe first supported graph shape is intentionally small:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]\n```\n\nThis proves the foundation before advanced behavior is added. The backend\nchecks stable node codes, supported node types, one START node, at least one END\nnode, valid transitions, duplicate node codes, and unsafe executable action\nreferences.\n\nWhen a draft is published, the backend creates an immutable\n`processDefinitionVersion`. Later draft edits must not mutate version 1. This\nis critical for audit: if a process instance ran yesterday, operators must know\nexactly which published graph version it used.\n\n## Starting an instance\n\nStarting a process requires a published definition. The request can specify a\ndefinition code and optional version. If no version is supplied, the backend\nuses the current published version from the definition aggregate.\n\nExample request:\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}\n```\n\nThe backend creates:\n\n- one `processInstance`;\n- a `process.instance.started` audit event;\n- the first `processTask` when the graph reaches a TASK node;\n- a `process.task.created` audit event.\n\n## Task lifecycle\n\nHuman tasks are operational work items. They can be open, claimed, completed,\ncancelled, or escalated.\n\nRuntime mutation routes use dedicated Process permissions. This keeps\ndefinition governance, instance control, human-task operations, and trigger\nmanagement separate even when the reference admin can exercise all of them.\nCustomer projects can assign these permissions to narrower user groups later.\n\n| Action | API | Permission | Allowed from | Result |\n| --- | --- | --- | --- | --- |\n| Start instance | `POST /instances` | `process.instance.start` | Published version | Instance starts and first task may be created. |\n| Claim | `POST /tasks/:taskCode/claim` | `process.task.claim` | `OPEN` | Task becomes `CLAIMED` and assignee is recorded. |\n| Assign | `POST /tasks/:taskCode/assign` | `process.task.assign` | `OPEN`, `CLAIMED`, `ESCALATED` | Assignee changes while task remains actionable. |\n| Complete | `POST /tasks/:taskCode/complete` | `process.task.complete` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `COMPLETED`; instance moves to next node. |\n| Cancel task | `POST /tasks/:taskCode/cancel` | `process.task.cancel` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `CANCELLED` without cancelling the whole instance. |\n| Cancel instance | `POST /instances/:instanceCode/cancel` | `process.instance.cancel` | `CREATED`, `RUNNING`, `WAITING` | Instance becomes `CANCELLED`; open tasks are cancelled. |\n\nCompleting the current MVP task moves the instance to END and marks it\n`COMPLETED`. Later versions can add gateways, multiple tasks, automated domain\nactions, timers, retries, and compensation.\n\n## Instance detail and audit\n\nOperators need evidence, not just status. The detail API returns the instance,\nits tasks, and its audit timeline.\n\n```http\nGET /nodics/process/v0/instances/contentApproval-001/detail\n```\n\nThe response gives Axis enough information to show:\n\n- current instance status;\n- definition and version;\n- current node;\n- all related tasks;\n- timeline events such as instance started, task created, task claimed, task\n  completed, and instance completed.\n\nAudit data must stay bounded and redacted. It should explain what happened\nwithout storing secrets or large raw payloads.\n\n## Scheduled triggers\n\nScheduled automation is represented as Process trigger metadata. A trigger may\nreference a Cron job code, but actual scheduling, firing, retries, and job\nlifecycle stay in `nodics.cron`.\n\nThis split helps a business user see automation relationships from the Process\nconsole while preserving module ownership:\n\n| Concern | Owner |\n| --- | --- |\n| Trigger relationship to a process | `nodics.process` |\n| Cron expression, job enablement, scheduler runtime | `nodics.cron` |\n| Starting an instance when schedule fires | Process API called by authorized runtime integration |\n| Showing relationship in Axis | `nodics.axis` frontend projection |\n\nThe trigger metadata lifecycle uses `process.trigger.manage` for create,\nupdate, activation, pause, and archive operations. Archiving is preferred over\ndelete so operators can still explain why a scheduled automation relationship\nused to exist.\n\n## QA checklist\n\nThe runtime foundation is healthy when:\n\n1. A draft can be created and validated.\n2. A valid draft can publish version 1.\n3. Version 1 remains immutable after preparing version 2 draft.\n4. A published definition can start a runtime instance.\n5. The first TASK node creates an OPEN task.\n6. Claiming the task records assignee and audit evidence.\n7. Completing the task advances the instance to END and COMPLETED.\n8. Instance detail returns tasks and audit timeline.\n9. Invalid task transitions fail with stable Process errors.\n10. Axis refreshes after each operation without calculating runtime state locally.\n\n## Customization examples\n\nA customer project can customize without editing the standard Process source:\n\n- override task assignment policy to assign by enterprise, site, queue, or role;\n- add SLA due-date calculation using project-level properties;\n- add graph validation rules for domain action references;\n- add a provider that executes ACTION nodes through a domain module facade;\n- add escalation rules that create events or Cron-backed reminders;\n- enrich Axis cards using backend-owned API data.\n\nThe key principle stays the same: Process owns orchestration state, domain\nmodules own business actions, Cron owns scheduling, and Axis renders authorized\ncontracts.\n",
      "previous": {
        "title": "Business Process and Automation Overview",
        "route": "/docs/framework/process"
      },
      "next": {
        "title": "Business Value and Adoption Model",
        "route": "/docs/framework/process/business-value"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/runtime-lifecycle.md",
        "wordCount": 919,
        "checksum": "8210e395eb5cb8fcfe8c611c8d60f9d81948e1ba70665a2705cdef98199cabc5"
      }
    },
    "active": true
  },
  "record3": {
    "code": "processDocumentationComponentbusinessValue",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "business-value",
      "title": "Business Value and Adoption Model",
      "route": "/docs/framework/process/business-value",
      "section": "process-fundamentals",
      "sectionTitle": "Process Fundamentals",
      "audience": [
        "business-user",
        "administrator",
        "architect"
      ],
      "summary": "Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance.",
      "headings": [
        {
          "text": "The business problem",
          "anchor": "businessValue-1-the-business-problem",
          "level": 2
        },
        {
          "text": "What Process gives business users",
          "anchor": "businessValue-2-what-process-gives-business-users",
          "level": 2
        },
        {
          "text": "Why this reduces cost",
          "anchor": "businessValue-3-why-this-reduces-cost",
          "level": 2
        },
        {
          "text": "Adoption path",
          "anchor": "businessValue-4-adoption-path",
          "level": 2
        },
        {
          "text": "Business-user acceptance",
          "anchor": "businessValue-5-business-user-acceptance",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "businessValue-6-continue",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics Process exists to make business operations visible, governed, reusable, and changeable without scattering workflow rules across many domain services. A beginner can think of it as the operating playbook for work that crosses people, systems, approvals, time, and exceptions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The business problem",
          "anchor": "businessValue-1-the-business-problem"
        },
        {
          "kind": "paragraph",
          "text": "Most enterprises already have processes, but those processes are often hidden:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "an approval rule lives in one service;",
            "a retry rule lives in a scheduler;",
            "an escalation rule lives in an email template;",
            "a support team tracks manual work in a spreadsheet;",
            "a developer knows which service has to be called next."
          ]
        },
        {
          "kind": "paragraph",
          "text": "That structure works until the business asks simple questions:"
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Without Process",
            "With Nodics Process"
          ],
          "rows": [
            [
              "Where is this onboarding request stuck?",
              "Ask several teams and inspect logs.",
              "Open the instance and task timeline."
            ],
            [
              "Who owns the next action?",
              "Read custom code or tribal knowledge.",
              "The current task shows assignee/queue."
            ],
            [
              "Can we change the approval path?",
              "Deploy risky domain-service changes.",
              "Update and publish a governed definition version."
            ],
            [
              "Which version ran last month?",
              "Difficult to prove.",
              "Immutable version and audit evidence are stored."
            ],
            [
              "Can operations pause automation?",
              "Maybe, if the scheduler has a switch.",
              "Trigger metadata is visible and governed."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What Process gives business users",
          "anchor": "businessValue-2-what-process-gives-business-users"
        },
        {
          "kind": "paragraph",
          "text": "Process gives business users a shared language:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**definition**: the designed workflow;",
            "**version**: the published immutable contract that actually ran;",
            "**instance**: one running or completed business case;",
            "**task**: one human action waiting for a person, queue, or team;",
            "**trigger**: a relationship saying automation can start a process;",
            "**audit event**: evidence of what changed and who did it."
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Idea[\"Business policy\"] --> Definition[\"Process definition\"]\n  Definition --> Version[\"Published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Instance --> Audit[\"Audit timeline\"]\n  Trigger[\"Scheduled trigger metadata\"] --> Instance"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this reduces cost",
          "anchor": "businessValue-3-why-this-reduces-cost"
        },
        {
          "kind": "paragraph",
          "text": "The cost benefit is not only automation. The real saving comes from reducing the number of places where people have to look, change, test, and explain a business process."
        },
        {
          "kind": "paragraph",
          "text": "Process helps reduce operating cost by:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "making work state visible;",
            "reducing custom one-off orchestration code;",
            "separating workflow orchestration from domain action ownership;",
            "preserving version history for audit and rollback discussions;",
            "allowing standard Axis screens to manage definitions, tasks, and triggers."
          ]
        },
        {
          "kind": "paragraph",
          "text": "It can also reduce capital expenditure because partner projects can reuse the same Process engine instead of building a new workflow layer for every domain."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Adoption path",
          "anchor": "businessValue-4-adoption-path"
        },
        {
          "kind": "paragraph",
          "text": "Start small. A good first process has one start, one human task, and one end."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"Start\"] --> Review[\"Business review task\"]\n  Review --> End[\"End\"]"
        },
        {
          "kind": "paragraph",
          "text": "Once that works, add richer behavior in layers:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "add assignment policy;",
            "add SLA and escalation;",
            "add scheduled trigger metadata;",
            "add domain action providers;",
            "add gateway rules;",
            "add analytics and operational dashboards."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This avoids the classic workflow failure: trying to model the whole company on day one."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business-user acceptance",
          "anchor": "businessValue-5-business-user-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "A business user should be able to:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "see active process definitions;",
            "understand which workflows are drafts and which are published;",
            "open a task list and know who must act next;",
            "see whether scheduled automation is active or paused;",
            "understand that Process coordinates work while domain modules still own actual business behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "businessValue-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Runtime Instance and Task Lifecycle](runtime-lifecycle.md)",
            "[Process and Cron Shared Runtime](process-cron-runtime.md)"
          ]
        }
      ],
      "searchText": "Business Value and Adoption Model Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance. # Business Value and Adoption Model\n\nNodics Process exists to make business operations visible, governed, reusable,\nand changeable without scattering workflow rules across many domain services.\nA beginner can think of it as the operating playbook for work that crosses\npeople, systems, approvals, time, and exceptions.\n\n## The business problem\n\nMost enterprises already have processes, but those processes are often hidden:\n\n- an approval rule lives in one service;\n- a retry rule lives in a scheduler;\n- an escalation rule lives in an email template;\n- a support team tracks manual work in a spreadsheet;\n- a developer knows which service has to be called next.\n\nThat structure works until the business asks simple questions:\n\n| Business question | Without Process | With Nodics Process |\n| --- | --- | --- |\n| Where is this onboarding request stuck? | Ask several teams and inspect logs. | Open the instance and task timeline. |\n| Who owns the next action? | Read custom code or tribal knowledge. | The current task shows assignee/queue. |\n| Can we change the approval path? | Deploy risky domain-service changes. | Update and publish a governed definition version. |\n| Which version ran last month? | Difficult to prove. | Immutable version and audit evidence are stored. |\n| Can operations pause automation? | Maybe, if the scheduler has a switch. | Trigger metadata is visible and governed. |\n\n## What Process gives business users\n\nProcess gives business users a shared language:\n\n- **definition**: the designed workflow;\n- **version**: the published immutable contract that actually ran;\n- **instance**: one running or completed business case;\n- **task**: one human action waiting for a person, queue, or team;\n- **trigger**: a relationship saying automation can start a process;\n- **audit event**: evidence of what changed and who did it.\n\n```mermaid\nflowchart LR\n  Idea[\"Business policy\"] --> Definition[\"Process definition\"]\n  Definition --> Version[\"Published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Instance --> Audit[\"Audit timeline\"]\n  Trigger[\"Scheduled trigger metadata\"] --> Instance\n```\n\n## Why this reduces cost\n\nThe cost benefit is not only automation. The real saving comes from reducing\nthe number of places where people have to look, change, test, and explain a\nbusiness process.\n\nProcess helps reduce operating cost by:\n\n1. making work state visible;\n2. reducing custom one-off orchestration code;\n3. separating workflow orchestration from domain action ownership;\n4. preserving version history for audit and rollback discussions;\n5. allowing standard Axis screens to manage definitions, tasks, and triggers.\n\nIt can also reduce capital expenditure because partner projects can reuse the\nsame Process engine instead of building a new workflow layer for every domain.\n\n## Adoption path\n\nStart small. A good first process has one start, one human task, and one end.\n\n```mermaid\nflowchart LR\n  Start[\"Start\"] --> Review[\"Business review task\"]\n  Review --> End[\"End\"]\n```\n\nOnce that works, add richer behavior in layers:\n\n1. add assignment policy;\n2. add SLA and escalation;\n3. add scheduled trigger metadata;\n4. add domain action providers;\n5. add gateway rules;\n6. add analytics and operational dashboards.\n\nThis avoids the classic workflow failure: trying to model the whole company on\nday one.\n\n## Business-user acceptance\n\nA business user should be able to:\n\n- see active process definitions;\n- understand which workflows are drafts and which are published;\n- open a task list and know who must act next;\n- see whether scheduled automation is active or paused;\n- understand that Process coordinates work while domain modules still own\n  actual business behavior.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [Process and Cron Shared Runtime](process-cron-runtime.md)\n",
      "previous": {
        "title": "Runtime Instance and Task Lifecycle",
        "route": "/docs/framework/process/runtime-lifecycle"
      },
      "next": {
        "title": "Developer Customization Guide",
        "route": "/docs/framework/process/developer-customization"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/business-value.md",
        "wordCount": 543,
        "checksum": "7af31349bf047e8580bae2dc443f5d98506bbf33d11a38762120e1d122f9db75"
      }
    },
    "active": true
  },
  "record4": {
    "code": "processDocumentationComponentdeveloperCustomization",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "developer-customization",
      "title": "Developer Customization Guide",
      "route": "/docs/framework/process/developer-customization",
      "section": "build-and-extend",
      "sectionTitle": "Build and Extend",
      "audience": [
        "developer",
        "architect",
        "ai-tool"
      ],
      "summary": "Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely.",
      "headings": [
        {
          "text": "Where code belongs",
          "anchor": "developerCustomization-1-where-code-belongs",
          "level": 2
        },
        {
          "text": "Customization-first approach",
          "anchor": "developerCustomization-2-customization-first-approach",
          "level": 2
        },
        {
          "text": "Domain action boundary",
          "anchor": "developerCustomization-3-domain-action-boundary",
          "level": 2
        },
        {
          "text": "API extension rule",
          "anchor": "developerCustomization-4-api-extension-rule",
          "level": 2
        },
        {
          "text": "Generated artifacts",
          "anchor": "developerCustomization-5-generated-artifacts",
          "level": 2
        },
        {
          "text": "Developer acceptance checklist",
          "anchor": "developerCustomization-6-developer-acceptance-checklist",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "developerCustomization-7-continue",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide explains where developers should extend Process behavior. The most important rule is simple: Process owns orchestration state, but domain modules own business action behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Where code belongs",
          "anchor": "developerCustomization-1-where-code-belongs"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Owning place"
          ],
          "rows": [
            [
              "Process schemas and status definitions",
              "`nodics.process/modules/workflow/modules/flowSchema`"
            ],
            [
              "Runtime lifecycle, validation, assignment, audit",
              "`nodics.process/modules/workflow/modules/flowCore`"
            ],
            [
              "HTTP routes, controllers, facades",
              "`nodics.process/modules/workflow/modules/flowApi`"
            ],
            [
              "Cron job definitions and scheduler execution",
              "`nodics.cron`"
            ],
            [
              "Order, commerce, content, profile, media side effects",
              "Owning domain module"
            ],
            [
              "Customer-specific policy override",
              "Customer module loaded after framework module"
            ],
            [
              "Browser rendering and editor interactions",
              "`nodics.axis`"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not put runtime source directly under `nodics.process/src`. The module group root is for composition, contracts, package metadata, documentation, and shared defaults."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization-first approach",
          "anchor": "developerCustomization-2-customization-first-approach"
        },
        {
          "kind": "paragraph",
          "text": "Before writing new code, ask:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Can this be changed by a property?",
            "Can this be changed by a provider?",
            "Can this be changed by an interceptor or pipeline?",
            "Can a customer module override only one service method?",
            "Is a new framework feature actually needed?"
          ]
        },
        {
          "kind": "paragraph",
          "text": "Example: a customer wants task assignment to go to a site-specific queue."
        },
        {
          "kind": "paragraph",
          "text": "Do not edit the standard Process task lifecycle directly. Instead, create a customer module that overrides assignment policy and loads after Process."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "/*\n    Customer Project - Process Customization\n */\n\n'use strict';\n\n/**\n * @module customer.process/src/service/defaultCustomerTaskAssignmentService\n * @description Resolves task assignee from enterprise, site, and process category.\n * @override Loaded after nodics.process to customize assignment without forking framework source.\n */\nmodule.exports = {\n    resolveAssignee: function (request, taskModel) {\n        const site = request.runtimeOperation && request.runtimeOperation.site;\n        if (site === 'uae-store') return 'uaeOperationsQueue';\n        return taskModel.assignee || 'defaultProcessQueue';\n    }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Domain action boundary",
          "anchor": "developerCustomization-3-domain-action-boundary"
        },
        {
          "kind": "paragraph",
          "text": "Process can decide that an ACTION node should be executed. It must not directly own a commerce refund, media upload, content publication, logistics shipment, or telco provisioning command."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Process[\"Process engine\"] --> Contract[\"Domain action contract\"]\n  Contract --> Commerce[\"Commerce module\"]\n  Contract --> Media[\"Media module\"]\n  Contract --> Wcms[\"WCMS module\"]\n  Contract --> Profile[\"Profile module\"]"
        },
        {
          "kind": "paragraph",
          "text": "The Process engine should store orchestration evidence. The domain module should validate permissions, data, side effects, rollback, and audit for its own action."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API extension rule",
          "anchor": "developerCustomization-4-api-extension-rule"
        },
        {
          "kind": "paragraph",
          "text": "Add a Process API only when:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "the behavior is process-owned;",
            "route permission is added to the identity catalog;",
            "status codes live in `statusDefinitions.js`;",
            "controller/facade/service layers remain separated;",
            "tests cover positive, negative, boundary, and permission behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Generated artifacts",
          "anchor": "developerCustomization-5-generated-artifacts"
        },
        {
          "kind": "paragraph",
          "text": "Generated service/facade files are loader-visible runtime artifacts. If the generator is available for the affected schema, regenerate from schema source. If a generated-style file must be repaired manually during migration, mirror the nearest generated artifact exactly and add tests that prove the runtime service is available."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer acceptance checklist",
          "anchor": "developerCustomization-6-developer-acceptance-checklist"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Source is in the nearest owning module.",
            "No customer-specific rule is hardcoded in standard Process.",
            "Axis is not storing workflow truth.",
            "New permissions exist in the identity catalog.",
            "Status/error codes live in status definitions.",
            "Fresh bootstrap and live smoke prove the change."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "developerCustomization-7-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Visual Workflow Designer Contract](visual-designer.md)",
            "[DevOps and Runtime Topology](devops-topology.md)"
          ]
        }
      ],
      "searchText": "Developer Customization Guide Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely. # Developer Customization Guide\n\nThis guide explains where developers should extend Process behavior. The most\nimportant rule is simple: Process owns orchestration state, but domain modules\nown business action behavior.\n\n## Where code belongs\n\n| Need | Owning place |\n| --- | --- |\n| Process schemas and status definitions | `nodics.process/modules/workflow/modules/flowSchema` |\n| Runtime lifecycle, validation, assignment, audit | `nodics.process/modules/workflow/modules/flowCore` |\n| HTTP routes, controllers, facades | `nodics.process/modules/workflow/modules/flowApi` |\n| Cron job definitions and scheduler execution | `nodics.cron` |\n| Order, commerce, content, profile, media side effects | Owning domain module |\n| Customer-specific policy override | Customer module loaded after framework module |\n| Browser rendering and editor interactions | `nodics.axis` |\n\nDo not put runtime source directly under `nodics.process/src`. The module group\nroot is for composition, contracts, package metadata, documentation, and shared\ndefaults.\n\n## Customization-first approach\n\nBefore writing new code, ask:\n\n1. Can this be changed by a property?\n2. Can this be changed by a provider?\n3. Can this be changed by an interceptor or pipeline?\n4. Can a customer module override only one service method?\n5. Is a new framework feature actually needed?\n\nExample: a customer wants task assignment to go to a site-specific queue.\n\nDo not edit the standard Process task lifecycle directly. Instead, create a\ncustomer module that overrides assignment policy and loads after Process.\n\n```js\n/*\n    Customer Project - Process Customization\n */\n\n'use strict';\n\n/**\n * @module customer.process/src/service/defaultCustomerTaskAssignmentService\n * @description Resolves task assignee from enterprise, site, and process category.\n * @override Loaded after nodics.process to customize assignment without forking framework source.\n */\nmodule.exports = {\n    resolveAssignee: function (request, taskModel) {\n        const site = request.runtimeOperation && request.runtimeOperation.site;\n        if (site === 'uae-store') return 'uaeOperationsQueue';\n        return taskModel.assignee || 'defaultProcessQueue';\n    }\n};\n```\n\n## Domain action boundary\n\nProcess can decide that an ACTION node should be executed. It must not directly\nown a commerce refund, media upload, content publication, logistics shipment,\nor telco provisioning command.\n\n```mermaid\nflowchart LR\n  Process[\"Process engine\"] --> Contract[\"Domain action contract\"]\n  Contract --> Commerce[\"Commerce module\"]\n  Contract --> Media[\"Media module\"]\n  Contract --> Wcms[\"WCMS module\"]\n  Contract --> Profile[\"Profile module\"]\n```\n\nThe Process engine should store orchestration evidence. The domain module\nshould validate permissions, data, side effects, rollback, and audit for its\nown action.\n\n## API extension rule\n\nAdd a Process API only when:\n\n- the behavior is process-owned;\n- route permission is added to the identity catalog;\n- status codes live in `statusDefinitions.js`;\n- controller/facade/service layers remain separated;\n- tests cover positive, negative, boundary, and permission behavior.\n\n## Generated artifacts\n\nGenerated service/facade files are loader-visible runtime artifacts. If the\ngenerator is available for the affected schema, regenerate from schema source.\nIf a generated-style file must be repaired manually during migration, mirror\nthe nearest generated artifact exactly and add tests that prove the runtime\nservice is available.\n\n## Developer acceptance checklist\n\n- Source is in the nearest owning module.\n- No customer-specific rule is hardcoded in standard Process.\n- Axis is not storing workflow truth.\n- New permissions exist in the identity catalog.\n- Status/error codes live in status definitions.\n- Fresh bootstrap and live smoke prove the change.\n\n## Continue\n\n- [Visual Workflow Designer Contract](visual-designer.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n",
      "previous": {
        "title": "Business Value and Adoption Model",
        "route": "/docs/framework/process/business-value"
      },
      "next": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/developer-customization.md",
        "wordCount": 496,
        "checksum": "ca7731f86eb5976d83859c1bbe7d4330446d7ece7a2a4bb42a9270eb884db64b"
      }
    },
    "active": true
  },
  "record5": {
    "code": "processDocumentationComponentdevopsTopology",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "devops-topology",
      "title": "DevOps and Runtime Topology",
      "route": "/docs/framework/process/devops-topology",
      "section": "operate",
      "sectionTitle": "Operate",
      "audience": [
        "operator",
        "developer",
        "architect"
      ],
      "summary": "Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes.",
      "headings": [
        {
          "text": "Runtime shape",
          "anchor": "devopsTopology-1-runtime-shape",
          "level": 2
        },
        {
          "text": "Fresh bootstrap evidence",
          "anchor": "devopsTopology-2-fresh-bootstrap-evidence",
          "level": 2
        },
        {
          "text": "What to monitor",
          "anchor": "devopsTopology-3-what-to-monitor",
          "level": 2
        },
        {
          "text": "Failure and recovery",
          "anchor": "devopsTopology-4-failure-and-recovery",
          "level": 2
        },
        {
          "text": "Release discipline",
          "anchor": "devopsTopology-5-release-discipline",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "devopsTopology-6-continue",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Operations teams need Process to be understandable after deployment, not only during development. This page explains how Process should be deployed, observed, tested, and sustained."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime shape",
          "anchor": "devopsTopology-1-runtime-shape"
        },
        {
          "kind": "paragraph",
          "text": "In local Kickoff, Process runs in the Business Process & Automation runtime. That server can include `nodics.process`, `nodics.cron`, and `nodics.core`."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TB\n  Axis[\"nodics.axis browser\"] --> Platform[\"Platform server\"]\n  Axis --> Wcms[\"WCMS server\"]\n  Axis --> ProcessServer[\"Process server\"]\n  ProcessServer --> Process[\"nodics.process\"]\n  ProcessServer --> Cron[\"nodics.cron\"]\n  ProcessServer --> Core[\"nodics.core\"]\n  Process --> Mongo[\"Process database\"]\n  Cron --> Mongo"
        },
        {
          "kind": "paragraph",
          "text": "Sharing a runtime is a deployment decision, not an ownership merge. Process still owns process instances, tasks, triggers, and audit. Cron still owns job definitions, scheduler state, firing, retry, and job execution lifecycle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fresh bootstrap evidence",
          "anchor": "devopsTopology-2-fresh-bootstrap-evidence"
        },
        {
          "kind": "paragraph",
          "text": "The local fresh acceptance test drops only local Kickoff databases, starts the runtime servers, imports documentation packs, verifies Axis routes, logs in as admin, exercises Process APIs, and runs Cron lifecycle operations."
        },
        {
          "kind": "paragraph",
          "text": "This is the minimum confidence gate before saying the local stack is healthy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What to monitor",
          "anchor": "devopsTopology-3-what-to-monitor"
        },
        {
          "kind": "table",
          "headers": [
            "Signal",
            "Why it matters"
          ],
          "rows": [
            [
              "Process server readiness",
              "Axis process screens depend on this API."
            ],
            [
              "Definition publish failures",
              "Bad graph contracts block operations."
            ],
            [
              "Waiting task count",
              "Shows work stuck with humans or queues."
            ],
            [
              "Failed/cancelled instance count",
              "Reveals broken policy or domain integration."
            ],
            [
              "Trigger status distribution",
              "Shows scheduled automation posture."
            ],
            [
              "Audit event volume",
              "Confirms runtime evidence is being written."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Failure and recovery",
          "anchor": "devopsTopology-4-failure-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "If Axis can load but Process APIs fail, Axis should show recovery or unavailable states. Do not fake process data in the browser."
        },
        {
          "kind": "paragraph",
          "text": "If Process starts but trigger creation fails, check:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "`flowSchema` includes the `processTrigger` schema;",
            "generated trigger service/facade artifacts are loader-visible;",
            "route permissions exist in the identity catalog;",
            "the referenced definition exists and is safe to use;",
            "fresh acceptance passes from zero database state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Release discipline",
          "anchor": "devopsTopology-5-release-discipline"
        },
        {
          "kind": "paragraph",
          "text": "Process changes are release-sensitive because they can affect long-running instances. Always ask:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Is the schema backward compatible?",
            "Are published versions immutable?",
            "Can older instances still be inspected?",
            "Does a new route have a dedicated permission?",
            "Does the change preserve tenant and audit boundaries?",
            "Can a customer override the behavior without editing framework source?"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "devopsTopology-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Process and Cron Shared Runtime](process-cron-runtime.md)",
            "[Developer Customization Guide](developer-customization.md)"
          ]
        }
      ],
      "searchText": "DevOps and Runtime Topology Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes. # DevOps and Runtime Topology\n\nOperations teams need Process to be understandable after deployment, not only\nduring development. This page explains how Process should be deployed, observed,\ntested, and sustained.\n\n## Runtime shape\n\nIn local Kickoff, Process runs in the Business Process & Automation runtime.\nThat server can include `nodics.process`, `nodics.cron`, and `nodics.core`.\n\n```mermaid\nflowchart TB\n  Axis[\"nodics.axis browser\"] --> Platform[\"Platform server\"]\n  Axis --> Wcms[\"WCMS server\"]\n  Axis --> ProcessServer[\"Process server\"]\n  ProcessServer --> Process[\"nodics.process\"]\n  ProcessServer --> Cron[\"nodics.cron\"]\n  ProcessServer --> Core[\"nodics.core\"]\n  Process --> Mongo[\"Process database\"]\n  Cron --> Mongo\n```\n\nSharing a runtime is a deployment decision, not an ownership merge. Process\nstill owns process instances, tasks, triggers, and audit. Cron still owns job\ndefinitions, scheduler state, firing, retry, and job execution lifecycle.\n\n## Fresh bootstrap evidence\n\nThe local fresh acceptance test drops only local Kickoff databases, starts the\nruntime servers, imports documentation packs, verifies Axis routes, logs in as\nadmin, exercises Process APIs, and runs Cron lifecycle operations.\n\nThis is the minimum confidence gate before saying the local stack is healthy.\n\n## What to monitor\n\n| Signal | Why it matters |\n| --- | --- |\n| Process server readiness | Axis process screens depend on this API. |\n| Definition publish failures | Bad graph contracts block operations. |\n| Waiting task count | Shows work stuck with humans or queues. |\n| Failed/cancelled instance count | Reveals broken policy or domain integration. |\n| Trigger status distribution | Shows scheduled automation posture. |\n| Audit event volume | Confirms runtime evidence is being written. |\n\n## Failure and recovery\n\nIf Axis can load but Process APIs fail, Axis should show recovery or unavailable\nstates. Do not fake process data in the browser.\n\nIf Process starts but trigger creation fails, check:\n\n1. `flowSchema` includes the `processTrigger` schema;\n2. generated trigger service/facade artifacts are loader-visible;\n3. route permissions exist in the identity catalog;\n4. the referenced definition exists and is safe to use;\n5. fresh acceptance passes from zero database state.\n\n## Release discipline\n\nProcess changes are release-sensitive because they can affect long-running\ninstances. Always ask:\n\n- Is the schema backward compatible?\n- Are published versions immutable?\n- Can older instances still be inspected?\n- Does a new route have a dedicated permission?\n- Does the change preserve tenant and audit boundaries?\n- Can a customer override the behavior without editing framework source?\n\n## Continue\n\n- [Process and Cron Shared Runtime](process-cron-runtime.md)\n- [Developer Customization Guide](developer-customization.md)\n",
      "previous": {
        "title": "Developer Customization Guide",
        "route": "/docs/framework/process/developer-customization"
      },
      "next": {
        "title": "Process and Cron Shared Runtime",
        "route": "/docs/framework/process/process-cron-runtime"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/devops-topology.md",
        "wordCount": 373,
        "checksum": "eb37017dfa042e2e1f56f8a6f74dec995317fb8fcaeaab0ae9bb6b78b041f42e"
      }
    },
    "active": true
  },
  "record6": {
    "code": "processDocumentationComponentprocessCronRuntime",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "process-cron-runtime",
      "title": "Process and Cron Shared Runtime",
      "route": "/docs/framework/process/process-cron-runtime",
      "section": "operate",
      "sectionTitle": "Operate",
      "audience": [
        "administrator",
        "operator",
        "developer",
        "architect"
      ],
      "summary": "Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries.",
      "headings": [
        {
          "text": "The key rule",
          "anchor": "processCronRuntime-1-the-key-rule",
          "level": 2
        },
        {
          "text": "Example topology",
          "anchor": "processCronRuntime-2-example-topology",
          "level": 2
        },
        {
          "text": "Why this is attractive for partners",
          "anchor": "processCronRuntime-3-why-this-is-attractive-for-partners",
          "level": 2
        },
        {
          "text": "Safe lifecycle behavior",
          "anchor": "processCronRuntime-4-safe-lifecycle-behavior",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processCronRuntime-5-continue",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Process and Cron can run together in one runtime server when a partner wants a smaller topology. This is useful for local development, small installations, or customers who want business process automation and scheduled jobs without running many microservice processes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The key rule",
          "anchor": "processCronRuntime-1-the-key-rule"
        },
        {
          "kind": "paragraph",
          "text": "Shared runtime does not mean shared ownership."
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Owner"
          ],
          "rows": [
            [
              "Process definitions",
              "`nodics.process`"
            ],
            [
              "Published workflow versions",
              "`nodics.process`"
            ],
            [
              "Runtime instances and tasks",
              "`nodics.process`"
            ],
            [
              "Trigger relationship metadata",
              "`nodics.process`"
            ],
            [
              "Cron job definition",
              "`nodics.cron`"
            ],
            [
              "Scheduler firing and retries",
              "`nodics.cron`"
            ],
            [
              "Domain business action",
              "Domain module"
            ],
            [
              "UI rendering",
              "`nodics.axis`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example topology",
          "anchor": "processCronRuntime-2-example-topology"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.core\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  ProcessServer --> Cron[\"includes nodics.cron\"]\n  Process --> Trigger[\"processTrigger metadata\"]\n  Cron --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job"
        },
        {
          "kind": "paragraph",
          "text": "The trigger can reference a Cron job code. It does not become the Cron job. Cron still decides when the job fires. When a Cron-owned job wants to start a process, it calls the Process API with a secured runtime identity."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this is attractive for partners",
          "anchor": "processCronRuntime-3-why-this-is-attractive-for-partners"
        },
        {
          "kind": "paragraph",
          "text": "Partners often start with one server for operational simplicity. Later they may split runtimes when scale, isolation, or team ownership requires it. Nodics should support both without changing functional module identity."
        },
        {
          "kind": "paragraph",
          "text": "This keeps the mental model stable:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Process console shows workflows and automation relationships.",
            "Cron console shows jobs and scheduler behavior.",
            "Axis can place both under \"Business Process & Automation\".",
            "Backend ownership still protects maintainability."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe lifecycle behavior",
          "anchor": "processCronRuntime-4-safe-lifecycle-behavior"
        },
        {
          "kind": "paragraph",
          "text": "Cron can be registered, activated, deactivated, and deregistered through the module registry. Process APIs should remain reachable even when Cron is deregistered, because Process definitions and tasks are not owned by Cron."
        },
        {
          "kind": "paragraph",
          "text": "The local acceptance smoke proves this by exercising Process runtime first and then verifying the Cron registry lifecycle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processCronRuntime-5-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Runtime Instance and Task Lifecycle](runtime-lifecycle.md)",
            "[DevOps and Runtime Topology](devops-topology.md)"
          ]
        }
      ],
      "searchText": "Process and Cron Shared Runtime Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries. # Process and Cron Shared Runtime\n\nProcess and Cron can run together in one runtime server when a partner wants a\nsmaller topology. This is useful for local development, small installations, or\ncustomers who want business process automation and scheduled jobs without\nrunning many microservice processes.\n\n## The key rule\n\nShared runtime does not mean shared ownership.\n\n| Concern | Owner |\n| --- | --- |\n| Process definitions | `nodics.process` |\n| Published workflow versions | `nodics.process` |\n| Runtime instances and tasks | `nodics.process` |\n| Trigger relationship metadata | `nodics.process` |\n| Cron job definition | `nodics.cron` |\n| Scheduler firing and retries | `nodics.cron` |\n| Domain business action | Domain module |\n| UI rendering | `nodics.axis` |\n\n## Example topology\n\n```mermaid\nflowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.core\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  ProcessServer --> Cron[\"includes nodics.cron\"]\n  Process --> Trigger[\"processTrigger metadata\"]\n  Cron --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job\n```\n\nThe trigger can reference a Cron job code. It does not become the Cron job.\nCron still decides when the job fires. When a Cron-owned job wants to start a\nprocess, it calls the Process API with a secured runtime identity.\n\n## Why this is attractive for partners\n\nPartners often start with one server for operational simplicity. Later they may\nsplit runtimes when scale, isolation, or team ownership requires it. Nodics\nshould support both without changing functional module identity.\n\nThis keeps the mental model stable:\n\n- Process console shows workflows and automation relationships.\n- Cron console shows jobs and scheduler behavior.\n- Axis can place both under \"Business Process & Automation\".\n- Backend ownership still protects maintainability.\n\n## Safe lifecycle behavior\n\nCron can be registered, activated, deactivated, and deregistered through the\nmodule registry. Process APIs should remain reachable even when Cron is\nderegistered, because Process definitions and tasks are not owned by Cron.\n\nThe local acceptance smoke proves this by exercising Process runtime first and\nthen verifying the Cron registry lifecycle.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n",
      "previous": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "next": {
        "title": "Visual Workflow Designer Contract",
        "route": "/docs/framework/process/visual-designer"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/process-cron-runtime.md",
        "wordCount": 307,
        "checksum": "c68000a6c66dd04db58288ffc0319264f4ada9b38e1c0bb04f4004fe08cc4fd1"
      }
    },
    "active": true
  },
  "record7": {
    "code": "processDocumentationComponentvisualDesigner",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "visual-designer",
      "title": "Visual Workflow Designer Contract",
      "route": "/docs/framework/process/visual-designer",
      "section": "build-and-extend",
      "sectionTitle": "Build and Extend",
      "audience": [
        "business-user",
        "developer",
        "tester",
        "ai-tool"
      ],
      "summary": "Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer.",
      "headings": [
        {
          "text": "Ownership model",
          "anchor": "visualDesigner-1-ownership-model",
          "level": 2
        },
        {
          "text": "MVP graph contract",
          "anchor": "visualDesigner-2-mvp-graph-contract",
          "level": 2
        },
        {
          "text": "What the browser may do",
          "anchor": "visualDesigner-3-what-the-browser-may-do",
          "level": 2
        },
        {
          "text": "Designer acceptance",
          "anchor": "visualDesigner-4-designer-acceptance",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "visualDesigner-5-continue",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The visual workflow designer lets a business user or developer edit a process graph through Axis. The important contract is that Axis is an editor, not the runtime authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership model",
          "anchor": "visualDesigner-1-ownership-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version"
        },
        {
          "kind": "paragraph",
          "text": "Axis can display nodes, edges, positions, labels, and selection state. The backend validates whether the graph is executable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "MVP graph contract",
          "anchor": "visualDesigner-2-mvp-graph-contract"
        },
        {
          "kind": "paragraph",
          "text": "The first designer contract supports:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "one `START` node;",
            "one or more `TASK` nodes;",
            "one or more `END` nodes;",
            "transitions with stable codes, source, and target;",
            "optional designer metadata for browser positions."
          ]
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What the browser may do",
          "anchor": "visualDesigner-3-what-the-browser-may-do"
        },
        {
          "kind": "paragraph",
          "text": "Axis may:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "render a node palette;",
            "show a canvas preview;",
            "let the user select nodes;",
            "collect labels and basic properties;",
            "send draft graph data to Process APIs;",
            "show backend validation diagnostics."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis must not:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "execute process logic;",
            "calculate runtime state;",
            "bypass backend validation;",
            "store workflow definitions in browser storage as authority;",
            "create a parallel workflow registry."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Designer acceptance",
          "anchor": "visualDesigner-4-designer-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "The designer foundation is healthy when:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A user can see START, TASK, and END nodes.",
            "A user can inspect selected node details.",
            "Saving calls the Process draft API.",
            "Validation calls the Process graph validator.",
            "Publishing remains a separate backend-owned action.",
            "The same graph can be verified through API tests and fresh acceptance."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "visualDesigner-5-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Developer Customization Guide](developer-customization.md)",
            "[Runtime Instance and Task Lifecycle](runtime-lifecycle.md)"
          ]
        }
      ],
      "searchText": "Visual Workflow Designer Contract Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer. # Visual Workflow Designer Contract\n\nThe visual workflow designer lets a business user or developer edit a process\ngraph through Axis. The important contract is that Axis is an editor, not the\nruntime authority.\n\n## Ownership model\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version\n```\n\nAxis can display nodes, edges, positions, labels, and selection state. The\nbackend validates whether the graph is executable.\n\n## MVP graph contract\n\nThe first designer contract supports:\n\n- one `START` node;\n- one or more `TASK` nodes;\n- one or more `END` nodes;\n- transitions with stable codes, source, and target;\n- optional designer metadata for browser positions.\n\n```json\n{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}\n```\n\n## What the browser may do\n\nAxis may:\n\n- render a node palette;\n- show a canvas preview;\n- let the user select nodes;\n- collect labels and basic properties;\n- send draft graph data to Process APIs;\n- show backend validation diagnostics.\n\nAxis must not:\n\n- execute process logic;\n- calculate runtime state;\n- bypass backend validation;\n- store workflow definitions in browser storage as authority;\n- create a parallel workflow registry.\n\n## Designer acceptance\n\nThe designer foundation is healthy when:\n\n1. A user can see START, TASK, and END nodes.\n2. A user can inspect selected node details.\n3. Saving calls the Process draft API.\n4. Validation calls the Process graph validator.\n5. Publishing remains a separate backend-owned action.\n6. The same graph can be verified through API tests and fresh acceptance.\n\n## Continue\n\n- [Developer Customization Guide](developer-customization.md)\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n",
      "previous": {
        "title": "Process and Cron Shared Runtime",
        "route": "/docs/framework/process/process-cron-runtime"
      },
      "next": null,
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/visual-designer.md",
        "wordCount": 330,
        "checksum": "c88c1e49266e24c1e658631019df31dbfd6277acfdffad79eeeca9ef6622997a"
      }
    },
    "active": true
  }
};
