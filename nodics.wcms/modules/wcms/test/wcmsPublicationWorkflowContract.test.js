/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates the current Process-owned CMS approval definition and authenticated Staged-to-Online publication handoff. */
const assert = require('assert');
class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };

const cmsManifest = require('../../cms/data/manifest.json');
const approval = require('../../cms/data/init-v001/records/process/cmsPublicationApprovalDefinitionData').definitions[0];
assert.strictEqual(cmsManifest.sections.cmsPublicationApproval.destinationRole, 'PROCESS');
assert.strictEqual(cmsManifest.sections.cmsPublicationApproval.installer, 'PROCESS_DEFINITION');
assert.strictEqual(approval.code, 'cmsPublicationApproval');
assert(approval.graph.nodes.some(node => node.action && node.action.operation === 'applyPublicationDecision'));
assert.strictEqual(require('../data/manifest.json').sections['init-v001'], undefined,
    'the superseded local Workflow import must not return');

global.SERVICE = {};

(async () => {
    let outbound;
    global.CONFIG = { get: key => key === 'cms' ? { publication: { target: {
        moduleName: 'cms', connectionName: 'cmsOnline', connectionType: 'server', nodeId: 'online-node', timeoutMs: 1000, maxAttempts: 2
    }, runtimeRole: 'STAGED' } } : undefined };
    global.NODICS = { getInternalAuthToken: tenant => 'internal-' + tenant };
    SERVICE.DefaultModuleService = {
        invokeModule: options => {
            outbound = options;
            return Promise.resolve(options.responseSelector({ result: { version: 'target-release-a' } }));
        }
    };
    const transport = require('../../cms/src/service/publication/defaultCmsPublicationModuleTransportService');
    await transport.deploy({ manifest: { code: 'release-a' } }, { tenant: 'tenant-a' });
    assert.deepStrictEqual(outbound.targetAuthority, { runtimeRole: 'WCMS_ONLINE' });
    assert.strictEqual(outbound.connectionType, 'server');
    assert.strictEqual(outbound.moduleName, 'cms');
    assert.strictEqual(outbound.connectionName, 'cmsOnline');
    assert.strictEqual(outbound.nodeId, 'online-node');
    assert.strictEqual(outbound.header.Authorization, 'Bearer internal-tenant-a');
    assert.strictEqual(outbound.apiName, '/publication/target/deploy');
    assert.strictEqual(outbound.idempotencyKey, 'release-a');

    global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: 'ONLINE', target: { moduleName: 'cms', connectionName: 'cmsOnline' } } } : undefined };
    await assert.rejects(() => transport.deploy({ manifest: { code: 'invalid-source' } }, { tenant: 'tenant-a' }),
        error => error.code === 'CMS_PUBLICATION_SOURCE_ROLE_INVALID');

    console.log('WCMS approval-to-publication workflow contract validated');
})().catch(error => { console.error(error); process.exit(1); });
