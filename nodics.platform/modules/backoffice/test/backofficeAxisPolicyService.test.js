/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');
const schemas = require('../src/schemas/schemas').backoffice;

assert.strictEqual(schemas.backofficeAxisPolicy.definition.screenLockEnabled.type, 'bool',
    'persistent BackOffice boolean fields must use the MongoDB BSON bool type');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
};
global.CONFIG = {
    get: key => key === 'backofficeAxisPolicy' ? {
        ...require('../config/properties').backofficeAxisPolicy
    } : key === 'defaultTenant' ? 'default' : undefined
};

let persisted;
let audit;
global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ tokenType: 'service' }) },
    DefaultBackofficeAxisPolicyService: {
        get: async () => ({ result: persisted ? [persisted] : [] }),
        save: async request => {
            persisted = Object.assign({}, request.model);
            return { result: [persisted] };
        },
        update: async request => {
            if (!persisted || persisted.revision !== request.query.revision) return { result: { modifiedCount: 0 } };
            persisted = Object.assign({}, persisted, request.model);
            return { result: { modifiedCount: 1 } };
        }
    },
    DefaultBackofficeAuditService: {
        record: async event => {
            audit = event;
            return true;
        }
    }
};

const service = require(path.resolve(__dirname, '../src/service/policy/defaultAxisExperiencePolicyService'));

(async () => {
    let fallback = await service.getEffective({ tenant: 'tenantA' });
    assert.deepStrictEqual(fallback, {
        contractVersion: 0,
        screenLockEnabled: true,
        idleTimeoutSeconds: 900,
        recentNavigationLimit: 12,
        revision: 0,
        source: 'DEFAULT',
        sessionRecoveryPresentation: require('../config/properties').backofficeAxisPolicy.sessionRecoveryPresentation
    });

    assert.ok(fallback.sessionRecoveryPresentation?.lockedMessage.includes('unsaved'), 'Lock guidance must explain draft retention');
    assert.ok(fallback.sessionRecoveryPresentation?.expiredMessage.includes('inspect'), 'Expiry guidance must warn about completed pending actions');

    let created = await service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 600, recentNavigationLimit: 8, expectedRevision: 0 }
    });
    assert.strictEqual(created.data.revision, 1);
    assert.strictEqual(persisted.idleTimeoutSeconds, 600);
    assert.strictEqual(persisted.recentNavigationLimit, 8);
    assert.strictEqual(audit.eventType, 'backoffice.axis.policy.updated');

    let effective = await service.getEffective({ tenant: 'tenantA' });
    assert.strictEqual(effective.source, 'PERSISTED');
    assert.strictEqual(effective.idleTimeoutSeconds, 600);
    assert.strictEqual(effective.recentNavigationLimit, 8);

    let updated = await service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: false, idleTimeoutSeconds: 1200, recentNavigationLimit: 10, expectedRevision: 1 }
    });
    assert.strictEqual(updated.data.revision, 2);
    assert.strictEqual(updated.data.screenLockEnabled, false);
    assert.strictEqual(updated.data.recentNavigationLimit, 10);

    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 59, expectedRevision: 2 }
    }), /Invalid Axis employee screen-lock policy/);
    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 900, expectedRevision: 1 }
    }), /revision conflict/);
    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'human', principalId: 'axis.admin' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 900, recentNavigationLimit: 25, expectedRevision: 2 }
    }), /Invalid Axis recent navigation policy/);
    await assert.rejects(() => service.update({
        tenant: 'tenantA',
        authData: { tokenType: 'service', principalId: 'module' },
        body: { screenLockEnabled: true, idleTimeoutSeconds: 900, expectedRevision: 2 }
    }), /human employee principal/);

    assert.strictEqual(persisted.sessionRecoveryPresentation, undefined, 'Source-owned guidance must not be copied into persistent policy');
    const originalConfiguration = CONFIG.get;
    const source = originalConfiguration('backofficeAxisPolicy');
    const custom = { lockedMessage: 'Project recovery guidance', expiredMessage: 'Project expiry guidance' };
    CONFIG.get = key => key === 'backofficeAxisPolicy' ? { ...source, sessionRecoveryPresentation: custom } : originalConfiguration(key);
    assert.deepStrictEqual((await service.getEffective({ tenant: 'tenantA' })).sessionRecoveryPresentation, custom);
    for (const invalid of [undefined, null, {}, { ...custom, lockedMessage: '' }, { ...custom, expiredMessage: 'x'.repeat(1025) }]) {
        CONFIG.get = key => key === 'backofficeAxisPolicy' ? { ...source, sessionRecoveryPresentation: invalid } : originalConfiguration(key);
        await assert.rejects(() => service.getEffective({ tenant: 'tenantA' }), /recovery presentation is incomplete/);
    }
    CONFIG.get = originalConfiguration;
    assert.strictEqual(require('../src/schemas/apiContracts').axisPolicy.properties.contractVersion.minimum, 0);
    console.log('BackOffice Axis policy service tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
