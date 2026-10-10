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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageengagementcontactsubmissionoperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageengagementContactSubmissionOperations",
    "title": "Contact Submission Operations",
    "summary": "How contact forms, submissions, validation, moderation, workflow routing, notifications, retention, audit, and recovery work.",
    "searchText": "Contact Submission Operations How contact forms, submissions, validation, moderation, workflow routing, notifications, retention, audit, and recovery work. contact-submission engagement moderation workflow notification",
    "keywords": [
      "contact-submission",
      "engagement",
      "moderation",
      "workflow",
      "notification"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadataengagementcontactsubmissionoperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataengagementContactSubmissionOperations",
    "title": "Contact Submission Operations",
    "summary": "How contact forms, submissions, validation, moderation, workflow routing, notifications, retention, audit, and recovery work.",
    "searchText": "Contact Submission Operations How contact forms, submissions, validation, moderation, workflow routing, notifications, retention, audit, and recovery work. # Contact Submission Operations\n\nContact Submission lets public or authenticated users send business enquiries that can be reviewed, moderated, routed, and answered. Engagement owns the submission lifecycle. Communication providers may send notifications, Process may run workflows, and Axis may show moderation queues, but those consumers do not own the submitted content. For beginners, a contact form creates a governed record that needs safety, routing, and audit.\n\n## Source map\n\n| Owner operation | Framework source |\n| --- | --- |\n| Intake and form lookup | `nodics.engagement/modules/contactSubmission/src/service/defaultContactSubmissionOperationService.js`, `defaultContactValidationService.js`, `defaultContactFormQueryService.js` in that service directory. |\n| Form/version and shared intake schemas | `nodics.engagement/modules/engagementCore/src/schemas/schemas.js`; Core intake/protection remain the shared submission authority. |\n| Contact lifecycle/routing | `nodics.engagement/modules/contactSubmission/src/service/defaultContactRoutingService.js`, `defaultContactOperatorService.js`; `src/schemas/schemas.js` under that owner. |\n| Handoff dispatch/recovery | `nodics.engagement/modules/contactSubmission/src/service/defaultContactHandoffDispatchService.js`, `defaultContactHandoffRecoveryService.js`, `defaultContactHandoffRepositoryService.js` in that directory. |\n| Public / authorized API projection | `nodics.engagement/modules/engagementApi/src/router/routers.js`, `src/facade/defaultEngagementApiFacade.js`; allow-lists are in `nodics.engagement/modules/engagementApi/config/properties.js`. |\n\n## Lifecycle\n\n```mermaid\nflowchart TD\n  Intake[\"Enabled Contact + Core validation/protection/dedupe\"] --> Guest[\"Guest: VERIFICATION_PENDING / verification PENDING\"]\n  Intake --> Owner[\"Authenticated or verification not required: OPEN\"]\n  Owner --> Work[\"IN_PROGRESS / WAITING_CUSTOMER / WAITING_INTERNAL\"]\n  Work --> Resolved[\"RESOLVED / CLOSED\"]\n  Intake --> Handoff[\"Separate PROCESS handoff: PENDING / RETRY_PENDING / IN_PROGRESS\"]\n  Handoff --> Evidence[\"SUCCEEDED / DEAD_LETTER / RECONCILED\"]\n  Work --> Moderation[\"SPAM / DUPLICATE; governed operator actions\"]\n```\n\nThe business problem is safe response management. Business users need to know which enquiries are new, which are waiting, and which require follow-up. Developers need form and version contracts. Operators need spam controls, workflow evidence, notification status, and recovery steps for production.\n\n## Data contract\n\nengagementFormDefinition is a tenant-scoped operational record with submissionType, targetCapability, DRAFT/VALIDATED/ACTIVE/RETIRED status, currentVersion, accessibilityPolicyCode, validationPolicyCode and correlationId. engagementFormVersion separately carries definitionCode, integer version, VALIDATED/ACTIVE/RETIRED, declarative structure, deterministic checksum and validatedAt. Form lookup selects the first ACTIVE version for tenant/definitionCode; it does not itself enforce unique active versions or validate a submission against the displayed form's version/checksum.\n\nContact validation uses the configured requiredFields, allowed types, email syntax and subject/message bounds and allow-lists type/reasonCode/subject/message/contactEmail/contactPhone/preferredChannel. Submit does not consume an arbitrary fields[] object as its validation contract. Keep definition/version governance and submission validation aligned in their owners; do not claim a browser form is dynamically schema-enforced merely because it renders a stored structure.\n\n```js\n// Illustrative schema-shaped authoring objects, not a submit payload.\nconst definition = {\n  code: 'contactEnquiry', tenant: 'demo', submissionType: 'CONTACT',\n  targetCapability: 'contactSubmission', status: 'DRAFT', currentVersion: 0,\n  accessibilityPolicyCode: 'contactAccessibility', validationPolicyCode: 'contactValidation',\n  correlationId: 'contact-form-review'\n};\nconst version = {\n  code: 'contactEnquiryV1', tenant: 'demo', definitionCode: definition.code,\n  version: 1, status: 'VALIDATED', structure: reviewedDeclarativeStructure,\n  checksum: validatedStructureChecksum, validatedAt: validationTimestamp,\n  correlationId: definition.correlationId\n};\n// These trusted validation outputs must come from the qualified authoring lane.\n// Schema declarations and ACTIVE lookup do not implement an immutable form workflow;\n// do not fabricate a checksum or activate an unvalidated structure through raw CRUD.\n```\n\n```js\n// Input to the enabled Contact service / public engagement intake transport.\n// Tenant, actor, correlation and Idempotency-Key are established by the server/channel.\nconst payload = { type: 'ENQUIRY', subject: 'Catalog question',\n  message: 'Please confirm availability.', contactEmail: 'reader@example.test',\n  preferredChannel: 'EMAIL' };\n// Public acknowledgement allow-list:\nconst acknowledgement = { referenceCode: 'contact-reference', duplicate: false,\n  verificationRequired: true };\n// Internal persisted outcome for a guest when guestRequired is true:\n// status VERIFICATION_PENDING, verificationStatus PENDING, revision 0.\n// Otherwise OPEN / NOT_REQUIRED. Do not expose the internal contact/handoff wholesale.\n```\n\n## Customization and extension guidance\n\nEnable Contact through engagement.capabilities.contactSubmission and the owner policy, not a frontend toggle. Shared Core intake owns protection, consent/dedupe/idempotency checks; Contact creates the domain record and routing result. Guest owner identity is a hash-derived guest reference, not email as an exposed identifier. The schema defines verification challenges/statuses, but the inspected Contact operation does not issue/complete a challenge or implement a public verification endpoint. A verificationRequired acknowledgement does not prove email verification or an email worker exists.\n\n## Implementation handoff\n\nRouting chooses queue/team/priority and SLA dueAt using configured reason/default policy; it is distinct from moderation and provider delivery. Operator actions REQUEST_INFORMATION, ATTEMPT_CONTACT, RESOLVE, CLOSE, REOPEN, MARK_DUPLICATE and MARK_SPAM map to owner lifecycle targets with expectedRevision checks; the schema's larger status enum does not make every transition/action available. Core engagementActivity, contactCorrespondence, contactAttempt and contactResolution are distinct evidence schemas, not proof every operator transition persists every audit/notification record.\n\nSubmit creates a separate PROCESS handoff. With no supplied adapter dispatch records deferred PENDING; adapter send can record its external reference/status, while failure records RETRY_PENDING. Handoff persistence follows domain creation, and initial dispatch can precede persistence: this is not atomic domain/process creation or guaranteed exactly-once external execution. Process owns its instance lifecycle, not Contact. Notification intent, Communication delivery and channel/provider receipts are separate owner evidence; neither an OPEN contact nor a SUCCEEDED process handoff proves email/SMS delivery. Configure and qualify scheduling/adapters separately.\n\n| Recovery operation | Precondition / result | Safe operator decision |\n| --- | --- | --- |\n| runHandoffRecovery / run | PENDING, due RETRY_PENDING (or no nextRetryAt), or IN_PROGRESS with expired lease. Default batch 25, lease 30000ms; revision-checked claim then adapter.send. | Default adapter selection is PROCESS; other target types require an explicit adapter or HANDOFF_ADAPTER_UNAVAILABLE. Persisted work does not imply a scheduler is running. |\n| complete / fail | Only matching leaseOwner and claimed revision may finish. Failed claim => SKIPPED; stale completion/failure => LOST_LEASE. | Reread revision/lease and inspect external reference. Never clear another worker's live lease to force a retry. |\n| Backoff / escalation | attempts increases on each recovery failure. Default maximumAttempts 5; exponential baseBackoffMs 1000 capped maximumBackoffMs 300000; then DEAD_LETTER. | Repair the owning adapter/provider and retain redacted error/correlation. Initial dispatch and recovery attempts are distinct; inspect stored attempt count. |\n| retryHandoff / retry | Only FAILED, DEAD_LETTER or RETRY_PENDING; revision-checked reset -> RETRY_PENDING due now or CONFLICT. Other states ERR_CONTACT_00007. | Reset does not clear attempts; exhaustion is not a fresh retry budget. No new contact submission or new idempotency key. |\n| reconcileHandoff / reconcile | Requires an existing externalReference (else ERR_CONTACT_00008) and adapter.lookup. Nonterminal remains unchanged; terminal -> RECONCILED or CONFLICT. | Reconcile a known external execution before replaying; owner adapter must supply lookup. RECONCILED is handoff evidence, not contact resolution or notification delivery. |\n\nUse tenant-bound operator permissions, handoffCode, current revision/lease, exact external reference, attempt ceiling, due time and correlation for recovery. Never copy subject/message/email, challenge material, tokens or raw provider payloads into recovery logs. Purpose-bound EXPORT/ANONYMIZE remains Engagement privacy authority with retention/legal-hold policy; retrying handoff must not reset a completed submission or defeat privacy decisions.\n\n## Evidence checklist\n\nSubmission evidence should include form code, version, source route, locale, field validation result, consent flag, moderation status, assigned queue, notification state, retention class, and correlation id. Operators should be able to trace a missing response from browser submission to queue assignment and communication receipt. Developers should avoid storing unnecessary personal data just to make reporting easier.\n\nThis keeps public contact journeys useful without turning them into unmanaged data collection. Business users get enough context to respond, while security and production support keep retention and privacy boundaries visible.\n\nProduction evidence should also show duplicate detection and abuse controls. That lets operators separate genuine customer enquiries from noisy traffic without blocking the business team from responding to valid messages.\n\n## Common mistakes\n\n- Treating a frontend contact form as the authority.\n- Accepting submissions without validation, consent, or spam controls.\n- Sending notifications before moderation policy allows it.\n- Keeping personal data longer than required.\n- Hiding failed routing or notification evidence from operators.\n\n## Verification\n\nImport form definitions into a fresh schema, submit a browser form, confirm validation, moderation, routing, notification, audit, and retention behavior. Production readiness requires business queue visibility, developer tests, operator failure evidence, and QA proof that rejected or unsafe submissions do not create outbound communication.\n",
    "keywords": [
      "contact-submission",
      "engagement",
      "moderation",
      "workflow",
      "notification",
      "Customer Engagement and Feedback",
      "Contact and Feedback",
      "Contact Submission Operations"
    ],
    "facets": {
      "section": "customer-engagement-and-feedback",
      "group": "customer-engagement-and-feedback",
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
      "maturityState": "operational"
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
