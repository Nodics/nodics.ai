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
const { isDeepStrictEqual } = require('util');
const crypto = require('crypto');

/**
 * @module workflow/service/definition/DefaultProcessDefinitionContributionService
 * @description Reconciles destination-qualified, immutable domain-owned workflow contributions through the Process definition lifecycle services.
 * @layer service
 * @owner workflow
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
        let candidates = (contribution.declaredFiles || []).filter(file =>
            /^(init|init-v\d{3})\/(data|records)\/.+\.js$/.test(file));
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
        if (new Set(payload.definitions.map(definition => definition && definition.code)).size !== payload.definitions.length) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition contribution contains duplicate identities');
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

    /**
     * Applies configured node assignees to a detached definition. Entries are scoped
     * to the definition, domain and contribution owner; only existing TASK nodes can
     * be assigned. Malformed policy or graph/identity overrides fail before mutation.
     */
    customizeDefinition: function (definition, contribution) {
        let assignments = this.getPolicy().reviewerAssignments || {};
        if (typeof assignments !== 'object' || Array.isArray(assignments)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Reviewer assignments must be a definition map');
        }
        if (!Object.prototype.hasOwnProperty.call(assignments, definition.code)) return definition;
        let policy = assignments[definition.code];
        if (!policy || typeof policy !== 'object' || Array.isArray(policy) ||
            Object.keys(policy).some(key => !['ownerModule', 'contributionOwner', 'nodeAssignees'].includes(key)) ||
            typeof policy.ownerModule !== 'string' || !policy.ownerModule ||
            typeof policy.contributionOwner !== 'string' || !policy.contributionOwner ||
            !policy.nodeAssignees || typeof policy.nodeAssignees !== 'object' || Array.isArray(policy.nodeAssignees)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Reviewer policy permits only scoped node assignee mappings');
        }
        if (policy.ownerModule !== definition.ownerModule || policy.contributionOwner !== contribution.moduleName) return definition;
        let updates = Object.entries(policy.nodeAssignees).map(([code, assignee]) => {
            let nodes = definition.graph.nodes.filter(node => node.code === code);
            if (nodes.length !== 1 || nodes[0].type !== 'TASK' || typeof assignee !== 'string' ||
                !assignee.trim() || assignee !== assignee.trim() || assignee.length > 128) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Reviewer assignment requires an existing TASK node and a bounded assignee');
            }
            return { node: nodes[0], assignee: assignee };
        });
        updates.forEach(update => { update.node.assignee = update.assignee; });
        return definition;
    },

    /** Returns the complete immutable source identity, independently of definition ownership. */
    provenance: function (definition) {
        return {
            moduleName: definition.contributionOwner,
            releaseCode: definition.contributionCode,
            version: definition.contributionVersion,
            checksum: definition.contributionChecksum
        };
    },

    /** Compares execution semantics, including customer reviewer policy, without depending on JSON key order. */
    sameExecution: function (left, right) {
        return isDeepStrictEqual(left.graph, right.graph) &&
            isDeepStrictEqual(left.policy || {}, right.policy || {});
    },

    /** Binds operator evidence to the complete effective graph and policy, including later-layer customization. */
    executionChecksum: function (definition) {
        return crypto.createHash('sha256').update(JSON.stringify({
            graph: definition.graph, policy: definition.policy || {}
        })).digest('hex');
    },

    /** Reads and verifies installed immutable evidence using tenant-scoped lifecycle services. */
    publishedEvidence: async function (request, existing) {
        let lifecycle = SERVICE.DefaultProcessDefinitionLifecycleService;
        let version = await lifecycle.requireLatestVersion(request, existing);
        let source = this.provenance(existing);
        if (!Object.values(source).every(value => typeof value === 'string' && value.length > 0) ||
            !/^[a-f0-9]{64}$/.test(source.checksum) ||
            !/^[a-f0-9]{64}$/.test(version.checksum || '') ||
            version.definitionCode !== existing.code || version.version !== existing.currentVersion ||
            version.status !== 'PUBLISHED' || !isDeepStrictEqual(this.provenance(version), source) ||
            version.checksum !== lifecycle.checksum(Object.assign({}, existing, { graph: version.graph })) ||
            !this.sameExecution(existing, version)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Contribution adoption evidence does not match the published version');
        }
        return version;
    },

    /** Resolves one explicitly selected contribution through nImport; supplied descriptors are never trusted here. */
    qualifyRelease: async function (request) {
        let selection = request && request.releaseRequest;
        if (!selection || !Array.isArray(selection.releaseCodes) || selection.releaseCodes.length !== 1 ||
            selection.modules || selection.dataType !== 'init') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Select exactly one Init process contribution release');
        }
        let plan = await SERVICE.DefaultDataReleaseService.preparePlan(request);
        if (plan.releases.length !== 1 || plan.releases[0].releaseCode !== selection.releaseCodes[0] ||
            plan.releases[0].installer !== 'PROCESS_DEFINITION' || plan.releases[0].destinationRole !== 'PROCESS') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Selected release is not a Process definition contribution');
        }
        return plan.releases[0];
    },

    /** Reports qualified target and installed evidence before transition approval, without granting authority or writing state. */
    inspectRelease: async function (request) {
        let contribution = await this.qualifyRelease(request);
        return this.inspectContribution(Object.assign({}, request, { contribution: contribution }));
    },

    /** Reads evidence for the descriptor qualified by nImport, without resolving caller-supplied selectors again. */
    inspectContribution: async function (request) {
        let contribution = request.contribution;
        let definitions = this.contributionDefinitions(contribution);
        let evidence = [];
        for (let definition of definitions) {
            let existing = await SERVICE.DefaultProcessDefinitionLifecycleService.findDefinition(request, definition.code);
            let version;
            if (existing) {
                if (existing.ownerModule !== definition.ownerModule || existing.status !== 'PUBLISHED') {
                    throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Inspection requires a published definition with the same domain owner');
                }
                version = await this.publishedEvidence(request, existing);
            }
            evidence.push({ code: definition.code,
                installed: existing && this.provenance(existing),
                currentVersion: existing && existing.currentVersion,
                publishedChecksum: version && version.checksum,
                equivalent: existing ? this.sameExecution(existing, definition) : false,
                target: this.provenance(this.model(definition, contribution)),
                targetExecutionChecksum: this.executionChecksum(definition) });
        }
        return { releaseCode: contribution.releaseCode, definitions: evidence };
    },

    /** Returns evidence and an authorized plan to nImport preflight; blocked authority is data, never approval. */
    preflightContribution: async function (request) {
        let evidence = await this.inspectContribution(request);
        try {
            let plan = await this.planContribution(request);
            return { ready: true, evidence: evidence, plan: plan };
        } catch (error) {
            if (!['ERR_PROCESS_00003', 'ERR_PROCESS_00005'].includes(error.code)) throw error;
            return { ready: false, evidence: evidence,
                blocker: { code: error.code, message: error.message } };
        }
    },

    /** Plans an explicit nImport-qualified release against configured transition authority, without executing it. */
    planRelease: async function (request) {
        let contribution = await this.qualifyRelease(request);
        return this.planContribution(Object.assign({}, request, { contribution: contribution }));
    },

    /**
     * Plans one qualified definition without writes. Cross-owner adoption needs an exact
     * configured source/target pair and immutable version checksum for this definition.
     * Request bodies cannot grant migration authority. Equivalent execution retains all
     * installed provenance; changed execution requires the explicit forward mode.
     */
    planDefinition: async function (request, definition, contribution) {
        let lifecycle = SERVICE.DefaultProcessDefinitionLifecycleService;
        let existing = await lifecycle.findDefinition(request, definition.code);
        if (!existing) return { action: 'CREATE' };
        let target = this.provenance(this.model(definition, contribution));
        let source = this.provenance(existing);
        if (existing.ownerModule !== definition.ownerModule) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition domain owner conflict');
        }
        if (source.moduleName !== target.moduleName || source.releaseCode !== target.releaseCode) {
            let transitions = this.getPolicy().ownershipTransitions || [];
            let transition = Array.isArray(transitions) && transitions.find(item => item && item.definitionCode === definition.code &&
                isDeepStrictEqual(item.source, source) && isDeepStrictEqual(item.target, target));
            if (!transition || !['RETAIN', 'FORWARD'].includes(transition.mode)) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition is owned by another contribution');
            }
            let prepared = transition.mode === 'FORWARD' && existing.status === 'DRAFT' &&
                existing.preparedFromVersion === existing.currentVersion;
            if (existing.status !== 'PUBLISHED' && !prepared) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Contribution adoption requires a published definition');
            }
            let version = await this.publishedEvidence(request, existing);
            if (version.checksum !== transition.publishedChecksum) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Contribution adoption evidence does not match the published version');
            }
            if (this.sameExecution(existing, definition)) {
                if (prepared) throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Retained adoption cannot discard a draft');
                return { action: 'RETAIN', existing: existing };
            }
            if (transition.mode !== 'FORWARD') {
                throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Changed execution requires an explicit forward migration');
            }
            if (transition.targetExecutionChecksum !== this.executionChecksum(definition)) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Forward migration target execution does not match approved evidence');
            }
            return { action: 'FORWARD', existing: existing };
        }
        let comparison = this.compareVersions(contribution.version, existing.contributionVersion);
        if (comparison < 0) throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition contribution downgrade is not allowed');
        if (comparison === 0 && existing.contributionChecksum !== contribution.checksum) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition contribution changed without a version change');
        }
        if (comparison === 0 && existing.status === 'PUBLISHED') {
            if (!this.sameExecution(existing, definition)) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Installed execution changed without a contribution version change');
            }
            return { action: 'CURRENT', existing: existing };
        }
        if (!['PUBLISHED', 'DRAFT'].includes(existing.status)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Process definition contribution cannot update the current lifecycle state');
        }
        return { action: 'UPDATE', existing: existing };
    },

    /** Reconciles one definition idempotently through create/update/publish services. */
    reconcileDefinition: async function (request, definition, contribution) {
        let lifecycle = SERVICE.DefaultProcessDefinitionLifecycleService;
        let plan = await this.planDefinition(request, definition, contribution);
        let existing = plan.existing;
        let model = this.model(definition, contribution);
        if (plan.action === 'CREATE') {
            await lifecycle.createDefinition(Object.assign({}, request, { processDefinition: model }));
            return lifecycle.publishDraft(Object.assign({}, request, { definitionCode: definition.code }));
        }
        if (plan.action === 'CURRENT' || plan.action === 'RETAIN') {
            return { code: 'SUC_PROCESS_00007', data: { code: definition.code, status: 'CURRENT',
                version: existing.currentVersion, retained: plan.action === 'RETAIN',
                provenance: this.provenance(existing) } };
        }
        if (existing.status === 'PUBLISHED') {
            await lifecycle.prepareNextDraft(Object.assign({}, request, { definitionCode: definition.code }));
        } else if (existing.status !== 'DRAFT') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Process definition contribution cannot update the current lifecycle state');
        }
        await lifecycle.updateDraft(Object.assign({}, request, { definitionCode: definition.code, processDefinition: model }));
        return lifecycle.publishDraft(Object.assign({}, request, { definitionCode: definition.code }));
    },

    /** Loads and validates detached definitions plus later-layer customer policy. */
    contributionDefinitions: function (contribution) {
        let payload = this.loadPayload(contribution);
        let definitions = this.validateContribution(contribution, payload).map(definition => {
            let customized = this.customizeDefinition(JSON.parse(JSON.stringify(definition)), contribution);
            if (!customized || customized.code !== definition.code || customized.ownerModule !== definition.ownerModule) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Contribution customization cannot change definition identity');
            }
            return customized;
        });
        this.validateContribution(contribution, { definitions: definitions });
        return definitions;
    },

    /** Returns a read-only adoption/install plan; this is an internal service, not a new API or approval authority. */
    planContribution: async function (request) {
        let contribution = request && request.contribution;
        let definitions = this.contributionDefinitions(contribution);
        let plans = [];
        for (let definition of definitions) {
            let plan = await this.planDefinition(request, definition, contribution);
            plans.push({ code: definition.code, action: plan.action,
                installed: plan.existing && this.provenance(plan.existing),
                target: this.provenance(this.model(definition, contribution)),
                targetExecutionChecksum: this.executionChecksum(definition) });
        }
        return { releaseCode: contribution.releaseCode, definitions: plans };
    },

    /** Installs or upgrades one qualified definition contribution without direct persistence or generic saveAll. */
    installContribution: async function (request) {
        let contribution = request && request.contribution;
        let definitions = this.contributionDefinitions(contribution);
        // Preflight the complete release, then recheck each definition immediately before mutation.
        for (let definition of definitions) await this.planDefinition(request, definition, contribution);
        let results = [];
        for (let definition of definitions) results.push(await this.reconcileDefinition(request, definition, contribution));
        return { code: 'SUC_PROCESS_00007', data: { releaseCode: contribution.releaseCode,
            version: contribution.version, definitions: results.map(result => result.data) } };
    }
};
