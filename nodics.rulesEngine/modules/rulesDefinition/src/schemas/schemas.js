/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesDefinition/src/schemas/schemas @description Defines governed rule-set and score-band drafts plus immutable published versions. @layer schema @owner rulesDefinition @override Later framework/customer layers may extend metadata while preserving version immutability and generic semantics. */
module.exports = {
    rulesDefinition: {
        ruleSet: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                description: { type: 'string', required: false, description: 'Business-readable purpose of this governed rule set.' },
                consumerModule: { type: 'string', required: true, description: 'Registered consumer module that owns property semantics and outcome interpretation.' },
                policyType: { type: 'string', required: true, description: 'Consumer-owned policy classification such as REWARD_SCORING or PROMOTION_ELIGIBILITY.' },
                propertyProviderCode: { type: 'string', required: true, description: 'Server-owned registered property catalogue provider code.' },
                propertyCatalogueVersion: { type: 'string', required: false, description: 'Optional pinned consumer property catalogue version used for validation.' },
                scopeType: { type: 'string', required: true, enum: ['PLATFORM','DOMAIN','ENTERPRISE','CAMPAIGN'], description: 'Policy hierarchy scope.' },
                scopeCode: { type: 'string', required: true, description: 'Business scope identifier interpreted by the consumer policy resolver.' },
                inheritsFrom: { type: 'string', required: false, description: 'Optional higher-scope rule-set code used as inheritance source.' },
                overridePolicy: { type: 'object', required: false, description: 'Declarative fields and behaviors that lower scopes may override.' },
                scoreBandSetCode: { type: 'string', required: false, description: 'Related independently versioned score-band set for score-based outcomes.' },
                minimumScore: { type: 'number', required: false, description: 'Optional minimum aggregate score bound.' },
                maximumScore: { type: 'number', required: false, description: 'Optional maximum aggregate score bound.' },
                definition: { type: 'object', required: true, description: 'Editable backend-governed rule graph containing RuleGroups, Conditions and generic Outcomes.' },
                status: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT','SCHEDULED','ACTIVE','EXPIRED','DISABLED','ARCHIVED'], description: 'Business lifecycle of the rule-set aggregate.' },
                currentVersion: { type: 'int', required: true, default: 0, description: 'Latest immutable published version.' },
                draftRevision: { type: 'int', required: true, default: 1, description: 'Mutable draft revision for optimistic editing and audit.' },
                effectiveFrom: { type: 'date', required: false, description: 'Date/time this rule set becomes eligible for runtime use.' },
                effectiveTo: { type: 'date', required: false, description: 'Date/time this rule set stops being eligible for runtime use.' },
                validation: { type: 'object', required: false, description: 'Latest backend validation evidence for the draft.' },
                preparedFromVersion: { type: 'int', required: false, description: 'Immutable version used to prepare the current draft.' },
                createdBy: { type: 'string', required: false, description: 'Authenticated creator identity.' },
                createdAt: { type: 'date', required: false, description: 'Creation timestamp.' },
                publishedAt: { type: 'date', required: false, description: 'Latest publication timestamp.' },
                revision: { type: 'int', required: true, default: 0, description: 'Business revision used by governed lifecycle operations.' },
                metadata: { type: 'object', required: false, description: 'Bounded extension metadata; executable behavior is prohibited.' }
            }
        },
        ruleSetVersion: {
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search','read'] },
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                ruleSetCode: { type: 'string', required: true, description: 'Owning stable rule-set code.' },
                version: { type: 'int', required: true, description: 'Immutable version number.' },
                consumerModule: { type: 'string', required: true, description: 'Consumer module bound to this version.' },
                policyType: { type: 'string', required: true, description: 'Consumer policy type bound to this version.' },
                propertyProviderCode: { type: 'string', required: true, description: 'Property provider bound to this version.' },
                propertyCatalogueVersion: { type: 'string', required: false, description: 'Consumer property catalogue version bound to this version.' },
                scopeType: { type: 'string', required: true, enum: ['PLATFORM','DOMAIN','ENTERPRISE','CAMPAIGN'], description: 'Published policy scope.' },
                scopeCode: { type: 'string', required: true, description: 'Published scope identity.' },
                inheritsFrom: { type: 'string', required: false, description: 'Published parent rule-set identity.' },
                overridePolicy: { type: 'object', required: false, description: 'Published override policy snapshot.' },
                scoreBandSetCode: { type: 'string', required: false, description: 'Score-band set selected by this version.' },
                scoreBandSetVersion: { type: 'int', required: false, description: 'Exact immutable score-band-set version selected by this version.' },
                minimumScore: { type: 'number', required: false, description: 'Published minimum score bound.' },
                maximumScore: { type: 'number', required: false, description: 'Published maximum score bound.' },
                definition: { type: 'object', required: true, description: 'Immutable backend-validated rule graph.' },
                checksum: { type: 'string', required: true, description: 'Deterministic SHA-256 checksum of versioned business content.' },
                effectiveFrom: { type: 'date', required: false, description: 'Version effective start.' },
                effectiveTo: { type: 'date', required: false, description: 'Version effective end.' },
                status: { type: 'string', required: true, enum: ['SCHEDULED','ACTIVE','EXPIRED','DISABLED','ARCHIVED'], description: 'Published version lifecycle.' },
                publishedBy: { type: 'string', required: false, description: 'Authenticated publishing actor.' },
                approvedBy: { type: 'string', required: false, description: 'Approver identity when maker-checker applies.' },
                approvedAt: { type: 'date', required: false, description: 'Approval timestamp when maker-checker applies.' },
                supersedesVersion: { type: 'int', required: false, description: 'Previous immutable version superseded by this version.' },
                changeReason: { type: 'string', required: false, description: 'Business-readable reason for the version change.' },
                publishedAt: { type: 'date', required: true, description: 'Publication timestamp.' },
                metadata: { type: 'object', required: false, description: 'Bounded immutable extension evidence.' }
            }
        },
        scoreBandSet: {
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                description: { type: 'string', required: false, description: 'Business-readable purpose of the score-band mapping.' },
                consumerModule: { type: 'string', required: true, description: 'Consumer module interpreting band outcomes.' },
                outcomeType: { type: 'string', required: true, description: 'Consumer-owned outcome type used by the bands.' },
                bands: { type: 'array', required: true, description: 'Editable non-overlapping score ranges and structured outcomes.' },
                gapBehavior: { type: 'string', required: true, default: 'REJECT', enum: ['REJECT','NO_OUTCOME'], description: 'Explicit behavior when a score is not covered.' },
                status: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT','SCHEDULED','ACTIVE','EXPIRED','DISABLED','ARCHIVED'], description: 'Band-set lifecycle.' },
                currentVersion: { type: 'int', required: true, default: 0, description: 'Latest immutable version number.' },
                draftRevision: { type: 'int', required: true, default: 1, description: 'Editable draft revision.' },
                effectiveFrom: { type: 'date', required: false, description: 'Band-set effective start.' },
                effectiveTo: { type: 'date', required: false, description: 'Band-set effective end.' },
                validation: { type: 'object', required: false, description: 'Latest backend validation evidence.' },
                revision: { type: 'int', required: true, default: 0, description: 'Business revision.' },
                metadata: { type: 'object', required: false, description: 'Bounded extension metadata.' }
            }
        },
        scoreBandSetVersion: {
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search','read'] },
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                bandSetCode: { type: 'string', required: true, description: 'Owning score-band-set code.' },
                version: { type: 'int', required: true, description: 'Immutable band-set version.' },
                consumerModule: { type: 'string', required: true, description: 'Consumer module interpreting outcomes.' },
                outcomeType: { type: 'string', required: true, description: 'Outcome type bound to this version.' },
                bands: { type: 'array', required: true, description: 'Immutable validated score bands.' },
                gapBehavior: { type: 'string', required: true, enum: ['REJECT','NO_OUTCOME'], description: 'Published gap behavior.' },
                checksum: { type: 'string', required: true, description: 'Deterministic version checksum.' },
                effectiveFrom: { type: 'date', required: false, description: 'Version effective start.' },
                effectiveTo: { type: 'date', required: false, description: 'Version effective end.' },
                status: { type: 'string', required: true, enum: ['SCHEDULED','ACTIVE','EXPIRED','DISABLED','ARCHIVED'], description: 'Published lifecycle.' },
                publishedBy: { type: 'string', required: false, description: 'Publishing actor.' },
                publishedAt: { type: 'date', required: true, description: 'Publication timestamp.' },
                metadata: { type: 'object', required: false, description: 'Bounded immutable extension evidence.' }
            }
        }
    }
};
