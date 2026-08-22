/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

/**
 * @module nodics.foundation/test/serviceLayerNamingContract
 * @description Guards the Nodics layered exposure principle: service-layer business behavior must not be named as API exposure.
 * @layer test
 * @owner nSetup
 */

const root = path.resolve(__dirname, '..', '..');
const ignoredParts = new Set(['node_modules', 'generated', 'data', 'docs', 'coverage', '.git']);

function shouldSkip(filePath) {
    return filePath.split(path.sep).some(part => ignoredParts.has(part));
}

function walk(directory, files = []) {
    if (shouldSkip(directory) || !fs.existsSync(directory)) return files;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const next = path.join(directory, entry.name);
        if (shouldSkip(next)) continue;
        if (entry.isDirectory()) walk(next, files);
        else if (entry.isFile() && next.endsWith('.js')) files.push(next);
    }
    return files;
}

test('service layer does not introduce API-named business services', () => {
    const serviceFiles = walk(root).filter(file => file.includes(`${path.sep}src${path.sep}service${path.sep}`));
    const apiNamedFiles = serviceFiles.filter(file => /apiService|ApiService|APIService/.test(path.basename(file)));
    const apiNamedIdentities = [];
    for (const file of serviceFiles) {
        const source = fs.readFileSync(file, 'utf8');
        if (/Default[A-Za-z0-9]+ApiService|Default[A-Za-z0-9]+APIService/.test(source)) {
            apiNamedIdentities.push(file);
        }
    }
    assert.deepEqual(apiNamedFiles.map(file => path.relative(root, file)), []);
    assert.deepEqual(apiNamedIdentities.map(file => path.relative(root, file)), []);
});
