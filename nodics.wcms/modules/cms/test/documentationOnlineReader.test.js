'use strict';

/** Verifies exact Online publication pins, employee scope, and authored project references through the HTTP controller. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const controller = require('../src/controller/defaultCmsDeliveryController');
const delivery = require('../src/service/delivery/defaultCmsDeliveryService');
const reader = require('../src/service/documentation/defaultCmsDocumentationReaderService');
const endpoint = require('../src/router/routers').cms.cmsDelivery.documentationGuides;
const req = { tenant: 'one', entCode: 'acme', authData: { loginId: 'reader', principalType: 'human',
    tokenType: 'access', tenant: 'one', entCode: 'acme' }, httpRequest: { query: { tenant: 'two', accessMode: 'CUSTOMER' } } };

function fixture() {
    let role = 'ONLINE';
    const settings = require('../config/properties').cms;
    global.CONFIG = { get: () => ({ ...settings, publication: { enabled: true, runtimeRole: role } }) };
    const auth = { isSystem: true, userGroups: ['service'] };
    const pointers = [], manifests = new Map();
    const add = (guide, site, path, id, extra = {}) => {
        const pointer = { site, path, channel: 'web', locale: 'en', accessMode: 'PUBLIC', code: String(pointers.length + 1000),
            active: true, revision: 1, manifestCode: site + '_release' };
        pointers.push(pointer);
        const nav = { id: guide, label: guide, route: '/docs?guide=' + guide, order: 1 };
        const descriptor = { guide, label: guide, route: nav.route, navigation: nav };
        if (guide === 'project') Object.assign(descriptor, { projectId: 'acme', route: nav.route + '&project=acme',
            channelReferences: [{ channelId: 'app', channelLabel: 'App', site: 'shared', id: 'reference' }] });
        const snapshot = { ...pointer, page: { components: [{ renderer: 'documentation.component.navigation',
            properties: { readerGuide: descriptor } }, { renderer: 'documentation.component.article',
            properties: { code: id, title: id, route: path, accessMode: 'PUBLIC', lifecycleState: 'STAGED', ...extra } }] } };
        if (!manifests.has(pointer.manifestCode)) manifests.set(pointer.manifestCode, { code: pointer.manifestCode, active: true,
            snapshot: { contractVersion: 2, bundleType: 'SITE', site, routes: [] } });
        manifests.get(pointer.manifestCode).snapshot.routes.push(snapshot);
    };
    global.SERVICE = { DefaultCmsDocumentationReaderService: reader, DefaultCmsDeliveryService: delivery,
        DefaultIdentityGovernanceService: { getSystemAuthData: () => auth },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [], isPermissionGranted: () => true },
        DefaultCmsOnlinePublicationPointerService: { get: async request => {
            assert.equal(request.tenant, 'one'); assert.equal(request.authData, auth); assert.deepEqual(request.options, { recursive: false });
            assert.equal(request.query.channel, 'web'); assert.equal(request.query.locale, 'en');
            return { result: pointers.filter(p => !request.query.code || p.code > request.query.code.$gt).slice(0, request.searchOptions.pageSize) };
        } },
        DefaultCmsPublicationManifestService: { get: async request => ({ result: [manifests.get(request.query.code)].filter(Boolean) }) } };
    const read = () => new Promise((resolve, reject) => controller.documentationGuides(req, (err, value) => err ? reject(err) : resolve(value.result)));
    return { read, pointers, manifests, add, staged: () => { role = 'STAGED'; } };
}

test('normal route returns only pinned, entitled topics and imported guide links', async () => {
    const f = fixture();
    assert.equal(endpoint.key, '/delivery/documentation/guides'); assert.equal(endpoint.secured, true);
    assert.deepEqual(await f.read(), { contractVersion: 1, navigation: [], guides: [] });
    f.add('project', 'owned', '/docs/acme', 'acme');
    f.add('framework', 'shared', '/docs/reference', 'reference');
    f.add('framework', 'shared', '/docs/private', 'private', { allowedPermissions: ['not-granted'] });
    f.add('framework', 'shared', '/docs/draft', 'draft', { lifecycleState: 'DRAFT' });
    f.add('framework', 'shared', '/docs/retired', 'retired');
    f.pointers.pop(); // Immutable manifest still contains this withdrawn route.
    const result = await f.read();
    assert.deepEqual(result.guides.find(g => g.guide === 'framework').topics.map(t => t.id), ['reference']);
    const project = result.guides.find(g => g.guide === 'project');
    assert.equal(project.topics.find(t => t.channelId === 'app').route, '/docs/reference');
    assert.deepEqual(result.navigation.map(n => n.id).sort(), ['framework', 'project']);
    f.pointers.splice(1); // Only the project remains Online.
    assert.deepEqual((await f.read()).guides[0].topics.map(t => t.id), ['acme']);
    delete f.manifests.get('owned_release').snapshot.routes[0].page.components[0].properties.readerGuide;
    assert.deepEqual((await f.read()).navigation, []);
});

test('incomplete pins, tenant substitution, changed revisions and Staged role fail closed', async () => {
    const f = fixture();
    f.add('axis', 'axis', '/docs/axis', 'axis');
    await assert.rejects(reader.guides({ ...req, tenant: 'two' }), { code: 'ERR_CMS_00086' });
    f.pointers[0].manifestCode = 'absent';
    await assert.rejects(f.read(), { code: 'ERR_CMS_00091' });
    f.pointers[0].manifestCode = 'axis_release';
    const get = SERVICE.DefaultCmsPublicationManifestService.get;
    SERVICE.DefaultCmsPublicationManifestService.get = async request => { f.pointers[0].revision++; return get(request); };
    await assert.rejects(f.read(), { code: 'ERR_CMS_00090' });
    f.staged(); await assert.rejects(f.read(), { code: 'ERR_CMS_00090' });
});

test('paginates beyond one pointer page and supports exact compact and per-route publications', async () => {
    const f = fixture();
    for (let n = 0; n < 103; n++) f.add('axis', 'axis', '/docs/axis/' + n, 'id' + n);
    const manifest = f.manifests.get('axis_release');
    const last = manifest.snapshot.routes.pop();
    const pointer = f.pointers.at(-1);
    pointer.manifestCode = 'single';
    f.manifests.set('single', { code: pointer.manifestCode, active: true, snapshot: { ...last, contractVersion: 0 } });
    const first = manifest.snapshot.routes[0].page.components;
    manifest.snapshot.sharedComponents = { nav: first[0] };
    first[0] = { componentRef: 'nav' };
    assert.equal((await f.read()).guides[0].topics.length, 103);
});
