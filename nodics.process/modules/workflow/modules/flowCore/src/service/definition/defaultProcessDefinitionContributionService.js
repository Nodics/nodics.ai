/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @module flowCore/service/definition/DefaultProcessDefinitionContributionService
 * @description Reconciles destination-qualified, immutable domain-owned workflow contributions through the Process definition lifecycle services.
 * @layer service
 * @owner flowCore
 * @override Customer Process overlays may narrow policy or map additional qualified contribution installers without bypassing checksum, ownership, or lifecycle validation.
 */
module.exports = {
    /** Returns bounded contribution installation policy. */
    getPolicy: function () {
        return ((CONFIG.get('process') || {}).definitionContributions) || {};
    },

    /** Compares strict semantic release versions. */
    compareVersions: function (left, right) {
        let first = String(left || '0.0.0').split('.').map(Number);
        let second = String(right || '0.0.0').split('.').map(Number);
        for (let index = 0; index < 3; index++) {
            if (first[index] !== second[index]) return first[index] > second[index] ? 1 : -1;
        }
        return 0;
    },

    /** Loads only JS payloads declared and checksum-qualified by nImport from a known Nodics module. */
    loadPayload: function (contribution) {
        let owner = NODICS.getRawModule(contribution.moduleName);
        if (!owner || !owner.path) throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Contribution owner is unavailable');
        let candidates = (contribution.declaredFiles || []).filter(file => /^init\/data\/.+\.js$/.test(file));
        if (candidates.length !== 1) throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition contribution must declare one data payload');
        let dataRoot = path.resolve(owner.path, 'data');
        let payloadPath = path.resolve(dataRoot, candidates[0]);
        if (!payloadPath.startsWith(dataRoot + path.sep) || !fs.existsSync(payloadPath) ||
            fs.lstatSync(payloadPath).isSymbolicLink() || !fs.statSync(payloadPath).isFile()) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition contribution payload is unavailable');
        }
        delete require.cache[require.resolve(payloadPath)];
        return JSON.parse(JSON.stringify(require(payloadPath)));
    },

    /** Validates the nImport-qualified release and its domain-owned payload. */
    validateContribution: function (contribution, payload) {
        if (!contribution || contribution.destinationRole !== 'PROCESS' || contribution.installer !== 'PROCESS_DEFINITION' ||
            !/^[A-Za-z][A-Za-z0-9_-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(contribution.releaseCode || '') ||
            !/^\d+\.\d+\.\d+$/.test(contribution.version || '') || !/^[a-f0-9]{64}$/.test(contribution.checksum || '')) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition contribution contract is invalid');
        }
        let maximum = Number(this.getPolicy().maximumDefinitionsPerContribution || 50);
        if (!payload || !Array.isArray(payload.definitions) || payload.definitions.length === 0 || payload.definitions.length > maximum) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition contribution payload is invalid');
        }
        payload.definitions.forEach(definition => {
            if (!definition || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(definition.code || '') ||
                definition.ownerModule !== contribution.owningDomain || !definition.graph) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Contributed process definition identity is invalid');
            }
            SERVICE.DefaultProcessGraphValidationService.assertValidGraph(definition.graph);
        });
        return payload.definitions;
    },

    /** Builds lifecycle-owned draft input while binding immutable contribution provenance. */
    model: function (definition, contribution) {
        return Object.assign({}, definition, {
            contributionOwner: contribution.moduleName,
            contributionCode: contribution.releaseCode,
            contributionVersion: contribution.version,
            contributionChecksum: contribution.checksum
        });
    },

    /** Reconciles one definition idempotently through create/update/publish services. */
    reconcileDefinition: async function (request, definition, contribution) {
        let lifecycle = SERVICE.DefaultProcessDefinitionLifecycleService;
        let existing = await lifecycle.findDefinition(request, definition.code);
        let model = this.model(definition, contribution);
        if (!existing) {
            await lifecycle.createDefinition(Object.assign({}, request, { processDefinition: model }));
            return lifecycle.publishDraft(Object.assign({}, request, { definitionCode: definition.code }));
        }
        if (existing.contributionCode && existing.contributionCode !== contribution.releaseCode) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition is owned by another contribution');
        }
        let comparison = this.compareVersions(contribution.version, existing.contributionVersion);
        if (comparison < 0) throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition contribution downgrade is not allowed');
        if (comparison === 0 && existing.contributionChecksum === contribution.checksum && existing.status === 'PUBLISHED') {
            return { code: 'SUC_PROCESS_00007', data: { code: definition.code, status: 'CURRENT', version: existing.currentVersion } };
        }
        if (comparison === 0 && existing.contributionChecksum && existing.contributionChecksum !== contribution.checksum) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition contribution changed without a version change');
        }
        if (existing.status === 'PUBLISHED') {
            await lifecycle.prepareNextDraft(Object.assign({}, request, { definitionCode: definition.code }));
        } else if (existing.status !== 'DRAFT') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Process definition contribution cannot update the current lifecycle state');
        }
        await lifecycle.updateDraft(Object.assign({}, request, { definitionCode: definition.code, processDefinition: model }));
        return lifecycle.publishDraft(Object.assign({}, request, { definitionCode: definition.code }));
    },

    /** Installs or upgrades one qualified definition contribution without direct persistence or generic saveAll. */
    installContribution: async function (request) {
        let contribution = request && request.contribution;
        let payload = this.loadPayload(contribution);
        let definitions = this.validateContribution(contribution, payload);
        let results = [];
        for (let definition of definitions) results.push(await this.reconcileDefinition(request, definition, contribution));
        return { code: 'SUC_PROCESS_00007', data: { releaseCode: contribution.releaseCode,
            version: contribution.version, definitions: results.map(result => result.data) } };
    }
};
