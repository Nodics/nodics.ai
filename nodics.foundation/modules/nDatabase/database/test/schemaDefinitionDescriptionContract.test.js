/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/schemaDefinitionDescriptionContract
 * @description Verifies that schema fields expose business-readable descriptions for Schema Workbench rendering.
 * @layer test
 * @owner nDatabase
 * @override Later layers may add schema fields, but every effective field must describe its business purpose.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../../..');
const weakDescriptions = new Set(['description of the property', 'description', 'todo', 'tbd', 'na', 'n/a']);

function createRuntimeProxy(name) {
    const target = function runtimeProxy() {
        return name;
    };
    return new Proxy(target, {
        get: function getProxyProperty(_target, property) {
            if (property === Symbol.toPrimitive) {
                return function toPrimitive() {
                    return name;
                };
            }
            if (property === 'toString' || property === 'valueOf' || property === 'inspect') {
                return function proxyToString() {
                    return name;
                };
            }
            return createRuntimeProxy(`${name}.${String(property)}`);
        },
        apply: function applyProxy() {
            return name;
        },
    });
}

function collectSchemaFiles(directory, result) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
        if (entry.name === 'node_modules' || entry.name === '.git') {
            return;
        }
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            collectSchemaFiles(entryPath, result);
            return;
        }
        if (entry.name === 'schemas.js' && entryPath.includes(`${path.sep}src${path.sep}schemas${path.sep}`)) {
            result.push(entryPath);
        }
    });
}

function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function inspectSchemaNode(node, trail, relativePath, failures, counters) {
    if (!isObject(node)) {
        return;
    }
    if (isObject(node.definition)) {
        counters.schemas += 1;
        Object.entries(node.definition).forEach(([fieldName, field]) => {
            if (!isObject(field)) {
                return;
            }
            counters.fields += 1;
            const description = field.description;
            const normalized = typeof description === 'string' ? description.trim() : '';
            if (!normalized || weakDescriptions.has(normalized.toLowerCase())) {
                failures.push(`${relativePath} :: ${trail.join('.')}.${fieldName}`);
            }
        });
    }
    Object.entries(node).forEach(([key, value]) => {
        if (key !== 'definition' && isObject(value)) {
            inspectSchemaNode(value, trail.concat(key), relativePath, failures, counters);
        }
    });
}

(function validateSchemaFieldDescriptions() {
    global.ENUMS = createRuntimeProxy('ENUMS');
    global.CONSTANTS = createRuntimeProxy('CONSTANTS');
    global.SERVICE = createRuntimeProxy('SERVICE');

    const schemaFiles = [];
    const failures = [];
    const counters = { schemas: 0, fields: 0 };
    collectSchemaFiles(repositoryRoot, schemaFiles);

    schemaFiles.forEach((schemaFile) => {
        const relativePath = path.relative(repositoryRoot, schemaFile);
        delete require.cache[require.resolve(schemaFile)];
        const schemaExport = require(schemaFile);
        inspectSchemaNode(schemaExport, [], relativePath, failures, counters);
    });

    assert.strictEqual(failures.length, 0, `Schema fields missing business descriptions:\n${failures.join('\n')}`);
    assert.ok(counters.schemas > 0, 'Expected at least one schema definition to be inspected');
    assert.ok(counters.fields > 0, 'Expected at least one schema field to be inspected');
    console.log(`Schema definition description contract validated for ${counters.schemas} schemas and ${counters.fields} fields`);
})();
