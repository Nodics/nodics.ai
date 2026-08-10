/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('node:crypto');

/**
 * @module product/service/defaultProductLocalizedPublicationLifecycleService
 * @description Owns preview, stage, online synchronization, and evidence-based rollback for localized Products.
 * @layer service
 * @owner product
 * @override Later modules may add approval policy while retaining immutable evidence and Product/nSearch boundaries.
 */
module.exports = {
    /** Builds a non-persisted bilingual preview and readiness report. */
    preview: function (request, input) {
        if (!input || !input.product || !input.storeCode) throw new Error('Product and Store are required for publication preview');
        let staged = SERVICE.DefaultProductPublicationPolicyService.stageLocalized(request, input.product, input.localizations);
        let locales = Array.from(new Set((input.localizations || []).filter(item => item.tenant === request.tenant && item.status === 'READY')
            .map(item => SERVICE.DefaultProductLocalizationPolicyService.canonicalize(item.locale))));
        let projections = locales.map(locale => SERVICE.DefaultProductLocalizedProjectionBuilderService.build(request,
            Object.assign({}, input, { locale: locale })));
        return Object.freeze({ publication: staged, projections: Object.freeze(projections),
            previews: Object.freeze(projections.map(projection => Object.freeze({ locale: projection.locale,
                direction: /^(ar|fa|he|ur)(-|$)/i.test(projection.locale) ? 'rtl' : 'ltr', payload: projection.payload }))) });
    },

    /** Persists immutable staged publication evidence without changing the online index. */
    stage: async function (request, input) {
        let preview = this.preview(request, input);
        let revision = Number(input.publicationRevision || input.product.revision || 1);
        let now = request.now || new Date().toISOString();
        let model = { code: [input.product.code, input.product.catalogVersion, input.storeCode, revision].join('|'),
            tenant: request.tenant, productCode: input.product.code, catalogVersion: input.product.catalogVersion,
            storeCode: input.storeCode, revision: revision, status: 'STAGED', sourceHash: preview.publication.sourceHash,
            localizationEvidence: preview.publication.localization, projectionCodes: preview.projections.map(item => item.code),
            previousPublicationCode: input.previousPublication && input.previousPublication.code,
            stagedAt: now, correlationId: request.correlationId };
        await SERVICE.DefaultProductPublicationService.save({ tenant: request.tenant, authData: request.authData, model: model });
        return Object.freeze({ model: Object.freeze(model), preview: preview });
    },

    /** Synchronizes one staged publication to locale-specific online search projections. */
    publish: async function (request, input) {
        let staged = input.staged || await this.stage(request, input);
        if (staged.model.tenant !== request.tenant || staged.model.status !== 'STAGED') {
            throw new Error('A tenant-scoped staged Product publication is required');
        }
        let online = await SERVICE.DefaultProductSearchPublicationService.publish(request, input);
        let publishedAt = request.now || new Date().toISOString();
        if (input.previousPublication && input.previousPublication.status === 'PUBLISHED') {
            await SERVICE.DefaultProductPublicationService.update({ tenant: request.tenant, authData: request.authData,
                query: { code: input.previousPublication.code, tenant: request.tenant }, model: { status: 'SUPERSEDED' } });
        }
        await SERVICE.DefaultProductPublicationService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: staged.model.code, tenant: request.tenant }, model: { status: 'PUBLISHED', publishedAt: publishedAt,
                projectionCodes: online.projections.map(item => item.code) } });
        return Object.freeze({ publication: Object.freeze(Object.assign({}, staged.model, { status: 'PUBLISHED',
            publishedAt: publishedAt, projectionCodes: online.projections.map(item => item.code) })),
        projections: online.projections });
    },

    /** Restores a prior evidenced projection set and records an auditable rollback publication. */
    rollback: async function (request, input) {
        let current = input && input.currentPublication;
        let target = input && input.targetPublication;
        if (!current || !target || current.tenant !== request.tenant || target.tenant !== request.tenant ||
            current.productCode !== target.productCode || current.storeCode !== target.storeCode || current.status !== 'PUBLISHED') {
            throw new Error('Compatible current and target Product publication evidence is required');
        }
        await SERVICE.DefaultProductSearchPublicationService.withdraw(request,
            { productCode: current.productCode, storeCode: current.storeCode });
        let projections = await SERVICE.DefaultProductSearchPublicationService.restore(request,
            { productCode: target.productCode, storeCode: target.storeCode, projections: input.targetProjections });
        await SERVICE.DefaultProductPublicationService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: current.code, tenant: request.tenant }, model: { status: 'ROLLED_BACK' } });
        let revision = Number(current.revision) + 1;
        let now = request.now || new Date().toISOString();
        let source = { tenant: request.tenant, productCode: target.productCode, storeCode: target.storeCode,
            rollbackOf: current.code, restoredFrom: target.code, targetSourceHash: target.sourceHash, revision: revision };
        let model = { code: [target.productCode, target.catalogVersion, target.storeCode, revision, 'rollback'].join('|'),
            tenant: request.tenant, productCode: target.productCode, catalogVersion: target.catalogVersion,
            storeCode: target.storeCode, revision: revision, status: 'PUBLISHED',
            sourceHash: crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'),
            localizationEvidence: target.localizationEvidence, projectionCodes: projections.map(item => item.code),
            previousPublicationCode: target.code, rollbackOf: current.code, stagedAt: now, publishedAt: now,
            correlationId: request.correlationId };
        await SERVICE.DefaultProductPublicationService.save({ tenant: request.tenant, authData: request.authData, model: model });
        return Object.freeze({ publication: Object.freeze(model), projections: Object.freeze(projections) });
    }
};
