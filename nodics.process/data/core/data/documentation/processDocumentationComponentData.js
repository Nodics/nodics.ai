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
          "code": "beginner-guides",
          "title": "Beginner Guides",
          "order": 15
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
          "searchText": "Runtime Instance and Task Lifecycle Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships. # Runtime Instance and Task Lifecycle\n\nThis page explains the lifecycle that turns a designed process into operational\nwork. It is written for a beginner, so it starts with the simple path before\nexplaining where developers and operators customize behavior.\n\n## Lifecycle summary\n\n```mermaid\nstateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance\n```\n\nEvery arrow is a backend operation. Axis buttons call these APIs, but Axis does\nnot update the database directly and does not invent the next state.\n\n## Definition lifecycle\n\nA process starts as a draft. Drafts can be edited because business users and\ndevelopers often need multiple rounds of naming, description, category, graph\nlayout, and validation. A draft cannot become operational until the backend\ngraph validator accepts it.\n\nThe first supported graph shape is intentionally small:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]\n```\n\nThis proves the foundation before advanced behavior is added. The backend\nchecks stable node codes, supported node types, one START node, at least one END\nnode, valid transitions, duplicate node codes, and unsafe executable action\nreferences.\n\nWhen a draft is published, the backend creates an immutable\n`processDefinitionVersion`. Later draft edits must not mutate version 1. This\nis critical for audit: if a process instance ran yesterday, operators must know\nexactly which published graph version it used.\n\n## Starting an instance\n\nStarting a process requires a published definition. The request can specify a\ndefinition code and optional version. If no version is supplied, the backend\nuses the current published version from the definition aggregate.\n\nExample request:\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}\n```\n\nThe backend creates:\n\n- one `processInstance`;\n- a `process.instance.started` audit event;\n- the first `processTask` when the graph reaches a TASK node;\n- a `process.task.created` audit event.\n\n## Task lifecycle\n\nHuman tasks are operational work items. They can be open, claimed, completed,\ncancelled, or escalated.\n\nRuntime mutation routes use dedicated Process permissions. This keeps\ndefinition governance, instance control, human-task operations, and trigger\nmanagement separate even when the reference admin can exercise all of them.\nCustomer projects can assign these permissions to narrower user groups later.\n\n| Action | API | Permission | Allowed from | Result |\n| --- | --- | --- | --- | --- |\n| Start instance | `POST /instances` | `process.instance.start` | Published version | Instance starts and first task may be created. |\n| Claim | `POST /tasks/:taskCode/claim` | `process.task.claim` | `OPEN` | Task becomes `CLAIMED` and assignee is recorded. |\n| Assign | `POST /tasks/:taskCode/assign` | `process.task.assign` | `OPEN`, `CLAIMED`, `ESCALATED` | Assignee changes while task remains actionable. |\n| Complete | `POST /tasks/:taskCode/complete` | `process.task.complete` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `COMPLETED`; instance moves to next node. |\n| Cancel task | `POST /tasks/:taskCode/cancel` | `process.task.cancel` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `CANCELLED` without cancelling the whole instance. |\n| Cancel instance | `POST /instances/:instanceCode/cancel` | `process.instance.cancel` | `CREATED`, `RUNNING`, `WAITING` | Instance becomes `CANCELLED`; open tasks are cancelled. |\n\nCompleting a task advances through the published graph. ACTION, DECISION,\nTIMER, and SUB_PROCESS nodes are backend-executed. If an ACTION fails, Process\nmarks the instance `FAILED` and opens a recovery incident; operators then use\nthe governed retry or compensation APIs described in the incident recovery\nguide.\n\n## Instance detail and audit\n\nOperators need evidence, not just status. The detail API returns the instance,\nits tasks, and its audit timeline.\n\n```http\nGET /nodics/process/v0/instances/contentApproval-001/detail\n```\n\nThe response gives Axis enough information to show:\n\n- current instance status;\n- definition and version;\n- current node;\n- all related tasks;\n- timeline events such as instance started, task created, task claimed, task\n  completed, and instance completed.\n\nAudit data must stay bounded and redacted. It should explain what happened\nwithout storing secrets or large raw payloads.\n\n## Scheduled triggers\n\nScheduled automation is represented as Process trigger metadata. A trigger may\nreference a Cron job code, but actual scheduling, firing, retries, and job\nlifecycle stay in `nodics.cron`.\n\nThis split helps a business user see automation relationships from the Process\nconsole while preserving module ownership:\n\n| Concern | Owner |\n| --- | --- |\n| Trigger relationship to a process | `nodics.process` |\n| Cron expression, job enablement, scheduler runtime | `nodics.cron` |\n| Starting an instance when schedule fires | Process API called by authorized runtime integration |\n| Showing relationship in Axis | `nodics.axis` frontend projection |\n\nThe trigger metadata lifecycle uses `process.trigger.manage` for create,\nupdate, activation, pause, and archive operations. Archiving is preferred over\ndelete so operators can still explain why a scheduled automation relationship\nused to exist.\n\n## QA checklist\n\nThe runtime foundation is healthy when:\n\n1. A draft can be created and validated.\n2. A valid draft can publish version 1.\n3. Version 1 remains immutable after preparing version 2 draft.\n4. A published definition can start a runtime instance.\n5. The first TASK node creates an OPEN task.\n6. Claiming the task records assignee and audit evidence.\n7. Completing the task advances the instance to END and COMPLETED.\n8. Instance detail returns tasks and audit timeline.\n9. Invalid task transitions fail with stable Process errors.\n10. Axis refreshes after each operation without calculating runtime state locally.\n\n## Customization examples\n\nA customer project can customize without editing the standard Process source:\n\n- override task assignment policy to assign by enterprise, site, queue, or role;\n- add SLA due-date calculation using project-level properties;\n- add graph validation rules for domain action references;\n- add a provider that executes ACTION nodes through a domain module facade;\n- add escalation rules that create events or Cron-backed reminders;\n- enrich Axis cards using backend-owned API data.\n\nThe key principle stays the same: Process owns orchestration state, domain\nmodules own business actions, Cron owns scheduling, and Axis renders authorized\ncontracts.\n"
        },
        {
          "code": "incident-recovery",
          "title": "Incident, Retry, and Compensation Operations",
          "route": "/docs/framework/process/incident-recovery",
          "section": "process-operations",
          "sectionTitle": "Process Operations",
          "sectionOrder": 20,
          "order": 22,
          "audience": [
            "business-user",
            "administrator",
            "developer",
            "operator",
            "tester",
            "ai-tool"
          ],
          "summary": "Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation.",
          "searchText": "Incident, Retry, and Compensation Operations Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation. # Incident, Retry, and Compensation Operations\n\nThis guide explains what happens when an automated workflow step fails and how\nan operator safely recovers it. Process owns the orchestration incident. The\nbusiness module still owns the action and any reversal of business state.\n\n## The recovery lifecycle\n\n```mermaid\nstateDiagram-v2\n  [*] --> Open: ACTION fails\n  Open --> Retrying: authorized retry\n  Retrying --> Resolved: action succeeds\n  Retrying --> Open: attempt fails and budget remains\n  Retrying --> DeadLetter: attempt budget exhausted\n  Open --> Compensating: authorized compensation\n  DeadLetter --> Compensating: authorized compensation\n  Compensating --> Compensated: domain adapter succeeds\n  Compensating --> DeadLetter: domain adapter fails\n```\n\nAn ACTION failure creates one `processIncident` containing the instance,\npublished definition version, failed node, stable error code, current attempt,\nmaximum attempts, optional next retry time, and declarative adapter references.\nRaw exception payloads and secrets must not be copied into incident evidence.\n\n## What an operator sees\n\nThe incident list is the recovery work queue:\n\n```http\nGET /nodics/process/v0/incidents?status=OPEN\nAuthorization: Bearer <access-token>\n```\n\nOpen the incident before acting. Confirm the definition version, node, error\ncode, attempt budget, next retry time, and related instance. Refresh if another\noperator may be working on the same incident.\n\n| Operation | Permission | Result |\n| --- | --- | --- |\n| List or read incidents | `process.incident.read` | Returns bounded recovery evidence. |\n| Retry failed ACTION | `process.instance.retry` | Re-executes the same published ACTION and continues only after success. |\n| Run compensation | `process.instance.compensate` | Dispatches the node's registered domain compensation adapter. |\n\n## Retry safely\n\nSend the attempt number you inspected. This optimistic check prevents an old\nbrowser tab from spending a newer retry attempt.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/retry\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"expectedAttempt\": 1,\n  \"correlationId\": \"support-case-4831\"\n}\n```\n\nOn success, the incident becomes `RESOLVED` and the instance continues from the\ntransition after the failed ACTION. On failure, the attempt increments. The\nincident returns to `OPEN` while budget remains or becomes `DEAD_LETTER` after\nthe final attempt. Retry policy is bounded to ten attempts and a maximum delay\nof 24 hours even when project configuration is incorrect.\n\n## Compensate safely\n\nCompensation is not a generic database rollback. A workflow node may declare a\nregistered compensation adapter, for example an Order-owned reversal command.\nProcess invokes that adapter and records orchestration evidence; the domain\nmodule validates its own state, idempotency, authorization, and reversal rules.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/compensate\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"payload\": {\n    \"reasonCode\": \"PAYMENT_CAPTURE_FAILED\"\n  }\n}\n```\n\nIf no compensation adapter is declared, the API fails closed. Operators must\nnot substitute a direct database edit. If compensation fails, the incident is\ndead-lettered and the instance keeps `compensationStatus: FAILED` for manual\ninvestigation.\n\n## Developer contract\n\nAn ACTION node can declare retry and compensation without embedding executable\ncode in the graph:\n\n```json\n{\n  \"code\": \"reserveInventory\",\n  \"type\": \"ACTION\",\n  \"action\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"reserve\"\n  },\n  \"retry\": {\n    \"maximumAttempts\": 3,\n    \"delayMs\": 5000\n  },\n  \"compensation\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"release\"\n  }\n}\n```\n\nBoth declarations must exist in the configured action-adapter allowlist. The\nadapter implementation lives behind a domain service or facade. Unknown or\nunavailable adapters fail closed.\n\n## Operational checklist\n\n1. Confirm the incident belongs to the intended tenant and instance.\n2. Read the stable error code and current attempt; never expose secrets in notes.\n3. Resolve the external cause before retrying, when applicable.\n4. Pass `expectedAttempt` and a correlation identifier.\n5. Confirm `process.incident.resolved` or `process.incident.compensated` audit evidence.\n6. Escalate dead-letter incidents instead of repeatedly bypassing policy.\n7. Test domain compensation idempotency and partial-failure behavior before production qualification.\n"
        },
        {
          "code": "first-workflow",
          "title": "Build Your First Workflow",
          "route": "/docs/framework/process/first-workflow",
          "section": "beginner-guides",
          "sectionTitle": "Beginner Guides",
          "sectionOrder": 15,
          "order": 25,
          "audience": [
            "business-user",
            "developer",
            "tester",
            "ai-tool"
          ],
          "summary": "Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples.",
          "searchText": "Build Your First Workflow Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples. # Build Your First Workflow\n\nThis guide is for someone opening Nodics for the first time. The goal is not to\nteach every automation feature at once. The goal is to help you create one small\nworkflow, understand why each step exists, and know where to look when something\ndoes not validate.\n\n## What you are building\n\nYou will build a simple content approval process:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Review content\"]\n  Review --> Decision[\"DECISION: Approved?\"]\n  Decision -->|approved=true| Notify[\"ACTION: nodics.process.noop\"]\n  Decision -->|default| End[\"END\"]\n  Notify --> Timer[\"TIMER: audit pause\"]\n  Timer --> Child[\"SUB_PROCESS: optional governance\"]\n  Child --> End\n```\n\nThe workflow is intentionally small, but it introduces the same building blocks\nused by larger commerce, telco, logistics, onboarding, support, and publishing\nprocesses.\n\n## Step 1: create a draft definition\n\nIn Axis, open Business Process & Automation, then open Workflows or Designer.\nCreate a beginner-safe process draft. Give it a stable code such as\n`contentApproval`.\n\nStable code matters because integrations, audit events, tests, and customer\nextensions refer to codes. Display names can change; codes should not change\ncasually.\n\n## Step 2: understand the nodes\n\n| Node type | Beginner meaning | Runtime owner |\n| --- | --- | --- |\n| `START` | Where the process begins. | Process |\n| `TASK` | Human work, such as review, approval, or correction. | Process |\n| `DECISION` | Chooses the next path using declared decision data. | Process |\n| `ACTION` | Calls an explicitly allowed domain adapter. | Process orchestrates; domain module owns business logic. |\n| `TIMER` | Represents a wait, schedule boundary, or future SLA point. | Process records intent; Cron can schedule real execution. |\n| `SUB_PROCESS` | References another governed workflow definition. | Process |\n| `END` | Marks the instance complete. | Process |\n\nAxis edits these nodes visually, but the backend validator decides whether the\ngraph is valid.\n\n## Step 3: connect the nodes\n\nEvery transition must have:\n\n- a stable transition code;\n- a source node;\n- a target node;\n- no transition from `END`;\n- no transition into `START`.\n\nFor a `DECISION` node, every outgoing path should either declare a condition or\nbe marked as the default path. Example:\n\n```json\n{\n  \"code\": \"decision_to_notify\",\n  \"source\": \"approvalDecision\",\n  \"target\": \"notify\",\n  \"condition\": { \"field\": \"approved\", \"equals\": true }\n}\n```\n\n## Step 4: save, validate, publish\n\nSave stores the draft graph. Validate asks nodics.process to inspect the graph.\nPublish creates an immutable version that can run. A running instance should\nalways point to a published version, not a mutable draft.\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis\n  participant Process as nodics.process\n  User->>Axis: Edit graph\n  Axis->>Process: Save draft graph\n  User->>Axis: Validate\n  Axis->>Process: Validate backend contract\n  User->>Axis: Publish\n  Axis->>Process: Create immutable version\n```\n\n## Common beginner mistakes\n\n- Creating two `START` nodes.\n- Forgetting an `END` node.\n- Connecting a transition to a deleted node.\n- Adding an `ACTION` node without a registered adapter.\n- Putting JavaScript, URLs, or file paths inside action metadata.\n- Expecting Axis to execute the process locally.\n\nWhen validation fails, fix the graph and validate again. Do not bypass the\nbackend validator.\n\n"
        },
        {
          "code": "first-human-task",
          "title": "Build Your First Human Task Flow",
          "route": "/docs/framework/process/first-human-task",
          "section": "beginner-guides",
          "sectionTitle": "Beginner Guides",
          "sectionOrder": 15,
          "order": 27,
          "audience": [
            "business-user",
            "administrator",
            "developer",
            "operator"
          ],
          "summary": "Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps.",
          "searchText": "Build Your First Human Task Flow Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps. # Build Your First Human Task Flow\n\nHuman tasks are the bridge between automation and people. A task tells an\noperator, reviewer, merchandiser, support agent, or approver what needs human\nattention.\n\n## Example business scenario\n\nA content editor changes a page. The change should not go live until someone\nreviews it. The process creates a task called `Review content`. The reviewer can\nclaim it, assign it, complete it, or cancel it.\n\n```mermaid\nstateDiagram-v2\n  [*] --> OPEN\n  OPEN --> CLAIMED: claim\n  OPEN --> COMPLETED: complete\n  CLAIMED --> COMPLETED: complete\n  OPEN --> CANCELLED: cancel\n  CLAIMED --> CANCELLED: cancel\n```\n\n## Task fields you should understand\n\n| Field | Why it matters |\n| --- | --- |\n| `code` | Stable task identifier for audit and support. |\n| `instanceCode` | Links the task to the running process instance. |\n| `nodeCode` | Shows which workflow step produced the task. |\n| `assignee` | Person, queue, or group expected to work on it. |\n| `status` | Current state such as `OPEN`, `CLAIMED`, or `COMPLETED`. |\n| `dueAt` | Optional SLA date for operations. |\n\n## How Axis should present task work\n\nAxis should show tasks as business work, not as raw database rows. A good task\nscreen answers:\n\n1. What process created this task?\n2. What business object is affected?\n3. Who owns it now?\n4. What action can I take safely?\n5. What happened before this task?\n\nThe detail timeline answers the fifth question by reading Process audit events.\n\n## Developer customization\n\nCustomer modules can customize assignment without editing standard Process\nsource. For example:\n\n- route enterprise onboarding approvals to an enterprise admin queue;\n- route product publishing approvals to merchandising;\n- route logistics exceptions to warehouse operations;\n- route refund approval tasks to finance.\n\nThe customization should live in the customer or domain module, not in Axis.\nAxis renders authorized actions; Process owns task lifecycle.\n\n"
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
          "code": "action-adapters",
          "title": "Action Adapter Contract",
          "route": "/docs/framework/process/action-adapters",
          "section": "build-and-extend",
          "sectionTitle": "Build and Extend",
          "sectionOrder": 30,
          "order": 45,
          "audience": [
            "developer",
            "architect",
            "security",
            "tester",
            "ai-tool"
          ],
          "summary": "Learn why ACTION nodes use registered declarative adapters and how customer/domain modules own business execution.",
          "searchText": "Action Adapter Contract Learn why ACTION nodes use registered declarative adapters and how customer/domain modules own business execution. # Action Adapter Contract\n\nAn `ACTION` node is where a workflow asks another capability to do something.\nExamples:\n\n- ask Commerce to reserve stock;\n- ask Profile to notify a user;\n- ask WCMS to move content to review;\n- ask a customer module to call a partner integration.\n\nProcess should not contain that business logic. Process should orchestrate,\nauthorize, and audit the request.\n\n## Safe default\n\nThe framework includes one safe demo action:\n\n```json\n{\n  \"moduleName\": \"nodics.process\",\n  \"operation\": \"noop\"\n}\n```\n\nThis proves the runtime path without touching a real business domain.\n\n## What is not allowed\n\nGraph JSON must not contain:\n\n- JavaScript functions;\n- file paths;\n- URLs as executable handlers;\n- arbitrary script fragments;\n- secrets or credentials.\n\nThis is a security and maintainability rule. A workflow should say what domain\noperation is requested, not how to execute arbitrary code.\n\n## Customer extension pattern\n\nA customer project can register allowed adapters through configuration or a\ncustom registry override.\n\n```js\nmodule.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'customer.commerce',\n          operation: 'reserveStock',\n          service: 'CustomerCommerceProcessAdapterService',\n          method: 'reserveStock'\n        }\n      ]\n    }\n  }\n};\n```\n\nThe service implementation belongs to the customer/domain module. Process only\ncalls it through the approved registry and records the result.\n\n## QA checklist\n\n- Unknown actions fail with a stable Process error.\n- Allowed demo no-op action completes successfully.\n- Failed actions create audit evidence.\n- Action output is bounded and does not leak secrets.\n- Domain modules can be tested independently from Process orchestration.\n\n"
        },
        {
          "code": "custom-project-extension",
          "title": "Custom Project Extension Guide",
          "route": "/docs/framework/process/custom-project-extension",
          "section": "build-and-extend",
          "sectionTitle": "Build and Extend",
          "sectionOrder": 30,
          "order": 47,
          "audience": [
            "developer",
            "architect",
            "operator",
            "ai-tool"
          ],
          "summary": "Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance.",
          "searchText": "Custom Project Extension Guide Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance. # Custom Project Extension Guide\n\nCustomer projects may customize Process behavior without renaming the functional\nmodule. A customer module can extend or override standard behavior, but Axis and\nBackOffice should still show the capability as Process.\n\n## Example topology\n\n```mermaid\nflowchart TD\n  Server[\"customer processServer\"] --> CustomerProcess[\"customer.process overlay\"]\n  CustomerProcess --> NodicsProcess[\"nodics.process\"]\n  NodicsProcess --> NodicsCore[\"nodics.core\"]\n  Server --> NodicsCron[\"nodics.cron included in shared runtime\"]\n```\n\nThe server can include Cron and Process together for operational simplicity,\nwhile ownership remains clear.\n\n## What belongs in a customer extension\n\n- custom task assignment rules;\n- domain-specific action adapters;\n- additional graph validation policies;\n- extra audit metadata with safe redaction;\n- environment-specific timer/SLA rules;\n- customer documentation and sample workflows.\n\n## What should not be customized casually\n\n- published version immutability;\n- permission checks;\n- audit event creation;\n- backend graph validation;\n- module identity exposed to Axis.\n\nChanging those weakens trust in the automation platform.\n\n## Documentation ownership\n\nFramework Process docs belong in nodics.process. Customer process docs belong in\nthe customer project module or project documentation pack. Axis only renders\nimported content; it should not own backend documentation data.\n\n"
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
          "searchText": "Process and Cron Shared Runtime Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries. # Process and Cron Shared Runtime\n\nProcess and Cron can run together in one runtime server when a partner wants a\nsmaller topology. This is useful for local development, small installations, or\ncustomers who want business process automation and scheduled jobs without\nrunning many microservice processes.\n\n## The key rule\n\nShared runtime does not mean shared ownership.\n\n| Concern | Owner |\n| --- | --- |\n| Process definitions | `nodics.process` |\n| Published workflow versions | `nodics.process` |\n| Runtime instances and tasks | `nodics.process` |\n| Trigger relationship metadata | `nodics.process` |\n| Cron job definition | `nodics.cron` |\n| Scheduler firing and retries | `nodics.cron` |\n| Domain business action | Domain module |\n| UI rendering | `nodics.axis` |\n\n## Example topology\n\n```mermaid\nflowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.core\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  ProcessServer --> Cron[\"includes nodics.cron\"]\n  Process --> Trigger[\"processTrigger metadata\"]\n  Cron --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job\n```\n\nThe trigger can reference a Cron job code. It does not become the Cron job.\nCron still decides when the job fires. When a Cron-owned job wants to start a\nprocess, it declares a `jobDetail.processTrigger` target. The Cron trigger\npipeline then calls the Process trigger executor with a service identity,\ncorrelation id, schedule context, and job evidence. Process verifies the\ntrigger is active, starts the workflow instance, and records audit events.\n\n## Why this is attractive for partners\n\nPartners often start with one server for operational simplicity. Later they may\nsplit runtimes when scale, isolation, or team ownership requires it. Nodics\nshould support both without changing functional module identity.\n\nThis keeps the mental model stable:\n\n- Process console shows workflows and automation relationships.\n- Cron console shows jobs and scheduler behavior.\n- Axis can place both under \"Business Process & Automation\".\n- Backend ownership still protects maintainability.\n\n## Safe lifecycle behavior\n\nCron can be registered, activated, deactivated, and deregistered through the\nmodule registry. Process APIs should remain reachable even when Cron is\nderegistered, because Process definitions and tasks are not owned by Cron.\n\nThe local acceptance smoke proves this by exercising Process runtime first and\nthen verifying the Cron registry lifecycle.\n\n## Cron job handoff shape\n\nA Cron job that starts a Process workflow should look declarative. It should not\nembed workflow logic or call arbitrary code when the intent is scheduled\nautomation.\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  tenant: 'default',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        businessDateMode: 'CURRENT_DAY'\n      }\n    }\n  }\n}\n```\n\nThat shape keeps the responsibilities readable:\n\n- Cron reads the schedule and fires the job.\n- Cron passes `cronJobCode`, tenant, schedule expression, and correlation\n  evidence into Process.\n- Process loads the active trigger relationship.\n- Process starts the published workflow version.\n- Process writes `process.trigger.execution.*` and instance audit events.\n\nIf `nodics.process` is not loaded in the same runtime, the Cron job fails closed\nwith a dependency error instead of silently pretending the automation ran.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n"
        },
        {
          "code": "scheduled-automation",
          "title": "Scheduled Automation and Cron Triggers",
          "route": "/docs/framework/process/scheduled-automation",
          "section": "operate",
          "sectionTitle": "Operate",
          "sectionOrder": 40,
          "order": 65,
          "audience": [
            "administrator",
            "operator",
            "developer",
            "tester"
          ],
          "summary": "Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence.",
          "searchText": "Scheduled Automation and Cron Triggers Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence. # Scheduled Automation and Cron Triggers\n\nScheduled automation connects time-based execution to business workflows. Nodics\nkeeps the ownership boundary explicit:\n\n- nodics.process owns process definitions, trigger relationships, instances,\n  tasks, and audit.\n- nodics.cron owns job scheduling, firing, retry timing, and scheduler runtime.\n\n## Why this split exists\n\nIf Process owned Cron jobs directly, workflows would become a hidden scheduler.\nIf Cron owned process definitions, scheduled jobs would become a hidden workflow\nengine. Keeping the boundary clear makes the system easier to test, operate, and\ncustomize.\n\n```mermaid\nsequenceDiagram\n  participant Cron as nodics.cron\n  participant Process as nodics.process\n  participant Audit as Process audit\n  Cron->>Process: POST /triggers/:code/execute\n  Process->>Audit: process.trigger.execution.requested\n  Process->>Process: start published process instance\n  Process->>Audit: process.instance.started\n  Process->>Audit: process.trigger.execution.completed\n```\n\n## Trigger lifecycle\n\n| State | Meaning |\n| --- | --- |\n| `DRAFT` | Relationship exists but is not executable. |\n| `ACTIVE` | Authorized scheduler can execute it. |\n| `PAUSED` | Keep metadata but do not execute. |\n| `ARCHIVED` | Historical relationship; cannot be updated or executed. |\n\nAxis should make this lifecycle obvious. A business user should not need to\nguess why an automation did not run.\n\n## Runtime execution contract\n\nThe execution API requires an active trigger. The scheduler should pass a\ncorrelation or idempotency key.\n\n```http\nPOST /nodics/process/v0/triggers/dailyContentApproval/execute\nAuthorization: Bearer <runtime-token>\ncontent-type: application/json\n\n{\n  \"correlationId\": \"cron-fire-2026-08-09T10:00:00Z\",\n  \"context\": {\n    \"source\": \"cron\",\n    \"businessDate\": \"2026-08-09\"\n  }\n}\n```\n\nProcess starts the referenced workflow and records audit evidence. Cron remains\nresponsible for deciding when to call this endpoint and how to retry scheduler\nfailures.\n\n## Cron-owned job declaration\n\nWhen Process and Cron run together in `processServer`, a Cron job can execute a\nProcess trigger without using a browser-only shortcut:\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        sourceDescription: 'Daily content approval automation'\n      }\n    }\n  }\n}\n```\n\nThis declaration is intentionally small. The business process remains in\nProcess. The schedule remains in Cron. Domain-specific work remains in the\ndomain module that Process calls through explicit ACTION adapters.\n\n## What business users should see in Axis\n\nAxis should explain two related but different records:\n\n| Axis concept | Backend owner | What the user controls |\n| --- | --- | --- |\n| Scheduled trigger relationship | `nodics.process` | Which process definition is allowed to start from a schedule. |\n| Cron job | `nodics.cron` | When the schedule fires and how scheduler lifecycle is operated. |\n| Manual execute now | `nodics.process` | Test an active trigger immediately with audit evidence. |\n\nThis helps a business user understand why activating a trigger relationship is\nnot the same thing as starting a scheduler, and why a Cron job may still need to\nexist before real time-based automation fires.\n"
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
          "searchText": "Visual Workflow Designer Contract Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer. # Visual Workflow Designer Contract\n\nThe visual workflow designer lets a business user or developer edit a process\ngraph through Axis. The important contract is that Axis is an editor, not the\nruntime authority.\n\n## Ownership model\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version\n```\n\nAxis can display nodes, edges, positions, labels, and selection state. The\nbackend validates whether the graph is executable.\n\n## MVP graph contract\n\nThe first designer contract supports:\n\n- one `START` node;\n- one or more `TASK` nodes;\n- one or more `END` nodes;\n- transitions with stable codes, source, and target;\n- optional designer metadata for browser positions.\n\n```json\n{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}\n```\n\n## What the browser may do\n\nAxis may:\n\n- render a node palette;\n- show a canvas preview;\n- let the user select nodes;\n- collect labels and basic properties;\n- send draft graph data to Process APIs;\n- show backend validation diagnostics.\n\nAxis must not:\n\n- execute process logic;\n- calculate runtime state;\n- bypass backend validation;\n- store workflow definitions in browser storage as authority;\n- create a parallel workflow registry.\n\n## How a beginner should use the first designer\n\nThe first designer is intentionally simple. It is not trying to be a complex\ndiagramming tool on day one. It gives a business user a safe way to understand\nthe shape of a workflow and gives a developer a safe way to prove the backend\ngraph contract.\n\nStart with this flow:\n\n```mermaid\nflowchart LR\n  Start[\"START: request received\"] --> Review[\"TASK: business review\"]\n  Review --> End[\"END: approved or recorded\"]\n```\n\nThen ask these business questions before adding more nodes:\n\n| Question | Why it matters | Where the answer belongs |\n| --- | --- | --- |\n| Who starts this process? | Prevents hidden automation and duplicate cases. | Process trigger metadata or domain API call. |\n| Who owns the human task? | Makes the work queue visible. | Process task assignment policy. |\n| What happens if the task is delayed? | Defines SLA and escalation. | Process policy, future timer, or Cron relationship. |\n| What business object is affected? | Lets users connect workflow to real work. | Process instance context and domain module reference. |\n| What evidence is required? | Supports audit and compliance. | Process audit event and domain audit. |\n\nIf a user cannot answer these questions, the flow is not ready for publication\neven if the graph is technically valid.\n\n## Designer library roadmap\n\nThe first implementation uses a Nodics-native card/canvas projection because it\nkeeps the contract easy to test. The roadmap is:\n\n1. keep the backend graph contract stable;\n2. keep Axis as the renderer/editor only;\n3. add drag/drop layout metadata after the save/validate/publish flow is stable;\n4. evaluate React Flow / xyflow as the first richer canvas implementation;\n5. add BPMN import/export only as an interoperability adapter when a customer\n   needs it.\n\nThis sequence prevents a drawing library from becoming the workflow authority.\nThe designer may become more attractive and interactive, but the validation,\nversioning, permissions, runtime execution, and audit evidence must remain in\n`nodics.process`.\n\n## Designer acceptance\n\nThe designer foundation is healthy when:\n\n1. A user can see START, TASK, and END nodes.\n2. A user can inspect selected node details.\n3. Saving calls the Process draft API.\n4. Validation calls the Process graph validator.\n5. Publishing remains a separate backend-owned action.\n6. The same graph can be verified through API tests and fresh acceptance.\n7. Axis refresh is not required after create, save, validate, publish, trigger,\n   task, or Cron handoff operations.\n8. A business user can explain the workflow outcome from the page without\n   reading raw JSON.\n9. A developer can reproduce the same graph through the Process API.\n10. An operator can trace a started instance from trigger/job evidence through\n    Process audit events.\n\n## Continue\n\n- [Developer Customization Guide](developer-customization.md)\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n"
        },
        {
          "code": "qa-regression-guide",
          "title": "Process QA and Regression Guide",
          "route": "/docs/framework/process/qa-regression-guide",
          "section": "operate",
          "sectionTitle": "Operate",
          "sectionOrder": 40,
          "order": 80,
          "audience": [
            "tester",
            "developer",
            "operator",
            "ai-tool"
          ],
          "summary": "Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation.",
          "searchText": "Process QA and Regression Guide Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation. # Process QA and Regression Guide\n\nProcess automation touches business operations, so small bugs can become noisy\nin production. QA must test both the happy path and the boundaries.\n\n## Minimum backend regression\n\nRun the Process contract suite:\n\n```bash\ncd nodics.ai/nodics.process\nnpm test\n```\n\nThis validates module structure, secured routes, permission catalog coverage,\ngenerated schemas, graph validation, definition lifecycle, operation inspection,\nruntime lifecycle, trigger execution, and action adapter blocking.\n\n## Fresh database acceptance\n\nFrom the reference customer project, run the fresh local acceptance when you\nneed evidence that bootstrap, imports, module registration, Axis content, and\nruntime servers still cooperate:\n\n```bash\ncd nodics.kickoff\nnpm run acceptance:local:fresh\n```\n\nThis is heavier than unit tests, but it catches integration drift.\n\n## Manual Axis smoke checklist\n\n1. Login to Axis.\n2. Open Business Process & Automation.\n3. Create a sample draft.\n4. Save a graph change in Designer.\n5. Validate the draft.\n6. Publish the draft.\n7. Start an instance.\n8. Claim and complete a task.\n9. Create a scheduled trigger relationship.\n10. Activate and execute the trigger.\n11. Confirm a new instance appears.\n12. Open the timeline and verify audit evidence.\n\n## Negative tests that matter\n\n- Unknown action adapter must fail.\n- Paused or archived trigger must not execute.\n- Draft definition must not start.\n- Archived trigger must not update.\n- User without Process permission must be denied.\n- Axis refresh must not be required after every operation.\n\nIf these fail, stop and fix the contract before adding more UI.\n\n"
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
          "text": "Completing a task advances through the published graph. ACTION, DECISION, TIMER, and SUB_PROCESS nodes are backend-executed. If an ACTION fails, Process marks the instance `FAILED` and opens a recovery incident; operators then use the governed retry or compensation APIs described in the incident recovery guide."
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
      "searchText": "Runtime Instance and Task Lifecycle Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships. # Runtime Instance and Task Lifecycle\n\nThis page explains the lifecycle that turns a designed process into operational\nwork. It is written for a beginner, so it starts with the simple path before\nexplaining where developers and operators customize behavior.\n\n## Lifecycle summary\n\n```mermaid\nstateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance\n```\n\nEvery arrow is a backend operation. Axis buttons call these APIs, but Axis does\nnot update the database directly and does not invent the next state.\n\n## Definition lifecycle\n\nA process starts as a draft. Drafts can be edited because business users and\ndevelopers often need multiple rounds of naming, description, category, graph\nlayout, and validation. A draft cannot become operational until the backend\ngraph validator accepts it.\n\nThe first supported graph shape is intentionally small:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]\n```\n\nThis proves the foundation before advanced behavior is added. The backend\nchecks stable node codes, supported node types, one START node, at least one END\nnode, valid transitions, duplicate node codes, and unsafe executable action\nreferences.\n\nWhen a draft is published, the backend creates an immutable\n`processDefinitionVersion`. Later draft edits must not mutate version 1. This\nis critical for audit: if a process instance ran yesterday, operators must know\nexactly which published graph version it used.\n\n## Starting an instance\n\nStarting a process requires a published definition. The request can specify a\ndefinition code and optional version. If no version is supplied, the backend\nuses the current published version from the definition aggregate.\n\nExample request:\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}\n```\n\nThe backend creates:\n\n- one `processInstance`;\n- a `process.instance.started` audit event;\n- the first `processTask` when the graph reaches a TASK node;\n- a `process.task.created` audit event.\n\n## Task lifecycle\n\nHuman tasks are operational work items. They can be open, claimed, completed,\ncancelled, or escalated.\n\nRuntime mutation routes use dedicated Process permissions. This keeps\ndefinition governance, instance control, human-task operations, and trigger\nmanagement separate even when the reference admin can exercise all of them.\nCustomer projects can assign these permissions to narrower user groups later.\n\n| Action | API | Permission | Allowed from | Result |\n| --- | --- | --- | --- | --- |\n| Start instance | `POST /instances` | `process.instance.start` | Published version | Instance starts and first task may be created. |\n| Claim | `POST /tasks/:taskCode/claim` | `process.task.claim` | `OPEN` | Task becomes `CLAIMED` and assignee is recorded. |\n| Assign | `POST /tasks/:taskCode/assign` | `process.task.assign` | `OPEN`, `CLAIMED`, `ESCALATED` | Assignee changes while task remains actionable. |\n| Complete | `POST /tasks/:taskCode/complete` | `process.task.complete` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `COMPLETED`; instance moves to next node. |\n| Cancel task | `POST /tasks/:taskCode/cancel` | `process.task.cancel` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `CANCELLED` without cancelling the whole instance. |\n| Cancel instance | `POST /instances/:instanceCode/cancel` | `process.instance.cancel` | `CREATED`, `RUNNING`, `WAITING` | Instance becomes `CANCELLED`; open tasks are cancelled. |\n\nCompleting a task advances through the published graph. ACTION, DECISION,\nTIMER, and SUB_PROCESS nodes are backend-executed. If an ACTION fails, Process\nmarks the instance `FAILED` and opens a recovery incident; operators then use\nthe governed retry or compensation APIs described in the incident recovery\nguide.\n\n## Instance detail and audit\n\nOperators need evidence, not just status. The detail API returns the instance,\nits tasks, and its audit timeline.\n\n```http\nGET /nodics/process/v0/instances/contentApproval-001/detail\n```\n\nThe response gives Axis enough information to show:\n\n- current instance status;\n- definition and version;\n- current node;\n- all related tasks;\n- timeline events such as instance started, task created, task claimed, task\n  completed, and instance completed.\n\nAudit data must stay bounded and redacted. It should explain what happened\nwithout storing secrets or large raw payloads.\n\n## Scheduled triggers\n\nScheduled automation is represented as Process trigger metadata. A trigger may\nreference a Cron job code, but actual scheduling, firing, retries, and job\nlifecycle stay in `nodics.cron`.\n\nThis split helps a business user see automation relationships from the Process\nconsole while preserving module ownership:\n\n| Concern | Owner |\n| --- | --- |\n| Trigger relationship to a process | `nodics.process` |\n| Cron expression, job enablement, scheduler runtime | `nodics.cron` |\n| Starting an instance when schedule fires | Process API called by authorized runtime integration |\n| Showing relationship in Axis | `nodics.axis` frontend projection |\n\nThe trigger metadata lifecycle uses `process.trigger.manage` for create,\nupdate, activation, pause, and archive operations. Archiving is preferred over\ndelete so operators can still explain why a scheduled automation relationship\nused to exist.\n\n## QA checklist\n\nThe runtime foundation is healthy when:\n\n1. A draft can be created and validated.\n2. A valid draft can publish version 1.\n3. Version 1 remains immutable after preparing version 2 draft.\n4. A published definition can start a runtime instance.\n5. The first TASK node creates an OPEN task.\n6. Claiming the task records assignee and audit evidence.\n7. Completing the task advances the instance to END and COMPLETED.\n8. Instance detail returns tasks and audit timeline.\n9. Invalid task transitions fail with stable Process errors.\n10. Axis refreshes after each operation without calculating runtime state locally.\n\n## Customization examples\n\nA customer project can customize without editing the standard Process source:\n\n- override task assignment policy to assign by enterprise, site, queue, or role;\n- add SLA due-date calculation using project-level properties;\n- add graph validation rules for domain action references;\n- add a provider that executes ACTION nodes through a domain module facade;\n- add escalation rules that create events or Cron-backed reminders;\n- enrich Axis cards using backend-owned API data.\n\nThe key principle stays the same: Process owns orchestration state, domain\nmodules own business actions, Cron owns scheduling, and Axis renders authorized\ncontracts.\n",
      "previous": {
        "title": "Business Process and Automation Overview",
        "route": "/docs/framework/process"
      },
      "next": {
        "title": "Incident, Retry, and Compensation Operations",
        "route": "/docs/framework/process/incident-recovery"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/runtime-lifecycle.md",
        "wordCount": 935,
        "checksum": "d491cfa2a10ed1619ccc0213b3a339bdd9be85445c52821a754ccc6f7cf84674"
      }
    },
    "active": true
  },
  "record3": {
    "code": "processDocumentationComponentincidentRecovery",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "incident-recovery",
      "title": "Incident, Retry, and Compensation Operations",
      "route": "/docs/framework/process/incident-recovery",
      "section": "process-operations",
      "sectionTitle": "Process Operations",
      "audience": [
        "business-user",
        "administrator",
        "developer",
        "operator",
        "tester",
        "ai-tool"
      ],
      "summary": "Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation.",
      "headings": [
        {
          "text": "The recovery lifecycle",
          "anchor": "incidentRecovery-1-the-recovery-lifecycle",
          "level": 2
        },
        {
          "text": "What an operator sees",
          "anchor": "incidentRecovery-2-what-an-operator-sees",
          "level": 2
        },
        {
          "text": "Retry safely",
          "anchor": "incidentRecovery-3-retry-safely",
          "level": 2
        },
        {
          "text": "Compensate safely",
          "anchor": "incidentRecovery-4-compensate-safely",
          "level": 2
        },
        {
          "text": "Developer contract",
          "anchor": "incidentRecovery-5-developer-contract",
          "level": 2
        },
        {
          "text": "Operational checklist",
          "anchor": "incidentRecovery-6-operational-checklist",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide explains what happens when an automated workflow step fails and how an operator safely recovers it. Process owns the orchestration incident. The business module still owns the action and any reversal of business state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The recovery lifecycle",
          "anchor": "incidentRecovery-1-the-recovery-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> Open: ACTION fails\n  Open --> Retrying: authorized retry\n  Retrying --> Resolved: action succeeds\n  Retrying --> Open: attempt fails and budget remains\n  Retrying --> DeadLetter: attempt budget exhausted\n  Open --> Compensating: authorized compensation\n  DeadLetter --> Compensating: authorized compensation\n  Compensating --> Compensated: domain adapter succeeds\n  Compensating --> DeadLetter: domain adapter fails"
        },
        {
          "kind": "paragraph",
          "text": "An ACTION failure creates one `processIncident` containing the instance, published definition version, failed node, stable error code, current attempt, maximum attempts, optional next retry time, and declarative adapter references. Raw exception payloads and secrets must not be copied into incident evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What an operator sees",
          "anchor": "incidentRecovery-2-what-an-operator-sees"
        },
        {
          "kind": "paragraph",
          "text": "The incident list is the recovery work queue:"
        },
        {
          "kind": "code",
          "language": "http",
          "text": "GET /nodics/process/v0/incidents?status=OPEN\nAuthorization: Bearer <access-token>"
        },
        {
          "kind": "paragraph",
          "text": "Open the incident before acting. Confirm the definition version, node, error code, attempt budget, next retry time, and related instance. Refresh if another operator may be working on the same incident."
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Permission",
            "Result"
          ],
          "rows": [
            [
              "List or read incidents",
              "`process.incident.read`",
              "Returns bounded recovery evidence."
            ],
            [
              "Retry failed ACTION",
              "`process.instance.retry`",
              "Re-executes the same published ACTION and continues only after success."
            ],
            [
              "Run compensation",
              "`process.instance.compensate`",
              "Dispatches the node's registered domain compensation adapter."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Retry safely",
          "anchor": "incidentRecovery-3-retry-safely"
        },
        {
          "kind": "paragraph",
          "text": "Send the attempt number you inspected. This optimistic check prevents an old browser tab from spending a newer retry attempt."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances/orderApproval-001/retry\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"expectedAttempt\": 1,\n  \"correlationId\": \"support-case-4831\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "On success, the incident becomes `RESOLVED` and the instance continues from the transition after the failed ACTION. On failure, the attempt increments. The incident returns to `OPEN` while budget remains or becomes `DEAD_LETTER` after the final attempt. Retry policy is bounded to ten attempts and a maximum delay of 24 hours even when project configuration is incorrect."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Compensate safely",
          "anchor": "incidentRecovery-4-compensate-safely"
        },
        {
          "kind": "paragraph",
          "text": "Compensation is not a generic database rollback. A workflow node may declare a registered compensation adapter, for example an Order-owned reversal command. Process invokes that adapter and records orchestration evidence; the domain module validates its own state, idempotency, authorization, and reversal rules."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances/orderApproval-001/compensate\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"payload\": {\n    \"reasonCode\": \"PAYMENT_CAPTURE_FAILED\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "If no compensation adapter is declared, the API fails closed. Operators must not substitute a direct database edit. If compensation fails, the incident is dead-lettered and the instance keeps `compensationStatus: FAILED` for manual investigation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer contract",
          "anchor": "incidentRecovery-5-developer-contract"
        },
        {
          "kind": "paragraph",
          "text": "An ACTION node can declare retry and compensation without embedding executable code in the graph:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"reserveInventory\",\n  \"type\": \"ACTION\",\n  \"action\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"reserve\"\n  },\n  \"retry\": {\n    \"maximumAttempts\": 3,\n    \"delayMs\": 5000\n  },\n  \"compensation\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"release\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Both declarations must exist in the configured action-adapter allowlist. The adapter implementation lives behind a domain service or facade. Unknown or unavailable adapters fail closed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational checklist",
          "anchor": "incidentRecovery-6-operational-checklist"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Confirm the incident belongs to the intended tenant and instance.",
            "Read the stable error code and current attempt; never expose secrets in notes.",
            "Resolve the external cause before retrying, when applicable.",
            "Pass `expectedAttempt` and a correlation identifier.",
            "Confirm `process.incident.resolved` or `process.incident.compensated` audit evidence.",
            "Escalate dead-letter incidents instead of repeatedly bypassing policy.",
            "Test domain compensation idempotency and partial-failure behavior before production qualification."
          ]
        }
      ],
      "searchText": "Incident, Retry, and Compensation Operations Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation. # Incident, Retry, and Compensation Operations\n\nThis guide explains what happens when an automated workflow step fails and how\nan operator safely recovers it. Process owns the orchestration incident. The\nbusiness module still owns the action and any reversal of business state.\n\n## The recovery lifecycle\n\n```mermaid\nstateDiagram-v2\n  [*] --> Open: ACTION fails\n  Open --> Retrying: authorized retry\n  Retrying --> Resolved: action succeeds\n  Retrying --> Open: attempt fails and budget remains\n  Retrying --> DeadLetter: attempt budget exhausted\n  Open --> Compensating: authorized compensation\n  DeadLetter --> Compensating: authorized compensation\n  Compensating --> Compensated: domain adapter succeeds\n  Compensating --> DeadLetter: domain adapter fails\n```\n\nAn ACTION failure creates one `processIncident` containing the instance,\npublished definition version, failed node, stable error code, current attempt,\nmaximum attempts, optional next retry time, and declarative adapter references.\nRaw exception payloads and secrets must not be copied into incident evidence.\n\n## What an operator sees\n\nThe incident list is the recovery work queue:\n\n```http\nGET /nodics/process/v0/incidents?status=OPEN\nAuthorization: Bearer <access-token>\n```\n\nOpen the incident before acting. Confirm the definition version, node, error\ncode, attempt budget, next retry time, and related instance. Refresh if another\noperator may be working on the same incident.\n\n| Operation | Permission | Result |\n| --- | --- | --- |\n| List or read incidents | `process.incident.read` | Returns bounded recovery evidence. |\n| Retry failed ACTION | `process.instance.retry` | Re-executes the same published ACTION and continues only after success. |\n| Run compensation | `process.instance.compensate` | Dispatches the node's registered domain compensation adapter. |\n\n## Retry safely\n\nSend the attempt number you inspected. This optimistic check prevents an old\nbrowser tab from spending a newer retry attempt.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/retry\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"expectedAttempt\": 1,\n  \"correlationId\": \"support-case-4831\"\n}\n```\n\nOn success, the incident becomes `RESOLVED` and the instance continues from the\ntransition after the failed ACTION. On failure, the attempt increments. The\nincident returns to `OPEN` while budget remains or becomes `DEAD_LETTER` after\nthe final attempt. Retry policy is bounded to ten attempts and a maximum delay\nof 24 hours even when project configuration is incorrect.\n\n## Compensate safely\n\nCompensation is not a generic database rollback. A workflow node may declare a\nregistered compensation adapter, for example an Order-owned reversal command.\nProcess invokes that adapter and records orchestration evidence; the domain\nmodule validates its own state, idempotency, authorization, and reversal rules.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/compensate\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"payload\": {\n    \"reasonCode\": \"PAYMENT_CAPTURE_FAILED\"\n  }\n}\n```\n\nIf no compensation adapter is declared, the API fails closed. Operators must\nnot substitute a direct database edit. If compensation fails, the incident is\ndead-lettered and the instance keeps `compensationStatus: FAILED` for manual\ninvestigation.\n\n## Developer contract\n\nAn ACTION node can declare retry and compensation without embedding executable\ncode in the graph:\n\n```json\n{\n  \"code\": \"reserveInventory\",\n  \"type\": \"ACTION\",\n  \"action\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"reserve\"\n  },\n  \"retry\": {\n    \"maximumAttempts\": 3,\n    \"delayMs\": 5000\n  },\n  \"compensation\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"release\"\n  }\n}\n```\n\nBoth declarations must exist in the configured action-adapter allowlist. The\nadapter implementation lives behind a domain service or facade. Unknown or\nunavailable adapters fail closed.\n\n## Operational checklist\n\n1. Confirm the incident belongs to the intended tenant and instance.\n2. Read the stable error code and current attempt; never expose secrets in notes.\n3. Resolve the external cause before retrying, when applicable.\n4. Pass `expectedAttempt` and a correlation identifier.\n5. Confirm `process.incident.resolved` or `process.incident.compensated` audit evidence.\n6. Escalate dead-letter incidents instead of repeatedly bypassing policy.\n7. Test domain compensation idempotency and partial-failure behavior before production qualification.\n",
      "previous": {
        "title": "Runtime Instance and Task Lifecycle",
        "route": "/docs/framework/process/runtime-lifecycle"
      },
      "next": {
        "title": "Build Your First Workflow",
        "route": "/docs/framework/process/first-workflow"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/incident-recovery.md",
        "wordCount": 554,
        "checksum": "c860791ead89aca063323cc16dd0d84b221e0756f5d3d09c2d201a93e4d1cffc"
      }
    },
    "active": true
  },
  "record4": {
    "code": "processDocumentationComponentfirstWorkflow",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "first-workflow",
      "title": "Build Your First Workflow",
      "route": "/docs/framework/process/first-workflow",
      "section": "beginner-guides",
      "sectionTitle": "Beginner Guides",
      "audience": [
        "business-user",
        "developer",
        "tester",
        "ai-tool"
      ],
      "summary": "Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples.",
      "headings": [
        {
          "text": "What you are building",
          "anchor": "firstWorkflow-1-what-you-are-building",
          "level": 2
        },
        {
          "text": "Step 1: create a draft definition",
          "anchor": "firstWorkflow-2-step-1-create-a-draft-definition",
          "level": 2
        },
        {
          "text": "Step 2: understand the nodes",
          "anchor": "firstWorkflow-3-step-2-understand-the-nodes",
          "level": 2
        },
        {
          "text": "Step 3: connect the nodes",
          "anchor": "firstWorkflow-4-step-3-connect-the-nodes",
          "level": 2
        },
        {
          "text": "Step 4: save, validate, publish",
          "anchor": "firstWorkflow-5-step-4-save-validate-publish",
          "level": 2
        },
        {
          "text": "Common beginner mistakes",
          "anchor": "firstWorkflow-6-common-beginner-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide is for someone opening Nodics for the first time. The goal is not to teach every automation feature at once. The goal is to help you create one small workflow, understand why each step exists, and know where to look when something does not validate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What you are building",
          "anchor": "firstWorkflow-1-what-you-are-building"
        },
        {
          "kind": "paragraph",
          "text": "You will build a simple content approval process:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START\"] --> Review[\"TASK: Review content\"]\n  Review --> Decision[\"DECISION: Approved?\"]\n  Decision -->|approved=true| Notify[\"ACTION: nodics.process.noop\"]\n  Decision -->|default| End[\"END\"]\n  Notify --> Timer[\"TIMER: audit pause\"]\n  Timer --> Child[\"SUB_PROCESS: optional governance\"]\n  Child --> End"
        },
        {
          "kind": "paragraph",
          "text": "The workflow is intentionally small, but it introduces the same building blocks used by larger commerce, telco, logistics, onboarding, support, and publishing processes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 1: create a draft definition",
          "anchor": "firstWorkflow-2-step-1-create-a-draft-definition"
        },
        {
          "kind": "paragraph",
          "text": "In Axis, open Business Process & Automation, then open Workflows or Designer. Create a beginner-safe process draft. Give it a stable code such as `contentApproval`."
        },
        {
          "kind": "paragraph",
          "text": "Stable code matters because integrations, audit events, tests, and customer extensions refer to codes. Display names can change; codes should not change casually."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 2: understand the nodes",
          "anchor": "firstWorkflow-3-step-2-understand-the-nodes"
        },
        {
          "kind": "table",
          "headers": [
            "Node type",
            "Beginner meaning",
            "Runtime owner"
          ],
          "rows": [
            [
              "`START`",
              "Where the process begins.",
              "Process"
            ],
            [
              "`TASK`",
              "Human work, such as review, approval, or correction.",
              "Process"
            ],
            [
              "`DECISION`",
              "Chooses the next path using declared decision data.",
              "Process"
            ],
            [
              "`ACTION`",
              "Calls an explicitly allowed domain adapter.",
              "Process orchestrates; domain module owns business logic."
            ],
            [
              "`TIMER`",
              "Represents a wait, schedule boundary, or future SLA point.",
              "Process records intent; Cron can schedule real execution."
            ],
            [
              "`SUB_PROCESS`",
              "References another governed workflow definition.",
              "Process"
            ],
            [
              "`END`",
              "Marks the instance complete.",
              "Process"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis edits these nodes visually, but the backend validator decides whether the graph is valid."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 3: connect the nodes",
          "anchor": "firstWorkflow-4-step-3-connect-the-nodes"
        },
        {
          "kind": "paragraph",
          "text": "Every transition must have:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "a stable transition code;",
            "a source node;",
            "a target node;",
            "no transition from `END`;",
            "no transition into `START`."
          ]
        },
        {
          "kind": "paragraph",
          "text": "For a `DECISION` node, every outgoing path should either declare a condition or be marked as the default path. Example:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"decision_to_notify\",\n  \"source\": \"approvalDecision\",\n  \"target\": \"notify\",\n  \"condition\": { \"field\": \"approved\", \"equals\": true }\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 4: save, validate, publish",
          "anchor": "firstWorkflow-5-step-4-save-validate-publish"
        },
        {
          "kind": "paragraph",
          "text": "Save stores the draft graph. Validate asks nodics.process to inspect the graph. Publish creates an immutable version that can run. A running instance should always point to a published version, not a mutable draft."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant User as Business user\n  participant Axis\n  participant Process as nodics.process\n  User->>Axis: Edit graph\n  Axis->>Process: Save draft graph\n  User->>Axis: Validate\n  Axis->>Process: Validate backend contract\n  User->>Axis: Publish\n  Axis->>Process: Create immutable version"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common beginner mistakes",
          "anchor": "firstWorkflow-6-common-beginner-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Creating two `START` nodes.",
            "Forgetting an `END` node.",
            "Connecting a transition to a deleted node.",
            "Adding an `ACTION` node without a registered adapter.",
            "Putting JavaScript, URLs, or file paths inside action metadata.",
            "Expecting Axis to execute the process locally."
          ]
        },
        {
          "kind": "paragraph",
          "text": "When validation fails, fix the graph and validate again. Do not bypass the backend validator."
        }
      ],
      "searchText": "Build Your First Workflow Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples. # Build Your First Workflow\n\nThis guide is for someone opening Nodics for the first time. The goal is not to\nteach every automation feature at once. The goal is to help you create one small\nworkflow, understand why each step exists, and know where to look when something\ndoes not validate.\n\n## What you are building\n\nYou will build a simple content approval process:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Review content\"]\n  Review --> Decision[\"DECISION: Approved?\"]\n  Decision -->|approved=true| Notify[\"ACTION: nodics.process.noop\"]\n  Decision -->|default| End[\"END\"]\n  Notify --> Timer[\"TIMER: audit pause\"]\n  Timer --> Child[\"SUB_PROCESS: optional governance\"]\n  Child --> End\n```\n\nThe workflow is intentionally small, but it introduces the same building blocks\nused by larger commerce, telco, logistics, onboarding, support, and publishing\nprocesses.\n\n## Step 1: create a draft definition\n\nIn Axis, open Business Process & Automation, then open Workflows or Designer.\nCreate a beginner-safe process draft. Give it a stable code such as\n`contentApproval`.\n\nStable code matters because integrations, audit events, tests, and customer\nextensions refer to codes. Display names can change; codes should not change\ncasually.\n\n## Step 2: understand the nodes\n\n| Node type | Beginner meaning | Runtime owner |\n| --- | --- | --- |\n| `START` | Where the process begins. | Process |\n| `TASK` | Human work, such as review, approval, or correction. | Process |\n| `DECISION` | Chooses the next path using declared decision data. | Process |\n| `ACTION` | Calls an explicitly allowed domain adapter. | Process orchestrates; domain module owns business logic. |\n| `TIMER` | Represents a wait, schedule boundary, or future SLA point. | Process records intent; Cron can schedule real execution. |\n| `SUB_PROCESS` | References another governed workflow definition. | Process |\n| `END` | Marks the instance complete. | Process |\n\nAxis edits these nodes visually, but the backend validator decides whether the\ngraph is valid.\n\n## Step 3: connect the nodes\n\nEvery transition must have:\n\n- a stable transition code;\n- a source node;\n- a target node;\n- no transition from `END`;\n- no transition into `START`.\n\nFor a `DECISION` node, every outgoing path should either declare a condition or\nbe marked as the default path. Example:\n\n```json\n{\n  \"code\": \"decision_to_notify\",\n  \"source\": \"approvalDecision\",\n  \"target\": \"notify\",\n  \"condition\": { \"field\": \"approved\", \"equals\": true }\n}\n```\n\n## Step 4: save, validate, publish\n\nSave stores the draft graph. Validate asks nodics.process to inspect the graph.\nPublish creates an immutable version that can run. A running instance should\nalways point to a published version, not a mutable draft.\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis\n  participant Process as nodics.process\n  User->>Axis: Edit graph\n  Axis->>Process: Save draft graph\n  User->>Axis: Validate\n  Axis->>Process: Validate backend contract\n  User->>Axis: Publish\n  Axis->>Process: Create immutable version\n```\n\n## Common beginner mistakes\n\n- Creating two `START` nodes.\n- Forgetting an `END` node.\n- Connecting a transition to a deleted node.\n- Adding an `ACTION` node without a registered adapter.\n- Putting JavaScript, URLs, or file paths inside action metadata.\n- Expecting Axis to execute the process locally.\n\nWhen validation fails, fix the graph and validate again. Do not bypass the\nbackend validator.\n\n",
      "previous": {
        "title": "Incident, Retry, and Compensation Operations",
        "route": "/docs/framework/process/incident-recovery"
      },
      "next": {
        "title": "Build Your First Human Task Flow",
        "route": "/docs/framework/process/first-human-task"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/first-workflow.md",
        "wordCount": 465,
        "checksum": "cc53e41e5599850b814e5b4aec447962e733b598a28429e2d157e4612d915036"
      }
    },
    "active": true
  },
  "record5": {
    "code": "processDocumentationComponentfirstHumanTask",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "first-human-task",
      "title": "Build Your First Human Task Flow",
      "route": "/docs/framework/process/first-human-task",
      "section": "beginner-guides",
      "sectionTitle": "Beginner Guides",
      "audience": [
        "business-user",
        "administrator",
        "developer",
        "operator"
      ],
      "summary": "Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps.",
      "headings": [
        {
          "text": "Example business scenario",
          "anchor": "firstHumanTask-1-example-business-scenario",
          "level": 2
        },
        {
          "text": "Task fields you should understand",
          "anchor": "firstHumanTask-2-task-fields-you-should-understand",
          "level": 2
        },
        {
          "text": "How Axis should present task work",
          "anchor": "firstHumanTask-3-how-axis-should-present-task-work",
          "level": 2
        },
        {
          "text": "Developer customization",
          "anchor": "firstHumanTask-4-developer-customization",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Human tasks are the bridge between automation and people. A task tells an operator, reviewer, merchandiser, support agent, or approver what needs human attention."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example business scenario",
          "anchor": "firstHumanTask-1-example-business-scenario"
        },
        {
          "kind": "paragraph",
          "text": "A content editor changes a page. The change should not go live until someone reviews it. The process creates a task called `Review content`. The reviewer can claim it, assign it, complete it, or cancel it."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> OPEN\n  OPEN --> CLAIMED: claim\n  OPEN --> COMPLETED: complete\n  CLAIMED --> COMPLETED: complete\n  OPEN --> CANCELLED: cancel\n  CLAIMED --> CANCELLED: cancel"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Task fields you should understand",
          "anchor": "firstHumanTask-2-task-fields-you-should-understand"
        },
        {
          "kind": "table",
          "headers": [
            "Field",
            "Why it matters"
          ],
          "rows": [
            [
              "`code`",
              "Stable task identifier for audit and support."
            ],
            [
              "`instanceCode`",
              "Links the task to the running process instance."
            ],
            [
              "`nodeCode`",
              "Shows which workflow step produced the task."
            ],
            [
              "`assignee`",
              "Person, queue, or group expected to work on it."
            ],
            [
              "`status`",
              "Current state such as `OPEN`, `CLAIMED`, or `COMPLETED`."
            ],
            [
              "`dueAt`",
              "Optional SLA date for operations."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "How Axis should present task work",
          "anchor": "firstHumanTask-3-how-axis-should-present-task-work"
        },
        {
          "kind": "paragraph",
          "text": "Axis should show tasks as business work, not as raw database rows. A good task screen answers:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "What process created this task?",
            "What business object is affected?",
            "Who owns it now?",
            "What action can I take safely?",
            "What happened before this task?"
          ]
        },
        {
          "kind": "paragraph",
          "text": "The detail timeline answers the fifth question by reading Process audit events."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer customization",
          "anchor": "firstHumanTask-4-developer-customization"
        },
        {
          "kind": "paragraph",
          "text": "Customer modules can customize assignment without editing standard Process source. For example:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "route enterprise onboarding approvals to an enterprise admin queue;",
            "route product publishing approvals to merchandising;",
            "route logistics exceptions to warehouse operations;",
            "route refund approval tasks to finance."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The customization should live in the customer or domain module, not in Axis. Axis renders authorized actions; Process owns task lifecycle."
        }
      ],
      "searchText": "Build Your First Human Task Flow Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps. # Build Your First Human Task Flow\n\nHuman tasks are the bridge between automation and people. A task tells an\noperator, reviewer, merchandiser, support agent, or approver what needs human\nattention.\n\n## Example business scenario\n\nA content editor changes a page. The change should not go live until someone\nreviews it. The process creates a task called `Review content`. The reviewer can\nclaim it, assign it, complete it, or cancel it.\n\n```mermaid\nstateDiagram-v2\n  [*] --> OPEN\n  OPEN --> CLAIMED: claim\n  OPEN --> COMPLETED: complete\n  CLAIMED --> COMPLETED: complete\n  OPEN --> CANCELLED: cancel\n  CLAIMED --> CANCELLED: cancel\n```\n\n## Task fields you should understand\n\n| Field | Why it matters |\n| --- | --- |\n| `code` | Stable task identifier for audit and support. |\n| `instanceCode` | Links the task to the running process instance. |\n| `nodeCode` | Shows which workflow step produced the task. |\n| `assignee` | Person, queue, or group expected to work on it. |\n| `status` | Current state such as `OPEN`, `CLAIMED`, or `COMPLETED`. |\n| `dueAt` | Optional SLA date for operations. |\n\n## How Axis should present task work\n\nAxis should show tasks as business work, not as raw database rows. A good task\nscreen answers:\n\n1. What process created this task?\n2. What business object is affected?\n3. Who owns it now?\n4. What action can I take safely?\n5. What happened before this task?\n\nThe detail timeline answers the fifth question by reading Process audit events.\n\n## Developer customization\n\nCustomer modules can customize assignment without editing standard Process\nsource. For example:\n\n- route enterprise onboarding approvals to an enterprise admin queue;\n- route product publishing approvals to merchandising;\n- route logistics exceptions to warehouse operations;\n- route refund approval tasks to finance.\n\nThe customization should live in the customer or domain module, not in Axis.\nAxis renders authorized actions; Process owns task lifecycle.\n\n",
      "previous": {
        "title": "Build Your First Workflow",
        "route": "/docs/framework/process/first-workflow"
      },
      "next": {
        "title": "Business Value and Adoption Model",
        "route": "/docs/framework/process/business-value"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/first-human-task.md",
        "wordCount": 273,
        "checksum": "7748c786037eebb7541dad8ac3d4570bc136b41bf882dc3e6e45b27154439581"
      }
    },
    "active": true
  },
  "record6": {
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
        "title": "Build Your First Human Task Flow",
        "route": "/docs/framework/process/first-human-task"
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
  "record7": {
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
        "title": "Action Adapter Contract",
        "route": "/docs/framework/process/action-adapters"
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
  "record8": {
    "code": "processDocumentationComponentactionAdapters",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "action-adapters",
      "title": "Action Adapter Contract",
      "route": "/docs/framework/process/action-adapters",
      "section": "build-and-extend",
      "sectionTitle": "Build and Extend",
      "audience": [
        "developer",
        "architect",
        "security",
        "tester",
        "ai-tool"
      ],
      "summary": "Learn why ACTION nodes use registered declarative adapters and how customer/domain modules own business execution.",
      "headings": [
        {
          "text": "Safe default",
          "anchor": "actionAdapters-1-safe-default",
          "level": 2
        },
        {
          "text": "What is not allowed",
          "anchor": "actionAdapters-2-what-is-not-allowed",
          "level": 2
        },
        {
          "text": "Customer extension pattern",
          "anchor": "actionAdapters-3-customer-extension-pattern",
          "level": 2
        },
        {
          "text": "QA checklist",
          "anchor": "actionAdapters-4-qa-checklist",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "An `ACTION` node is where a workflow asks another capability to do something. Examples:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "ask Commerce to reserve stock;",
            "ask Profile to notify a user;",
            "ask WCMS to move content to review;",
            "ask a customer module to call a partner integration."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Process should not contain that business logic. Process should orchestrate, authorize, and audit the request."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe default",
          "anchor": "actionAdapters-1-safe-default"
        },
        {
          "kind": "paragraph",
          "text": "The framework includes one safe demo action:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"moduleName\": \"nodics.process\",\n  \"operation\": \"noop\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "This proves the runtime path without touching a real business domain."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What is not allowed",
          "anchor": "actionAdapters-2-what-is-not-allowed"
        },
        {
          "kind": "paragraph",
          "text": "Graph JSON must not contain:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "JavaScript functions;",
            "file paths;",
            "URLs as executable handlers;",
            "arbitrary script fragments;",
            "secrets or credentials."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is a security and maintainability rule. A workflow should say what domain operation is requested, not how to execute arbitrary code."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer extension pattern",
          "anchor": "actionAdapters-3-customer-extension-pattern"
        },
        {
          "kind": "paragraph",
          "text": "A customer project can register allowed adapters through configuration or a custom registry override."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'customer.commerce',\n          operation: 'reserveStock',\n          service: 'CustomerCommerceProcessAdapterService',\n          method: 'reserveStock'\n        }\n      ]\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The service implementation belongs to the customer/domain module. Process only calls it through the approved registry and records the result."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "QA checklist",
          "anchor": "actionAdapters-4-qa-checklist"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Unknown actions fail with a stable Process error.",
            "Allowed demo no-op action completes successfully.",
            "Failed actions create audit evidence.",
            "Action output is bounded and does not leak secrets.",
            "Domain modules can be tested independently from Process orchestration."
          ]
        }
      ],
      "searchText": "Action Adapter Contract Learn why ACTION nodes use registered declarative adapters and how customer/domain modules own business execution. # Action Adapter Contract\n\nAn `ACTION` node is where a workflow asks another capability to do something.\nExamples:\n\n- ask Commerce to reserve stock;\n- ask Profile to notify a user;\n- ask WCMS to move content to review;\n- ask a customer module to call a partner integration.\n\nProcess should not contain that business logic. Process should orchestrate,\nauthorize, and audit the request.\n\n## Safe default\n\nThe framework includes one safe demo action:\n\n```json\n{\n  \"moduleName\": \"nodics.process\",\n  \"operation\": \"noop\"\n}\n```\n\nThis proves the runtime path without touching a real business domain.\n\n## What is not allowed\n\nGraph JSON must not contain:\n\n- JavaScript functions;\n- file paths;\n- URLs as executable handlers;\n- arbitrary script fragments;\n- secrets or credentials.\n\nThis is a security and maintainability rule. A workflow should say what domain\noperation is requested, not how to execute arbitrary code.\n\n## Customer extension pattern\n\nA customer project can register allowed adapters through configuration or a\ncustom registry override.\n\n```js\nmodule.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'customer.commerce',\n          operation: 'reserveStock',\n          service: 'CustomerCommerceProcessAdapterService',\n          method: 'reserveStock'\n        }\n      ]\n    }\n  }\n};\n```\n\nThe service implementation belongs to the customer/domain module. Process only\ncalls it through the approved registry and records the result.\n\n## QA checklist\n\n- Unknown actions fail with a stable Process error.\n- Allowed demo no-op action completes successfully.\n- Failed actions create audit evidence.\n- Action output is bounded and does not leak secrets.\n- Domain modules can be tested independently from Process orchestration.\n\n",
      "previous": {
        "title": "Developer Customization Guide",
        "route": "/docs/framework/process/developer-customization"
      },
      "next": {
        "title": "Custom Project Extension Guide",
        "route": "/docs/framework/process/custom-project-extension"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/action-adapters.md",
        "wordCount": 222,
        "checksum": "36ba18e31a55c2da56acd63481526fd822446b8db78759e955c79ad04e4ec126"
      }
    },
    "active": true
  },
  "record9": {
    "code": "processDocumentationComponentcustomProjectExtension",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "custom-project-extension",
      "title": "Custom Project Extension Guide",
      "route": "/docs/framework/process/custom-project-extension",
      "section": "build-and-extend",
      "sectionTitle": "Build and Extend",
      "audience": [
        "developer",
        "architect",
        "operator",
        "ai-tool"
      ],
      "summary": "Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance.",
      "headings": [
        {
          "text": "Example topology",
          "anchor": "customProjectExtension-1-example-topology",
          "level": 2
        },
        {
          "text": "What belongs in a customer extension",
          "anchor": "customProjectExtension-2-what-belongs-in-a-customer-extension",
          "level": 2
        },
        {
          "text": "What should not be customized casually",
          "anchor": "customProjectExtension-3-what-should-not-be-customized-casually",
          "level": 2
        },
        {
          "text": "Documentation ownership",
          "anchor": "customProjectExtension-4-documentation-ownership",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Customer projects may customize Process behavior without renaming the functional module. A customer module can extend or override standard behavior, but Axis and BackOffice should still show the capability as Process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example topology",
          "anchor": "customProjectExtension-1-example-topology"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Server[\"customer processServer\"] --> CustomerProcess[\"customer.process overlay\"]\n  CustomerProcess --> NodicsProcess[\"nodics.process\"]\n  NodicsProcess --> NodicsCore[\"nodics.core\"]\n  Server --> NodicsCron[\"nodics.cron included in shared runtime\"]"
        },
        {
          "kind": "paragraph",
          "text": "The server can include Cron and Process together for operational simplicity, while ownership remains clear."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What belongs in a customer extension",
          "anchor": "customProjectExtension-2-what-belongs-in-a-customer-extension"
        },
        {
          "kind": "unordered-list",
          "items": [
            "custom task assignment rules;",
            "domain-specific action adapters;",
            "additional graph validation policies;",
            "extra audit metadata with safe redaction;",
            "environment-specific timer/SLA rules;",
            "customer documentation and sample workflows."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What should not be customized casually",
          "anchor": "customProjectExtension-3-what-should-not-be-customized-casually"
        },
        {
          "kind": "unordered-list",
          "items": [
            "published version immutability;",
            "permission checks;",
            "audit event creation;",
            "backend graph validation;",
            "module identity exposed to Axis."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Changing those weakens trust in the automation platform."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation ownership",
          "anchor": "customProjectExtension-4-documentation-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Framework Process docs belong in nodics.process. Customer process docs belong in the customer project module or project documentation pack. Axis only renders imported content; it should not own backend documentation data."
        }
      ],
      "searchText": "Custom Project Extension Guide Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance. # Custom Project Extension Guide\n\nCustomer projects may customize Process behavior without renaming the functional\nmodule. A customer module can extend or override standard behavior, but Axis and\nBackOffice should still show the capability as Process.\n\n## Example topology\n\n```mermaid\nflowchart TD\n  Server[\"customer processServer\"] --> CustomerProcess[\"customer.process overlay\"]\n  CustomerProcess --> NodicsProcess[\"nodics.process\"]\n  NodicsProcess --> NodicsCore[\"nodics.core\"]\n  Server --> NodicsCron[\"nodics.cron included in shared runtime\"]\n```\n\nThe server can include Cron and Process together for operational simplicity,\nwhile ownership remains clear.\n\n## What belongs in a customer extension\n\n- custom task assignment rules;\n- domain-specific action adapters;\n- additional graph validation policies;\n- extra audit metadata with safe redaction;\n- environment-specific timer/SLA rules;\n- customer documentation and sample workflows.\n\n## What should not be customized casually\n\n- published version immutability;\n- permission checks;\n- audit event creation;\n- backend graph validation;\n- module identity exposed to Axis.\n\nChanging those weakens trust in the automation platform.\n\n## Documentation ownership\n\nFramework Process docs belong in nodics.process. Customer process docs belong in\nthe customer project module or project documentation pack. Axis only renders\nimported content; it should not own backend documentation data.\n\n",
      "previous": {
        "title": "Action Adapter Contract",
        "route": "/docs/framework/process/action-adapters"
      },
      "next": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/custom-project-extension.md",
        "wordCount": 174,
        "checksum": "55dfa1aed60a6df0acff67f06c5ea2ebd37082d39dcb2693f206a31f45bc6ab9"
      }
    },
    "active": true
  },
  "record10": {
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
        "title": "Custom Project Extension Guide",
        "route": "/docs/framework/process/custom-project-extension"
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
  "record11": {
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
          "text": "Cron job handoff shape",
          "anchor": "processCronRuntime-5-cron-job-handoff-shape",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processCronRuntime-6-continue",
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
          "text": "The trigger can reference a Cron job code. It does not become the Cron job. Cron still decides when the job fires. When a Cron-owned job wants to start a process, it declares a `jobDetail.processTrigger` target. The Cron trigger pipeline then calls the Process trigger executor with a service identity, correlation id, schedule context, and job evidence. Process verifies the trigger is active, starts the workflow instance, and records audit events."
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
          "text": "Cron job handoff shape",
          "anchor": "processCronRuntime-5-cron-job-handoff-shape"
        },
        {
          "kind": "paragraph",
          "text": "A Cron job that starts a Process workflow should look declarative. It should not embed workflow logic or call arbitrary code when the intent is scheduled automation."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "{\n  code: 'dailyContentApprovalJob',\n  tenant: 'default',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        businessDateMode: 'CURRENT_DAY'\n      }\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "That shape keeps the responsibilities readable:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Cron reads the schedule and fires the job.",
            "Cron passes `cronJobCode`, tenant, schedule expression, and correlation evidence into Process.",
            "Process loads the active trigger relationship.",
            "Process starts the published workflow version.",
            "Process writes `process.trigger.execution.*` and instance audit events."
          ]
        },
        {
          "kind": "paragraph",
          "text": "If `nodics.process` is not loaded in the same runtime, the Cron job fails closed with a dependency error instead of silently pretending the automation ran."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processCronRuntime-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Runtime Instance and Task Lifecycle](runtime-lifecycle.md)",
            "[DevOps and Runtime Topology](devops-topology.md)"
          ]
        }
      ],
      "searchText": "Process and Cron Shared Runtime Clarify how processServer can include Cron while Process and Cron keep separate ownership boundaries. # Process and Cron Shared Runtime\n\nProcess and Cron can run together in one runtime server when a partner wants a\nsmaller topology. This is useful for local development, small installations, or\ncustomers who want business process automation and scheduled jobs without\nrunning many microservice processes.\n\n## The key rule\n\nShared runtime does not mean shared ownership.\n\n| Concern | Owner |\n| --- | --- |\n| Process definitions | `nodics.process` |\n| Published workflow versions | `nodics.process` |\n| Runtime instances and tasks | `nodics.process` |\n| Trigger relationship metadata | `nodics.process` |\n| Cron job definition | `nodics.cron` |\n| Scheduler firing and retries | `nodics.cron` |\n| Domain business action | Domain module |\n| UI rendering | `nodics.axis` |\n\n## Example topology\n\n```mermaid\nflowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.core\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  ProcessServer --> Cron[\"includes nodics.cron\"]\n  Process --> Trigger[\"processTrigger metadata\"]\n  Cron --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job\n```\n\nThe trigger can reference a Cron job code. It does not become the Cron job.\nCron still decides when the job fires. When a Cron-owned job wants to start a\nprocess, it declares a `jobDetail.processTrigger` target. The Cron trigger\npipeline then calls the Process trigger executor with a service identity,\ncorrelation id, schedule context, and job evidence. Process verifies the\ntrigger is active, starts the workflow instance, and records audit events.\n\n## Why this is attractive for partners\n\nPartners often start with one server for operational simplicity. Later they may\nsplit runtimes when scale, isolation, or team ownership requires it. Nodics\nshould support both without changing functional module identity.\n\nThis keeps the mental model stable:\n\n- Process console shows workflows and automation relationships.\n- Cron console shows jobs and scheduler behavior.\n- Axis can place both under \"Business Process & Automation\".\n- Backend ownership still protects maintainability.\n\n## Safe lifecycle behavior\n\nCron can be registered, activated, deactivated, and deregistered through the\nmodule registry. Process APIs should remain reachable even when Cron is\nderegistered, because Process definitions and tasks are not owned by Cron.\n\nThe local acceptance smoke proves this by exercising Process runtime first and\nthen verifying the Cron registry lifecycle.\n\n## Cron job handoff shape\n\nA Cron job that starts a Process workflow should look declarative. It should not\nembed workflow logic or call arbitrary code when the intent is scheduled\nautomation.\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  tenant: 'default',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        businessDateMode: 'CURRENT_DAY'\n      }\n    }\n  }\n}\n```\n\nThat shape keeps the responsibilities readable:\n\n- Cron reads the schedule and fires the job.\n- Cron passes `cronJobCode`, tenant, schedule expression, and correlation\n  evidence into Process.\n- Process loads the active trigger relationship.\n- Process starts the published workflow version.\n- Process writes `process.trigger.execution.*` and instance audit events.\n\nIf `nodics.process` is not loaded in the same runtime, the Cron job fails closed\nwith a dependency error instead of silently pretending the automation ran.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n- [DevOps and Runtime Topology](devops-topology.md)\n",
      "previous": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "next": {
        "title": "Scheduled Automation and Cron Triggers",
        "route": "/docs/framework/process/scheduled-automation"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/process-cron-runtime.md",
        "wordCount": 456,
        "checksum": "73260a5f7d4308e3d2b40dc751d72420053049bea0ba0e96a4179844d882071c"
      }
    },
    "active": true
  },
  "record12": {
    "code": "processDocumentationComponentscheduledAutomation",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "scheduled-automation",
      "title": "Scheduled Automation and Cron Triggers",
      "route": "/docs/framework/process/scheduled-automation",
      "section": "operate",
      "sectionTitle": "Operate",
      "audience": [
        "administrator",
        "operator",
        "developer",
        "tester"
      ],
      "summary": "Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence.",
      "headings": [
        {
          "text": "Why this split exists",
          "anchor": "scheduledAutomation-1-why-this-split-exists",
          "level": 2
        },
        {
          "text": "Trigger lifecycle",
          "anchor": "scheduledAutomation-2-trigger-lifecycle",
          "level": 2
        },
        {
          "text": "Runtime execution contract",
          "anchor": "scheduledAutomation-3-runtime-execution-contract",
          "level": 2
        },
        {
          "text": "Cron-owned job declaration",
          "anchor": "scheduledAutomation-4-cron-owned-job-declaration",
          "level": 2
        },
        {
          "text": "What business users should see in Axis",
          "anchor": "scheduledAutomation-5-what-business-users-should-see-in-axis",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Scheduled automation connects time-based execution to business workflows. Nodics keeps the ownership boundary explicit:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "nodics.process owns process definitions, trigger relationships, instances, tasks, and audit.",
            "nodics.cron owns job scheduling, firing, retry timing, and scheduler runtime."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this split exists",
          "anchor": "scheduledAutomation-1-why-this-split-exists"
        },
        {
          "kind": "paragraph",
          "text": "If Process owned Cron jobs directly, workflows would become a hidden scheduler. If Cron owned process definitions, scheduled jobs would become a hidden workflow engine. Keeping the boundary clear makes the system easier to test, operate, and customize."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Cron as nodics.cron\n  participant Process as nodics.process\n  participant Audit as Process audit\n  Cron->>Process: POST /triggers/:code/execute\n  Process->>Audit: process.trigger.execution.requested\n  Process->>Process: start published process instance\n  Process->>Audit: process.instance.started\n  Process->>Audit: process.trigger.execution.completed"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Trigger lifecycle",
          "anchor": "scheduledAutomation-2-trigger-lifecycle"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Meaning"
          ],
          "rows": [
            [
              "`DRAFT`",
              "Relationship exists but is not executable."
            ],
            [
              "`ACTIVE`",
              "Authorized scheduler can execute it."
            ],
            [
              "`PAUSED`",
              "Keep metadata but do not execute."
            ],
            [
              "`ARCHIVED`",
              "Historical relationship; cannot be updated or executed."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should make this lifecycle obvious. A business user should not need to guess why an automation did not run."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime execution contract",
          "anchor": "scheduledAutomation-3-runtime-execution-contract"
        },
        {
          "kind": "paragraph",
          "text": "The execution API requires an active trigger. The scheduler should pass a correlation or idempotency key."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/triggers/dailyContentApproval/execute\nAuthorization: Bearer <runtime-token>\ncontent-type: application/json\n\n{\n  \"correlationId\": \"cron-fire-2026-08-09T10:00:00Z\",\n  \"context\": {\n    \"source\": \"cron\",\n    \"businessDate\": \"2026-08-09\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Process starts the referenced workflow and records audit evidence. Cron remains responsible for deciding when to call this endpoint and how to retry scheduler failures."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Cron-owned job declaration",
          "anchor": "scheduledAutomation-4-cron-owned-job-declaration"
        },
        {
          "kind": "paragraph",
          "text": "When Process and Cron run together in `processServer`, a Cron job can execute a Process trigger without using a browser-only shortcut:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "{\n  code: 'dailyContentApprovalJob',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        sourceDescription: 'Daily content approval automation'\n      }\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "This declaration is intentionally small. The business process remains in Process. The schedule remains in Cron. Domain-specific work remains in the domain module that Process calls through explicit ACTION adapters."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What business users should see in Axis",
          "anchor": "scheduledAutomation-5-what-business-users-should-see-in-axis"
        },
        {
          "kind": "paragraph",
          "text": "Axis should explain two related but different records:"
        },
        {
          "kind": "table",
          "headers": [
            "Axis concept",
            "Backend owner",
            "What the user controls"
          ],
          "rows": [
            [
              "Scheduled trigger relationship",
              "`nodics.process`",
              "Which process definition is allowed to start from a schedule."
            ],
            [
              "Cron job",
              "`nodics.cron`",
              "When the schedule fires and how scheduler lifecycle is operated."
            ],
            [
              "Manual execute now",
              "`nodics.process`",
              "Test an active trigger immediately with audit evidence."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This helps a business user understand why activating a trigger relationship is not the same thing as starting a scheduler, and why a Cron job may still need to exist before real time-based automation fires."
        }
      ],
      "searchText": "Scheduled Automation and Cron Triggers Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence. # Scheduled Automation and Cron Triggers\n\nScheduled automation connects time-based execution to business workflows. Nodics\nkeeps the ownership boundary explicit:\n\n- nodics.process owns process definitions, trigger relationships, instances,\n  tasks, and audit.\n- nodics.cron owns job scheduling, firing, retry timing, and scheduler runtime.\n\n## Why this split exists\n\nIf Process owned Cron jobs directly, workflows would become a hidden scheduler.\nIf Cron owned process definitions, scheduled jobs would become a hidden workflow\nengine. Keeping the boundary clear makes the system easier to test, operate, and\ncustomize.\n\n```mermaid\nsequenceDiagram\n  participant Cron as nodics.cron\n  participant Process as nodics.process\n  participant Audit as Process audit\n  Cron->>Process: POST /triggers/:code/execute\n  Process->>Audit: process.trigger.execution.requested\n  Process->>Process: start published process instance\n  Process->>Audit: process.instance.started\n  Process->>Audit: process.trigger.execution.completed\n```\n\n## Trigger lifecycle\n\n| State | Meaning |\n| --- | --- |\n| `DRAFT` | Relationship exists but is not executable. |\n| `ACTIVE` | Authorized scheduler can execute it. |\n| `PAUSED` | Keep metadata but do not execute. |\n| `ARCHIVED` | Historical relationship; cannot be updated or executed. |\n\nAxis should make this lifecycle obvious. A business user should not need to\nguess why an automation did not run.\n\n## Runtime execution contract\n\nThe execution API requires an active trigger. The scheduler should pass a\ncorrelation or idempotency key.\n\n```http\nPOST /nodics/process/v0/triggers/dailyContentApproval/execute\nAuthorization: Bearer <runtime-token>\ncontent-type: application/json\n\n{\n  \"correlationId\": \"cron-fire-2026-08-09T10:00:00Z\",\n  \"context\": {\n    \"source\": \"cron\",\n    \"businessDate\": \"2026-08-09\"\n  }\n}\n```\n\nProcess starts the referenced workflow and records audit evidence. Cron remains\nresponsible for deciding when to call this endpoint and how to retry scheduler\nfailures.\n\n## Cron-owned job declaration\n\nWhen Process and Cron run together in `processServer`, a Cron job can execute a\nProcess trigger without using a browser-only shortcut:\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        sourceDescription: 'Daily content approval automation'\n      }\n    }\n  }\n}\n```\n\nThis declaration is intentionally small. The business process remains in\nProcess. The schedule remains in Cron. Domain-specific work remains in the\ndomain module that Process calls through explicit ACTION adapters.\n\n## What business users should see in Axis\n\nAxis should explain two related but different records:\n\n| Axis concept | Backend owner | What the user controls |\n| --- | --- | --- |\n| Scheduled trigger relationship | `nodics.process` | Which process definition is allowed to start from a schedule. |\n| Cron job | `nodics.cron` | When the schedule fires and how scheduler lifecycle is operated. |\n| Manual execute now | `nodics.process` | Test an active trigger immediately with audit evidence. |\n\nThis helps a business user understand why activating a trigger relationship is\nnot the same thing as starting a scheduler, and why a Cron job may still need to\nexist before real time-based automation fires.\n",
      "previous": {
        "title": "Process and Cron Shared Runtime",
        "route": "/docs/framework/process/process-cron-runtime"
      },
      "next": {
        "title": "Visual Workflow Designer Contract",
        "route": "/docs/framework/process/visual-designer"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/scheduled-automation.md",
        "wordCount": 419,
        "checksum": "3194cb4efc46f94d8f6a4dfda7c74e81a6e3deef21092d15bd3a595bdc8993b5"
      }
    },
    "active": true
  },
  "record13": {
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
          "text": "How a beginner should use the first designer",
          "anchor": "visualDesigner-4-how-a-beginner-should-use-the-first-designer",
          "level": 2
        },
        {
          "text": "Designer library roadmap",
          "anchor": "visualDesigner-5-designer-library-roadmap",
          "level": 2
        },
        {
          "text": "Designer acceptance",
          "anchor": "visualDesigner-6-designer-acceptance",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "visualDesigner-7-continue",
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
          "text": "How a beginner should use the first designer",
          "anchor": "visualDesigner-4-how-a-beginner-should-use-the-first-designer"
        },
        {
          "kind": "paragraph",
          "text": "The first designer is intentionally simple. It is not trying to be a complex diagramming tool on day one. It gives a business user a safe way to understand the shape of a workflow and gives a developer a safe way to prove the backend graph contract."
        },
        {
          "kind": "paragraph",
          "text": "Start with this flow:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START: request received\"] --> Review[\"TASK: business review\"]\n  Review --> End[\"END: approved or recorded\"]"
        },
        {
          "kind": "paragraph",
          "text": "Then ask these business questions before adding more nodes:"
        },
        {
          "kind": "table",
          "headers": [
            "Question",
            "Why it matters",
            "Where the answer belongs"
          ],
          "rows": [
            [
              "Who starts this process?",
              "Prevents hidden automation and duplicate cases.",
              "Process trigger metadata or domain API call."
            ],
            [
              "Who owns the human task?",
              "Makes the work queue visible.",
              "Process task assignment policy."
            ],
            [
              "What happens if the task is delayed?",
              "Defines SLA and escalation.",
              "Process policy, future timer, or Cron relationship."
            ],
            [
              "What business object is affected?",
              "Lets users connect workflow to real work.",
              "Process instance context and domain module reference."
            ],
            [
              "What evidence is required?",
              "Supports audit and compliance.",
              "Process audit event and domain audit."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "If a user cannot answer these questions, the flow is not ready for publication even if the graph is technically valid."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Designer library roadmap",
          "anchor": "visualDesigner-5-designer-library-roadmap"
        },
        {
          "kind": "paragraph",
          "text": "The first implementation uses a Nodics-native card/canvas projection because it keeps the contract easy to test. The roadmap is:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "keep the backend graph contract stable;",
            "keep Axis as the renderer/editor only;",
            "add drag/drop layout metadata after the save/validate/publish flow is stable;",
            "evaluate React Flow / xyflow as the first richer canvas implementation;",
            "add BPMN import/export only as an interoperability adapter when a customer needs it."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This sequence prevents a drawing library from becoming the workflow authority. The designer may become more attractive and interactive, but the validation, versioning, permissions, runtime execution, and audit evidence must remain in `nodics.process`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Designer acceptance",
          "anchor": "visualDesigner-6-designer-acceptance"
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
            "The same graph can be verified through API tests and fresh acceptance.",
            "Axis refresh is not required after create, save, validate, publish, trigger, task, or Cron handoff operations.",
            "A business user can explain the workflow outcome from the page without reading raw JSON.",
            "A developer can reproduce the same graph through the Process API.",
            "An operator can trace a started instance from trigger/job evidence through Process audit events."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "visualDesigner-7-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Developer Customization Guide](developer-customization.md)",
            "[Runtime Instance and Task Lifecycle](runtime-lifecycle.md)"
          ]
        }
      ],
      "searchText": "Visual Workflow Designer Contract Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer. # Visual Workflow Designer Contract\n\nThe visual workflow designer lets a business user or developer edit a process\ngraph through Axis. The important contract is that Axis is an editor, not the\nruntime authority.\n\n## Ownership model\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version\n```\n\nAxis can display nodes, edges, positions, labels, and selection state. The\nbackend validates whether the graph is executable.\n\n## MVP graph contract\n\nThe first designer contract supports:\n\n- one `START` node;\n- one or more `TASK` nodes;\n- one or more `END` nodes;\n- transitions with stable codes, source, and target;\n- optional designer metadata for browser positions.\n\n```json\n{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}\n```\n\n## What the browser may do\n\nAxis may:\n\n- render a node palette;\n- show a canvas preview;\n- let the user select nodes;\n- collect labels and basic properties;\n- send draft graph data to Process APIs;\n- show backend validation diagnostics.\n\nAxis must not:\n\n- execute process logic;\n- calculate runtime state;\n- bypass backend validation;\n- store workflow definitions in browser storage as authority;\n- create a parallel workflow registry.\n\n## How a beginner should use the first designer\n\nThe first designer is intentionally simple. It is not trying to be a complex\ndiagramming tool on day one. It gives a business user a safe way to understand\nthe shape of a workflow and gives a developer a safe way to prove the backend\ngraph contract.\n\nStart with this flow:\n\n```mermaid\nflowchart LR\n  Start[\"START: request received\"] --> Review[\"TASK: business review\"]\n  Review --> End[\"END: approved or recorded\"]\n```\n\nThen ask these business questions before adding more nodes:\n\n| Question | Why it matters | Where the answer belongs |\n| --- | --- | --- |\n| Who starts this process? | Prevents hidden automation and duplicate cases. | Process trigger metadata or domain API call. |\n| Who owns the human task? | Makes the work queue visible. | Process task assignment policy. |\n| What happens if the task is delayed? | Defines SLA and escalation. | Process policy, future timer, or Cron relationship. |\n| What business object is affected? | Lets users connect workflow to real work. | Process instance context and domain module reference. |\n| What evidence is required? | Supports audit and compliance. | Process audit event and domain audit. |\n\nIf a user cannot answer these questions, the flow is not ready for publication\neven if the graph is technically valid.\n\n## Designer library roadmap\n\nThe first implementation uses a Nodics-native card/canvas projection because it\nkeeps the contract easy to test. The roadmap is:\n\n1. keep the backend graph contract stable;\n2. keep Axis as the renderer/editor only;\n3. add drag/drop layout metadata after the save/validate/publish flow is stable;\n4. evaluate React Flow / xyflow as the first richer canvas implementation;\n5. add BPMN import/export only as an interoperability adapter when a customer\n   needs it.\n\nThis sequence prevents a drawing library from becoming the workflow authority.\nThe designer may become more attractive and interactive, but the validation,\nversioning, permissions, runtime execution, and audit evidence must remain in\n`nodics.process`.\n\n## Designer acceptance\n\nThe designer foundation is healthy when:\n\n1. A user can see START, TASK, and END nodes.\n2. A user can inspect selected node details.\n3. Saving calls the Process draft API.\n4. Validation calls the Process graph validator.\n5. Publishing remains a separate backend-owned action.\n6. The same graph can be verified through API tests and fresh acceptance.\n7. Axis refresh is not required after create, save, validate, publish, trigger,\n   task, or Cron handoff operations.\n8. A business user can explain the workflow outcome from the page without\n   reading raw JSON.\n9. A developer can reproduce the same graph through the Process API.\n10. An operator can trace a started instance from trigger/job evidence through\n    Process audit events.\n\n## Continue\n\n- [Developer Customization Guide](developer-customization.md)\n- [Runtime Instance and Task Lifecycle](runtime-lifecycle.md)\n",
      "previous": {
        "title": "Scheduled Automation and Cron Triggers",
        "route": "/docs/framework/process/scheduled-automation"
      },
      "next": {
        "title": "Process QA and Regression Guide",
        "route": "/docs/framework/process/qa-regression-guide"
      },
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/visual-designer.md",
        "wordCount": 699,
        "checksum": "6a3d5af88c91d915dec075dc6bb8f866f7afc15f202fd2426dd56e9ab6521c3e"
      }
    },
    "active": true
  },
  "record14": {
    "code": "processDocumentationComponentqaRegressionGuide",
    "typeCode": "processDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "AUTHENTICATED",
    "properties": {
      "code": "qa-regression-guide",
      "title": "Process QA and Regression Guide",
      "route": "/docs/framework/process/qa-regression-guide",
      "section": "operate",
      "sectionTitle": "Operate",
      "audience": [
        "tester",
        "developer",
        "operator",
        "ai-tool"
      ],
      "summary": "Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation.",
      "headings": [
        {
          "text": "Minimum backend regression",
          "anchor": "qaRegressionGuide-1-minimum-backend-regression",
          "level": 2
        },
        {
          "text": "Fresh database acceptance",
          "anchor": "qaRegressionGuide-2-fresh-database-acceptance",
          "level": 2
        },
        {
          "text": "Manual Axis smoke checklist",
          "anchor": "qaRegressionGuide-3-manual-axis-smoke-checklist",
          "level": 2
        },
        {
          "text": "Negative tests that matter",
          "anchor": "qaRegressionGuide-4-negative-tests-that-matter",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Process automation touches business operations, so small bugs can become noisy in production. QA must test both the happy path and the boundaries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Minimum backend regression",
          "anchor": "qaRegressionGuide-1-minimum-backend-regression"
        },
        {
          "kind": "paragraph",
          "text": "Run the Process contract suite:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "cd nodics.ai/nodics.process\nnpm test"
        },
        {
          "kind": "paragraph",
          "text": "This validates module structure, secured routes, permission catalog coverage, generated schemas, graph validation, definition lifecycle, operation inspection, runtime lifecycle, trigger execution, and action adapter blocking."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fresh database acceptance",
          "anchor": "qaRegressionGuide-2-fresh-database-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "From the reference customer project, run the fresh local acceptance when you need evidence that bootstrap, imports, module registration, Axis content, and runtime servers still cooperate:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "cd nodics.kickoff\nnpm run acceptance:local:fresh"
        },
        {
          "kind": "paragraph",
          "text": "This is heavier than unit tests, but it catches integration drift."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Manual Axis smoke checklist",
          "anchor": "qaRegressionGuide-3-manual-axis-smoke-checklist"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Login to Axis.",
            "Open Business Process & Automation.",
            "Create a sample draft.",
            "Save a graph change in Designer.",
            "Validate the draft.",
            "Publish the draft.",
            "Start an instance.",
            "Claim and complete a task.",
            "Create a scheduled trigger relationship.",
            "Activate and execute the trigger.",
            "Confirm a new instance appears.",
            "Open the timeline and verify audit evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Negative tests that matter",
          "anchor": "qaRegressionGuide-4-negative-tests-that-matter"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Unknown action adapter must fail.",
            "Paused or archived trigger must not execute.",
            "Draft definition must not start.",
            "Archived trigger must not update.",
            "User without Process permission must be denied.",
            "Axis refresh must not be required after every operation."
          ]
        },
        {
          "kind": "paragraph",
          "text": "If these fail, stop and fix the contract before adding more UI."
        }
      ],
      "searchText": "Process QA and Regression Guide Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation. # Process QA and Regression Guide\n\nProcess automation touches business operations, so small bugs can become noisy\nin production. QA must test both the happy path and the boundaries.\n\n## Minimum backend regression\n\nRun the Process contract suite:\n\n```bash\ncd nodics.ai/nodics.process\nnpm test\n```\n\nThis validates module structure, secured routes, permission catalog coverage,\ngenerated schemas, graph validation, definition lifecycle, operation inspection,\nruntime lifecycle, trigger execution, and action adapter blocking.\n\n## Fresh database acceptance\n\nFrom the reference customer project, run the fresh local acceptance when you\nneed evidence that bootstrap, imports, module registration, Axis content, and\nruntime servers still cooperate:\n\n```bash\ncd nodics.kickoff\nnpm run acceptance:local:fresh\n```\n\nThis is heavier than unit tests, but it catches integration drift.\n\n## Manual Axis smoke checklist\n\n1. Login to Axis.\n2. Open Business Process & Automation.\n3. Create a sample draft.\n4. Save a graph change in Designer.\n5. Validate the draft.\n6. Publish the draft.\n7. Start an instance.\n8. Claim and complete a task.\n9. Create a scheduled trigger relationship.\n10. Activate and execute the trigger.\n11. Confirm a new instance appears.\n12. Open the timeline and verify audit evidence.\n\n## Negative tests that matter\n\n- Unknown action adapter must fail.\n- Paused or archived trigger must not execute.\n- Draft definition must not start.\n- Archived trigger must not update.\n- User without Process permission must be denied.\n- Axis refresh must not be required after every operation.\n\nIf these fail, stop and fix the contract before adding more UI.\n\n",
      "previous": {
        "title": "Visual Workflow Designer Contract",
        "route": "/docs/framework/process/visual-designer"
      },
      "next": null,
      "source": {
        "repository": "nodics.process",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "path": "data/core/source/documentation/pages/qa-regression-guide.md",
        "wordCount": 241,
        "checksum": "ae6e70f751a410faa30df25b36ee9be4fa697af85334f2ad9416a907f9b04a6f"
      }
    },
    "active": true
  }
};
