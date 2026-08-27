/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const service = require('../src/service/project/defaultProjectFrameworkLinkService');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-framework-link-'));
try {
    const projectRoot = path.join(tmpRoot, 'project');
    const frameworkRoot = path.join(tmpRoot, 'framework');
    const foundationRoot = path.join(frameworkRoot, 'nodics.foundation');
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.mkdirSync(foundationRoot, { recursive: true });
    fs.writeFileSync(path.join(projectRoot, '.env'), 'NODICS_FRAMEWORK_ROOT=../framework\n');
    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({ name: 'project', dependencies: {} }, null, 2));
    fs.writeFileSync(path.join(foundationRoot, 'package.json'), JSON.stringify({ name: 'nodics.foundation' }, null, 2));

    service.validate({ projectRoot, environment: {} });

    assert.strictEqual(fs.existsSync(path.join(projectRoot, '.nodics', 'framework')), false,
        'Framework validation must not create project-local framework links');

    fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({
        name: 'project',
        dependencies: {
            'nodics.foundation': 'file:.nodics/framework/nodics.foundation'
        }
    }, null, 2));

    assert.throws(() => service.validate({ projectRoot, environment: {} }), /legacy \.nodics\/framework dependencies/u,
        'Legacy framework-link dependencies must be rejected instead of recreated');
    console.log('Project framework root validation contract validated');
} finally {
    fs.rmSync(tmpRoot, { force: true, recursive: true });
}
