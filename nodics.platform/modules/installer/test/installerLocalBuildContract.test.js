/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */

/** @module installer/test/installerLocalBuildContract @description Verifies confirmed generation, scope, receipts and exact reversal. @layer test @owner installer */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const owner = require('../src/service/defaultInstallerLocalBuildService');
const fixture = require('../../../../nodics.foundation/modules/nTooling/test/helpers/applicationBuilderWorkspace');

test('a confirmed canonical Local plan generates once and reverses only its unchanged output', async t => {
    const source = fixture();
    const framework = path.resolve(__dirname, '../../../..');
    const original = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE };
    let enabled = false;
    global.CONFIG = { get: key => key === 'installer' ? { applicationBuilder: {
        workspace: { allowedRoots: [source.customer] },
        buildExecution: { enabled, experienceRoot: source.experience, frontendCode: 'storefront', allowedPresets: ['apparel'] },
    } } : undefined };
    global.NODICS = { getCustomHome: () => source.customer, getNodicsHome: () => path.join(framework, 'nodics.foundation'),
        getServerPath: () => source.root };
    global.SERVICE = { DefaultSecuredRequestPipelineService: {
        getGrantedPermissions: request => request.authData.permissions,
        getRouteActionAuthorizationConfig: () => ({}),
        isPermissionGranted: (permission, granted) => granted.includes(permission),
    } };
    const root = owner.receiptRoot();
    t.after(() => { fs.rmSync(root, { recursive: true, force: true }); Object.assign(global, original); });
    const runId = randomUUID();
    const authority = { tenant: 'default', entCode: 'default', loginId: 'operator', principalType: 'human',
        tokenType: 'access', permissions: ['installer.workspace.build'] };
    const prepare = { runId, workspaceRoot: source.customer, applicationName: 'axis-k04-verified',
        accelerator: 'apparel', environment: 'local' };
    const call = async (command, payload, authData = authority) => (await owner.execute({ authData, payload }, command)).data;
    await assert.rejects(call('prepare', prepare), { code: 'INSTALLER_API_DISABLED' });
    enabled = true;
    await assert.rejects(call('prepare', prepare, { ...authority, permissions: ['installer.workspace.plan'] }),
        { code: 'INSTALLER_PERMISSION_DENIED' });
    const reviewed = await call('prepare', prepare);
    assert.equal(reviewed.state, 'REVIEWED');
    assert.deepEqual(await call('prepare', prepare), reviewed);
    await assert.rejects(call('prepare', { ...prepare, applicationName: 'different-app' }), { code: 'INSTALLER_BUILD_CONFLICT' });
    await assert.rejects(call('read', { runId }, { ...authority, loginId: 'another' }), { code: 'INSTALLER_BUILD_NOT_FOUND' });
    const action = { runId, reviewDigest: reviewed.reviewDigest, confirmed: true };
    await assert.rejects(call('generate', { ...action, reviewDigest: 'sha256:' + '0'.repeat(64) }), { code: 'INSTALLER_BUILD_CONFLICT' });
    await assert.rejects(call('generate', { ...action, confirmed: false }), { code: 'INSTALLER_BUILD_INVALID' });
    const project = path.join(root, runId, 'project');
    assert.equal(fs.existsSync(project), false);
    const generated = await call('generate', action);
    assert.equal(generated.state, 'GENERATED');
    assert.ok(generated.artifactCount > 20);
    assert.deepEqual(await call('generate', action), generated);
    const lock = JSON.parse(fs.readFileSync(path.join(project, 'solution-lock.json'), 'utf8'));
    assert.equal(lock.planDigest, reviewed.reviewDigest);
    assert.equal(lock.qualification.state, 'NOT_RUN');
    const extra = path.join(project, 'unexpected.txt');
    fs.writeFileSync(extra, 'Do not remove changed output.');
    await assert.rejects(call('rollback', action), { code: 'INSTALLER_BUILD_CONFLICT' });
    assert.equal(fs.readFileSync(extra, 'utf8'), 'Do not remove changed output.');
    fs.unlinkSync(extra);
    const rolled = await call('rollback', action);
    assert.equal(rolled.state, 'ROLLED_BACK');
    assert.equal(fs.existsSync(project), false);
    assert.deepEqual(await call('rollback', action), rolled);
    assert.deepEqual(await call('read', { runId }), rolled);
    assert.deepEqual(rolled.audit.map(row => row.state), ['REVIEWED', 'GENERATING', 'GENERATED', 'ROLLING_BACK', 'ROLLED_BACK']);
    assert.ok(!JSON.stringify(rolled).includes(source.root));
});
