/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectLocalRuntimeCredentialService
 * @description Validates generated native-local runtime credential injection without committed secrets or .env files.
 * @layer test
 * @owner nTooling
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const service = require('../src/service/project/defaultProjectLocalRuntimeCredentialService');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-local-runtime-credentials-'));
fs.mkdirSync(path.join(root, 'envs', 'kickoffLocal'), { recursive: true });

const first = service.ensureCredentials(root, 'kickoffLocal');
const second = service.ensureCredentials(root, 'kickoffLocal');
const file = service.credentialPath(root, 'kickoffLocal');

assert(fs.existsSync(file), 'native-local credentials must be generated under the environment generated folder');
assert.strictEqual(JSON.stringify(first), JSON.stringify(second), 'generated local credentials must be stable across starts');
assert.strictEqual(fs.statSync(file).mode & 0o777, 0o600, 'generated local credentials must not be world-readable');
assert(first.NODICS_JWT_SECRET, 'generated local credentials must include JWT signing material');
assert(first.NODICS_API_KEY_PEPPER, 'generated local credentials must include API-key digest material');
assert(first.NODICS_API_KEY, 'generated local credentials must include a server-local runtime proof');
assert.strictEqual(first.NODICS_RUNTIME_API_KEY, undefined,
    'new native-local credentials must not generate server-shared runtime aliases');
assert.strictEqual(first.NODICS_WASTE_API_KEY, undefined,
    'new native-local credentials must not generate server-prefixed API-key aliases');

const merged = service.mergeEnvironment(root, 'kickoffLocal', {
    NODICS_API_KEY: 'external-runtime-key',
    CUSTOM_VALUE: 'kept'
});
assert.strictEqual(merged.NODICS_API_KEY, 'external-runtime-key',
    'deployment-supplied values must override generated local defaults');
assert.strictEqual(merged.CUSTOM_VALUE, 'kept');

const production = service.mergeEnvironment(root, 'qa', {});
assert.strictEqual(production.NODICS_API_KEY, undefined,
    'non-local environments must not receive generated local credentials');

const migratedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-local-runtime-credentials-migration-'));
const migratedFile = service.credentialPath(migratedRoot, 'kickoffLocal');
fs.mkdirSync(path.dirname(migratedFile), { recursive: true });
fs.writeFileSync(migratedFile, JSON.stringify({
    NODICS_JWT_SECRET: 'j'.repeat(64),
    NODICS_API_KEY_PEPPER: 'p'.repeat(64),
    NODICS_BOOTSTRAP_ADMIN_PASSWORD: 'administrator-password-for-migration',
    NODICS_BOOTSTRAP_SERVICE_PASSWORD: 'service-password-for-migration',
    NODICS_BOOTSTRAP_SERVICE_API_KEY: 's'.repeat(48),
    NODICS_RUNTIME_API_KEY: 'r'.repeat(48),
    NODICS_WASTE_API_KEY: 'w'.repeat(48)
}, null, 2));
const migrated = service.ensureCredentials(migratedRoot, 'kickoffLocal');
assert.strictEqual(migrated.NODICS_API_KEY, 'r'.repeat(48),
    'legacy retained runtime proof must migrate to the server-local runtime proof');
assert.strictEqual(migrated.NODICS_RUNTIME_API_KEY, undefined);
assert.strictEqual(migrated.NODICS_WASTE_API_KEY, undefined);

console.log('Project local runtime credential service validated');
