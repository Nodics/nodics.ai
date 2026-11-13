/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
/** @module editorial/service/DefaultEditorialOnlineProjectionService @description Builds and switches sanitized Editorial Online projections for nPublish. @layer service @owner editorial */
module.exports = {
    /** Normalizes generated-service results. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Invokes only the configured distinct Online transport, or the same target owner on an explicit Online process. */
    targetOperation: function (operation, payload, request) {
        const config = (CONFIG.get('editorial') || {}).publication || {};
        if (!['status', 'deploy', 'rollback', 'withdraw'].includes(operation)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial target operation is unsupported');
        if (config.runtimeRole === 'STAGED') {
            const name = config.targetTransportProvider;
            if (!name || typeof SERVICE[name]?.[operation] !== 'function') throw new CLASSES.NodicsError('ERR_EDT_00001', 'A distinct qualified Online Editorial target transport is required');
            return SERVICE[name][operation](payload, request);
        }
        if (config.runtimeRole !== 'ONLINE' || typeof SERVICE.DefaultEditorialPublicationTargetService?.[operation] !== 'function') throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial projection operations require an explicit Staged transport or Online target');
        return SERVICE.DefaultEditorialPublicationTargetService[operation](Object.assign({}, request, { editorialPublicationTarget: payload }));
    },
    /** Checks a target acknowledgement without deriving success from an HTTP status or submitted model. */
    positive: function (value) {
        if (!value || typeof value !== 'object' || Array.isArray(value) || value.success === false || value.acknowledged === false || value.error ||
            value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length) ||
            [value.code, value.responseCode].some(code => typeof code === 'string' && code.startsWith('ERR_'))) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial target response could not be confirmed; inspect the original publication');
        return value;
    },
    /** Correlates qualified activation proof to the original nPublish source and predecessor, including its absent-pointer token. */
    confirmedActivation: function (value, publication) {
        const result = this.positive(value), receipt = this.positive(result.receipt), operation = publication.activationOperation;
        if (!operation || !(operation.previousOnlineVersion === null || typeof operation.previousOnlineVersion === 'string' && operation.previousOnlineVersion.length) ||
            !Number.isSafeInteger(operation.previousOnlineRevision) || operation.previousOnlineRevision < 0 ||
            receipt.operationKey !== operation.key || receipt.publicationCode !== publication.code || receipt.rootCode !== publication.rootCode ||
            receipt.sourceVersion !== publication.sourceVersion || receipt.targetVersion !== result.version ||
            receipt.previousOnlineVersion !== operation.previousOnlineVersion || receipt.previousOnlineRevision !== operation.previousOnlineRevision ||
            !Array.isArray(result.projectionCodes) || !result.projectionCodes.length || new Set(result.projectionCodes).size !== result.projectionCodes.length ||
            result.projectionCodes.some(code => typeof code !== 'string' || !code || code.includes(',')) || [...result.projectionCodes].sort().join(',') !== result.version) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial activation response does not match its original publication operation');
        return result;
    },
    /** Correlates rollback/withdrawal to the original command, publication root/source and acknowledged target identity. */
    confirmedCommand: function (value, kind, payload) {
        const result = this.positive(value), receipt = this.positive(result.receipt), publication = payload.publication;
        const count = kind === 'ROLLBACK' ? result.restored : result.withdrawn;
        const version = kind === 'ROLLBACK' ? payload.targetVersion : publication.targetVersion;
        const codes = result.projectionCodes;
        if (receipt.operationKey !== payload.operationKey || receipt.publicationCode !== publication.code || receipt.rootCode !== publication.rootCode ||
            receipt.sourceVersion !== publication.sourceVersion || receipt.operation !== kind || receipt.targetVersion !== version || receipt.affected !== count ||
            !Number.isSafeInteger(count) || count < 0 || typeof version !== 'string' || !version || count > version.split(',').length ||
            !Array.isArray(codes) || codes.length !== count || new Set(codes).size !== count || codes.some(code => typeof code !== 'string' || !code || code.includes(',')) ||
            count > 0 && [...codes].sort().join(',') !== version ||
            kind === 'ROLLBACK' && (result.version !== version || count !== version.split(',').length) || kind === 'WITHDRAWAL' && (result.articleCode !== publication.rootCode || count !== 0 && count !== version.split(',').length)) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial target command acknowledgement does not match the original publication');
        return result;
    },
    /** Uses nPublish's retained original command journal proof; an advanced lifecycle revision cannot manufacture another target intent. */
    commandPayload: function (publication, operation, targetVersion) {
        const proof = publication.targetCommandOperation, version = operation === 'ROLLBACK' ? targetVersion : publication.targetVersion;
        if (!proof || proof.contractVersion !== 1 || proof.operation !== operation || proof.publicationCode !== publication.code ||
            proof.domain !== 'editorial' || proof.domain !== publication.domain || proof.rootType !== 'article' || proof.rootType !== publication.rootType ||
            proof.rootCode !== publication.rootCode || proof.sourceVersion !== publication.sourceVersion || proof.activationKey !== publication.activationOperation?.key ||
            !Number.isSafeInteger(proof.originRevision) || proof.originRevision < 1 || !Number.isSafeInteger(publication.revision) || proof.originRevision > publication.revision ||
            proof.operationKey !== publication.code + (operation === 'ROLLBACK' ? ':rollback:' : ':withdraw:') + String(proof.originRevision) ||
            publication.state !== (operation === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING') || typeof version !== 'string' || !version ||
            crypto.createHash('sha256').update(JSON.stringify(version)).digest('hex') !== proof.targetVersionHash) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Inspect the original nPublish rollback or withdrawal intent before continuing');
        return { publication, operationKey: proof.operationKey, ...(operation === 'ROLLBACK' ? { targetVersion } : { articleCode: publication.rootCode }) };
    },
    /** Inspects only the retained activation operation; UNKNOWN never proves that its target write failed. */
    inspectActivation: async function (publication, request) {
        const result = this.confirmedPointer(await this.targetOperation('status', { publication, articleCode: publication.rootCode,
            inspectOperation: true, operationKey: publication.code + ':inspect:' + String(publication.revision) }, request));
        if (!result.activation || !['COMMITTED', 'UNKNOWN'].includes(result.activation.status)) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Original Editorial activation inspection is unverified');
        if (result.activation.status === 'COMMITTED') {
            if (typeof result.activation.isCurrent !== 'boolean') throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial activation visibility evidence is unverified');
            this.confirmedActivation(result.activation.result, publication);
        }
        return result;
    },
    /** Checks a complete current-pointer observation without inventing an absent revision. */
    confirmedPointer: function (value) {
        const result = this.positive(value);
        if (!(result.version === null || typeof result.version === 'string' && result.version.length) ||
            !Number.isSafeInteger(result.revision) || result.revision < 0 || !Array.isArray(result.projectionCodes) ||
            new Set(result.projectionCodes).size !== result.projectionCodes.length || result.projectionCodes.some(code => typeof code !== 'string' || !code || code.includes(',')) ||
            (result.projectionCodes.length ? [...result.projectionCodes].sort().join(',') !== result.version : result.version !== null)) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial Online pointer inspection is unverified');
        return result;
    },
    /** Explicit local Online reads share the target transaction owner; Staged must never read a local projection substitute. */
    getActiveSet: async function (publication, request) {
        const target = SERVICE.DefaultEditorialPublicationTargetService;
        if (((CONFIG.get('editorial') || {}).publication || {}).runtimeRole !== 'ONLINE' || !target) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Local Editorial projection inspection requires an Online runtime');
        return target.transaction(request, async scoped => (await target.current(publication.rootCode, scoped)).rows);
    },
    /** Loads one active projection for compatibility with nPublish version inspection. */
    getActive: async function (publication, request) {
        return this.confirmedPointer(await this.targetOperation('status', { publication, articleCode: publication.rootCode,
            operationKey: publication.code + ':status:' + String(publication.revision) }, request));
    },
    /** Reads an exact owner-proven current deployment independently of the source's retained latest publication reference. */
    getDeployment: async function (articleCode, request) {
        if (typeof articleCode !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(articleCode)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'An Editorial article reference is required');
        const result = this.confirmedPointer(await this.targetOperation('status', { articleCode,
            operationKey: articleCode + ':deployment-status' }, request));
        const deployed = result.deployment;
        if (result.version === null) {
            if (deployed !== null) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial deployment absence is unverified');
            return { status: 'NONE', revision: result.revision };
        }
        if (!deployed || typeof deployed.publicationCode !== 'string' || !deployed.publicationCode.trim() || deployed.publicationCode.length > 256 ||
            /[\u0000-\u001f\u007f]/.test(deployed.publicationCode) || !Number.isSafeInteger(deployed.sourceRevision) || deployed.sourceRevision < 1 ||
            typeof deployed.activationKey !== 'string' || !deployed.activationKey || deployed.activationKey.length > 1024 || /[\u0000-\u001f\u007f]/.test(deployed.activationKey)) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial current deployment identity is unverified');
        }
        return { status: 'DEPLOYED', code: deployed.publicationCode, sourceRevision: deployed.sourceRevision,
            activationKey: deployed.activationKey, version: result.version, revision: result.revision };
    },
    /** Builds immutable per-site/per-locale projection models from Staged source records. */
    buildProjectionModels: async function (publication, request) {
        let article = await SERVICE.DefaultEditorialPublicationVersionProviderService.getVersion(publication, request);
        if (!article || article.code !== publication.rootCode || article.revision !== Number(publication.sourceVersion) || article.status !== 'APPROVED') throw new CLASSES.NodicsError('ERR_EDT_00008', 'The saved approved Editorial source changed before target preparation');
        const maximum = CONFIG.get('editorial')?.publication?.maximumProjections;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || !Array.isArray(article.siteCodes) || !article.siteCodes.length ||
            new Set(article.siteCodes).size !== article.siteCodes.length) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial publication site or projection boundary is unverified');
        let response = await SERVICE.DefaultEditorialArticleLocalizationService.get({ tenant: request.tenant, authData: request.authData, options: { recursive: false }, query: { articleCode: article.code, revision: article.revision, status: 'READY' }, searchOptions: { limit: maximum + 1 } });
        this.positive(response);
        let localizations = response.result;
        if (typeof response.code !== 'string' || !response.code.startsWith('SUC_') || !Array.isArray(localizations) || !localizations.length ||
            localizations.length * article.siteCodes.length > maximum || new Set(localizations.map(row => row?.localeCode)).size !== localizations.length ||
            localizations.some(row => !row || row.articleCode !== article.code || row.revision !== article.revision || row.status !== 'READY')) throw new CLASSES.NodicsError('ERR_EDT_00005', 'Editorial publication requires the complete acknowledged ready localization set');
        let projections = [];
        for (let siteCode of article.siteCodes || []) for (let localization of localizations) {
            let payload = { articleCode: article.code, contentTypeCode: article.contentTypeCode, siteCode: siteCode, localeCode: localization.localeCode,
                slug: localization.slug || article.slug, title: localization.title, summary: localization.summary, body: localization.body, takeaways: localization.takeaways || [], seo: localization.seo,
                authorCodes: article.authorCodes || [], taxonomyTermCodes: article.taxonomyTermCodes || [], seriesCode: article.seriesCode, featuredMediaCode: article.featuredMediaCode,
                special: article.special === true, specialLabel: article.specialLabel, specialRank: article.specialRank, specialFrom: article.specialFrom,
                specialUntil: article.specialUntil, specialVariant: article.specialVariant,
                publishFrom: article.publishFrom, publishUntil: article.publishUntil, embargoAt: article.embargoAt };
            let sourceHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
            let code = [article.code, siteCode, localization.localeCode, article.revision].join('-');
            projections.push({ code: code, active: true,
                accessGroups: Array.from(new Set([].concat(article.accessGroups || ['userGroup']).concat(['serviceAccountUserGroup']))), description: 'Online Editorial projection for ' + article.code, articleCode: article.code,
                contentTypeCode: article.contentTypeCode, siteCode: siteCode, localeCode: localization.localeCode, slug: payload.slug, payload: payload,
                sourceRevision: article.revision, sourceHash: sourceHash, status: 'CURRENT', publishedAt: new Date() });
        }
        return { article: article, projections: projections };
    },
    /** Explicit Online-local integrations use exactly the same transactional target owner. */
    activateLocal: async function (publication, request, projectionModels) {
        if (((CONFIG.get('editorial') || {}).publication || {}).runtimeRole !== 'ONLINE') throw new CLASSES.NodicsError('ERR_EDT_00001', 'Local activation cannot replace a Staged-to-Online transport');
        return this.confirmedActivation(await this.targetOperation('deploy', { publication, projections: projectionModels,
            operationKey: publication.activationOperation?.key }, request), publication);
    },
    /** Creates immutable per-site/per-locale projections in the authoritative Online target. */
    activate: async function (publication, request) {
        const inspected = await this.inspectActivation(publication, request);
        if (inspected.activation.status === 'COMMITTED') return this.confirmedActivation(inspected.activation.result, publication);
        const built = await this.buildProjectionModels(publication, request);
        return this.confirmedActivation(await this.targetOperation('deploy', { publication, projections: built.projections,
            operationKey: publication.activationOperation?.key }, request), publication);
    },
    /** Restores a previous projection set by stable version identity. */
    rollback: async function (publication, targetVersion, request) {
        if (!targetVersion) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial rollback target is required');
        const payload = this.commandPayload(publication, 'ROLLBACK', targetVersion);
        return this.confirmedCommand(await this.targetOperation('rollback', payload, request), 'ROLLBACK', payload);
    },
    /** Withdraws all active projections for an article after an authorized lifecycle intent. */
    withdraw: async function (publication, request) {
        let articleCode = publication && publication.rootCode;
        const sourceRevision = Number(publication && publication.sourceVersion);
        if (typeof articleCode !== 'string' || !articleCode || !Number.isSafeInteger(sourceRevision) || sourceRevision < 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial withdrawal requires the exact publication source revision');
        }
        const payload = this.commandPayload(publication, 'WITHDRAWAL');
        return this.confirmedCommand(await this.targetOperation('withdraw', payload, request), 'WITHDRAWAL', payload);
    },
    /** Existing nPublish operations may inspect original commit/current visibility evidence; this never promotes or repairs lifecycle state. */
    reconcile: async function (publication, request) {
        const inspected = await this.inspectActivation(publication, request);
        return { status: inspected.activation.status, repaired: false, currentVersion: inspected.version,
            currentRevision: inspected.revision, originalActivation: inspected.activation };
    }
};
