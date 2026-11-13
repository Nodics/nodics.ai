/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module workflow/test/workflowDocumentationLinks @description Checks owner-contributed help against selected canonical CMS routes and article heading anchors; source validity does not prove Online publication. @owner workflow @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const owner = path.resolve(__dirname, '..');
const contract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const capability = require('../src/service/defaultWorkflowBackofficeCapabilityService').getCapability();
const release = { ...contract.readDocumentationRelease(owner), children: [] };
const records = suffix => contract.readReleaseRecords(release, suffix).records;
const routes = records('Route');
const pages = records('PageMetadata');
const components = records('Component');

test('every advertised Workflow help route and fragment belongs to its selected owner article', () => {
    for (const entry of capability.navigation) {
        assert.ok(entry.help, entry.id);
        const route = routes.find(route => route.path === entry.help.documentationRoute);
        assert.ok(route, entry.id + ': canonical documentation route');
        const page = pages.find(page => page.targetRoute === route.code);
        assert.ok(page, entry.id + ': canonical page metadata');
        const article = components.find(component => component.code === page.articleComponent);
        assert.ok(article, entry.id + ': canonical article');
        if (entry.help.documentationFragment) {
            assert.ok(article.properties.blocks.some(block => block.kind === 'heading' &&
                block.anchor === entry.help.documentationFragment), entry.id + ': actual article heading');
        }
    }
});

test('human review and trigger help lead to the corresponding business journeys', () => {
    const targets = {
        'process-tasks': 'process.first-human-task',
        'process-triggers': 'process.scheduled-automation',
        'process-designer': 'process.visual-designer'
    };
    for (const [id, documentId] of Object.entries(targets)) {
        const entry = capability.navigation.find(entry => entry.id === id);
        const page = pages.find(page => page.documentId === documentId);
        const route = routes.find(route => route.code === page.targetRoute);
        assert.equal(entry.help.documentationRoute, route.path, id);
    }
});
