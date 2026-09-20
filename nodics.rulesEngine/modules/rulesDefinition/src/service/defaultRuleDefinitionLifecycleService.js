/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module rulesDefinition/src/service/defaultRuleDefinitionLifecycleService @description Owns governed rule-set and score-band draft, validation, immutable publication and next-draft preparation. @layer service @owner rulesDefinition */
module.exports = {
    tenant: function (request) {
        return request && request.tenant || (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('defaultTenant')) || 'default';
    },

    actor: function (request) {
        let auth = request && request.authData || {};
        return auth.loginId || auth.code || auth.userId || auth.serviceId;
    },

    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: this.tenant(request),
            authData: request && request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    ruleSetService: function () { return SERVICE.DefaultRuleSetService; },
    ruleSetVersionService: function () { return SERVICE.DefaultRuleSetVersionService; },
    bandSetService: function () { return SERVICE.DefaultScoreBandSetService; },
    bandSetVersionService: function () { return SERVICE.DefaultScoreBandSetVersionService; },

    validationService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleDefinitionValidationService
            ? SERVICE.DefaultRuleDefinitionValidationService
            : require('./defaultRuleDefinitionValidationService');
    },

    auditService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleAuditService
            ? SERVICE.DefaultRuleAuditService
            : require('./defaultRuleAuditService');
    },

    assertCurrentSimulation: async function (request, ruleSet) {
        let simulation = ruleSet.lastSimulation || {};
        let bandVersion = await this.currentBandVersion(request, ruleSet.scoreBandSetCode);
        if (!simulation.sourceHash ||
            Number(simulation.draftRevision) !== Number(ruleSet.draftRevision || 1) ||
            !bandVersion ||
            simulation.bandSetCode !== bandVersion.bandSetCode ||
            Number(simulation.bandSetVersion) !== Number(bandVersion.version)) {
            throw new Error('Run a successful simulation for the current rule and reward-band versions before submission or publication');
        }
        return bandVersion;
    },

    isCode: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
    },

    assertCode: function (value) {
        if (!this.isCode(value)) throw new Error('Rule definition code is invalid');
        return value;
    },

    modelOf: function (request) {
        return request && (request.model || request.body || request.ruleSet || request.bandSet) || {};
    },

    one: function (response) {
        let result = response && response.result;
        if (Array.isArray(result)) return result[0];
        return result;
    },

    findRuleSet: async function (request, code) {
        let response = await this.ruleSetService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(code) },
            searchOptions: { limit: 2 }
        }));
        return this.one(response);
    },

    requireRuleSet: async function (request, code) {
        let row = await this.findRuleSet(request, code);
        if (!row) throw new Error('Rule set was not found');
        return row;
    },

    findBandSet: async function (request, code) {
        let response = await this.bandSetService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(code) },
            searchOptions: { limit: 2 }
        }));
        return this.one(response);
    },

    requireBandSet: async function (request, code) {
        let row = await this.findBandSet(request, code);
        if (!row) throw new Error('Score band set was not found');
        return row;
    },

    checksum: function (payload) {
        return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    },

    publishedStatus: function (effectiveFrom, effectiveTo, now) {
        now = now || new Date();
        if (effectiveTo && new Date(effectiveTo) <= now) return 'EXPIRED';
        if (effectiveFrom && new Date(effectiveFrom) > now) return 'SCHEDULED';
        return 'ACTIVE';
    },

    createRuleSet: async function (request) {
        let model = Object.assign({}, this.modelOf(request));
        this.assertCode(model.code);
        if (await this.findRuleSet(request, model.code)) throw new Error('Rule set already exists');
        let validation = this.validationService().validateDefinition({
            definition: model.definition,
            propertyProviderCode: model.propertyProviderCode,
            context: request.validationContext
        });
        let now = new Date();
        Object.assign(model, {
            status: 'DRAFT',
            currentVersion: 0,
            draftRevision: 1,
            validation: validation,
            createdBy: this.actor(request),
            createdAt: now,
            active: true
        });
        let response = await this.ruleSetService().save(this.serviceRequest(request, { model: model }));
        await this.auditService().record(request, {
            ruleSetCode: model.code,
            draftRevision: model.draftRevision,
            eventType: 'RULE_SET_CREATED',
            outcome: 'SUCCESS',
            metadata: { valid: validation.valid, issueCount: validation.issues.length }
        });
        return { code: 'RULE_SET_CREATED', data: response.result || response };
    },

    updateRuleSetDraft: async function (request) {
        let current = await this.requireRuleSet(request, request.ruleSetCode);
        if (current.status !== 'DRAFT') throw new Error('Only draft rule sets can be updated');
        if (current.approval && current.approval.status === 'PENDING')
            throw new Error('This draft is awaiting approval and cannot be edited');
        let patch = Object.assign({}, this.modelOf(request));
        ['code','status','currentVersion','createdBy','createdAt','publishedAt'].forEach(key => delete patch[key]);
        let validation = this.validationService().validateDefinition({
            definition: patch.definition || current.definition,
            propertyProviderCode: patch.propertyProviderCode || current.propertyProviderCode,
            context: request.validationContext
        });
        patch.validation = validation;
        patch.draftRevision = Number(current.draftRevision || 1) + 1;
        patch.lastSimulation = null;
        patch.approval = null;
        await this.ruleSetService().update(this.serviceRequest(request, {
            query: { code: current.code, status: 'DRAFT' },
            model: { $set: patch }
        }));
        await this.auditService().record(request, {
            ruleSetCode: current.code,
            draftRevision: patch.draftRevision,
            eventType: 'RULE_SET_DRAFT_UPDATED',
            outcome: 'SUCCESS',
            metadata: { valid: validation.valid, issueCount: validation.issues.length }
        });
        return { code: 'RULE_SET_UPDATED', data: { code: current.code, draftRevision: patch.draftRevision, validation: validation } };
    },

    validateRuleSetDraft: async function (request) {
        let current = await this.requireRuleSet(request, request.ruleSetCode);
        let validation = this.validationService().validateDefinition({
            definition: current.definition,
            propertyProviderCode: current.propertyProviderCode,
            context: request.validationContext
        });
        let dateValidation = this.validationService().validateDates(current.effectiveFrom, current.effectiveTo);
        validation.issues = validation.issues.concat(dateValidation.issues);
        validation.valid = validation.issues.length === 0;
        await this.ruleSetService().update(this.serviceRequest(request, {
            query: { code: current.code },
            model: { $set: { validation: validation } }
        }));
        if (!validation.valid) {
            let error = new Error('Rule set validation failed');
            error.issues = validation.issues;
            throw error;
        }
        return { code: 'RULE_SET_VALID', data: validation };
    },

    currentBandVersion: async function (request, bandSetCode) {
        if (!bandSetCode) return null;
        let bandSet = await this.requireBandSet(request, bandSetCode);
        if (Number(bandSet.currentVersion || 0) < 1) {
            throw new Error('Referenced score band set has no published version');
        }
        let response = await this.bandSetVersionService().get(this.serviceRequest(request, {
            query: { bandSetCode: bandSet.code, version: Number(bandSet.currentVersion) },
            searchOptions: { limit: 1 }
        }));
        let version = this.one(response);
        if (!version) throw new Error('Referenced score band version was not found');
        return version;
    },

    publishRuleSetDraft: async function (request) {
        let current = await this.requireRuleSet(request, request.ruleSetCode);
        if (current.status !== 'DRAFT') throw new Error('Only draft rule sets can be published');
        await this.validateRuleSetDraft(Object.assign({}, request, { ruleSetCode: current.code }));
        let bandVersion = await this.assertCurrentSimulation(request, current);
        let version = Number(current.currentVersion || 0) + 1;
        let now = new Date();
        let status = this.publishedStatus(current.effectiveFrom, current.effectiveTo, now);
        let immutable = {
            code: current.code + '_v' + version,
            active: status === 'ACTIVE' || status === 'SCHEDULED',
            name: current.name,
            ruleSetCode: current.code,
            version: version,
            consumerModule: current.consumerModule,
            policyType: current.policyType,
            propertyProviderCode: current.propertyProviderCode,
            propertyCatalogueVersion: current.propertyCatalogueVersion,
            scopeType: current.scopeType,
            scopeCode: current.scopeCode,
            inheritsFrom: current.inheritsFrom,
            overridePolicy: current.overridePolicy,
            scoreBandSetCode: current.scoreBandSetCode,
            scoreBandSetVersion: bandVersion && bandVersion.version,
            minimumScore: current.minimumScore,
            maximumScore: current.maximumScore,
            definition: current.definition,
            effectiveFrom: current.effectiveFrom,
            effectiveTo: current.effectiveTo,
            status: status,
            publishedBy: this.actor(request),
            approvedBy: request.approvedBy,
            approvedAt: request.approvedAt,
            supersedesVersion: Number(current.currentVersion || 0) || undefined,
            changeReason: request.changeReason,
            metadata: current.metadata,
            publishedAt: now
        };
        immutable.checksum = this.checksum(immutable);
        await this.ruleSetVersionService().save(this.serviceRequest(request, { model: immutable }));
        await this.ruleSetService().update(this.serviceRequest(request, {
            query: { code: current.code, status: 'DRAFT' },
            model: { $set: { status: status, currentVersion: version, publishedAt: now, active: immutable.active } }
        }));
        await this.auditService().record(request, {
            ruleSetCode: current.code,
            version: version,
            draftRevision: current.draftRevision,
            eventType: 'RULE_SET_PUBLISHED',
            outcome: 'SUCCESS',
            reason: request.changeReason,
            metadata: {
                status: status,
                checksum: immutable.checksum,
                bandSetCode: bandVersion && bandVersion.bandSetCode,
                bandSetVersion: bandVersion && bandVersion.version
            }
        });
        return { code: 'RULE_SET_PUBLISHED', data: { code: current.code, version: version, status: status, checksum: immutable.checksum } };
    },

    prepareNextRuleSetDraft: async function (request) {
        let current = await this.requireRuleSet(request, request.ruleSetCode);
        if (current.status === 'DRAFT') return { code: 'RULE_SET_DRAFT_READY', data: current };
        if (Number(current.currentVersion || 0) < 1) throw new Error('Published rule-set version is required');
        let response = await this.ruleSetVersionService().get(this.serviceRequest(request, {
            query: { ruleSetCode: current.code, version: Number(current.currentVersion) },
            searchOptions: { limit: 1 }
        }));
        let version = this.one(response);
        if (!version) throw new Error('Published rule-set version was not found');
        let draftRevision = Number(current.draftRevision || 1) + 1;
        await this.ruleSetService().update(this.serviceRequest(request, {
            query: { code: current.code },
            model: { $set: {
                status: 'DRAFT',
                definition: version.definition,
                propertyProviderCode: version.propertyProviderCode,
                propertyCatalogueVersion: version.propertyCatalogueVersion,
                scopeType: version.scopeType,
                scopeCode: version.scopeCode,
                inheritsFrom: version.inheritsFrom,
                overridePolicy: version.overridePolicy,
                scoreBandSetCode: version.scoreBandSetCode,
                minimumScore: version.minimumScore,
                maximumScore: version.maximumScore,
                effectiveFrom: version.effectiveFrom,
                effectiveTo: version.effectiveTo,
                draftRevision: draftRevision,
                preparedFromVersion: version.version,
                validation: null,
                lastSimulation: null,
                approval: null
            } }
        }));
        await this.auditService().record(request, {
            ruleSetCode: current.code,
            draftRevision: draftRevision,
            version: version.version,
            eventType: 'RULE_SET_NEXT_DRAFT_PREPARED',
            outcome: 'SUCCESS'
        });
        return { code: 'RULE_SET_DRAFT_READY', data: { code: current.code, draftRevision: draftRevision, preparedFromVersion: version.version } };
    },

    createBandSet: async function (request) {
        let model = Object.assign({}, this.modelOf(request));
        this.assertCode(model.code);
        if (await this.findBandSet(request, model.code)) throw new Error('Score band set already exists');
        let validation = this.validationService().validateBands(model.bands, model.gapBehavior || 'REJECT');
        Object.assign(model, { status: 'DRAFT', currentVersion: 0, draftRevision: 1, validation: validation, active: true });
        let response = await this.bandSetService().save(this.serviceRequest(request, { model: model }));
        await this.auditService().record(request, {
            bandSetCode: model.code,
            draftRevision: model.draftRevision,
            eventType: 'SCORE_BAND_SET_CREATED',
            outcome: 'SUCCESS',
            metadata: { valid: validation.valid, issueCount: validation.issues.length }
        });
        return { code: 'SCORE_BAND_SET_CREATED', data: response.result || response };
    },

    updateBandSetDraft: async function (request) {
        let current = await this.requireBandSet(request, request.bandSetCode);
        if (current.status !== 'DRAFT') throw new Error('Only draft score band sets can be updated');
        let patch = Object.assign({}, this.modelOf(request));
        ['code','status','currentVersion'].forEach(key => delete patch[key]);
        let bands = patch.bands || current.bands;
        let gapBehavior = patch.gapBehavior || current.gapBehavior;
        let validation = this.validationService().validateBands(bands, gapBehavior);
        patch.validation = validation;
        patch.draftRevision = Number(current.draftRevision || 1) + 1;
        await this.bandSetService().update(this.serviceRequest(request, {
            query: { code: current.code, status: 'DRAFT' },
            model: { $set: patch }
        }));
        return { code: 'SCORE_BAND_SET_UPDATED', data: { code: current.code, draftRevision: patch.draftRevision, validation: validation } };
    },

    publishBandSetDraft: async function (request) {
        let current = await this.requireBandSet(request, request.bandSetCode);
        if (current.status !== 'DRAFT') throw new Error('Only draft score band sets can be published');
        let validation = this.validationService().validateBands(current.bands, current.gapBehavior);
        let dateValidation = this.validationService().validateDates(current.effectiveFrom, current.effectiveTo);
        validation.issues = validation.issues.concat(dateValidation.issues);
        validation.valid = validation.issues.length === 0;
        if (!validation.valid) {
            let error = new Error('Score band validation failed');
            error.issues = validation.issues;
            throw error;
        }
        let version = Number(current.currentVersion || 0) + 1;
        let now = new Date();
        let status = this.publishedStatus(current.effectiveFrom, current.effectiveTo, now);
        let immutable = {
            code: current.code + '_v' + version,
            active: status === 'ACTIVE' || status === 'SCHEDULED',
            name: current.name,
            bandSetCode: current.code,
            version: version,
            consumerModule: current.consumerModule,
            outcomeType: current.outcomeType,
            bands: current.bands,
            gapBehavior: current.gapBehavior,
            effectiveFrom: current.effectiveFrom,
            effectiveTo: current.effectiveTo,
            status: status,
            publishedBy: this.actor(request),
            publishedAt: now
        };
        immutable.checksum = this.checksum(immutable);
        await this.bandSetVersionService().save(this.serviceRequest(request, { model: immutable }));
        await this.bandSetService().update(this.serviceRequest(request, {
            query: { code: current.code, status: 'DRAFT' },
            model: { $set: { status: status, currentVersion: version, validation: validation, active: immutable.active } }
        }));
        await this.auditService().record(request, {
            bandSetCode: current.code,
            version: version,
            draftRevision: current.draftRevision,
            eventType: 'SCORE_BAND_SET_PUBLISHED',
            outcome: 'SUCCESS',
            metadata: { status: status, checksum: immutable.checksum }
        });
        return { code: 'SCORE_BAND_SET_PUBLISHED', data: { code: current.code, version: version, status: status, checksum: immutable.checksum } };
    },

    prepareNextBandSetDraft: async function (request) {
        let current = await this.requireBandSet(request, request.bandSetCode);
        if (current.status === 'DRAFT') return { code: 'SCORE_BAND_SET_DRAFT_READY', data: current };
        if (Number(current.currentVersion || 0) < 1) throw new Error('Published score-band version is required');
        let response = await this.bandSetVersionService().get(this.serviceRequest(request, {
            query: { bandSetCode: current.code, version: Number(current.currentVersion) },
            searchOptions: { limit: 1 }
        }));
        let version = this.one(response);
        if (!version) throw new Error('Published score-band version was not found');
        let draftRevision = Number(current.draftRevision || 1) + 1;
        await this.bandSetService().update(this.serviceRequest(request, {
            query: { code: current.code },
            model: { $set: {
                status: 'DRAFT',
                consumerModule: version.consumerModule,
                outcomeType: version.outcomeType,
                bands: version.bands,
                gapBehavior: version.gapBehavior,
                effectiveFrom: version.effectiveFrom,
                effectiveTo: version.effectiveTo,
                draftRevision: draftRevision,
                validation: null
            } }
        }));
        await this.auditService().record(request, {
            bandSetCode: current.code,
            version: version.version,
            draftRevision: draftRevision,
            eventType: 'SCORE_BAND_SET_NEXT_DRAFT_PREPARED',
            outcome: 'SUCCESS'
        });
        return {
            code: 'SCORE_BAND_SET_DRAFT_READY',
            data: { code: current.code, draftRevision: draftRevision, preparedFromVersion: version.version }
        };
    }
};
