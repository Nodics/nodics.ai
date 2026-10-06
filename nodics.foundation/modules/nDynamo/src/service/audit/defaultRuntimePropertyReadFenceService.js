/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');

/** @module dynamo/service/audit/DefaultRuntimePropertyReadFenceService
 * @description Holds an existing committed tenant-property revision for one explicitly admitted framework operation through generated CAS, without another settings store.
 * @layer service @owner dynamo
 * @override Preserve deployment admission, exact operation/actor/revision binding, no expiration/takeover and strict acknowledgement. This private service is not a browser API or authorization grant.
 */
module.exports = {
    /** Rejects without revealing the existing operation or private fence token. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError(
            'ERR_SYS_00002',
            'Governed property read fence is unavailable or unconfirmed; inspect the original owner operation',
        );
    },
    /** Admits only deployment-configured private framework consumers and one exact operation. @param {Object} request Trusted owner call. @param {Object} intent Exact owner intent. @param {boolean} releasing Whether only an existing fence is being released. @returns {Object} Trusted scope and actor. */
    admission: function (request, intent, releasing = false) {
        const persistence = SERVICE.DefaultRuntimePropertyPersistenceService;
        const policy = CONFIG.get('runtimePropertyGovernance')?.readFence;
        const actor =
            request.authData?.loginId ||
            request.authData?.serviceId ||
            request.authData?.code;
        if (
            !persistence?.policy().enabled ||
            persistence.policy().requireDurableJournal !== true ||
            !intent ||
            typeof intent !== 'object' ||
            Array.isArray(intent) ||
            Object.keys(intent).sort().join() !==
                'operationCode,ownerModule,revision' ||
            ['operationCode', 'ownerModule', 'revision'].some(
                (key) => typeof intent[key] !== 'string',
            ) ||
            typeof actor !== 'string' ||
            !actor.trim() ||
            actor.length > 192 ||
            !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(intent.ownerModule || '') ||
            !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(
                intent.operationCode || '',
            ) ||
            !/^[a-f0-9]{64}$/.test(intent.revision || '') ||
            (!releasing &&
                (policy?.enabled !== true ||
                    policy.owners?.[intent.ownerModule] !== true))
        )
            this.fail();
        return { ...persistence.scope(request), actor };
    },
    /** Requires exactly one acknowledged atomic match with no contradictory failure details. @param {Object} response Generated result. @returns {void} Throws when uncertain. */
    acknowledge: function (response) {
        const result = response?.result;
        if (
            !/^SUC_/.test(response?.code || '') ||
            response.error ||
            response.success === false ||
            response.acknowledged === false ||
            (response.errors !== undefined &&
                (!Array.isArray(response.errors) || response.errors.length)) ||
            !result ||
            Array.isArray(result) ||
            result.error ||
            result.success === false ||
            (result.errors !== undefined &&
                (!Array.isArray(result.errors) || result.errors.length)) ||
            result.acknowledged === false ||
            result.matchedCount !== 1
        )
            this.fail();
    },
    /** Acquires one new fence only at the previously reviewed committed revision; existing fences never expire or replay implicitly. @param {Object} request Trusted owner. @param {Object} intent Owner, operation and revision. @returns {Promise<Object>} Private opaque-token receipt; consumer must keep it out of browser/model/log output. */
    acquire: async function (request, intent) {
        try {
            const scope = this.admission(request, intent);
            const owner = SERVICE.DefaultRuntimePropertyPersistenceService;
            const current = await owner.read(request);
            if (
                !current ||
                current.revision !== intent.revision ||
                current.propertyReadFence != null
            )
                this.fail();
            if (
                JSON.stringify(this.admission(request, intent)) !==
                JSON.stringify(scope)
            )
                this.fail();
            const fence = {
                version: 1,
                ...intent,
                actor: scope.actor,
                token: crypto.randomUUID(),
                at: new Date().toISOString(),
            };
            owner.validate({ ...current, propertyReadFence: fence }, scope);
            const response = await owner.store().update({
                ...owner.persistenceOptions(),
                tenant: scope.tenant,
                authData: request.authData,
                query: {
                    code: scope.code,
                    revision: intent.revision,
                    propertyReadFence: null,
                },
                model: { propertyReadFence: fence },
            });
            this.acknowledge(response);
            const observed = await owner.read(request);
            if (
                JSON.stringify(observed?.propertyReadFence) !==
                JSON.stringify(fence)
            )
                this.fail();
            if (
                JSON.stringify(this.admission(request, intent)) !==
                JSON.stringify(scope)
            )
                this.fail();
            return structuredClone(fence);
        } catch {
            this.fail();
        }
    },
    /** Reads an exact existing operation fence after response loss without acquiring, releasing or changing policy. @param {Object} request Trusted owner. @param {Object} intent Persisted owner intent. @returns {Promise<Object|null>} Private exact fence or absence. */
    inspect: async function (request, intent) {
        try {
            const scope = this.admission(request, intent, true);
            const current =
                await SERVICE.DefaultRuntimePropertyPersistenceService.read(
                    request,
                );
            if (!current || current.revision !== intent.revision) this.fail();
            const fence = current.propertyReadFence;
            if (
                fence &&
                (fence.ownerModule !== intent.ownerModule ||
                    fence.operationCode !== intent.operationCode ||
                    fence.actor !== scope.actor)
            )
                this.fail();
            if (
                JSON.stringify(this.admission(request, intent, true)) !==
                JSON.stringify(scope)
            )
                this.fail();
            return fence ? structuredClone(fence) : null;
        } catch {
            this.fail();
        }
    },
    /** Releases only the exact private token after the consumer has proven its own terminal outcome. Disabling acquisition does not strand an existing fence. @param {Object} request Original trusted owner identity. @param {Object} intent Persisted operation binding. @param {string} token Exact private fence token. @returns {Promise<Object>} Release acknowledgement, never evidence of consumer completion. */
    release: async function (request, intent, token) {
        try {
            const scope = this.admission(request, intent, true);
            if (typeof token !== 'string' || !/^[a-f0-9-]{36}$/.test(token))
                this.fail();
            const current = await this.inspect(request, intent);
            if (!current || current.token !== token) this.fail();
            if (
                JSON.stringify(this.admission(request, intent, true)) !==
                JSON.stringify(scope)
            )
                this.fail();
            this.acknowledge(
                await SERVICE.DefaultRuntimePropertyPersistenceService.store().update(
                    {
                        ...SERVICE.DefaultRuntimePropertyPersistenceService.persistenceOptions(),
                        tenant: scope.tenant,
                        authData: request.authData,
                        query: {
                            code: scope.code,
                            revision: intent.revision,
                            'propertyReadFence.token': token,
                            'propertyReadFence.operationCode':
                                intent.operationCode,
                        },
                        model: { propertyReadFence: null },
                    },
                ),
            );
            return { released: true, revision: intent.revision };
        } catch {
            this.fail();
        }
    },
};
