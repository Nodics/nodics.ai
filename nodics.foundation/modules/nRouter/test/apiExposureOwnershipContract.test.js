/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module router/test/apiExposureOwnershipContract @description Proves explicit capability category ownership and broad exposure policy overrides without changing route authorization. @layer test @owner router */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const pipeline = require('../src/service/request/defaultRequestHandlerPipelineService');
const root = path.resolve(__dirname, '../../../..');
function visit(node, action) {
    if (!node || typeof node !== 'object') return;
    action(node);
    for (const item of Object.values(node))
        if (Array.isArray(item)) item.forEach((child) => visit(child, action));
        else if (item && typeof item === 'object') visit(item, action);
}
function routers(directory, result = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (['node_modules', '.git', 'generated', 'gen', 'dist', 'data', 'test', 'llm'].includes(entry.name))
            continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) routers(file, result);
        else if (file.includes('/src/router/') && file.endsWith('.js')) result.push(file);
    }
    return result;
}
test('every authored literal API category is declared by the route capability', () => {
    const violations = [];
    let count = 0;
    for (const file of routers(root)) {
        const source = fs.readFileSync(file, 'utf8');
        const propertiesFile = path.join(file.split('/src/router/')[0], 'config/properties.js');
        const properties = fs.existsSync(propertiesFile) ? require(propertiesFile) : {};
        visit(acorn.parse(source, { ecmaVersion: 'latest' }), (node) => {
            if (node.type !== 'Property' || (node.key.name || node.key.value) !== 'apiExposure') return;
            const value =
                node.value.type === 'Literal'
                    ? node.value
                    : node.value.type === 'ObjectExpression'
                      ? node.value.properties.find((item) => (item.key.name || item.key.value) === 'category')
                            ?.value
                      : null;
            if (!value || typeof value.value !== 'string') return;
            count++;
            const policy = properties.apiExposure?.categories?.[value.value];
            if (!policy || (Object.prototype.hasOwnProperty.call(policy, 'enabled') && typeof policy.enabled !== 'boolean'))
                violations.push(path.relative(root, file) + ': ' + value.value);
        });
    }
    assert.ok(count > 100, 'inspect the actual route inventory');
    assert.deepEqual(violations, []);
});
test('unknown categories follow default exposure; explicit deployment and node overrides remain authoritative', () => {
    let exposure = {
        default: { enabled: true },
        categories: { sample: { enabled: true } },
    };
    global.CONFIG = { get: () => exposure };
    assert.equal(pipeline.isApiExposureEnabled('sample'), true);
    assert.equal(pipeline.isApiExposureEnabled('absent'), true);
    exposure.categories.sample.enabled = false;
    assert.equal(pipeline.isApiExposureEnabled('sample'), false);
    exposure.categories.sample.enabled = 'true';
    assert.equal(pipeline.isApiExposureEnabled('sample'), false);
    exposure.unknown = { enabled: false };
    assert.equal(pipeline.isApiExposureEnabled('absent'), false, 'explicit compatibility policy can still deny unknown categories');
    exposure = undefined;
    assert.equal(pipeline.isApiExposureEnabled('absent'), false);
});
