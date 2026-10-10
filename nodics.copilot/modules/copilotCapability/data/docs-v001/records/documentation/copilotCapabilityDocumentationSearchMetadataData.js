/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecopilotimportinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecopilotImportInspection",
    "title": "Data-release Inspection in Copilot",
    "summary": "Inspect admitted nImport release catalogues, run summaries and validation-only plans without installing releases or importing media.",
    "searchText": "Data-release Inspection in Copilot Inspect admitted nImport release catalogues, run summaries and validation-only plans without installing releases or importing media. copilot import data release catalogue preflight validation",
    "keywords": [
      "copilot",
      "import",
      "data release",
      "catalogue",
      "preflight",
      "validation"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecopilotprocessinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecopilotProcessInspection",
    "title": "Process Inspection in Copilot",
    "summary": "Inspect admitted workflow definitions, versions, instances, tasks and incidents through native employee-authorized reads without executing workflow actions.",
    "searchText": "Process Inspection in Copilot Inspect admitted workflow definitions, versions, instances, tasks and incidents through native employee-authorized reads without executing workflow actions. copilot process workflow inspection tasks incidents",
    "keywords": [
      "copilot",
      "process",
      "workflow",
      "inspection",
      "tasks",
      "incidents"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record2": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecopilotrulesinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecopilotRulesInspection",
    "title": "Rules Inspection in Copilot",
    "summary": "Inspect admitted rule and score-band summaries, versions and audit metadata through native employee-authorized reads.",
    "searchText": "Rules Inspection in Copilot Inspect admitted rule and score-band summaries, versions and audit metadata through native employee-authorized reads. copilot rules inspection audit versions score-band",
    "keywords": [
      "copilot",
      "rules",
      "inspection",
      "audit",
      "versions",
      "score-band"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record3": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacopilotimportinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacopilotImportInspection",
    "title": "Data-release Inspection in Copilot",
    "summary": "Inspect admitted nImport release catalogues, run summaries and validation-only plans without installing releases or importing media.",
    "searchText": "Data-release Inspection in Copilot Inspect admitted nImport release catalogues, run summaries and validation-only plans without installing releases or importing media. # Data-release Inspection in Copilot\n\n## Purpose\n\nData-release inspection lets an authorized employee review the current nImport catalogue, recent run summaries, and validation-only plans from the Copilot conversation. It does not install a release, execute an initialization profile, upload a file, or import business records.\n\nThe feature is disabled by default. A deployment must bind one Import runtime and explicitly allow release, profile, and history data-type identities for each tenant, enterprise, and environment.\n\nBeginners can use the fixed operation and selection controls without knowing native nImport routes. Business users receive a concise view of the releases or profiles that their enterprise is allowed to inspect. Developers configure exact identities and extend only the typed adapter contract. Operators use the same bounded evidence to diagnose catalogue, validation, and run-history issues without granting conversational installation authority.\n\n## Business journey\n\n1. Open the Copilot conversation and select **Inspect data releases**.\n2. Select a catalogue, history, or validation operation.\n3. For validation, select one configured release or initialization profile.\n4. Select **Inspect**. Axis sends a typed command; it does not send a native route.\n5. Review the bounded owner response in the conversation. Validation responses always state that no import was executed.\n\nCatalogue and history lists are bounded display windows, not total counts. Items outside the configured scope are omitted without revealing their identities or count.\n\n```mermaid\nsequenceDiagram\n  actor Employee\n  participant Axis\n  participant Core as Copilot Core\n  participant Capability as Import Inspection\n  participant Import as nImport\n  Employee->>Axis: Choose catalogue, history, or validation\n  Axis->>Core: Submit fixed typed command\n  Core->>Capability: Execute without model access\n  Capability->>Capability: Check enterprise scope and grants\n  Capability->>Import: One fixed call with employee bearer\n  Import->>Import: Native tenant and permission checks\n  Import-->>Capability: Catalogue or validation-only result\n  Capability->>Capability: Recheck admission and minimize fields\n  Capability-->>Axis: Bounded recorded evidence\n```\n\n## Supported operations\n\n| Copilot operation | Native owner call | Effect |\n| --- | --- | --- |\n| `import.release.init.catalogue` | `GET /nodics/import/v0/init` | Read configured initialization releases |\n| `import.release.core.catalogue` | `GET /nodics/import/v0/core` | Read configured core releases |\n| `import.release.sample.catalogue` | `GET /nodics/import/v0/sample` | Read configured sample releases |\n| `import.profile.list` | `GET /nodics/import/v0/initialization-profiles` | Read configured initialization profiles |\n| `import.run.history` | `GET /nodics/import/v0/run/history?limit=25` | Read bounded tenant run summaries |\n| `import.release.init.validate` | `POST /nodics/import/v0/init/validate` | Validate one selected initialization release |\n| `import.release.core.validate` | `POST /nodics/import/v0/core/validate` | Validate one selected core release |\n| `import.release.sample.validate` | `POST /nodics/import/v0/sample/validate` | Validate one selected sample release |\n| `import.profile.validate` | `POST /nodics/import/v0/initialization-profiles/{profileCode}/validate` | Validate one selected profile and its ordered steps |\n\n## Configuration\n\nConfigure `copilot.capability.importInspection` through normal Nodics configuration layering. Do not edit framework defaults for a customer deployment.\n\n```js\n{\n  enabled: true,\n  connectionName: \"importRuntime\",\n  targetAuthority: { runtimeRole: \"IMPORT\" },\n  maximumRows: 25,\n  scopes: [\n    {\n      tenant: \"default\",\n      enterprise: \"exampleEnterprise\",\n      environment: \"local\",\n      initReleaseCodes: [\"foundation:init-v001\"],\n      coreReleaseCodes: [\"foundation:core-v001\"],\n      sampleReleaseCodes: [\"project:sample-v001\"],\n      profileCodes: [\"foundationSetup\"],\n      historyDataTypes: [\"init\", \"core\", \"sample\"]\n    }\n  ]\n}\n```\n\nEach exact scope must be unique. Empty or duplicate scope values, wildcard identities, unknown history data types, invalid runtime authority, or more than 100 identities in one category make the capability unavailable.\n\n## Authorization and privacy\n\nThe employee requires `copilot.data.query` plus the native permission for the selected operation:\n\n| Operation family | Native permission |\n| --- | --- |\n| Catalogue and profile list | `import.release.view` |\n| Release and profile validation | `import.release.validate` |\n| Run history | `import.history.view` |\n\nCopilot forwards the original employee bearer and enterprise header. nImport remains the release authority and rechecks its own route permissions and tenant scope. The adapter performs one transport attempt, rechecks current Copilot configuration and authorization after the owner responds, and rejects the evidence if the binding changed.\n\nThe projection excludes source paths, filesystem locations, contribution implementation details, request actors, arbitrary metadata, imported records, and unconfigured identities. Responses are limited to 25 records and 24 KB.\n\n## Why installation is not exposed\n\nCurrent nImport receipts protect each release attempt, but the public multi-release and profile install commands are not yet bound to one caller idempotency key and immutable whole-command digest. After an uncertain response, Copilot cannot safely prove which steps completed or inspect one original command result. Automatic replay could duplicate writes.\n\nTherefore these routes remain native-only:\n\n- `POST /nodics/import/v0/init/install`\n- `POST /nodics/import/v0/core/install`\n- `POST /nodics/import/v0/sample/install`\n- `POST /nodics/import/v0/initialization-profiles/{profileCode}/install`\n- `POST /nodics/import/v0/media`\n\nBefore conversational execution can be enabled, nImport must own a durable whole-command receipt that binds actor, tenant, selection, expected versions, command digest, attempt, and original result. It must support inspection without replay and represent partial completion explicitly. Media import additionally requires a reviewed media-upload binding and original-command recovery across staging, parsing, and schema writes.\n\n## Failure and recovery\n\n- A denied Copilot or native grant produces no owner evidence.\n- Invalid or foreign release/profile identities are rejected before transport.\n- Malformed owner envelopes and any validation response claiming import execution are rejected.\n- Transport failures are not retried by the inspection adapter.\n- If configuration or authority changes while the call is running, the response is discarded.\n- For native installation uncertainty, use nImport catalogue and run-history controls; do not repeat an install from Copilot.\n\n## Troubleshooting\n\n| Symptom | Likely cause | Safe response |\n| --- | --- | --- |\n| Import inspection control is unavailable | Capability is disabled or no exact enterprise scope exists | Ask an operator to verify the active configuration layer and runtime binding. |\n| A release or profile is not listed | Its identity is not included in the employee's exact scope | Review the approved scope; do not replace the identity with a wildcard. |\n| Inspection is denied | Copilot or native nImport permission is missing | Grant only the documented permission through the normal authorization owner. |\n| Evidence is discarded after a slow call | Configuration or authority changed during execution | Re-open the conversation and submit a fresh read after the change is complete. |\n| Validation reports an execution | Owner response violated the validation-only contract | Treat the response as invalid and investigate nImport before trying again. |\n| Native installation has an unknown result | No whole-command receipt is available | Inspect native history and receipts; never replay the command from Copilot. |\n\n## Verification\n\nDevelopers can run the focused backend contract tests from the framework repository:\n\n```bash\nnode --test nodics.copilot/modules/copilotCapability/test/copilotImportInspection.test.js\n```\n\nRun the focused Axis composer tests from the Axis repository:\n\n```bash\nnpx vitest run test/assistant/CopilotImportInspectionComposer.test.tsx\n```\n\nOperators should also verify the active environment with a permitted test employee: confirm that configured identities are visible, foreign identities remain absent, validation states that nothing was executed, and denied grants return no owner evidence. A local unit result verifies the adapter contract; it does not by itself prove a deployed connection, signed-in browser journey, or production authorization configuration.\n\n## Common mistakes\n\n- Enabling the capability without an exact tenant, enterprise, and environment scope.\n- Using release labels as identities instead of the configured immutable release codes.\n- Granting `copilot.data.query` but omitting the native nImport permission, or bypassing nImport authorization in a project extension.\n- Treating a bounded list as the total catalogue or inferring hidden identity counts.\n- Adding an arbitrary URL, request body, filesystem path, or wildcard to make configuration easier.\n- Presenting validation as installation, or retrying an uncertain native install through the conversation.\n- Recording source paths, request actors, raw imported records, or private metadata in conversational evidence.\n\n## Customization contract\n\nLater project or environment layers may narrow scopes, labels, row limits, and target binding. They must not introduce arbitrary URLs, paths, request bodies, wildcard release selection, provider-mediated execution, hidden background reads, or a second import authority. New Import operations require an explicit adapter declaration, bounded projection, native permission, focused tests, documentation, and recovery classification.\n",
    "keywords": [
      "copilot",
      "import",
      "data release",
      "catalogue",
      "preflight",
      "validation",
      "AI Copilot",
      "Data Import",
      "Business Operations"
    ],
    "facets": {
      "section": "ai-and-developer-tooling",
      "group": "ai-and-developer-tooling",
      "navigationDepth": 2,
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
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record4": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacopilotprocessinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacopilotProcessInspection",
    "title": "Process Inspection in Copilot",
    "summary": "Inspect admitted workflow definitions, versions, instances, tasks and incidents through native employee-authorized reads without executing workflow actions.",
    "searchText": "Process Inspection in Copilot Inspect admitted workflow definitions, versions, instances, tasks and incidents through native employee-authorized reads without executing workflow actions. # Process Inspection in Copilot\n\nCanonical owner: **nodics.copilot**. Technical adapter: **copilotCapability**. Native workflow definitions, tasks, incidents and execution remain owned by **nodics.process / workflow**. Axis renders the optional conversation controls.\n\n## Business outcome and boundaries\n\nAn employee can inspect an admitted workflow record from the conversation page: which version is published, whether an instance is waiting or failed, its task status, recent activity, and incident retry metadata. Inspection does not claim, assign, approve, reject, cancel, retry, compensate, publish or start anything. Reading a task is not permission to make its decision.\n\nThis capability is a deterministic, typed read. It does not require a model to generate an answer. Natural-language process mutations and arbitrary workflow queries are not implemented by these adapters. The operation catalogue's `IMPLEMENTED` label describes source maturity, not deployment readiness.\n\n## Prerequisites and configuration\n\n1. Compose Copilot with Capability, Policy and the normal conversation owner. Enable the existing conversation API through `copilot.api.enabled`.\n2. Compose the native Workflow owner in the intended Process runtime. Preserve its secured routes and registration/activation requirements. Reads do not bypass a native denial or unavailable route.\n3. Configure an existing named `workflow` connection through nService's normal deployment configuration. Do not put a URL or bearer token into a command.\n4. Give the employee `copilot.data.query` and the specific native permission in the table below through Profile. Existing conversation permissions also apply. No default role is broadened by this feature.\n5. In the owning deployment's normal layered `config/properties.js`, opt in to `copilot.capability.processInspection` and declare an exact scope. Never add framework functionality to customer kickoff/startup code.\n\n| Property | Default | Meaning and limits |\n| --- | --- | --- |\n| `enabled` | `false` | Explicit deployment opt-in; other permissions still apply |\n| `connectionName` | `null` | Existing named Workflow transport, not a URL |\n| `targetAuthority` | `null` | Exact `{ runtimeRole: \"PROCESS\" }` binding; no extra target fields |\n| `maximumRows` | `25` | Integer 1 through 25 displayed rows; not total matching records |\n| `scopes` | `[]` | Up to 1,000 exact tenant/enterprise/environment bindings; exactly one must match |\n| `definitionCodes` | Required per scope | Up to 100 unique native definition codes |\n| `instanceCodes` | Required per scope | Up to 100 unique native instance codes |\n| `taskCodes` | Required per scope | Up to 100 unique native task codes |\n| `incidentCodes` | Required per scope | Up to 100 unique native incident codes |\n| `triggerCodes` | Required per scope | Up to 100 unique Process trigger codes; Cron jobs remain separate |\n| `presentation` | Framework labels | Inert title, field labels, buttons, failure text and fixed-operation labels |\n\nAll five code arrays must exist. `[]` admits none of that record kind. There is no wildcard, prefix, inherited all-records fallback or model-selected scope. Codes use letters, digits, dot, underscore and hyphen, start with a letter or digit, and are at most 128 characters. The environment must match Copilot's effective security context, not an assumed directory name.\n\nExample deployment delta, using synthetic identities:\n\n```javascript\nmodule.exports = {\n  copilot: {\n    capability: {\n      processInspection: {\n        enabled: true,\n        connectionName: 'process',\n        targetAuthority: { runtimeRole: 'PROCESS' },\n        scopes: {\n          $config: 'replace',\n          value: [{\n            tenant: 'default',\n            enterprise: 'example-enterprise',\n            environment: 'local',\n            definitionCodes: ['example-onboarding'],\n            instanceCodes: ['example-onboarding-001'],\n            taskCodes: [],\n            incidentCodes: [],\n            triggerCodes: [],\n          }],\n        },\n      },\n    },\n  },\n};\n```\n\nReplace only actual deployment differences. Use nConfig's explicit replacement for collections when replacing a prior scope list; a shorter ordinary array must not accidentally retain prior entries. This does not grant native access or create records. Credentials remain with the original authenticated employee.\n\n## Step-by-step employee journey\n\nFor beginners, start with **Definition summary** for a code supplied by your administrator. A definition is the workflow design; an instance is one execution of a published version; a task is a human step; an incident records a failure. Business users should inspect these states before requesting an operational decision. The configuration steps above are for the administrator or operator, not values a business user must enter in each conversation.\n\n1. Sign in to Axis under the intended enterprise.\n2. Open **AI > Conversation**, separately from the Workspace dashboard.\n3. Open **Inspect Process**. The button is present only when the backend supplies valid nonempty choices for this context. Missing choices do not mean no native workflow records exist.\n4. Choose an operation. List operations use the configured allowlist directly; record operations show only configured codes admitted for that operation and employee permission.\n5. For a record operation, select the record, then choose **Inspect**. A list operation has no record selector. Opening the form or changing a selection performs no read. Changing operation clears the record selection.\n6. Read the returned metadata and observation time. A bounded activity/task list is not a global inventory or total count. No action has been approved or run.\n7. To see a later state, explicitly request a fresh inspection. Re-delivery of the same accepted conversation turn does not cause another owner request.\n\nIf the employee becomes offline, the form refuses submission; it does not queue the read for an eventual reconnect. The conversation controller owns transport failures and uncertain turn delivery. Closing the dialog discards its selection. Reloaded owner context discards stale choices.\n\n```mermaid\nsequenceDiagram\n    participant Employee\n    participant Axis\n    participant Copilot\n    participant ProfilePolicy\n    participant Workflow\n    Employee->>Axis: Select operation and admitted record\n    Axis->>Copilot: Typed inspection in normal conversation turn\n    Copilot->>ProfilePolicy: Current employee grant and exact scope check\n    Copilot->>Workflow: One fixed GET with original employee bearer\n    Workflow-->>Copilot: Native authorized record or denial\n    Copilot->>ProfilePolicy: Recheck current scope and target\n    Copilot->>Copilot: Validate every identity and minimize scalar fields\n    Copilot-->>Axis: Deterministic metadata, excluded from provider history\n    Axis-->>Employee: Current bounded inspection result\n```\n\n## Operation and native API contracts\n\nEvery row also requires `copilot.data.query`. The table's paths are native API suffixes; the browser cannot submit them as executable input.\n\n| Operation | Native permission | Workflow GET suffix | Configured identity |\n| --- | --- | --- | --- |\n| `process.definition.list` | `process.definition.read` | `/definitions` | Filtered to `definitionCodes` |\n| `process.definition.inspect` | `process.definition.read` | `/definitions/:code` | `definitionCodes` |\n| `process.definition.versions` | `process.definition.read` | `/definitions/:code/versions` | `definitionCodes` |\n| `process.instance.list` | `process.backoffice.view` | `/instances` | Filtered to `instanceCodes` |\n| `process.instance.inspect` | `process.backoffice.view` | `/instances/:code` | `instanceCodes` |\n| `process.instance.detail` | `process.backoffice.view` | `/instances/:code/detail` | `instanceCodes` |\n| `process.instance.tasks` | `process.backoffice.view` | `/tasks?limit=25&instanceCode=:code` | `instanceCodes` |\n| `process.instance.activity` | `process.backoffice.view` | `/audit-events?limit=25&instanceCode=:code` | `instanceCodes` |\n| `process.instance.incidents` | `process.incident.read` | `/incidents?limit=25&instanceCode=:code` | `instanceCodes` |\n| `process.task.inspect` | `process.backoffice.view` | `/tasks/:code` | `taskCodes` |\n| `process.incident.inspect` | `process.incident.read` | `/incidents/:code` | `incidentCodes` |\n| `process.trigger.list` | `process.trigger.read` | `/triggers` | Filtered to `triggerCodes` |\n\nExample equivalent typed conversation input:\n\n```json\n{\"intent\":\"copilot.process.inspect\",\"operation\":\"process.instance.tasks\",\"code\":\"example-onboarding-001\"}\n```\n\nRecord commands accept only these three fields. Extra permissions, environment, fields, URLs, methods or authority data are rejected. Fixed API version is `v0`; native transport permits one attempt and never substitutes an internal service token.\n\nList commands contain only `intent` and `operation`, for example:\n\n```json\n{\"intent\":\"copilot.process.inspect\",\"operation\":\"process.definition.list\"}\n```\n\nThey still require a nonempty configured code allowlist. Copilot removes unselected owner rows without revealing their content or count.\n\n## Data handling and recording\n\nDefinition/version output includes scalar identity, status and revision/version metadata. Instance output includes status, node, incident/failure codes and times. Instance detail combines the same minimized instance fields with bounded tasks and activity; it still excludes decisions, actors and execution context. Trigger lists expose bounded Process trigger metadata, never Cron job authority. Tasks expose code, scalar name, instance/node, status and due date. Incidents expose code, instance/definition/node, status, error code, attempt counts and retry time. Activity exposes instance/definition, event type, outcome and event time.\n\nGraphs, execution context, actor/assignee identities, decisions, review contexts, compensation adapters, private receipts and arbitrary metadata are omitted. Localized name objects are omitted rather than selecting an arbitrary locale. Every returned row must belong to the requested native identity, including rows beyond the display limit. Failed envelopes and malformed scalar values reject the whole result. At most 200 native rows are accepted; the serialized projection is also capped at 24,000 bytes by removing display rows, never by exposing raw data.\n\nBoth the typed command and its answer are excluded from future provider context. Existing conversation recording controls govern transcript persistence; recording off retains request-only content under that owner's policy. Required security and execution evidence is not reclassified as optional transcript content. No model usage is billed for these deterministic reads.\n\nThe post-read recheck compares effective Copilot configuration and the trusted request identity/headers. It is not an additional live Profile token introspection. Native credential admission occurs at the secured owner API.\n\n## Failure and recovery\n\n| Symptom or code | Meaning | Safe next action |\n| --- | --- | --- |\n| Button absent | No valid admitted choices in current context | Check scope, deployment selection and specific grants; do not infer record existence |\n| `ERR_CPT_00005` | Invalid typed command | Use a listed operation and exact admitted code |\n| `ERR_CPT_00006` | Missing permission or exact scope | Have the owner review actual employee access; confirmation cannot fix it |\n| `ERR_CPT_00007` | Native denial/failure, wrong envelope/identity or invalid data | Diagnose through the native owner; do not retry through a model or alternate URL |\n| `ERR_CPT_00008` | Identity, target or admission changed during the read | Reload context and explicitly request a fresh inspection |\n| Empty bounded list | The native response contained no rows for this filter | Inspect the correct instance; not proof of no records elsewhere |\n| Failed instance or open incident | Reported native state only | Use the authorized native Process recovery journey; inspection does not retry or compensate |\n\n## Customize and extend safely\n\nFor presentation, override only selected labels in a later project's existing `modules/<owned-module>/config/properties.js`, for example `copilot.capability.processInspection.presentation.title`. Keep the six required labels bounded and nonempty, and retain fixed operation identities. No HTML, JavaScript, URL, permission or route can be supplied through presentation.\n\nFor policy, reduce `maximumRows`, remove admitted codes, or replace the exact scope array through nConfig. Test empty arrays and foreign enterprise/environment denial. Do not copy framework defaults wholesale into an environment or customer module.\n\nFor a reviewed framework enhancement, add a native read contract in `copilotCapability/src/service/defaultCopilotProcessInspectionService.js` only after validating its native owner, input, permissions and minimal projection. Its mergeable methods remain later-layer customization points. A new mutation must use governed preparation/approval/execution and cannot be added here as a GET. Preserve family-specific Axis validation in `copilotInspectionContract.ts` and the shared `CopilotInspectionComposer`; do not add a second frontend registry.\n\nDevelopers should test their effective later-layer implementation, not just the framework defaults. A customized projection must retain the identity check for every native row and the independent native permission for its operation.\n\n## Common mistakes\n\n- Enabling inspection without a matching named native connection leaves it unavailable; a browser endpoint is not a replacement.\n- Omitting a code array makes the scope invalid. Use an explicit empty array when that kind of record should not be inspectable.\n- Selecting an instance does not admit every task by standalone task code. Instance task lists remain bound to their admitted instance; a standalone task inspection separately requires membership in `taskCodes`.\n- Treating an incident's retry count as permission to retry bypasses the native decision boundary. Inspection performs no recovery command.\n- Sending old answer text back to a model can reintroduce protected history. The standard turn path excludes both sides of these inspections from prompts.\n- Passing raw database `limit` from a native generated-service customization can lose the requested bound. Preserve Workflow's `pageSize`/`pageNumber` contract.\n\n## Signed-in application verification\n\nThe actual Axis application was also tested against an owned five-runtime composition: Platform/Profile/Copilot, Process, Rules, WCMS Staged and WCMS Online. Normal Axis initialization, CMS publication, human Process approval and module activation were completed before sign-in; readiness was not mocked.\n\nThe operator selected **Inspect Process > Instance tasks > acceptance_instance** and explicitly submitted. The answer contained the real `acceptance_task` in `OPEN` state, without private context. A Rules summary was read in the same conversation. After restarting Copilot and reloading Axis, selecting the saved conversation restored both original answers. At 390 pixels, document and viewport widths matched. The successful run had no browser console errors or warnings.\n\nThe restricted reader saw neither inspector nor the operator's history. Pasting the same typed Process command into the ordinary composer returned a native-backed Copilot authorization refusal, not data. Final native inspection confirmed task `OPEN`, instance `WAITING` and rule `DRAFT`, unchanged. All disposable runtimes, databases and temporary frontend resources were closed after testing.\n\n![Actual signed-in Process result in the Axis application](media:nodicsDocsImage_14f712cef83c1ef616fb9972)\n\n![Actual mobile Process form after backend restart](media:nodicsDocsImage_8c3f0c8c18648d2b0766aa96)\n\n![Restricted employee refused a manually submitted Process command](media:nodicsDocsImage_5a684b97630b13347333e728)\n\nFor a maintainer reproducing full-application acceptance, the existing `copilotKnowledge/test/helpers/runtimeAcceptance/runtimeSession.js` supports `NODICS_COPILOT_PROCESS_INSPECTION_ACCEPTANCE=1` and `NODICS_COPILOT_RULES_INSPECTION_ACCEPTANCE=1`, together with its runtime, registration, Axis and persistent-acceptance opt-ins. The session returns a private temporary manifest; keep its password out of logs and documentation. Use the adjacent `initializeAxis.js` helper for governed baseline setup, seed the native records through employee APIs as in the native test below, and point a separately owned Axis dev server at that fixture using environment overrides. Use `http://127.0.0.1:3102`, its admitted CORS origin, not shared runtime edits. Send `restart` on session stdin for persistence verification and `close` for owned cleanup; shut down only the frontend server started for this test.\n\nThis earlier browser evidence covers the two explicit read journeys above, not every operation, natural-language intent planning, reference-runtime deployment or Process mutation. The updated native suite separately covers all twelve fixed reads; the three list operations and instance detail still require refreshed signed-in visual evidence.\n\n## Verification: component and native tests\n\nThe captures below show the actual shared Axis component with synthetic Process choices at 1280 by 720 and 390 by 844 pixels. They verify the form's layout and typed submission, not an authenticated Process request or full signed-in route.\n\n![Synthetic Process inspection form at desktop width](media:nodicsDocsImage_8ca6274851ef29f4c573b856)\n\n![Synthetic Process inspection form at mobile width](media:nodicsDocsImage_fe40e522f93fcbbfd3919f60)\n\nFocused backend tests exercise all twelve operations, original headers, grant/scope/code denial before transport, immutable binding drift, malformed envelopes, foreign rows beyond display limits, recording on/off and turn replay. The native fixture creates published Workflow definitions, a real human task and an incident caused by a callback lacking completed approval evidence. It reads their actual persisted state, checks unchanged owner records and restarts Copilot. Local Ollama availability is checked; inspection intentionally makes zero model calls. No fixture claims a task or performs a domain publication callback.\n\nRun from the framework checkout:\n\n```bash\nnode --test nodics.copilot/modules/copilotCapability/test/copilotProcessInspection.test.js\nnode --test nodics.process/modules/workflow/test/processInspectionPagination.test.js\nNODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \\\nNODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \\\nNODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \\\nnode --test nodics.copilot/modules/copilotCapability/test/copilotProcessInspectionRuntime.live.test.js\n```\n\nProvider coordinates above describe the supported disposable local test profile, not application defaults. The fixture cleans only its owned resources. Axis's `CopilotProcessInspectionComposer.test.tsx` covers explicit selection, exact typed submission, family isolation, stale choice clearing and offline refusal. Re-run Rules composer tests when changing shared rendering.\n\nThis is source implementation, private native acceptance and the scoped signed-in evidence above, not activation in every reference runtime, published documentation or complete Copilot coverage of all workflow mutations.\n",
    "keywords": [
      "copilot",
      "process",
      "workflow",
      "inspection",
      "tasks",
      "incidents",
      "AI Copilot",
      "Process",
      "Business Operations"
    ],
    "facets": {
      "section": "ai-and-developer-tooling",
      "group": "ai-and-developer-tooling",
      "navigationDepth": 2,
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
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record5": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacopilotrulesinspection",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacopilotRulesInspection",
    "title": "Rules Inspection in Copilot",
    "summary": "Inspect admitted rule and score-band summaries, versions and audit metadata through native employee-authorized reads.",
    "searchText": "Rules Inspection in Copilot Inspect admitted rule and score-band summaries, versions and audit metadata through native employee-authorized reads. # Rules Inspection in Copilot\n\nCanonical functional owner: `nodics.copilot`. Technical coordinator: `copilotCapability`. Rules API owns authorization and business records; Rules Definition owns persistence. Core owns conversation admission and delivery. Axis presents only the current allowed choices. This feature never evaluates, simulates, edits, approves or publishes a policy.\n\nBeginners and business users should follow **Inspect a rule** after an administrator completes setup. Operators own native availability and failure investigation. Developers should read **Customize and extend safely** before changing bindings or adding an operation.\n\n## Supported operations\n\n| Choice | Native GET path under the Rules connection | Additional employee permission |\n| --- | --- | --- |\n| Rule definitions | `/definitions` | `rules.definition.read` |\n| Rule summary | `/definitions/:code` | `rules.definition.read` |\n| Rule versions | `/definitions/:code/versions` | `rules.definition.read` |\n| Rule activity | `/definitions/:code/audit` | `rules.definition.audit` |\n| Score-band sets | `/band-sets` | `rules.band.read` |\n| Score-band summary | `/band-sets/:code` | `rules.band.read` |\n| Score-band versions | `/band-sets/:code/versions` | `rules.band.read` |\n| Property catalogue | `/property-catalogues/:code` | `rules.definition.read` |\n\nEvery inspection also requires `copilot.data.query`, normal conversation/API admission, an authenticated employee and an exact configured tenant, enterprise and environment binding. Native Rules routes independently authorize the original employee. Viewing a choice is not an execution grant.\n\nVersions and activity are bounded native responses, not collection totals. A new draft can legitimately have no published versions. Inspection does not prove that a rule is valid, published, effective or used in a particular customer journey. Native simulation writes simulation/audit state and is therefore not included as a read operation.\n\n## Administrator setup\n\n1. Deploy the normal Rules owners and configure their named module connection using existing runtime configuration. The transport resolves the module's actual URL prefix; the browser does not supply an endpoint.\n2. Confirm the intended employee can use the corresponding native Rules read. Assign permissions through Profile. Do not add wildcard grants or use a runtime service credential as the employee.\n3. Decide which exact rule, band and property-provider codes this enterprise can inspect. A code allowed for one enterprise is not implicitly allowed for another. All three arrays must be present, can be empty, and contain at most 100 unique codes each.\n4. In the project's existing configuration layer, override the default-disabled settings. The following is a configuration example, not a new runtime:\n\n```js\n   module.exports = {\n     copilot: {\n       capability: {\n         rulesInspection: {\n           enabled: true,\n           connectionName: \"rules-owner\",\n           targetAuthority: { runtimeRole: \"RULES\" },\n           maximumRows: 25,\n           scopes: [{\n             tenant: \"default\",\n             enterprise: \"example-enterprise\",\n             environment: \"local\",\n             ruleCodes: [\"reward-policy\"],\n             bandCodes: [\"reward-bands\"],\n             propertyProviderCodes: [\"eWaste.reward\"],\n           }],\n         },\n       },\n     },\n   };\n```\n\n1. Use the actual deployed runtime role, named connection and trusted Copilot environment. The binding above works only if those values exist. No wildcard scopes, duplicate matching bindings, URLs or additional target-authority fields are accepted. `maximumRows` must be an integer from 1 through 25.\n2. Reload the conversation context after applying configuration. Confirm the employee sees only permitted operations and admitted codes. Test a denied actor and an unadmitted code before enabling a wider set.\n\nThe scope binding is an additional Copilot restriction, not an alternate Rules permission system. It cannot grant native access. No Kickoff startup code or customer-specific adapter is needed.\n\n## Inspect a rule\n\n1. Open the separate Copilot conversation page for the intended enterprise.\n2. Select **Inspect Rules**. Opening this form makes no Rules read.\n3. Select an operation, such as **Rule activity**. List operations use the configured allowlist and do not show a record selector.\n4. For a record or property-catalogue operation, select a definition/provider from the allowed choices. Changing operation clears the previous selection. There is no free-form endpoint or arbitrary code field.\n5. Select **Inspect** once. Axis submits a typed command through the ordinary conversation controller. Offline submission is refused, never queued.\n6. Read the metadata response in the conversation. It shows the requested code, operation, observation time, coverage and returned records. An explicit `omittedForDisplay` count identifies rows removed by the display limit.\n7. To request another current observation, explicitly submit another inspection. Replaying the same accepted turn does not issue a second native read. Restored conversation history is historical evidence, not a fresh Rules query.\n\nThe typed command for technical callers is:\n\n```json\n{\n  \"intent\": \"copilot.rules.inspect\",\n  \"operation\": \"rules.definition.audit\",\n  \"code\": \"reward-policy\"\n}\n```\n\nRecord commands accept only these three fields. A tenant, enterprise, endpoint, HTTP method or handler in the command causes rejection. Unknown operations cannot fall through into model-selected API execution.\n\nList commands omit `code`, for example:\n\n```json\n{\"intent\":\"copilot.rules.inspect\",\"operation\":\"rules.definition.list\"}\n```\n\nThe native list is filtered to configured codes without exposing excluded rows or their count. Property catalogue output retains bounded property names, data types, allowed operators and scalar allowed values; provider implementation, resolvers and arbitrary nested metadata are excluded.\n\n## Owner flow\n\nThe following captures show the actual Axis component with synthetic choices, at desktop and 390-pixel mobile width. They verify form layout, selection and typed command composition, not a signed-in Rules journey.\n\n![Synthetic Rules inspection form at desktop width](media:nodicsDocsImage_2488b2e141953db92d3a295b)\n\n![Synthetic Rules inspection form at mobile width](media:nodicsDocsImage_2d65b3c0efc982f8d5281043)\n\n```mermaid\nsequenceDiagram\n    actor Employee\n    participant Axis\n    participant Core as Copilot Core\n    participant Capability as Rules Inspection\n    participant Rules as Native Rules API\n    Employee->>Axis: Select operation and admitted code\n    Axis->>Core: Submit typed conversation turn\n    Core->>Core: Accept once and exclude provider context\n    Core->>Capability: Execute with original request\n    Capability->>Capability: Check current scope and permissions\n    Capability->>Rules: One fixed GET with employee bearer\n    Rules->>Rules: Native route and record authorization\n    Rules-->>Capability: Owner envelope\n    Capability->>Capability: Recheck admission and project bounded scalars\n    Capability-->>Core: Inert metadata response\n    Core-->>Axis: Recorded or request-only delivery\n```\n\nThere is no LLM call in this flow. Both request and response are excluded from subsequent provider history. Rule graphs, band definitions, arbitrary metadata, audit actor identities, reasons and credentials are not included in the response projection. Audit output contains only the rule reference, event type, outcome, version, draft revision and creation time. Other responses contain explicitly allowed summary/version metadata. Owner errors are replaced with a stable generic error, not exposed with native URLs or secrets.\n\nConversation recording follows the existing recording configuration. With recording enabled, authorized transcript administrators can inspect retained content through the existing transcript owner. With recording disabled, content is delivered only for the current request and is not reconstructable from history. Turn lifecycle metadata still exists. This feature does not create a separate read-audit database or override retention policy.\n\n## Failure and recovery\n\n| Symptom | Meaning | Action |\n| --- | --- | --- |\n| No Inspect Rules control | Disabled, no matching scope, insufficient grants, empty code lists or unavailable context | Administrator checks effective settings and native access; refresh context |\n| Desired code absent | Code not admitted for that operation and scope | Request an administrator review; do not use another enterprise's binding |\n| `ERR_CPT_00001` | Invalid typed command | Correct only the operation/code; remove extra fields |\n| `ERR_CPT_00002` | Current user/scope/configuration refused | Recheck grants and effective binding; no automatic retry |\n| `ERR_CPT_00003` | Native transport or envelope could not establish valid evidence | Inspect owner health and native operation; do not treat an empty/error result as success |\n| `ERR_CPT_00004` | Identity or routing changed while reading | Obtain a new context and explicitly request a fresh read |\n| No versions | Native bounded result may be empty for an unpublished draft | Check the normal Rules lifecycle; inspection does not publish |\n| Recording-off response lost | Transient answer was not retained | A new explicit read is possible; the original content cannot be recovered |\n\nAdmission is rechecked after the native response against effective settings and the current trusted request. Changes visible there prevent delivery; this is not a second Profile token introspection. Wrong rule identities, malformed scalar fields and failed envelopes are refused, including mismatched rows beyond the display limit. No original credential, connection routing or native definition graph is placed in browser context metadata.\n\n## Customize and extend safely\n\nUse the project's existing layered `config/properties.js` or configured external properties file. For example, narrow `maximumRows` to 5 and replace one scope's `ruleCodes` with the two policies this enterprise operates. Keep all three code arrays and the exact tenant/enterprise/environment triple. Duplicate matching bindings are configuration errors, not union rules. Permissions remain Profile-owned.\n\nPresentation strings are configurable under `copilot.capability.rulesInspection.presentation`: `title`, `operation`, `code`, `submit`, `cancel`, `failure`, and `operations` labels keyed by the eight fixed operation codes. Keep all fields present and use short business labels. This customization changes wording, not the command vocabulary or permission rules.\n\nFor a new native read, extend the framework-owned operation contract and scalar projection with matching owner authorization, route evidence and denial tests. Extend the Axis typed parser only for that reviewed code. Do not configure URLs, service names or arbitrary methods as operations. Mutations must use the existing governed preparation/approval/execution architecture and native receipt contract; they cannot be added to this GET-only path.\n\nVerify changes with `copilotRulesInspection.test.js`, the recording/history regressions, Axis `CopilotRulesInspectionComposer.test.tsx`, and the opt-in native suite `copilotRulesInspectionRuntime.live.test.js`. The latter creates only disposable unpublished drafts, reads all eight paths and checks native denial, no model usage and restart persistence. Empty draft-version responses do not qualify published-version lifecycle behavior. Unit tests cover nonempty bounded version projection. Component screenshots, where present, are synthetic UI evidence, not signed-in Rules authorization or production acceptance.\n\n## Common mistakes\n\n- Treating a visible operation as permission to execute it. Both Copilot and native Rules check the current employee again when the request runs.\n- Sharing a wildcard code list between enterprises. Bind exact admitted codes to one tenant/enterprise/environment triple and test negative access.\n- Treating a draft summary or empty version list as publication evidence. Use the native lifecycle for validation, approval and publication.\n- Asking the LLM to interpret raw rule graphs from this tool. This metadata-only path excludes graphs and never invokes a model.\n- Retrying a lost recorded turn under another identity. Reopen only owned history; use a new explicit read when a current observation is needed.\n\n## Verification\n\nFull signed-in Axis acceptance also covers **Inspect Rules > Rule summary > acceptance_rule** in an owned five-runtime composition. The actual native DRAFT summary was returned through the conversation lifecycle, persisted after a Copilot backend restart and restored from history on a 390-pixel viewport. The restricted employee saw no Rules inspector and no operator conversation. Native inspection confirmed the rule remained DRAFT. Browser console checks on the successful journey had no warnings/errors; disposable resources were closed. This is one qualified browser read journey, not published-version lifecycle, all Rules operations or reference-runtime deployment.\n\n![Actual signed-in Rules result in Axis](media:nodicsDocsImage_fbcc50b88a0785c0d739e15a)\n\n![Recorded inspection restored on mobile after backend restart](media:nodicsDocsImage_13e7608ae078c2a9626c48f9)\n\nSee [Process inspection](/docs/framework/copilot/process-inspection#signed-in-application-verification) for the shared browser acceptance setup and test-session switches.\n\nFrom the framework root, with the existing local Mongo replica set and owned Elasticsearch fixture available:\n\n```sh\nenv NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \\\n  NODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \\\n  NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \\\n  node --test nodics.copilot/modules/copilotCapability/test/copilotRulesInspectionRuntime.live.test.js\n```\n\nUse the provider paths appropriate to the machine. The test manages private databases, ports and runtime processes and closes only its owned resources. It does not alter shared runtimes, production records or customer startup files.\n",
    "keywords": [
      "copilot",
      "rules",
      "inspection",
      "audit",
      "versions",
      "score-band",
      "AI Copilot",
      "Rules Engine",
      "Business Operations"
    ],
    "facets": {
      "section": "ai-and-developer-tooling",
      "group": "ai-and-developer-tooling",
      "navigationDepth": 2,
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
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
