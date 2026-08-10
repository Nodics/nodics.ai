/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.process/modules/workflow/modules/flowSchema/src/schemas/schemas
 * @description Defines governed persistence models for process definitions, immutable versions, runtime instances, human tasks, and audit evidence.
 * @layer schema
 * @owner flowSchema
 * @override Customer process overlays may extend these schemas through later schema fragments while preserving lifecycle and audit semantics.
 */
module.exports = {
    flowSchema: {
        processDefinition: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                description: {
                    type: 'string',
                    required: false,
                    description: 'Business-readable description of the governed process definition'
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'DRAFT',
                    enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED', 'ARCHIVED'],
                    description: 'Lifecycle state of the definition aggregate'
                },
                category: {
                    type: 'string',
                    required: false,
                    description: 'Business category such as commerce, fulfilment, support, onboarding, or governance'
                },
                ownerModule: {
                    type: 'string',
                    required: false,
                    description: 'Optional domain module that contributes or primarily consumes this process'
                },
                currentVersion: {
                    type: 'int',
                    required: true,
                    default: 0,
                    description: 'Latest published immutable version number'
                },
                draftRevision: {
                    type: 'int',
                    required: true,
                    default: 1,
                    description: 'Mutable draft revision used for optimistic editing and audit'
                },
                graph: {
                    type: 'object',
                    required: true,
                    description: 'Backend-owned draft workflow graph containing declarative nodes and transitions'
                },
                designer: {
                    type: 'object',
                    required: false,
                    description: 'Optional visual-editor metadata such as node positions; not runtime truth'
                },
                validation: {
                    type: 'object',
                    required: false,
                    description: 'Last validation result and diagnostics for the draft graph'
                },
                publishedAt: {
                    type: 'date',
                    required: false,
                    description: 'Timestamp when the current version became published'
                },
                archivedAt: {
                    type: 'date',
                    required: false,
                    description: 'Timestamp when the definition was archived'
                }
            }
        },
        processDefinitionVersion: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                definitionCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable code of the owning process definition'
                },
                version: {
                    type: 'int',
                    required: true,
                    description: 'Immutable version number within one process definition'
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'PUBLISHED',
                    enum: ['PUBLISHED', 'DEPRECATED', 'ARCHIVED'],
                    description: 'Lifecycle state of the immutable published version'
                },
                graph: {
                    type: 'object',
                    required: true,
                    description: 'Published backend-validated workflow graph'
                },
                designer: {
                    type: 'object',
                    required: false,
                    description: 'Published visual-editor metadata copied from the draft'
                },
                checksum: {
                    type: 'string',
                    required: true,
                    description: 'Deterministic checksum of the published graph contract'
                },
                publishedBy: {
                    type: 'string',
                    required: false,
                    description: 'Authenticated actor that published this version'
                },
                publishedAt: {
                    type: 'date',
                    required: true,
                    description: 'Timestamp when this version was published'
                }
            }
        },
        processInstance: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                definitionCode: { type: 'string', required: true, description: 'Process definition code used by this instance' },
                version: { type: 'int', required: true, description: 'Published version used by this instance' },
                status: { type: 'string', required: true, default: 'CREATED', enum: ['CREATED', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED'], description: 'Runtime lifecycle state' },
                context: { type: 'object', required: false, description: 'Bounded runtime context snapshot; secrets and raw payloads are prohibited' },
                currentNode: { type: 'string', required: false, description: 'Current node code for runtime diagnostics' },
                incidentCode: { type: 'string', required: false, description: 'Current Process-owned recovery incident, when execution has failed' },
                failureCode: { type: 'string', required: false, description: 'Stable redacted failure code for the current incident' },
                retryCount: { type: 'int', required: true, default: 0, description: 'Number of governed retry attempts performed for this instance' },
                compensationStatus: { type: 'string', required: true, default: 'NONE', enum: ['NONE', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'], description: 'Orchestration view of domain-owned compensation execution' },
                startedAt: { type: 'date', required: false, description: 'Runtime start timestamp' },
                completedAt: { type: 'date', required: false, description: 'Runtime completion timestamp' }
            }
        },
        processIncident: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                instanceCode: { type: 'string', required: true, description: 'Failed process instance owned by this incident' },
                definitionCode: { type: 'string', required: true, description: 'Process definition used by the failed instance' },
                version: { type: 'int', required: true, description: 'Immutable process version used by the failed instance' },
                nodeCode: { type: 'string', required: true, description: 'ACTION node that failed' },
                status: { type: 'string', required: true, default: 'OPEN', enum: ['OPEN', 'RETRYING', 'RESOLVED', 'COMPENSATING', 'COMPENSATED', 'DEAD_LETTER'], description: 'Governed incident and recovery lifecycle' },
                errorCode: { type: 'string', required: true, description: 'Stable redacted error code; raw exception payloads are prohibited' },
                attempt: { type: 'int', required: true, default: 1, description: 'Current execution attempt including the initial failure' },
                maximumAttempts: { type: 'int', required: true, default: 3, description: 'Bounded maximum attempts declared by policy' },
                nextRetryAt: { type: 'date', required: false, description: 'Earliest policy-calculated retry timestamp' },
                adapter: { type: 'object', required: false, description: 'Declarative failed domain adapter reference' },
                compensationAdapter: { type: 'object', required: false, description: 'Declarative domain-owned compensation adapter reference' },
                correlationId: { type: 'string', required: false, description: 'Caller correlation identifier for evidence tracing' },
                evidence: { type: 'object', required: false, description: 'Bounded redacted recovery evidence' },
                lastErrorAt: { type: 'date', required: true, description: 'Timestamp of the latest failed attempt' },
                resolvedAt: { type: 'date', required: false, description: 'Timestamp when retry resolved the incident' },
                compensatedAt: { type: 'date', required: false, description: 'Timestamp when domain compensation completed' }
            }
        },
        processTask: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                instanceCode: { type: 'string', required: true, description: 'Owning process instance code' },
                nodeCode: { type: 'string', required: true, description: 'Workflow node that created the task' },
                assignee: { type: 'string', required: false, description: 'Assigned user, group, or queue' },
                status: { type: 'string', required: true, default: 'OPEN', enum: ['OPEN', 'CLAIMED', 'COMPLETED', 'CANCELLED', 'ESCALATED'], description: 'Human-task lifecycle state' },
                dueAt: { type: 'date', required: false, description: 'Optional task due timestamp' },
                decision: { type: 'object', required: false, description: 'Completed decision evidence captured from the human task' }
            }
        },
        processTrigger: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                definitionCode: { type: 'string', required: true, description: 'Process definition started by this scheduled trigger' },
                version: { type: 'int', required: false, description: 'Optional pinned process version; empty means latest published version' },
                triggerType: { type: 'string', required: true, default: 'CRON', enum: ['CRON', 'EVENT', 'MANUAL'], description: 'Trigger source type without transferring source-module ownership' },
                ownerModule: { type: 'string', required: true, default: 'nodics.process', description: 'Module that owns this trigger metadata record' },
                cronJobCode: { type: 'string', required: false, description: 'Optional nodics.cron job code consumed as schedule metadata' },
                status: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'], description: 'Trigger lifecycle state managed by Process metadata APIs' },
                schedule: { type: 'object', required: false, description: 'Browser-safe schedule summary; authoritative cron execution stays in nodics.cron' },
                lastObservedAt: { type: 'date', required: false, description: 'Last time this trigger relationship was observed or refreshed' }
            }
        },
        processAuditEvent: {
            super: 'super',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { enabled: false },
            search: { enabled: true, idPropertyName: '_id' },
            definition: {
                definitionCode: { type: 'string', required: false, description: 'Related process definition code' },
                instanceCode: { type: 'string', required: false, description: 'Related process instance code' },
                eventType: { type: 'string', required: true, description: 'Audit event type' },
                outcome: { type: 'string', required: true, description: 'Audit outcome such as success, denied, skipped, or failed' },
                actor: { type: 'string', required: false, description: 'Authenticated actor or service identity' },
                metadata: { type: 'object', required: false, description: 'Redacted, bounded diagnostic metadata' }
            }
        }
    }
};
