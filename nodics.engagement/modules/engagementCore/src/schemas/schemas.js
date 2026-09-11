/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementCore/src/schemas/schemas
 * @description Defines internal, router-disabled persistence contracts for shared customer engagement identity, evidence, consent, assignment, classification, relations, publication links, integrations, and scoped forms.
 * @layer schema
 * @owner engagementCore
 * @override Later modules may add fields through governed schema fragments while preserving tenant, ownership, audit, consent, and authority boundaries.
 */
module.exports = {
    engagementCore: {
        engagementSubmission: {
            super: 'base', model: true, schemaPolicies: ['customerOwned'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false },
            event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Resolved tenant isolation context; never inferred silently from a public payload' },
                enterprise: { type: 'string', required: false, description: 'Profile-owned enterprise reference associated with the resolved tenant' },
                site: { type: 'string', required: false, description: 'Site or experience reference supplied by the owning channel' },
                channel: { type: 'string', required: true, enum: ['WEB', 'MOBILE', 'API', 'BACKOFFICE', 'IMPORT', 'INTEGRATION'], description: 'Governed submission channel' },
                locale: { type: 'string', required: false, description: 'Normalized locale used for validation and response policy' },
                source: { type: 'string', required: true, description: 'Bounded source identifier without network credentials or raw headers' },
                domainType: { type: 'string', required: true, description: 'Owning domain type such as contact, review, feedback, or testimonial' },
                domainCode: { type: 'string', required: true, description: 'Stable domain record identity owned by the domain capability' },
                correlationId: { type: 'string', required: true, description: 'End-to-end diagnostic and audit correlation identity' },
                idempotencyKey: { type: 'string', required: true, description: 'Tenant-scoped replay identity for one submission operation' },
                requestHash: { type: 'string', required: true, description: 'Digest used to reject conflicting reuse of an idempotency key' },
                processingStatus: { type: 'string', required: true, default: 'RECEIVED', enum: ['RECEIVED', 'VALIDATING', 'ACCEPTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ON_HOLD', 'ACTIONED', 'RESOLVED', 'CLOSED', 'REJECTED', 'SPAM', 'DUPLICATE', 'ARCHIVED'], description: 'Shared operational lifecycle state; domain modules publish allowed subsets' },
                revision: { type: 'int', required: true, default: 0, description: 'Optimistic concurrency revision for governed transitions' },
                processDefinitionCode: { type: 'string', required: false, description: 'Reference to a Process-owned definition' },
                processInstanceCode: { type: 'string', required: false, description: 'Reference to a Process-owned runtime instance' },
                processTaskCode: { type: 'string', required: false, description: 'Reference to a Process-owned task' },
                retentionPolicyCode: { type: 'string', required: true, description: 'Configured retention policy identity; no universal destructive duration is assumed' },
                legalHold: { type: 'bool', required: true, default: false, description: 'Prevents expiry actions while a governed legal hold is active' },
                receivedAt: { type: 'date', required: true, description: 'Timestamp when Engagement accepted the intake envelope' },
                closedAt: { type: 'date', required: false, description: 'Timestamp when processing reached CLOSED' }
            }
        },
        engagementActivity: {
            super: 'super', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the immutable-style activity evidence' },
                submissionCode: { type: 'string', required: true, description: 'Related engagement submission code' },
                domainType: { type: 'string', required: true, description: 'Owning engagement domain type' },
                domainCode: { type: 'string', required: true, description: 'Owning domain record code' },
                activityType: { type: 'string', required: true, description: 'Stable activity or transition type' },
                fromStatus: { type: 'string', required: false, description: 'Previous shared processing status when applicable' },
                toStatus: { type: 'string', required: false, description: 'Requested shared processing status when applicable' },
                outcome: { type: 'string', required: true, enum: ['SUCCEEDED', 'DENIED', 'SKIPPED', 'FAILED'], description: 'Recorded activity outcome' },
                actorId: { type: 'string', required: false, description: 'Stable authenticated actor or service identity' },
                actorType: { type: 'string', required: false, description: 'Actor category without copying authentication data' },
                reasonCode: { type: 'string', required: false, description: 'Stable reason code for support and audit' },
                evidence: { type: 'object', required: false, description: 'Bounded and redacted evidence with secrets prohibited' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity shared with the triggering operation' },
                occurredAt: { type: 'date', required: true, description: 'Timestamp when the activity occurred' }
            }
        },
        engagementConsent: {
            super: 'base', model: true, schemaPolicies: ['customerOwned'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the consent evidence' },
                submissionCode: { type: 'string', required: false, description: 'Related submission when consent was collected during intake' },
                subjectId: { type: 'string', required: true, description: 'Profile-owned customer or principal reference' },
                purpose: { type: 'string', required: true, description: 'Specific business purpose covered by this evidence' },
                channel: { type: 'string', required: true, description: 'Channel to which the consent applies' },
                action: { type: 'string', required: true, enum: ['CAPTURE', 'GRANT', 'DENY', 'WITHDRAW', 'EXPIRE'], description: 'Consent evidence action' },
                status: { type: 'string', required: true, enum: ['NOT_REQUIRED', 'PENDING', 'GRANTED', 'DENIED', 'WITHDRAWN', 'EXPIRED'], description: 'Effective consent state after this action' },
                policyVersion: { type: 'string', required: true, description: 'Version of the policy or notice shown to the subject' },
                evidenceVersion: { type: 'string', required: true, description: 'Version of the evidence representation' },
                evidence: { type: 'object', required: true, description: 'Redacted proof of notice and subject action; secrets and full request headers are prohibited' },
                grantedAt: { type: 'date', required: false, description: 'Timestamp of grant when status is GRANTED' },
                withdrawnAt: { type: 'date', required: false, description: 'Timestamp of withdrawal when status is WITHDRAWN' },
                expiresAt: { type: 'date', required: false, description: 'Optional governed consent expiry' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for collection or change' }
            }
        },
        engagementAssignment: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the assignment' },
                submissionCode: { type: 'string', required: true, description: 'Assigned engagement submission' },
                queueCode: { type: 'string', required: false, description: 'Configured business queue reference' },
                teamCode: { type: 'string', required: false, description: 'Profile or organization team reference' },
                assigneeId: { type: 'string', required: false, description: 'Profile-owned principal reference' },
                status: { type: 'string', required: true, default: 'UNASSIGNED', enum: ['UNASSIGNED', 'ASSIGNED', 'CLAIMED', 'REASSIGNED', 'RELEASED', 'COMPLETED'], description: 'Assignment lifecycle state' },
                priority: { type: 'int', required: true, default: 0, description: 'Configured relative work priority' },
                slaPolicyCode: { type: 'string', required: false, description: 'Configured SLA policy reference' },
                dueAt: { type: 'date', required: false, description: 'Calculated SLA due timestamp' },
                assignedAt: { type: 'date', required: false, description: 'Timestamp of current assignment' },
                completedAt: { type: 'date', required: false, description: 'Timestamp assignment work completed' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for assignment activity' }
            }
        },
        engagementClassification: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the classification evidence' },
                submissionCode: { type: 'string', required: true, description: 'Classified engagement submission' },
                category: { type: 'string', required: false, description: 'Configured business category' },
                intent: { type: 'string', required: false, description: 'Bounded detected or selected intent' },
                risk: { type: 'string', required: false, description: 'Risk classification without protected raw evidence' },
                sentiment: { type: 'string', required: false, description: 'Advisory sentiment that must not alone drive rejection or visibility' },
                confidence: { type: 'number', required: true, default: 0, description: 'Normalized confidence from zero to one' },
                source: { type: 'string', required: true, enum: ['RULE', 'OPERATOR', 'IMPORT', 'EXTERNAL', 'AI'], description: 'Classification source' },
                policyVersion: { type: 'string', required: true, description: 'Rule, policy, or model-governance version' },
                modelReference: { type: 'string', required: false, description: 'Optional governed model/deployment reference without prompts or secrets' },
                evidence: { type: 'object', required: false, description: 'Bounded explanation and signals used for review' },
                classifiedAt: { type: 'date', required: true, description: 'Classification timestamp' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for the classification action' }
            }
        },
        engagementRelation: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the relationship evidence' },
                sourceType: { type: 'string', required: true, description: 'Owning source record type' },
                sourceCode: { type: 'string', required: true, description: 'Owning source record code' },
                relationType: { type: 'string', required: true, description: 'Business meaning of the relation' },
                targetModule: { type: 'string', required: true, description: 'Module that owns the target record' },
                targetType: { type: 'string', required: true, description: 'Target record type' },
                targetCode: { type: 'string', required: true, description: 'Target record code without copying the target record' },
                activeFrom: { type: 'date', required: false, description: 'Optional relation activation timestamp' },
                activeUntil: { type: 'date', required: false, description: 'Optional relation expiry timestamp' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for relation creation' }
            }
        },
        engagementPublicationReference: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning this domain-to-publication link' },
                domainType: { type: 'string', required: true, description: 'Engagement domain type supplying publication eligibility' },
                domainCode: { type: 'string', required: true, description: 'Engagement domain record code' },
                domainVersion: { type: 'string', required: true, description: 'Immutable domain projection version' },
                eligibility: { type: 'string', required: true, default: 'NOT_EVALUATED', enum: ['NOT_EVALUATED', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN'], description: 'Domain eligibility only; not nPublish lifecycle state' },
                eligibilityReason: { type: 'string', required: false, description: 'Stable domain eligibility reason' },
                publicationRequestCode: { type: 'string', required: false, description: 'Reference to nPublish-owned publication request' },
                target: { type: 'object', required: false, description: 'Bounded site, locale, channel, or placement target reference' },
                evaluatedAt: { type: 'date', required: false, description: 'Last eligibility evaluation timestamp' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity shared with nPublish handoff' }
            }
        },
        engagementIntegrationReference: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the integration handoff evidence' },
                submissionCode: { type: 'string', required: true, description: 'Original Engagement submission reference' },
                systemCode: { type: 'string', required: true, description: 'Configured external system/provider identity' },
                operation: { type: 'string', required: true, description: 'Provider-neutral handoff operation' },
                authorityMode: { type: 'string', required: true, default: 'ENGAGEMENT', enum: ['ENGAGEMENT', 'EXTERNAL_CASE'], description: 'Explicit owner of downstream case progress' },
                idempotencyKey: { type: 'string', required: true, description: 'Tenant/provider/operation-scoped replay identity' },
                requestHash: { type: 'string', required: true, description: 'Digest used to reject conflicting replay' },
                externalReference: { type: 'string', required: false, description: 'Provider-issued case or transaction reference' },
                status: { type: 'string', required: true, default: 'PENDING', enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'RECONCILED'], description: 'Handoff and reconciliation status' },
                attemptCount: { type: 'int', required: true, default: 0, description: 'Number of governed handoff attempts' },
                nextAttemptAt: { type: 'date', required: false, description: 'Scheduled retry timestamp owned by policy/Cron relationship' },
                lastOutcome: { type: 'object', required: false, description: 'Content-free, redacted provider outcome' },
                lastAttemptAt: { type: 'date', required: false, description: 'Last handoff attempt timestamp' },
                reconciledAt: { type: 'date', required: false, description: 'Successful reconciliation timestamp' },
                correlationId: { type: 'string', required: true, description: 'End-to-end integration correlation identity' }
            }
        },
        engagementFormDefinition: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the Engagement-scoped form definition' },
                submissionType: { type: 'string', required: true, description: 'Engagement experience type served by the form' },
                targetCapability: { type: 'string', required: true, description: 'Owning Engagement domain capability' },
                status: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'VALIDATED', 'ACTIVE', 'RETIRED'], description: 'Form-definition lifecycle' },
                currentVersion: { type: 'int', required: true, default: 0, description: 'Latest active immutable version number' },
                sites: { type: 'array', required: false, description: 'Applicable site references' },
                locales: { type: 'array', required: false, description: 'Applicable locales' },
                channels: { type: 'array', required: false, description: 'Applicable channels' },
                accessibilityPolicyCode: { type: 'string', required: true, description: 'Required accessibility policy identity' },
                validationPolicyCode: { type: 'string', required: true, description: 'Required server-side validation policy identity' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for definition governance' }
            }
        },
        engagementFormVersion: {
            super: 'base', model: true, schemaPolicies: ['operational'],
            service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning this immutable form version' },
                definitionCode: { type: 'string', required: true, description: 'Owning Engagement form definition code' },
                version: { type: 'int', required: true, description: 'Immutable version number' },
                status: { type: 'string', required: true, enum: ['VALIDATED', 'ACTIVE', 'RETIRED'], description: 'Immutable version lifecycle' },
                structure: { type: 'object', required: true, description: 'Declarative sections, questions, options, conditions, labels, and safe rendering hints; executable scripts are prohibited' },
                checksum: { type: 'string', required: true, description: 'Deterministic checksum of the validated declarative structure' },
                validatedAt: { type: 'date', required: true, description: 'Server-side validation timestamp' },
                activatedAt: { type: 'date', required: false, description: 'Activation timestamp' },
                retiredAt: { type: 'date', required: false, description: 'Retirement timestamp' },
                correlationId: { type: 'string', required: true, description: 'Correlation identity for version governance' }
            }
        },
        engagementUnifiedQueueItem: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, domainType: { type: 'string', required: true , description: 'Classifies this record by domain type for validation and business handling.'}, domainCode: { type: 'string', required: true , description: 'Stores the domain code used to classify, link, or resolve this record.'}, sourceRevision: { type: 'int', required: true , description: 'Stores the numeric source revision used by this record.'}, sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'}, status: { type: 'string', required: true , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, queueCode: { type: 'string', required: false , description: 'Stores the queue code used to classify, link, or resolve this record.'}, assigneeId: { type: 'string', required: false , description: 'Stores the assignee identifier used to correlate this record.'}, priority: { type: 'string', required: false , description: 'Stores the priority used to order or resolve this record against competing records.'}, dueAt: { type: 'date', required: false , description: 'Records when the due event or value applies.'}, summary: { type: 'object', required: true , description: 'Stores structured summary details used by this record.'}, relatedRecords: { type: 'array', required: false , description: 'Lists the related records associated with this record.'}, consentFlags: { type: 'object', required: false , description: 'Stores structured consent flags details used by this record.'}, integrationStatus: { type: 'string', required: false , description: 'Stores the integration status value used by this record.'}, projectedAt: { type: 'date', required: true , description: 'Records when the projected event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementDashboardSnapshot: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, dashboardCode: { type: 'string', required: true , description: 'Stores the dashboard code used to classify, link, or resolve this record.'}, filters: { type: 'object', required: false , description: 'Stores structured filters details used by this record.'}, metrics: { type: 'object', required: true , description: 'Stores structured metrics details used by this record.'}, sourceHashes: { type: 'object', required: true , description: 'Stores structured source hashes details used by this record.'}, policyVersion: { type: 'string', required: true , description: 'Stores the policy version value used by this record.'}, calculatedAt: { type: 'date', required: true , description: 'Records when the calculated event or value applies.'}, status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'DRIFTED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementRepairCase: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, domainType: { type: 'string', required: true , description: 'Classifies this record by domain type for validation and business handling.'}, domainCode: { type: 'string', required: true , description: 'Stores the domain code used to classify, link, or resolve this record.'}, repairType: { type: 'string', required: true , description: 'Classifies this record by repair type for validation and business handling.'}, expectedSourceHash: { type: 'string', required: false , description: 'Stores the expected source hash value used by this record.'}, observedSourceHash: { type: 'string', required: false , description: 'Stores the observed source hash value used by this record.'}, status: { type: 'string', required: true, enum: ['DETECTED', 'PREVIEWED', 'APPROVED', 'IN_PROGRESS', 'REPAIRED', 'FAILED', 'RECONCILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, reason: { type: 'string', required: true , description: 'Stores the reason value used by this record.'}, requestedBy: { type: 'string', required: true , description: 'Stores the requested by value used by this record.'}, approvedBy: { type: 'string', required: false , description: 'Stores the approved by value used by this record.'}, result: { type: 'object', required: false , description: 'Stores structured result details used by this record.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementBatchRun: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'}, action: { type: 'string', required: true , description: 'Stores the action value used by this record.'}, reason: { type: 'string', required: true , description: 'Stores the reason value used by this record.'}, requestedBy: { type: 'string', required: true , description: 'Stores the requested by value used by this record.'}, approvedBy: { type: 'string', required: true , description: 'Stores the approved by value used by this record.'}, status: { type: 'string', required: true, enum: ['APPROVED', 'IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'FAILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, total: { type: 'int', required: true , description: 'Stores the numeric total used by this record.'}, succeeded: { type: 'int', required: true , description: 'Stores the numeric succeeded used by this record.'}, failed: { type: 'int', required: true , description: 'Stores the numeric failed used by this record.'}, cursor: { type: 'int', required: true , description: 'Stores the numeric cursor used by this record.'}, results: { type: 'array', required: true , description: 'Lists the results associated with this record.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}, startedAt: { type: 'date', required: true , description: 'Records when the started event or value applies.'}, completedAt: { type: 'date', required: false , description: 'Records when the completed event or value applies.'}
            }
        },
        engagementPrivacyCase: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, domainType: { type: 'string', required: true , description: 'Classifies this record by domain type for validation and business handling.'}, domainCode: { type: 'string', required: true , description: 'Stores the domain code used to classify, link, or resolve this record.'}, operation: { type: 'string', required: true, enum: ['EXPORT', 'ANONYMIZE', 'RETENTION_ARCHIVE'] , description: 'Selects the operation value used to drive validation, filtering, and business behavior.'}, purpose: { type: 'string', required: true , description: 'Stores the purpose value used by this record.'}, requestedBy: { type: 'string', required: true , description: 'Stores the requested by value used by this record.'}, status: { type: 'string', required: true, enum: ['COMPLETED', 'DENIED_LEGAL_HOLD', 'FAILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, fields: { type: 'array', required: false , description: 'Lists the fields associated with this record.'}, checksum: { type: 'string', required: false , description: 'Stores the checksum value used by this record.'}, result: { type: 'object', required: false , description: 'Stores structured result details used by this record.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}, executedAt: { type: 'date', required: true , description: 'Records when the executed event or value applies.'}
            }
        },
        engagementExportEvidence: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, purpose: { type: 'string', required: true , description: 'Stores the purpose value used by this record.'}, requestedBy: { type: 'string', required: true , description: 'Stores the requested by value used by this record.'}, approvedBy: { type: 'string', required: false , description: 'Stores the approved by value used by this record.'}, filters: { type: 'object', required: false , description: 'Stores structured filters details used by this record.'}, fields: { type: 'array', required: true , description: 'Lists the fields associated with this record.'}, maskingPolicy: { type: 'string', required: true , description: 'Defines the masking policy that controls how this record is handled.'}, recordCount: { type: 'int', required: true , description: 'Stores the record count used for validation, calculation, or operational decisions.'}, maximumRecords: { type: 'int', required: true , description: 'Stores the numeric maximum records used by this record.'}, checksum: { type: 'string', required: false , description: 'Stores the checksum value used by this record.'}, mediaCode: { type: 'string', required: false , description: 'Stores the media code used to classify, link, or resolve this record.'}, status: { type: 'string', required: true, enum: ['PREVIEWED', 'APPROVED', 'GENERATING', 'AVAILABLE', 'EXPIRED', 'FAILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, generatedAt: { type: 'date', required: false , description: 'Records when the generated event or value applies.'}, expiresAt: { type: 'date', required: false , description: 'Records when the expires event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementAutomationDecision: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, capability: { type: 'string', required: true, enum: ['CLASSIFICATION', 'SUMMARIZATION', 'TRANSLATION', 'MODERATION_RECOMMENDATION', 'FRAUD_SIGNAL', 'ANOMALY_SIGNAL', 'DUPLICATE_CLUSTER', 'RESPONSE_DRAFT'] , description: 'Selects the capability value used to drive validation, filtering, and business behavior.'}, domainType: { type: 'string', required: true , description: 'Classifies this record by domain type for validation and business handling.'}, domainCode: { type: 'string', required: true , description: 'Stores the domain code used to classify, link, or resolve this record.'}, sourceRevision: { type: 'int', required: true , description: 'Stores the numeric source revision used by this record.'}, sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'}, output: { type: 'object', required: true , description: 'Stores structured output details used by this record.'}, confidence: { type: 'number', required: true , description: 'Stores the numeric confidence used by this record.'}, source: { type: 'string', required: true, enum: ['RULE', 'AI', 'OPERATOR'] , description: 'Selects the source value used to drive validation, filtering, and business behavior.'}, providerCode: { type: 'string', required: false , description: 'Stores the provider code used to classify, link, or resolve this record.'}, modelReference: { type: 'string', required: false , description: 'Stores the model reference value used by this record.'}, promptVersion: { type: 'string', required: false , description: 'Stores the prompt version value used by this record.'}, policyVersion: { type: 'string', required: true , description: 'Stores the policy version value used by this record.'}, evaluationCode: { type: 'string', required: false , description: 'Stores the evaluation code used to classify, link, or resolve this record.'}, status: { type: 'string', required: true, enum: ['PROPOSED', 'REVIEW_REQUIRED', 'ACCEPTED', 'OVERRIDDEN', 'REJECTED', 'STALE', 'DELETED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, explanation: { type: 'object', required: false , description: 'Stores structured explanation details used by this record.'}, reviewedBy: { type: 'string', required: false , description: 'Stores the reviewed by value used by this record.'}, reviewReason: { type: 'string', required: false , description: 'Stores the review reason value used by this record.'}, decidedAt: { type: 'date', required: true , description: 'Records when the decided event or value applies.'}, reviewedAt: { type: 'date', required: false , description: 'Records when the reviewed event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementAutomationEvaluation: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, capability: { type: 'string', required: true , description: 'Stores the capability value used by this record.'}, providerCode: { type: 'string', required: false , description: 'Stores the provider code used to classify, link, or resolve this record.'}, modelReference: { type: 'string', required: false , description: 'Stores the model reference value used by this record.'}, promptVersion: { type: 'string', required: false , description: 'Stores the prompt version value used by this record.'}, policyVersion: { type: 'string', required: true , description: 'Stores the policy version value used by this record.'}, datasetReference: { type: 'string', required: true , description: 'Stores the dataset reference value used by this record.'}, sampleSize: { type: 'int', required: true , description: 'Stores the numeric sample size used by this record.'}, metrics: { type: 'object', required: true , description: 'Stores structured metrics details used by this record.'}, thresholds: { type: 'object', required: true , description: 'Stores structured thresholds details used by this record.'}, passed: { type: 'bool', required: true , description: 'Indicates whether passed applies for this record.'}, evaluatedAt: { type: 'date', required: true , description: 'Records when the evaluated event or value applies.'}, evaluatedBy: { type: 'string', required: true , description: 'Stores the evaluated by value used by this record.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementDeliveryAttempt: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'}, eventType: { type: 'string', required: true , description: 'Classifies this record by event type for validation and business handling.'}, eventVersion: { type: 'string', required: true , description: 'Stores the event version value used by this record.'}, idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'}, payloadHash: { type: 'string', required: true , description: 'Stores the payload hash value used by this record.'}, region: { type: 'string', required: true , description: 'Stores the region value used by this record.'}, endpointReference: { type: 'string', required: true , description: 'Stores the endpoint reference value used by this record.'}, status: { type: 'string', required: true, enum: ['PENDING', 'DELIVERING', 'DELIVERED', 'RETRY_PENDING', 'DEAD_LETTER', 'SUPPRESSED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, attempt: { type: 'int', required: true , description: 'Stores the numeric attempt used by this record.'}, maximumAttempts: { type: 'int', required: true , description: 'Stores the numeric maximum attempts used by this record.'}, nextAttemptAt: { type: 'date', required: false , description: 'Records when the next attempt event or value applies.'}, responseCode: { type: 'int', required: false , description: 'Stores the response code used to classify, link, or resolve this record.'}, deliveredAt: { type: 'date', required: false , description: 'Records when the delivered event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementRecoveryCheckpoint: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, workloadCode: { type: 'string', required: true , description: 'Stores the workload code used to classify, link, or resolve this record.'}, partitionKey: { type: 'string', required: true , description: 'Stores the partition key value used by this record.'}, region: { type: 'string', required: true , description: 'Stores the region value used by this record.'}, cursor: { type: 'string', required: true , description: 'Stores the cursor value used by this record.'}, sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'}, processedCount: { type: 'int', required: true , description: 'Stores the processed count used for validation, calculation, or operational decisions.'}, failedCount: { type: 'int', required: true , description: 'Stores the failed count used for validation, calculation, or operational decisions.'}, status: { type: 'string', required: true, enum: ['CURRENT', 'PAUSED', 'RECOVERING', 'FAILED', 'COMPLETE'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, startedAt: { type: 'date', required: true , description: 'Records when the started event or value applies.'}, checkpointedAt: { type: 'date', required: true , description: 'Records when the checkpointed event or value applies.'}, completedAt: { type: 'date', required: false , description: 'Records when the completed event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        engagementCompatibilityRecord: {
            super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
            definition: {
                tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, contractType: { type: 'string', required: true, enum: ['API', 'EVENT', 'EXPORT', 'PROVIDER'] , description: 'Classifies this record by contract type for validation and business handling.'}, contractCode: { type: 'string', required: true , description: 'Stores the contract code used to classify, link, or resolve this record.'}, version: { type: 'string', required: true , description: 'Stores the version value used by this record.'}, compatibility: { type: 'string', required: true, enum: ['CURRENT', 'BACKWARD_COMPATIBLE', 'DEPRECATED', 'BREAKING', 'RETIRED'] , description: 'Selects the compatibility value used to drive validation, filtering, and business behavior.'}, successorVersion: { type: 'string', required: false , description: 'Stores the successor version value used by this record.'}, deprecatedAt: { type: 'date', required: false , description: 'Records when the deprecated event or value applies.'}, sunsetAt: { type: 'date', required: false , description: 'Records when the sunset event or value applies.'}, evidence: { type: 'object', required: true , description: 'Stores structured evidence details used by this record.'}, evaluatedAt: { type: 'date', required: true , description: 'Records when the evaluated event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        }
    }
};
