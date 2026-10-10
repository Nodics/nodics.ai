/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/publication/DefaultMediaPublicationModuleTransportService
 * @description Sends Media publication packages to authenticated independently bound Online Media routes through nService.
 * @layer service
 * @owner media
 * @override Configure connection placement only; preserve scoped internal authentication and fixed route ownership.
 */
module.exports = {
    /** Invokes an allowlisted target operation without forwarding caller-controlled authority or credentials. */
    send: async function (operation, input, request) {
        const owner = SERVICE.DefaultMediaRetainedPublicationService;
        const authorizing = operation === 'authorize';
        owner.assertScope(request, authorizing ? 'ONLINE' : 'STAGED');
        const target = owner.policy()[authorizing ? 'source' : 'target'] || {};
        const paths = { deploy: 'deploy', getStatus: 'status', rollback: 'rollback', reconcile: 'reconcile', authorize: 'authorize-target' };
        if (!paths[operation] || !target.connectionName || target.connectionName === 'default' || !target.connectionType) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'An explicit Media transport connection is required');
        }
        const token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Media transport requires its scoped runtime token');
        const result = await SERVICE.DefaultModuleService.invokeModule({ moduleName: 'media', local: false,
            connectionName: target.connectionName, connectionType: target.connectionType,
            targetAuthority: { runtimeRole: authorizing ? 'WCMS_STAGED' : 'WCMS_ONLINE' }, tenant: request.tenant,
            methodName: 'POST', apiName: (authorizing ? '/publication/' : '/publication/target/') + paths[operation],
            header: { Authorization: 'Bearer ' + token, tenant: request.tenant },
            requestBody: input, timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            idempotencyKey: input.operationKey,
            responseSelector: response => response && response.result
        });
        return this.validateResult(operation, input, result);
    },
    /** Requires exact target evidence; an empty success envelope never completes activation or rollback. */
    validateResult: function (operation, input, result) {
        let valid = false;
        if (operation === 'authorize') {
            valid = !!result && result.authorized === true && result.fingerprint === SERVICE.DefaultMediaRetainedPublicationService.digest(input);
        } else if (operation === 'getStatus') {
            const validStatus = value => value === null || !!value && /^[a-f0-9]{64}$/.test(value.version || '') &&
                Number.isSafeInteger(value.revision) && value.revision > 0;
            valid = input.mediaCodes !== undefined
                ? Array.isArray(input.mediaCodes) && !!result && Array.isArray(result.statuses) &&
                    result.statuses.length === input.mediaCodes.length && result.statuses.every((item, index) =>
                        item && item.mediaCode === input.mediaCodes[index] && validStatus(item.status))
                : validStatus(result);
        } else if (operation === 'reconcile' && input.operationKey) {
            valid = !!result && ['ACTIVE', 'NOT_COMMITTED', 'CONFLICT'].includes(result.status) &&
                result.operationKey === input.operationKey && result.publicationCode === input.publicationCode &&
                result.manifestCode === input.manifestCode && result.mediaCode === input.mediaCode && result.repaired === false;
            if (valid && result.status === 'ACTIVE') {
                const receipt = result.receipt;
                valid = !!receipt && result.version === input.manifestCode && receipt.operationKey === input.operationKey &&
                    receipt.publicationCode === input.publicationCode && receipt.sourceVersion === input.manifestCode &&
                    receipt.targetVersion === input.manifestCode && receipt.previousOnlineVersion === input.expectedVersion;
            }
        } else if (operation === 'reconcile') {
            const validIntegrity = (item, expected) => !!item && item.manifestCode === expected.manifestCode && item.mediaCode === expected.mediaCode &&
                typeof item.intact === 'boolean' && typeof item.active === 'boolean' &&
                item.protected === true && item.deleted === false && item.repaired === false;
            valid = input.assets !== undefined
                ? Array.isArray(input.assets) && !!result && Array.isArray(result.results) &&
                    result.results.length === input.assets.length && result.results.every((item, index) => validIntegrity(item, input.assets[index]))
                : validIntegrity(result, input);
        } else if (operation === 'deploy' && input.prepareOnly === true) {
            valid = !!result && result.version === input.manifest.code && result.prepared === true && result.active === false;
        } else {
            const version = operation === 'deploy' ? input.manifest && input.manifest.code : input.manifestCode;
            const receipt = result && result.receipt;
            valid = !!result && !!receipt && /^[a-f0-9]{64}$/.test(version || '') && result.version === version &&
                receipt.operationKey === input.operationKey && receipt.publicationCode === input.publicationCode &&
                receipt.sourceVersion === version && receipt.targetVersion === version &&
                receipt.previousOnlineVersion === input.expectedVersion;
        }
        if (!valid) throw new CLASSES.NodicsError('ERR_MED_00022', 'Media target response was not acknowledged');
        return result;
    },
    /** Prepares or deploys an exact package through the target route. */
    deploy: function (input, request) { return this.send('deploy', input, request); },
    /** Asks the independently bound Staged authority to verify stored publication intent. */
    authorize: function (input, request) { return this.send('authorize', input, request); },
    /** Reads active target version evidence. */
    getStatus: function (input, request) { return this.send('getStatus', input, request); },
    /** Reads bounded pointer evidence through the same authenticated read-only target route. */
    getStatuses: function (input, request) { return this.send('getStatus', input, request); },
    /** Restores an exact retained target manifest. */
    rollback: function (input, request) { return this.send('rollback', input, request); },
    /** Checks target manifest integrity without pointer repair or deletion. */
    reconcile: function (input, request) { return this.send('reconcile', input, request); },
    /** Checks a bounded exact-version selection through the same read-only integrity route. */
    reconcileVersions: function (input, request) { return this.send('reconcile', input, request); }
};
