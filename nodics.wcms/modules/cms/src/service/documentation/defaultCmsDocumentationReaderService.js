/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/documentation/DefaultCmsDocumentationReaderService
 * @description Projects only currently addressed Online documentation manifests for an authorized employee.
 * @owner cms @layer service */
const docPath = /^\/docs(?:\/[A-Za-z0-9_-]+)+$/;
const identifier = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;


const scopeFields = ['site', 'path', 'locale', 'channel', 'accessMode'];

module.exports = {
    /** Validates a bounded published documentation identifier. */
    validId: function (value) { return typeof value === 'string' && identifier.test(value); },

    /** Validates bounded nonempty documentation presentation text. */
    label: function (value) { return typeof value === 'string' && value.trim().length > 0 && value.length <= 256; },

    /** Requires a fresh employee scope before reading private Online storage. */
    guides: async function (request) {
        const delivery = SERVICE.DefaultCmsDeliveryService;
        const publication = (CONFIG.get('cms') || {}).publication || {};
        const auth = request.authData || {};
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        const settings = delivery.settings();
        if (publication.enabled !== true || publication.runtimeRole !== 'ONLINE')
            throw delivery.error('ERR_CMS_00090', 'Documentation requires Online delivery');
        if (auth.tokenType !== 'access' || auth.principalType !== 'human' || auth.isSystem || auth.runtimeScope ||
            (auth.type !== undefined && auth.type !== 'Employee') || !(auth.loginId || auth.principalId) ||
            !request.tenant || auth.tenant !== request.tenant || !auth.entCode ||
            (request.entCode && request.entCode !== auth.entCode) || !settings.authenticatedPermission ||
            !security?.isPermissionGranted(settings.authenticatedPermission, security.getGrantedPermissions(request), {}))
            throw delivery.error('ERR_CMS_00086', 'Employee documentation access is required');
        const scope = { tenant: request.tenant, authData: delivery.persistenceAuthData(request) };
        const query = { active: true, channel: settings.defaultChannel,
            locale: delivery.localizationPolicy().defaultLocale || settings.defaultLocale,
            path: { $gte: '/docs/', $lt: '/docs0' }, accessMode: { $in: ['PUBLIC', 'AUTHENTICATED'] } };
        const pointers = await this.pointers(scope, query);
        const articles = [], markers = new Map();
        const byManifest = new Map();
        for (const pointer of pointers) {
            if (!byManifest.has(pointer.manifestCode)) byManifest.set(pointer.manifestCode, []);
            byManifest.get(pointer.manifestCode).push(pointer);
        }
        // Read each immutable manifest once, releasing its page bodies before the next read.
        for (const [code, group] of byManifest) {
            const manifest = await delivery.readEmployeeCompositionRecord('manifest', scope, { code, active: true }, 'ERR_CMS_00091');
            if (manifest.code !== code || manifest.active !== true) throw delivery.error('ERR_CMS_00091', 'Invalid manifest pin');
            const snapshot = manifest.snapshot;
            const bundle = snapshot?.bundleType === 'SITE' && [0, 2].includes(snapshot.contractVersion);
            const routes = bundle ? snapshot.routes : [snapshot];
            if (!Array.isArray(routes)) throw delivery.error('ERR_CMS_00091', 'Invalid publication routes');
            const key = route => JSON.stringify(scopeFields.map(field => route[field]));
            const index = new Map();
            for (const route of routes) {
                if (!route) continue;
                const identity = key(route);
                index.set(identity, index.has(identity) ? null : route);
            }
            for (const pointer of group) {
                const pinned = index.get(key(pointer));
                if (!pinned || (bundle && snapshot.site !== pointer.site))
                    throw delivery.error('ERR_CMS_00091', 'Published route pin is missing or ambiguous');
                const route = delivery.expandSharedComponents(pinned, snapshot.sharedComponents);
                this.collect(route, articles, markers);
            }
        }
        if (pointers.length && JSON.stringify(await this.pointers(scope, query)) !== JSON.stringify(pointers))
            throw delivery.error('ERR_CMS_00090', 'Documentation publication changed during the read');
        return { result: this.project(articles, markers) };
    },

    /** Keyset pagination keeps unrelated CMS routes and private schemas out of the result. */
    pointers: async function (scope, query) {
        const rows = [], ids = new Set();
        const service = SERVICE.DefaultCmsOnlinePublicationPointerService;
        let after;
        for (;;) {
            const response = await service.get({ ...scope, options: { recursive: false },
                searchOptions: { pageSize: 100, pageNumber: 1, sort: { code: 1 } },
                query: after ? { ...query, code: { $gt: after } } : query });
            if (!Array.isArray(response?.result) || response.result.length > 100)
                throw SERVICE.DefaultCmsDeliveryService.error('ERR_CMS_00090', 'Invalid Online pointer page');
            for (const row of response.result) {
                if (!this.label(row.code) || (after && row.code <= after) || row.active !== true || !this.validId(row.site) ||
                    !docPath.test(row.path) || row.locale !== query.locale || row.channel !== query.channel ||
                    !query.accessMode.$in.includes(row.accessMode) || !this.label(row.manifestCode) || rows.length >= 4096 ||
                    ids.has(row.path))
                    throw SERVICE.DefaultCmsDeliveryService.error('ERR_CMS_00090', 'Ambiguous or invalid Online route');
                after = row.code;
                ids.add(row.path);
                rows.push({ code: row.code, site: row.site, path: row.path, locale: row.locale, channel: row.channel,
                    accessMode: row.accessMode, manifestCode: row.manifestCode, revision: row.revision });
            }
            if (response.result.length < 100) return rows;
        }
    },

    /** Only active navigation declarations and articles from the exact addressed page are eligible. */
    collect: function (route, articles, markers) {
        const visit = component => {
            if (!component || component.active === false) return;
            const p = component.properties || {};
            if (component.renderer === 'documentation.component.navigation' && p.readerGuide) {
                const prior = markers.get(route.site);
                if (prior && JSON.stringify(prior) !== JSON.stringify(p.readerGuide))
                    throw SERVICE.DefaultCmsDeliveryService.error('ERR_CMS_00091', 'Conflicting published Site guide metadata');
                markers.set(route.site, p.readerGuide);
            }
            if (component.renderer === 'documentation.component.article' && p.route === route.path &&
                this.validId(p.code) && this.label(p.title) && ['STAGED', 'APPROVED', 'ONLINE'].includes(p.lifecycleState) &&
                (p.accessMode === 'PUBLIC' || (p.accessMode === 'AUTHENTICATED' && route.accessMode === 'AUTHENTICATED')) &&
                ['allowedPermissions', 'allowedGroups', 'allowedRoles'].every(key => !p[key] || (Array.isArray(p[key]) && !p[key].length))) {
                articles.push({ id: p.code, label: p.title, route: route.path, site: route.site, locale: route.locale,
                    channel: route.channel, accessMode: route.accessMode });
            }
            (component.components || []).forEach(visit);
        };
        (route.page?.components || []).forEach(visit);
    },

    /** Resolves project references against already-visible shared topics in their original Sites. */
    project: function (articles, markers) {
        const guides = new Map(), navigation = new Map(), shared = new Map(), references = [];
        const fail = () => { throw SERVICE.DefaultCmsDeliveryService.error('ERR_CMS_00091', 'Invalid published guide declaration'); };
        for (const [site, d] of markers) {
            const nav = d.navigation || {}, project = d.guide === 'project';
            const menuRoute = '/docs?guide=' + d.guide;
            if (!['framework', 'axis', 'project'].includes(d.guide) || !this.label(d.label) || !this.label(nav.label) ||
                !this.validId(nav.id) || !Number.isSafeInteger(nav.order) || nav.route !== menuRoute ||
                (project ? !this.validId(d.projectId) : d.projectId !== undefined) ||
                d.route !== (project ? menuRoute + '&project=' + d.projectId : menuRoute)) fail();
            const topics = articles.filter(article => article.site === site);
            if (!topics.length) continue;
            const menu = { id: nav.id, label: nav.label, route: nav.route, order: nav.order };
            if (navigation.has(nav.route) && JSON.stringify(navigation.get(nav.route)) !== JSON.stringify(menu)) fail();
            navigation.set(nav.route, menu);
            const guide = guides.get(d.route) || { guide: d.guide, label: d.label, route: d.route,
                ...(project ? { projectId: d.projectId } : {}), topics: [] };
            if (guide.label !== d.label) fail();
            guides.set(d.route, guide);
            for (const topic of topics) {
                guide.topics.push(topic);
                if (!project) {
                    const key = JSON.stringify([site, topic.id]);
                    if (shared.has(key)) fail();
                    shared.set(key, topic);
                }
            }
            if (d.channelReferences !== undefined) {
                if (!project || !Array.isArray(d.channelReferences) || d.channelReferences.length > 128) fail();
                for (const ref of d.channelReferences) {
                    if (!ref || !this.validId(ref.channelId) || !this.label(ref.channelLabel) || !this.validId(ref.site) || !this.validId(ref.id)) fail();
                    references.push({ guide, ref });
                }
            }
        }
        if (new Set([...navigation.values()].map(item => item.id)).size !== navigation.size) fail();
        for (const { guide, ref } of references) {
            const topic = shared.get(JSON.stringify([ref.site, ref.id]));
            if (topic) guide.topics.push({ ...topic, channelId: ref.channelId, channelLabel: ref.channelLabel });
        }
        for (const guide of guides.values()) guide.topics.sort((a, b) => a.label.localeCompare(b.label) || a.route.localeCompare(b.route));
        return { contractVersion: 1, navigation: [...navigation.values()].sort((a, b) => a.order - b.order),
            guides: [...guides.values()].sort((a, b) => a.route.localeCompare(b.route)) };
    }
};
