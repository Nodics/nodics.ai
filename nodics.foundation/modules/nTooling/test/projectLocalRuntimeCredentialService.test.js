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
assert(first.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY,
    'native-local startup must support encrypted provider configuration');
assert.strictEqual(first.NODICS_BOOTSTRAP_ADMIN_PASSWORD, 'adminPassword',
    'native-local credentials must keep the documented administrator password');
assert.strictEqual(first.NODICS_RUNTIME_API_KEY, undefined,
    'new native-local credentials must not generate server-shared runtime aliases');
assert.strictEqual(first.NODICS_WASTE_API_KEY, undefined,
    'new native-local credentials must not generate server-prefixed API-key aliases');

const readOnlyFile = fs.readFileSync(file);
const readOnlyStat = fs.statSync(file);
const readOnly = service.readExistingEnvironment(fs.realpathSync(root), 'kickoffLocal', { CUSTOM_VALUE: 'retained' });
assert.strictEqual(readOnly.NODICS_JWT_SECRET, first.NODICS_JWT_SECRET);
assert.strictEqual(readOnly.CUSTOM_VALUE, 'retained');
assert.deepStrictEqual(fs.readFileSync(file), readOnlyFile);
assert.strictEqual(fs.statSync(file).mtimeMs, readOnlyStat.mtimeMs);
assert.throws(() => service.readExistingEnvironment(fs.realpathSync(root), 'missingLocal', {}), /RESOLUTION_REFUSED/);
assert.strictEqual(fs.existsSync(service.credentialPath(root, 'missingLocal')), false);
fs.writeFileSync(file, '{}');
assert.throws(() => service.readExistingEnvironment(fs.realpathSync(root), 'kickoffLocal', {}), /RESOLUTION_REFUSED/);
assert.strictEqual(fs.readFileSync(file, 'utf8'), '{}');
fs.writeFileSync(file, readOnlyFile);

const merged = service.mergeEnvironment(root, 'kickoffLocal', {
    NODICS_API_KEY: 'external-runtime-key',
    NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY: 'external-encryption-key',
    CUSTOM_VALUE: 'kept'
});
assert.strictEqual(merged.NODICS_API_KEY, 'external-runtime-key',
    'deployment-supplied values must override generated local defaults');
assert.strictEqual(merged.CUSTOM_VALUE, 'kept');
assert.strictEqual(merged.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY, 'external-encryption-key');
assert.strictEqual(service.ensureCredentials(root, 'kickoffLocal').NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY,
    first.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY, 'environment overrides must not rotate persisted encryption keys');

const production = service.mergeEnvironment(root, 'qa', {});
assert.strictEqual(production.NODICS_API_KEY, undefined,
    'non-local environments must not receive generated local credentials');
assert.strictEqual(production.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY, undefined);

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
assert.strictEqual(migrated.NODICS_BOOTSTRAP_ADMIN_PASSWORD, 'adminPassword',
    'legacy local administrator passwords must normalize to the documented local default');
assert.strictEqual(migrated.NODICS_API_KEY, 'r'.repeat(48),
    'legacy retained runtime proof must migrate to the server-local runtime proof');
assert.strictEqual(migrated.NODICS_RUNTIME_API_KEY, undefined);
assert.strictEqual(migrated.NODICS_WASTE_API_KEY, undefined);
assert(migrated.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY,
    'existing local storage must gain the missing runtime encryption key');
assert.strictEqual(migrated.NODICS_JWT_SECRET, 'j'.repeat(64));
assert.strictEqual(migrated.NODICS_API_KEY_PEPPER, 'p'.repeat(64));
assert.strictEqual(service.ensureCredentials(migratedRoot, 'kickoffLocal').NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY,
    migrated.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY);

// Rotation uses only the existing file, even if compatibility normalization would otherwise change its contents.
const jwt = require('jsonwebtoken');
const rotationRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-selective-jwt-')));
const rotationFile = service.credentialPath(rotationRoot, 'fixtureLocal');
fs.mkdirSync(path.dirname(rotationFile), {recursive:true,mode:0o700});
const values = {
    NODICS_JWT_SECRET: service.randomSecret(64),
    NODICS_API_KEY_PEPPER: service.randomSecret(64),
    NODICS_BOOTSTRAP_ADMIN_PASSWORD: service.randomSecret(),
    NODICS_BOOTSTRAP_SERVICE_PASSWORD: 'legacy-kept-without-normalization',
    NODICS_BOOTSTRAP_SERVICE_API_KEY: service.randomSecret(),
    NODICS_API_KEY: service.randomSecret(),
    NODICS_RUNTIME_API_KEY: service.randomSecret()
};
fs.writeFileSync(rotationFile,JSON.stringify(values,null,2)+'\n',{mode:0o600});
const rotating = {...service,ensureCredentials:() => {throw Error('normalization forbidden');}};
try {
    const prior = jwt.sign({sub:'fixture',authVersion:1},values.NODICS_JWT_SECRET,{algorithm:'HS256'});
    const receipt = rotating.rotateJwtSecret(rotationRoot,'fixtureLocal');
    const current = JSON.parse(fs.readFileSync(rotationFile,'utf8'));
    assert.deepStrictEqual(receipt.changedKeys,['NODICS_JWT_SECRET']);
    assert.strictEqual(receipt.administratorPasswordPreserved,true);
    assert.strictEqual(Buffer.from(current.NODICS_JWT_SECRET).equals(Buffer.from(values.NODICS_JWT_SECRET)),false);
    for (const key of Object.keys(values).filter(key => key !== 'NODICS_JWT_SECRET'))
        assert.strictEqual(Buffer.from(current[key]).equals(Buffer.from(values[key])),true,'non-JWT credential bytes must remain unchanged');
    assert.strictEqual(fs.statSync(rotationFile).mode & 0o777,0o600);
    assert.throws(() => jwt.verify(prior,current.NODICS_JWT_SECRET,{algorithms:['HS256']}),/invalid signature/);
    const fresh = jwt.sign({sub:'fixture',authVersion:1},current.NODICS_JWT_SECRET,{algorithm:'HS256'});
    assert.strictEqual(jwt.verify(fresh,current.NODICS_JWT_SECRET,{algorithms:['HS256']}).authVersion,1);
    assert.deepStrictEqual(fs.readdirSync(path.dirname(rotationFile)),['credentials.json']);
    const retained = fs.readFileSync(rotationFile);
    for (const environment of ['production','../fixtureLocal','fixtureLocal/../fixtureLocal','missingLocal','',null])
        assert.throws(() => rotating.rotateJwtSecret(rotationRoot,environment),/JWT_ROTATION_REFUSED/);
    assert.strictEqual(fs.readFileSync(rotationFile).equals(retained),true);
    fs.chmodSync(rotationFile,0o644);
    assert.throws(() => rotating.rotateJwtSecret(rotationRoot,'fixtureLocal'),/JWT_ROTATION_REFUSED/);
    fs.chmodSync(rotationFile,0o600);
    const other = path.join(rotationRoot,'outside.json');
    fs.renameSync(rotationFile,other);
    fs.symlinkSync(other,rotationFile);
    assert.throws(() => rotating.rotateJwtSecret(rotationRoot,'fixtureLocal'),/JWT_ROTATION_REFUSED/);
    assert.strictEqual(fs.readFileSync(other).equals(retained),true);
    fs.unlinkSync(rotationFile);
    fs.renameSync(other,rotationFile);
    fs.writeFileSync(rotationFile,'{}');
    assert.throws(() => rotating.rotateJwtSecret(rotationRoot,'fixtureLocal'),/JWT_ROTATION_REFUSED/);
} finally { fs.rmSync(rotationRoot,{recursive:true,force:true}); }

const keyBefore = service.readExistingEnvironment(fs.realpathSync(root), 'kickoffLocal', {});
const purposeName = 'NODICS_TEST_PURPOSE_KEY';
const added = service.ensureSecretKey(fs.realpathSync(root), 'kickoffLocal', purposeName);
assert.deepStrictEqual(added.changedKeys, [purposeName]);
const keyAfter = service.readExistingEnvironment(fs.realpathSync(root), 'kickoffLocal', {});
assert.match(keyAfter[purposeName], /^[a-f0-9]{64}$/);
for (const key of Object.keys(keyBefore)) assert.strictEqual(keyAfter[key], keyBefore[key]);
const retainedKeyBytes = fs.readFileSync(file);
assert.deepStrictEqual(service.ensureSecretKey(fs.realpathSync(root), 'kickoffLocal', purposeName).changedKeys, []);
assert.deepStrictEqual(fs.readFileSync(file), retainedKeyBytes);
for (const name of ['NODICS_JWT_SECRET', '../outside', '', null])
    assert.throws(() => service.ensureSecretKey(fs.realpathSync(root), 'kickoffLocal', name), /LOCAL_SECRET_KEY_REFUSED/);
assert.throws(() => service.ensureSecretKey(fs.realpathSync(root), 'production', purposeName), /LOCAL_SECRET_KEY_REFUSED/);
fs.chmodSync(file, 0o644);
assert.throws(() => service.ensureSecretKey(fs.realpathSync(root), 'kickoffLocal', purposeName), /LOCAL_SECRET_KEY_REFUSED/);
fs.chmodSync(file, 0o600);
assert.deepStrictEqual(fs.readFileSync(file), retainedKeyBytes);

console.log('Project local runtime credential service validated');
