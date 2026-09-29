/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '../data');
const manifest = require('../data/manifest.json');
const components = Object.values(require('../data/init-v001/records/axis/axisCmsComponentData'));
const types = Object.values(require('../data/init-v001/records/axis/axisCmsTypeCodeData'));
const renderers = Object.values(require('../data/init-v001/records/axis/axisCmsRendererData'));
const pages = Object.values(require('../data/init-v001/records/axis/axisCmsPageData'));
const routes = Object.values(require('../data/init-v001/records/axis/axisCmsRouteData'));
const dashboardComponents = components.filter(component => component.code.startsWith('axisDashboard')
    || component.code.startsWith('axisFramework'));

test('current dashboard composition belongs to the Axis baseline during pre-production', () => {
    const release = manifest.sections.axisBaseline;
    assert.equal(release.destinationRole, 'WCMS_STAGED');
    assert.equal(release.publicationPolicy, 'REQUIRED');
    assert.equal(release.initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.equal(release.versioningPolicy, 'IMMUTABLE');
    for (const obsolete of ['core-v003', 'core-v004', 'core-v005', 'core-v006',
        'core-v007', 'core-v008', 'core-v009', 'core-v010']) {
        assert.equal(manifest.sections[obsolete], undefined, obsolete);
    }
    for (const [file, hash] of Object.entries(release.files)) {
        assert.equal(createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex'), hash, file);
    }
    const route = routes.find(route => route.path === '/dashboard');
    const page = pages.find(page => page.code === route.page);
    assert.equal(route.accessMode, 'AUTHENTICATED');
    assert.equal(route.page, 'axisDashboardPage');
    assert.equal(page.template, 'axisDashboardWorkspaceTemplate');
    assert.deepEqual(page.cmsComponents, [
        { target: 'axisFrameworkDashboardWorkspaceComponent', slot: 'workspace', index: 10, active: true }
    ]);
});

test('every dashboard view and section belongs to a closed CMS component graph', () => {
    const byCode = new Map(components.map(component => [component.code, component]));
    assert.equal(byCode.size, components.length);
    const workspace = byCode.get('axisFrameworkDashboardWorkspaceComponent');
    assert.equal(workspace.properties.defaultView, 'overview');
    const tabs = workspace.subComponents.map(ref => byCode.get(ref.target));
    assert.deepEqual(tabs.map(tab => tab.properties.view), ['overview', 'applications', 'technical']);
    assert.equal(tabs[0].properties.layout, 'framework');
    assert.equal(tabs[1].properties.layout, 'summary');
    assert.equal(tabs[2].properties.presentation, 'visual');
    assert.deepEqual(tabs.map(tab => tab.subComponents.length), [6, 9, 8]);
    for (const component of dashboardComponents) {
        assert.equal(component.accessMode, 'AUTHENTICATED');
        assert.equal(component.functionalModule, 'nodics.platform');
        const type = types.find(type => type.code === component.typeCode);
        assert.ok(type);
        assert.ok(renderers.some(renderer => renderer.code === type.code && renderer.contractVersion === 1));
        for (const [key, value] of Object.entries(component.properties)) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            assert.equal(type.propertySchema[key], actualType, component.code + ':' + key);
        }
        for (const ref of component.subComponents || []) {
            assert.ok(byCode.has(ref.target), ref.target);
            assert.equal(ref.code, undefined, 'Association identity must not replace its target');
        }
        assert.ok(!JSON.stringify(component).includes('localhost'));
    }
});

test('page and component associations follow the owning CMS schema', () => {
    const schemas = require('../../../../nodics.wcms/modules/cms/src/schemas/schemas');
    const schema = schemas.cms.cmsComponentDetail;
    assert.ok(schema.definition.target.required);
    const route = routes.find(route => route.path === '/dashboard');
    const page = pages.find(page => page.code === route.page);
    assert.equal(page.cmsComponents[0].target, 'axisFrameworkDashboardWorkspaceComponent');
    for (const component of dashboardComponents) for (const ref of component.subComponents || []) {
        assert.equal(typeof ref.target, 'string');
        assert.equal(typeof ref.index, 'number');
    }
});
