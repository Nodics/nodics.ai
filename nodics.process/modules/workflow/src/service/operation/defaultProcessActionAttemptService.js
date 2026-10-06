/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module workflow/service/DefaultProcessActionAttemptService
 * @description Maintains private per-execution evidence independently of an instance's latest action. The instance CAS remains the sole execution authority.
 * @layer service @owner workflow
 * @override Preserve exact acknowledgements, scoped identity and uncertain-outcome handling; this projection never grants replay.
 */
module.exports = {
    /** Rejects unavailable durable evidence. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError(
            'ERR_PROCESS_00019',
            'Process attempt evidence is unavailable',
        );
    },
    /** Requires an unambiguous generated-service envelope. @param {Object} response Persistence result. @returns {boolean} Whether acknowledged. */
    acknowledged: function (response) {
        return (
            /^SUC_/.test(response?.code || '') &&
            [response, response.result].every(
                (value) =>
                    !value ||
                    (!value.error &&
                        value.success !== false &&
                        value.acknowledged !== false &&
                        (value.errors === undefined ||
                            (Array.isArray(value.errors) &&
                                !value.errors.length))),
            )
        );
    },
    /** Records a newly claimed instance action before dispatch; no create fallback or retry. @param {Object} request Trusted Process context. @param {Object} instance Current instance. @param {Object} active Exact persisted handle. @returns {Promise<void>} Acknowledged evidence. */
    begin: async function (request, instance, active) {
        const model = {
            code: active.code,
            instanceCode: instance.code,
            definitionCode: instance.definitionCode,
            version: instance.version,
            moduleName: active.moduleName,
            actionKey: active.actionKey,
            enterpriseCode: active.enterpriseCode,
            projectCode: active.runtimeScope.projectCode,
            environmentCode: active.runtimeScope.environmentCode,
            context: structuredClone(active.context),
            status: 'READY',
            expiresAt: active.expiresAt,
            startedAt: new Date().toISOString(),
        };
        if (Buffer.byteLength(JSON.stringify(model.context)) > 65536)
            this.fail();
        const response =
            await SERVICE.DefaultProcessActionAttemptRecordService.save({
                tenant: request.tenant,
                authData: request.authData,
                model,
                options: { insertOnly: true },
            });
        if (
            !this.acknowledged(response) ||
            !response.result ||
            Object.entries(model).some(([key, value]) =>
                key === 'context'
                    ? !require('node:util').isDeepStrictEqual(
                          response.result[key],
                          value,
                      )
                    : response.result[key] !== value,
            )
        )
            this.fail();
    },
    /** Advances evidence only after its authoritative instance transition. A lost acknowledgement remains uncertain. @param {Object} request Trusted context. @param {Object} active Exact handle. @param {string[]} from Allowed prior evidence. @param {string} status Observed state. @returns {Promise<void>} Acknowledged evidence. */
    advance: async function (request, active, from, status) {
        const response =
            await SERVICE.DefaultProcessActionAttemptRecordService.update({
                tenant: request.tenant,
                authData: request.authData,
                query: {
                    code: active.code,
                    moduleName: active.moduleName,
                    enterpriseCode: active.enterpriseCode,
                    projectCode: active.runtimeScope.projectCode,
                    environmentCode: active.runtimeScope.environmentCode,
                    status: { $in: from },
                },
                model: {
                    $set: {
                        status,
                        ...(status === 'COMPLETED' || status === 'FAILED'
                            ? { completedAt: new Date().toISOString() }
                            : {}),
                    },
                },
            });
        if (
            !this.acknowledged(response) ||
            SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(
                response,
            ) !== 1
        )
            this.fail();
    },
};
