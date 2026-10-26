/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Checks consolidated owner inventories, file integrity and independently selected identity imports without runtime mutation. @owner nodics.platform @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const groups = ['nodics.loyalty', 'nodics.platform', 'nodics.waste', 'nodics.communication'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

for (const group of groups) test(group + ' ships only selected canonical data and unique identity imports', () => {
    for (const name of fs.readdirSync(path.join(root, group, 'modules'))) {
        const data = path.join(root, group, 'modules', name, 'data');
        if (!fs.existsSync(path.join(data, 'manifest.json'))) continue;
        const manifest = JSON.parse(fs.readFileSync(path.join(data, 'manifest.json')));
        assert.equal(manifest.retainedRoots, undefined, name);
        const inventory = new Set();
        const identityImports = new Map();
        for (const [code, section] of Object.entries(manifest.sections)) {
            assert.equal(section.retainedRoots, undefined, name + ':' + code);
            const files = section.files || section.generatedHashes || {};
            for (const [file, expected] of Object.entries(files)) {
                if (/^(init|core|sample|docs)-v/.test(file))
                    assert.match(file, /^(init|core|sample|docs)-v001\//, file);
                assert.ok(!inventory.has(file), name + ': duplicate selected file ' + file);
                inventory.add(file);
                assert.equal(hash(fs.readFileSync(path.join(data, file))), expected, file);
            }
            // Identity, documentation and workspace snapshots share destination identities.
            for (const file of Object.keys(files).filter(file => file.includes('/headers/') &&
                (file.includes('/identity/') || file.startsWith('docs-') || file.includes('/workspace/')))) {
                const headers = require(path.join(data, file));
                for (const [destination, entries] of Object.entries(headers)) for (const header of Object.values(entries)) {
                    const prefix = header.options?.dataFilePrefix;
                    if (!prefix) continue;
                    const records = Object.keys(files).filter(file => file.includes('/records/') && path.basename(file) === prefix + '.js');
                    assert.equal(records.length, 1, name + ':' + prefix);
                    for (const record of Object.values(require(path.join(data, records[0])))) {
                        const identity = destination + ':' + header.options.schemaName + ':' + record.code;
                        assert.ok(!identityImports.has(identity), name + ':' + identity + ' imported by ' + identityImports.get(identity) + ' and ' + code);
                        identityImports.set(identity, code);
                    }
                }
            }
        }
        for (const dir of fs.readdirSync(data).filter(dir => /-v\d+$/.test(dir))) {
            assert.match(dir, /^(init|core|sample|docs)-v001$/, name + ':' + dir);
            for (const file of fs.readdirSync(path.join(data, dir), {recursive: true})) {
                if (fs.statSync(path.join(data, dir, file)).isFile())
                    assert.ok(inventory.has(dir + '/' + file), name + ': unselected shipped snapshot ' + file);
            }
        }
    }
});
