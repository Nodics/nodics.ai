/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module wcmsExperience/service/defaultWcmsExperiencePublicationSourceService
 * @description Freezes bounded CMS placement values in the existing nPublish dependency journal before review.
 * @layer service @owner wcmsExperience
 * @override Preserve immutable reviewed values and referenced CMS graph ownership. */
module.exports = {
    /** Hashes the exact inert, allowlisted source value. */
    digest: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
    /** Freezes only placements referencing components in this reviewed route graph. */
    freeze: async function (route, dependencies, request) {
        const config = CONFIG.get('wcmsExperience') || {}, maximum = config.indexing?.maximumPlacements || 200;
        const codes = dependencies.filter(item => item.schema === 'cmsComponent').map(item => item.code);
        if (!codes.length) return [];
        const response = await SERVICE.DefaultCmsExperiencePlacementService.get({tenant: request.tenant, authData: request.authData,
            query: {site: route.site, active: true, component: {$in: codes}}, searchOptions: {limit: maximum + 1, pageSize: maximum + 1}});
        const rows = response?.result;
        if (!Array.isArray(rows) || rows.length > maximum || new Set(rows.map(row => row.code)).size !== rows.length)
            throw new Error('EXPERIENCE_PUBLICATION_SOURCE_UNCONFIRMED');
        const fields = ['code','site','pageType','slot','targetType','targetCode','component','rendererKey','contractVersion','properties','media',
            'specificity','priority','locale','channel','region','device','customerSegments','validFrom','validTo','fallbackComponent','deliveryStatus','revision'];
        return rows.filter(row => (!row.locale || row.locale === route.locale) && (!row.channel || row.channel === route.channel)).map(row => {
            const snapshot = SERVICE.DefaultDiscoveryProjectionTransportService.data(Object.fromEntries(fields.filter(key => row[key] !== undefined).map(key => [key,row[key]])));
            const resolver = SERVICE.DefaultWcmsExperienceResolverService;
            if (!snapshot.code || snapshot.site !== route.site || !codes.includes(snapshot.component) ||
                typeof snapshot.slot !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(snapshot.slot) || ['constructor','prototype'].includes(snapshot.slot) ||
                typeof snapshot.rendererKey !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(snapshot.rendererKey) ||
                !Number.isSafeInteger(snapshot.contractVersion) || snapshot.contractVersion < 0 ||
                !resolver.validateContext(resolver.normalizeContext({experience: snapshot})).valid ||
                !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 ||
                [snapshot.priority, snapshot.specificity].some(value => value !== undefined && !Number.isFinite(value)))
                throw new Error('EXPERIENCE_PUBLICATION_SOURCE_INVALID');
            return {schema: 'cmsExperiencePlacement', code: snapshot.code, version: this.digest(snapshot), snapshot};
        }).sort((a,b) => a.code.localeCompare(b.code));
    },
    /** Reads the exact journaled value without consulting mutable authoring records. */
    load: function (identity) {
        if (identity.schema !== 'cmsExperiencePlacement' || !identity.snapshot || identity.snapshot.code !== identity.code ||
            identity.version !== this.digest(identity.snapshot)) throw new Error('EXPERIENCE_PUBLICATION_SOURCE_INTEGRITY');
        return JSON.parse(JSON.stringify(identity.snapshot));
    }
};
