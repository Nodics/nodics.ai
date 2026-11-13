/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperienceIndexStatusService
 * @description Reports WCMS Experience projection health for Axis diagnostics.
 * @layer service
 * @owner wcmsExperience
 * @override Later modules may connect this status seam to real Discovery/Elasticsearch index metadata.
 */
module.exports = {
    /** Observes only the requested Staged journey through Discovery. Counts are
     * bounded observations, not alias, total-index or publication-health claims.
     * @param {Object} request Authenticated owner request with query context.
     * @returns {Promise<Object>} Scoped evidence or explicit unavailable state.
     */
    getStatus: async function (request) {
        const resolver = SERVICE.DefaultWcmsExperienceResolverService;
        const input = request.httpRequest && request.httpRequest.query || request.query || {};
        const context = resolver.normalizeContext({...request, experience: {...input, previewMode: true}});
        const validation = resolver.validateContext(context);
        if (!validation.valid) throw resolver.error('ERR_WCMS_EXPERIENCE_INPUT_INVALID', validation.message);
        const config = CONFIG.get('wcmsExperience') || {};
        const base = {
            indexingMode: (config.indexing || {}).mode,
            publication: 'STAGED',
            scope: Object.fromEntries(['site', 'pageType', 'targetType', 'targetCode', 'locale', 'channel', 'device'].map(key => [key, context[key]])),
            observationLimit: SERVICE.DefaultWcmsExperienceProjectionService.discoverySearchOptions().pageSize,
            observedAt: new Date().toISOString()
        };
        try {
            const placements = await SERVICE.DefaultWcmsExperienceProjectionService.findPlacements(context);
            const resolved = resolver.resolveFromPlacements(context, placements);
            const selected = Object.values(resolved.slots).flat();
            const versions = [...new Set(placements.map(item => item.indexVersion).filter(value => typeof value === 'string' && value))];
            return {...base,
                status: placements.length ? 'OBSERVED' : 'EMPTY',
                documentCount: placements.length,
                resolvedPlacementCount: selected.length,
                currentIndexVersion: versions.length === 1 ? versions[0] : undefined,
                message: 'Bounded Staged projection observation for this journey. This does not certify publication, Online alias health or the entire index. An empty observation is not proof that no authored placements exist.'
            };
        } catch (error) {
            return {...base, status: 'UNAVAILABLE',
                message: 'Projection evidence is unavailable. Ask an administrator to verify the Discovery owner, access and index readiness, then refresh. Do not re-import or publish solely to repair this observation.'};
        }
    }
};
