/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict');
const persistence = require('../../wasteCore/src/service/defaultWastePersistenceService');
const Enum = require('../../../../nodics.foundation/modules/nConfig/bin/enum');
/** @module wasteCarbon/test/repositoryFixture @description Unit-only generated-repository boundary with atomic revision conflicts and fault injection. No database or external access. @owner wasteCarbon @layer test */
module.exports = {
    /** Creates fresh tenant-separated fake generated repositories behind the real Waste persistence adapter. */
    create: function (schemas) {
        const db = new Map(), calls = [], failures = [];
        const copy = value => value === undefined ? undefined : structuredClone(value);
        const key = (tenant, schema, code) => [tenant, schema, code].join(':');
        const matches = (row, query) => Object.entries(query).every(([path, wanted]) => {
            if (path === '$or') return wanted.some(q => matches(row, q));
            const value = path.split('.').reduce((obj, part) => obj?.[part], row);
            return wanted?.$elemMatch ? Array.isArray(value) && value.some(item => matches(item, wanted.$elemMatch)) : value === wanted;
        });
        const fail = (schema, phase, input) => {
            const at = failures.findIndex(item => item.schema === schema && item.phase === phase && (!item.when || item.when(input)));
            if (at !== -1) { failures.splice(at, 1); throw new Error('injected ' + phase); }
        };
        const services = {
            DefaultWastePersistenceService: persistence,
            DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ principalType: 'service', loginId: 'system-owner' }) },
            DefaultSecuredRequestPipelineService: {
                getGrantedPermissions: request => request.authData.permissions || [],
                isPermissionGranted: (permission, permissions) => permissions.includes(permission)
            }
        };
        for (const schema of schemas) services['Default' + schema[0].toUpperCase() + schema.slice(1) + 'Service'] = {
            get: async input => {
                assert.equal(input.authData.loginId, 'system-owner');
                const rows = [...db.entries()].filter(([name, row]) => name.startsWith(input.tenant + ':' + schema + ':') && matches(row, input.query)).map(([, row]) => copy(row));
                const page = input.searchOptions?.pageNumber || 1, size = input.searchOptions?.pageSize || 100;
                return { result: rows.slice((page - 1) * size, page * size), count: rows.length };
            },
            save: async input => {
                calls.push({ schema, operation: 'save', input: copy(input) }); fail(schema, 'before-save', input);
                const id = key(input.tenant, schema, input.model.code);
                if (db.has(id)) throw Object.assign(new Error('duplicate'), { code: 'ERR_CONCURRENCY_00001' });
                db.set(id, { ...copy(input.model), revision: 1 }); fail(schema, 'after-save', input);
            },
            update: async input => {
                calls.push({ schema, operation: 'update', input: copy(input) }); fail(schema, 'before-update', input);
                const id = key(input.tenant, schema, input.query.code), row = db.get(id);
                if (!row || row.revision !== input.query.revision) throw Object.assign(new Error('conflict'), { code: 'ERR_CONCURRENCY_00001' });
                db.set(id, { ...row, ...copy(input.model), revision: row.revision + 1 }); fail(schema, 'after-update', input);
            }
        };
        const enums = Object.fromEntries(Object.entries(require('../src/utils/enums'))
            .map(([name, contribution]) => [name, new Enum(contribution.definition)]));
        return { db, calls, failures, services, enums,
            put: (schema, row, tenant = 'T') => db.set(key(tenant, schema, row.code), copy(row)),
            get: (schema, code, tenant = 'T') => copy(db.get(key(tenant, schema, code))) };
    }
};
