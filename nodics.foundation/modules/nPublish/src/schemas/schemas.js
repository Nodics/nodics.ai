/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPublish/schemas/schemas
 * @description Reserved schema contribution for publish/version promotion models.
 * @layer schema
 * @owner nPublish
 * @override Project modules may add later schemas for customer publishing governance.
 */
module.exports = {
    publish: {
        publicationRequest: {
            super: 'base',
            isVersionedEnabled: false,
            cache: { enabled: false },
            model: true,
            service: {
                enabled: true
            },
            router: { groups: { schemaOperations: true },
                enabled: true
            },
            definition: {
                domain: { type: 'string', required: true, description: 'Owning domain adapter code' },
                rootType: { type: 'string', required: true, description: 'Domain-owned root asset type' },
                rootCode: { type: 'string', required: true, description: 'Domain-owned root asset identity' },
                sourceVersion: { type: 'string', required: true, description: 'Immutable staged source version' },
                targetVersion: { type: 'string', required: false, description: 'Activated Online version' },
                state: { type: 'string', required: true, default: 'STAGED', description: 'Governed generic publication state' },
                revision: { type: 'int', required: true, default: 0, description: 'Optimistic-concurrency revision' },
                auditTrail: { type: 'array', required: true, default: [], description: 'Authoritative immutable transition journal updated atomically with lifecycle state' },
                dependencies: { type: 'array', required: false, description: 'Bounded adapter-resolved dependency identities' },
                mediaCodes: { type: 'array', required: false, description: 'Additional media identities that must move with the governed publication even when they are not directly present in the root content graph' },
                validation: { type: 'object', required: false, description: 'Sanitized domain validation result' },
                workflowRef: { type: 'string', required: false, description: 'Existing workflow authority reference' },
                previousOnlineVersion: { type: 'string', required: false, description: 'Rollback target captured before activation' },
                recoveryFromState: { type: 'string', required: false, description: 'Terminal state that initiated the current governed recovery attempt' },
                requestedBy: { type: 'string', required: false , description: 'Stores the requested by value used by this record.'},
                correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        },
        publicationAudit: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: { groups: { schemaOperations: true },
                enabled: true
            },
            event: {
                enabled: false
            },
            definition: {
                publicationCode: { type: 'string', required: true , description: 'Stores the publication code used to classify, link, or resolve this record.'},
                fromState: { type: 'string', required: false , description: 'Stores the from state value used by this record.'},
                toState: { type: 'string', required: true , description: 'Stores the to state value used by this record.'},
                revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
                actor: { type: 'string', required: false , description: 'Stores the actor value used by this record.'},
                reason: { type: 'string', required: false , description: 'Stores the reason value used by this record.'},
                details: { type: 'object', required: false, description: 'Sanitized projection of authoritative transition evidence without content payloads or secrets' },
                correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'}
            }
        }
    }
};
