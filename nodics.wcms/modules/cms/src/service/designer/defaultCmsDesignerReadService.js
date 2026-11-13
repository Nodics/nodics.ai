/* Nodics - governed by the repository LICENSE. */

/**
 * @module cms/service/designer/defaultCmsDesignerReadService
 * @description Reopens bounded, explicitly owned Staged page compositions without adopting legacy content.
 * @owner cms
 * @layer service
 * @override Extend faithful draft projections through the CMS owner; never flatten unsupported relationships.
 */
const crypto = require('crypto');
const _ = require('lodash');
const currentRecordHeads = require('../../utils/currentRecordHeads');

module.exports = {
    /** Initializes this owner service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Lists only explicitly owned page heads; the existing complete-read bound is never increased or truncated. */
    listPages: async function (request) {
        const scope = await this.readScope(request);
        const rows = await this.currentHeads('DefaultCmsPageService', request, {
            'authoringScope.enterpriseCode': scope.enterpriseCode,
            'authoringScope.catalogCode': scope.catalogCode,
            'authoringScope.siteCode': scope.siteCode
        }, scope);
        const pages = rows.filter(row => row.active === true).map(row => ({ code: row.code, name: row.name || row.code }));
        this.access().authorize(request, 'cms.backoffice.view');
        return { result: { pages } };
    },

    /** Reads exact current heads, retaining placement, locale and Media identities for a faithful bounded nested draft. */
    getDraft: async function (request) {
        const scope = await this.readScope(request), input = request.cmsDesigner || request.body || {};
        if (input.pageCode && input.page?.code && input.pageCode !== input.page.code) this.access().deny();
        const pageCode = input.pageCode || input.page?.code;
        const evidence = [];
        const exact = async (service, code) => {
            const rows = await this.access().assertIdentity(service, request, code, scope);
            if (!rows.length) {
                if (service === 'DefaultCmsPageService') throw new CLASSES.NodicsError('ERR_CMS_00088', 'The page has no saved record in this authoring scope.');
                this.fail('A referenced saved component is unavailable. Inspect the page before editing.');
            }
            const head = this.heads(rows)[0];
            if (head.active !== true) this.fail('This saved record is inactive. Inspect its retained history instead.');
            evidence.push([service, head]);
            return head;
        };
        const related = async (service, query) => {
            const heads = await this.currentHeads(service, request, query, scope);
            // Retired heads are part of the source stamp, but never replaced with an older active version.
            heads.forEach(head => evidence.push([service, head]));
            return heads.filter(row => row.active === true);
        };
        const page = await exact('DefaultCmsPageService', pageCode);
        const issues = [];
        if (!Array.isArray(page.cmsSite) || page.cmsSite.length !== 1 || page.cmsSite[0] !== scope.siteCode)
            issues.push('This page has a shared or unsupported Site binding.');
        if (page.cmsComponents !== undefined && (!Array.isArray(page.cmsComponents) || page.cmsComponents.length))
            issues.push('This page contains embedded components that this editor cannot safely change.');
        const seen = new Set([page.code]);
        const limits = SERVICE.DefaultCmsDesignerCompositionService.authoringPolicy();
        let count = 0;
        const sectionsFor = async (source, depth) => {
            const placements = await related('DefaultCmsComponentDetailService', { source });
            if (placements.length && depth > limits.maximumCompositionDepth) this.fail('This composition exceeds the supported nesting depth.');
            const sections = [];
            for (const placement of placements.sort((left, right) => left.index - right.index || left.code.localeCompare(right.code))) {
                if (!Number.isSafeInteger(placement.index) || placement.index < 0 || typeof placement.slot !== 'string' || !placement.slot)
                    this.fail('The saved placement order or slot is invalid.');
                if (seen.has(placement.target)) this.fail('This composition reuses a component or contains a cycle. Inspect its shared relationships before editing.');
                if (++count > limits.maximumCompositionComponents) this.fail('This composition exceeds the supported number of content blocks.');
                seen.add(placement.target);
                const component = await exact('DefaultCmsComponentService', placement.target);
                if (component.properties !== undefined && !_.isPlainObject(component.properties)) this.fail('The saved component content is not compatible with this editor.');
                const nested = await sectionsFor(component.code, depth + 1);
                if (component.subComponents !== undefined && (!Array.isArray(component.subComponents) || component.subComponents.some(value =>
                    !nested.some(section => section.code === (typeof value === 'string' ? value : value?.code)))))
                    issues.push('A nested reference does not match the saved parent placements. Inspect its relationships before editing.');
                const localizations = await related('DefaultCmsComponentLocalizationService', { componentCode: component.code });
                if (localizations.some(row => typeof row.locale !== 'string' || !row.locale.trim() ||
                    row.properties !== undefined && !_.isPlainObject(row.properties) || row.seo !== undefined && !_.isPlainObject(row.seo)))
                    this.fail('The saved translation content is not compatible with this editor.');
                if (new Set(localizations.map(row => row.locale)).size !== localizations.length) this.fail('The saved component has ambiguous translations.');
                const media = await related('DefaultCmsComponentMediaService', { componentCode: component.code });
                sections.push({ code: placement.code, slot: placement.slot, index: placement.index, components: [{
                    code: component.code, typeCode: component.typeCode, renderer: component.renderer,
                    accessMode: component.accessMode, properties: _.cloneDeep(component.properties || {}),
                    ...(nested.length ? { sections: nested } : {}),
                    localizations: localizations.map(row => ({ code: row.code, locale: row.locale,
                        properties: _.cloneDeep(row.properties || {}), seo: _.cloneDeep(row.seo), status: row.status })),
                    media: media.map(row => _.pick(row, ['code', 'componentMediaCode', 'mediaCode', 'mediaSetCode',
                        'mediaType', 'role', 'slot', 'localeCode', 'position', 'altText', 'caption']))
                }] });
            }
            return sections;
        };
        const sections = await sectionsFor(page.code, 0);
        const routes = await related('DefaultCmsPageRouteService', { page: page.code });
        if (routes.some(route => route.site !== scope.siteCode)) this.access().deny();
        if (routes.length > 1) issues.push('This page has multiple routes. Choose a route in a specialized editor before changing its composition.');
        const navigation = routes.length === 1 ? await related('DefaultCmsNavigationNodeService', {
            site: scope.siteCode, targetPage: page.code, nodeType: 'PAGE', locale: routes[0].locale, channel: routes[0].channel
        }) : [];
        if (navigation.length > 1) issues.push('This page has multiple menu entries. Inspect them in the navigation workspace before editing its composition.');
        const draft = {
            catalogCode: scope.catalogCode, siteCode: scope.siteCode, templateCode: page.template,
            page: { code: page.code, name: page.name || page.code, typeCode: page.typeCode, renderer: page.renderer },
            sections, ...(routes.length === 1 ? { route: _.pick(routes[0], ['code', 'path', 'locale', 'channel',
                'routeType', 'redirectPath', 'deliveryState', 'accessMode']) } : {}),
            ...(navigation.length === 1 ? { navigation: _.pick(navigation[0], ['code', 'site', 'parent',
                'name', 'title', 'nodeType', 'targetPage', 'position', 'status', 'locale', 'channel', 'restrictions']) } : {})
        };
        this.access().authorize(request, 'cms.backoffice.view');
        const sourceVersion = crypto.createHash('sha256').update(this.stable(evidence)).digest('hex');
        return { result: { draft: Object.assign(draft, { sourceVersion }), editable: issues.length === 0,
            issues: [...new Set(issues)], sourceVersion } };
    },

    /** Resolves candidate identities globally before relationship filters, so moved or retired history cannot reappear. */
    currentHeads: async function (service, request, query, scope) {
        const candidates = await this.access().records(service, request, query);
        const codes = this.heads(candidates).map(row => row.code);
        if (!codes.length) return [];
        const all = await this.access().records(service, request, { code: { $in: codes } });
        if (all.some(row => !this.access().matches(row, scope, service))) this.access().deny();
        const heads = this.heads(all);
        if (heads.length !== codes.length) this.access().deny();
        return heads.filter(row => this.access().queryMatches(row, query));
    },

    /** Pins the original employee and explicit Site/Catalog on the authoring runtime only. */
    readScope: async function (request) {
        if (CONFIG.get('runtimeRole')?.publication !== 'STAGED') this.access().deny();
        return this.access().scope(request, 'cms.backoffice.view');
    },

    /** Chooses current heads without resurrecting inactive history or accepting tied/malformed versions. */
    heads: function (rows) {
        try { return currentRecordHeads(rows); } catch (_) { this.access().deny(); }
    },

    /** Canonicalizes source records for an opaque preflight stamp; it is not a transaction or write lock. */
    stable: function (value) {
        const normalize = item => Array.isArray(item) ? item.map(normalize) : _.isPlainObject(item)
            ? Object.fromEntries(Object.keys(item).sort().map(key => [key, normalize(item[key])])) : item;
        return JSON.stringify(normalize(value));
    },
    /** Uses the existing CMS input failure for unsupported saved record shapes. */
    fail: function (message) { throw new CLASSES.NodicsError('ERR_CMS_00100', message); },
    /** Reuses the sole Designer admission and generated-read authority. */
    access: function () { return SERVICE.DefaultCmsDesignerAccessService; }
};
