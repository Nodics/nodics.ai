/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module workflow/service/DefaultProcessRemoteActionInspectionService
 * @description Reads bounded instance or private attempt evidence for the verified target runtime; never claims or replays actions.
 * @layer service @owner workflow
 * @override Preserve target-module, tenant, enterprise and deployment binding and fail closed on incomplete storage acknowledgements.
 */
module.exports = {
    /** Rejects unsafe or unavailable execution evidence. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError(
            'ERR_PROCESS_00019',
            'Process action history is unavailable',
        );
    },
    /** Reads every recorded attempt, including superseded actions and older published versions, without execution authority. @param {Object} request Verified target context. @param {Object} input Validated filters. @param {Object} scope Verified runtime partition. @returns {Promise<Object>} Bounded attempt evidence. */
    attempts: async function (request, input, scope) {
        const [key, value] = Object.entries(input.contextMatch)[0];
        const query = {
            moduleName: input.moduleName,
            actionKey: input.actionKey,
            definitionCode: input.definitionCode,
            enterpriseCode: scope.enterpriseCode,
            projectCode: scope.projectCode,
            environmentCode: scope.environmentCode,
            ['context.' + key]: value,
            ...(input.version === null ? {} : { version: input.version }),
            ...(input.instanceCode === undefined ? {} : { instanceCode: input.instanceCode }),
        };
        const response =
            await SERVICE.DefaultProcessActionAttemptRecordService.get({
                tenant: request.tenant,
                authData: request.authData,
                options: { recursive: false },
                query,
                searchOptions: {
                    pageSize: 25,
                    pageNumber: input.page,
                    sort: { startedAt: -1, code: 1 },
                },
            });
        if (
            !SERVICE.DefaultProcessActionAttemptService.acknowledged(
                response,
            ) ||
            !Array.isArray(response.result) ||
            response.result.length > 25 ||
            !Number.isSafeInteger(response.count) ||
            response.count < response.result.length
        )
            this.fail();
        const items = response.result.map((row) => {
            if (
                row.moduleName !== input.moduleName ||
                (input.instanceCode !== undefined && row.instanceCode !== input.instanceCode) ||
                row.actionKey !== input.actionKey ||
                row.definitionCode !== input.definitionCode ||
                row.enterpriseCode !== scope.enterpriseCode ||
                row.projectCode !== scope.projectCode ||
                row.environmentCode !== scope.environmentCode ||
                row.context?.[key] !== value ||
                !Number.isSafeInteger(row.version) ||
                row.version < 1 ||
                (input.version !== null && row.version !== input.version) ||
                !['READY', 'CLAIMED', 'COMPLETED', 'FAILED'].includes(
                    row.status,
                ) ||
                !/^[a-f0-9-]{36}$/.test(row.code || '') ||
                !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(
                    row.instanceCode || '',
                ) ||
                !Number.isSafeInteger(row.expiresAt) ||
                row.expiresAt <= 0 ||
                typeof row.startedAt !== 'string' ||
                !Number.isFinite(Date.parse(row.startedAt)) ||
                (row.completedAt != null &&
                    (typeof row.completedAt !== 'string' ||
                        !Number.isFinite(Date.parse(row.completedAt)))) ||
                (['COMPLETED', 'FAILED'].includes(row.status) &&
                    !row.completedAt) ||
                Buffer.byteLength(JSON.stringify(row.context)) > 65536
            )
                this.fail();
            return {
                instanceCode: row.instanceCode,
                definitionCode: row.definitionCode,
                version: row.version,
                executionCode: row.code,
                status: row.status,
                startedAt: row.startedAt,
                completedAt: row.completedAt || null,
                expiresAt: row.expiresAt,
                context: structuredClone(row.context),
            };
        });
        if (
            new Set(items.map((item) => item.executionCode)).size !==
            items.length
        )
            this.fail();
        return {
            code: 'SUC_PROCESS_00000',
            data: {
                contractVersion: 2,
                evidence: 'PROCESS_ACTION_ATTEMPTS',
                scope,
                page: input.page,
                limit: 25,
                hasMore: response.count > input.page * 25,
                items,
            },
        };
    },
    /** Lists the latest remote action per matching instance, not an inferred complete action-event log. @param {Object} request Verified target runtime request. @returns {Promise<Object>} Bounded persisted evidence. */
    history: async function (request) {
        const input = request.runtimeOperation || {};
        const code = (value) =>
            typeof value === 'string' &&
            /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value);
        const fields = [
            'moduleName',
            'actionKey',
            'definitionCode',
            'version',
            'contextMatch',
            'page',
            'expectedScope',
            'historyMode',
            'instanceCode',
        ];
        if (
            Object.keys(input).some((key) => !fields.includes(key)) ||
            (input.instanceCode !== undefined &&
                (input.historyMode !== 'ATTEMPTS' || typeof input.instanceCode !== 'string' ||
                    !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(input.instanceCode))) ||
            !code(input.moduleName) ||
            !code(input.actionKey) ||
            !code(input.definitionCode) ||
            !input.actionKey.startsWith(input.moduleName + '.') ||
            (input.historyMode !== undefined &&
                input.historyMode !== 'ATTEMPTS') ||
            (!(input.historyMode === 'ATTEMPTS' && input.version === null) &&
                (!Number.isSafeInteger(input.version) || input.version < 1)) ||
            !Number.isSafeInteger(input.page) ||
            input.page < 1 ||
            input.page > 1000 ||
            !input.contextMatch ||
            Array.isArray(input.contextMatch) ||
            Object.keys(input.contextMatch).length !== 1
        )
            this.fail();
        const [key, value] = Object.entries(input.contextMatch)[0];
        if (
            !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key) ||
            ['constructor', 'prototype', '__proto__'].includes(key) ||
            typeof value !== 'string' ||
            !value ||
            value.length > 192
        )
            this.fail();
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
            request,
            input.moduleName,
        );
        const scope = {
            tenantCode: request.tenant,
            enterpriseCode: auth.entCode,
            projectCode: auth.runtimeScope.projectCode,
            environmentCode: auth.runtimeScope.environmentCode,
        };
        if (
            !input.expectedScope ||
            Object.keys(input.expectedScope).length !== 4 ||
            Object.entries(scope).some(
                ([name, expected]) =>
                    !expected || input.expectedScope[name] !== expected,
            )
        )
            this.fail();
        if (input.historyMode === 'ATTEMPTS')
            return this.attempts(request, input, scope);
        const query = {
            definitionCode: input.definitionCode,
            version: input.version,
            'activeRemoteAction.moduleName': input.moduleName,
            'activeRemoteAction.actionKey': input.actionKey,
            'activeRemoteAction.enterpriseCode': scope.enterpriseCode,
            'activeRemoteAction.runtimeScope.projectCode': scope.projectCode,
            'activeRemoteAction.runtimeScope.environmentCode':
                scope.environmentCode,
            ['activeRemoteAction.context.' + key]: value,
        };
        const response = await SERVICE.DefaultProcessInstanceService.get({
            tenant: request.tenant,
            authData: request.authData,
            options: { recursive: false },
            query,
            searchOptions: {
                pageSize: 25,
                pageNumber: input.page,
                sort: { startedAt: -1, code: 1 },
            },
        });
        if (
            !/^SUC_/.test(response?.code || '') ||
            response.error ||
            response.success === false ||
            (response.errors !== undefined &&
                (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) ||
            response.result.length > 25 ||
            !Number.isSafeInteger(response.count) ||
            response.count < response.result.length
        )
            this.fail();
        const items = response.result.map((instance) => {
            const active = instance.activeRemoteAction;
            if (
                !active ||
                instance.definitionCode !== input.definitionCode ||
                instance.version !== input.version ||
                active.moduleName !== input.moduleName ||
                active.actionKey !== input.actionKey ||
                active.enterpriseCode !== scope.enterpriseCode ||
                active.runtimeScope?.projectCode !== scope.projectCode ||
                active.runtimeScope?.environmentCode !==
                    scope.environmentCode ||
                active.context?.[key] !== value ||
                !['READY', 'CLAIMED', 'COMPLETED', 'FAILED'].includes(
                    active.status,
                ) ||
                typeof instance.code !== 'string' ||
                instance.code.length > 192 ||
                !/^[a-f0-9-]{36}$/.test(active.code || '') ||
                !Number.isFinite(Number(active.expiresAt)) ||
                Buffer.byteLength(JSON.stringify(active.context)) > 65536
            )
                this.fail();
            return {
                instanceCode: instance.code,
                definitionCode: instance.definitionCode,
                version: instance.version,
                executionCode: active.code,
                status: active.status,
                instanceStatus: instance.status,
                startedAt: instance.startedAt || null,
                completedAt: instance.completedAt || null,
                expiresAt: Number(active.expiresAt),
                context: active.context,
            };
        });
        if (
            new Set(items.map((item) => item.instanceCode)).size !==
                items.length ||
            new Set(items.map((item) => item.executionCode)).size !==
                items.length
        )
            this.fail();
        return {
            code: 'SUC_PROCESS_00000',
            data: {
                contractVersion: 1,
                evidence: 'PROCESS_INSTANCE_LATEST_ACTION',
                scope,
                page: input.page,
                limit: 25,
                hasMore: response.count > input.page * 25,
                items,
            },
        };
    },
};
