/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotProvider/service/DefaultCopilotReconciliationService @description Captures private provider measurements and reconciles only scoped evidence-backed calls with atomic audit. @layer service @owner copilotProvider @override Preserve original call binding, trusted evidence, independent grants and no ambiguous-write retry. */
module.exports = {
    /** Resolves accounting authority. @returns {Object} Usage owner. */
    owner: function () {
        return SERVICE.DefaultCopilotUsageService;
    },
    /** Tests current resolved grants. @param {Object} request Trusted request. @param {string} grant Permission. @returns {boolean} Authorized. */
    permitted: function (request, grant) {
        const permissions = (request.authData || {}).permissions;
        return (
            Array.isArray(permissions) &&
            (permissions.includes('*') || permissions.includes(grant))
        );
    },
    /** Requires private generated evidence persistence. @returns {Object} Generated service. */
    storage: function () {
        const service = SERVICE.DefaultCopilotUsageReceiptService;
        if (
            !service ||
            typeof service.get !== 'function' ||
            typeof service.save !== 'function'
        )
            this.owner().reject('ERR_CPP_00001');
        return service;
    },
    /** Hashes canonical inert evidence. @param {Object} value Evidence. @returns {string} Digest. */
    digest: function (value) {
        return require('node:crypto')
            .createHash('sha256')
            .update(JSON.stringify(value))
            .digest('hex');
    },
    /** Builds immutable receipt identity. @param {Object} scope Original scope. @param {Object} period Original period. @param {string} callId Call identity. @returns {string} Key. */
    key: function (scope, period, callId) {
        return (
            'receipt-' +
            this.digest([
                scope.tenantCode,
                scope.enterpriseCode,
                scope.principalCode,
                period.key,
                callId,
            ])
        );
    },
    /** Captures only normalized measured counters, before settlement. Never exposed as an employee write API. @param {Object} handle Reservation. @param {Object} usage Provider measurement. @param {Object} request Original trusted request. @returns {Promise<void>} Acknowledged capture. */
    capture: async function (handle, usage, request) {
        const owner = this.owner(),
            scope = owner.scope(request);
        if (JSON.stringify(scope) !== JSON.stringify(handle.scope))
            owner.reject('ERR_CPP_00002');
        if (
            !owner.identifier(handle.callId) ||
            !owner.identifier(handle.period.key) ||
            usage.state !== 'MEASURED' ||
            !['inputTokens', 'outputTokens', 'totalTokens'].every((key) =>
                owner.count(usage[key]),
            )
        )
            owner.reject('ERR_CPP_00005');
        const measurement = {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
        };
        const data = {
            ...scope,
            periodKey: handle.period.key,
            callId: handle.callId,
            measurement,
        };
        const code = this.key(scope, handle.period, handle.callId),
            digest = this.digest(data);
        const response = await this.storage().save({
            tenant: scope.tenantCode,
            authData: request.authData,
            options: { insertOnly: true },
            model: {
                code,
                active: true,
                ...data,
                digest,
                measuredAt: new Date().toISOString(),
            },
        });
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            !response.result ||
            response.result.code !== code ||
            response.result.digest !== digest
        )
            owner.reject('ERR_CPP_00001');
    },
    /** Reads exact evidence and rejects foreign or malformed records. @param {Object} request Trusted reader. @param {Object} scope Original call scope. @param {Object} period Original period. @param {string} callId Call. @returns {Promise<Object|null>} Validated inert receipt. */
    receipt: async function (request, scope, period, callId) {
        const owner = this.owner(),
            code = this.key(scope, period, callId);
        const response = await this.storage().get({
            tenant: scope.tenantCode,
            authData: request.authData,
            query: { code, ...scope, periodKey: period.key, callId },
            searchOptions: { pageNumber: 1, pageSize: 2 },
        });
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            !Array.isArray(response.result) ||
            response.result.length > 1
        )
            owner.reject('ERR_CPP_00001');
        if (!response.result.length) return null;
        const row = response.result[0],
            measurement = row.measurement;
        if (
            row.code !== code ||
            Object.keys(scope).some((key) => row[key] !== scope[key]) ||
            row.periodKey !== period.key ||
            row.callId !== callId ||
            !measurement ||
            !['inputTokens', 'outputTokens', 'totalTokens'].every((key) =>
                owner.count(measurement[key]),
            ) ||
            !Number.isFinite(Date.parse(row.measuredAt))
        )
            owner.reject('ERR_CPP_00001');
        const data = {
            ...scope,
            periodKey: period.key,
            callId,
            measurement: {
                inputTokens: measurement.inputTokens,
                outputTokens: measurement.outputTokens,
                totalTokens: measurement.totalTokens,
            },
        };
        if (row.digest !== this.digest(data)) owner.reject('ERR_CPP_00001');
        return {
            digest: row.digest,
            totalTokens: measurement.totalTokens,
            measuredAt: new Date(row.measuredAt).toISOString(),
        };
    },
    /** Resolves a bounded period/call without broad scans, then enforces personal or enterprise read. @param {Object} request Trusted request. @param {Object} policy Effective policy. @returns {Promise<Object>} Private authorized context. */
    context: async function (request, policy) {
        const owner = this.owner(),
            scope = owner.scope(request);
        if (!this.permitted(request, 'copilot.assistant.read'))
            owner.reject('ERR_CPP_00002');
        const query = request.query || {};
        if (
            !owner.identifier(query.callId) ||
            !owner.identifier(query.periodKey)
        )
            owner.reject('ERR_CPP_00005');
        owner.validate(policy);
        const period = { key: query.periodKey };
        const current = await owner.read(request, scope, period);
        const entry =
            current &&
            current.journal.items.find(
                (item) =>
                    item.callId === query.callId &&
                    item.enterpriseCode === scope.enterpriseCode &&
                    (item.principalCode === scope.principalCode ||
                        this.permitted(request, 'copilot.usage.read')),
            );
        if (!entry) owner.reject('ERR_CPP_00002');
        return { owner, scope, period, current, entry };
    },
    /** Projects call metadata and available evidence, never transcript content. @param {Object} request Trusted reader. @param {Object} policy Effective policy. @returns {Promise<Object>} Detail. */
    detail: async function (request, policy) {
        const { scope, period, entry } = await this.context(request, policy);
        const enabled = !!(
            policy.reconciliation && policy.reconciliation.enabled === true
        );
        const evidence = enabled
            ? await this.receipt(
                  request,
                  { ...scope, principalCode: entry.principalCode },
                  period,
                  entry.callId,
              )
            : null;
        return {
            contractVersion: 1,
            context: scope,
            periodKey: period.key,
            presentation: { ...policy.presentation },
            item: {
                callId: entry.callId,
                principalCode: entry.principalCode,
                adapter: entry.adapter,
                profile: entry.profile,
                model: entry.model,
                purpose: entry.purpose,
                state: entry.state,
                consumed: entry.state === 'MEASURED' ? entry.totalTokens : null,
                reserved: entry.state === 'MEASURED' ? 0 : entry.reservation,
                createdAt: entry.createdAt,
                completedAt: entry.completedAt || null,
            },
            evidence,
            canReconcile:
                enabled &&
                !!evidence &&
                entry.state !== 'MEASURED' &&
                this.permitted(request, 'copilot.usage.read') &&
                this.permitted(request, 'copilot.usage.reconcile'),
            reconciliation: entry.reconciliation
                ? {
                      changeId: entry.reconciliation.changeId,
                      actor: entry.reconciliation.actor,
                      reason: entry.reconciliation.reason,
                      evidenceDigest: entry.reconciliation.evidenceDigest,
                      beforeState: entry.reconciliation.beforeState,
                      beforeReservation: entry.reconciliation.beforeReservation,
                      measured: entry.reconciliation.measured,
                      createdAt: entry.reconciliation.createdAt,
                  }
                : null,
        };
    },
    /** Validates strict commands and independent reconciliation grants before storage. @param {Object} request Trusted command. @returns {Object} Inert command. */
    command: function (request) {
        const owner = this.owner(),
            body = request.body || {};
        if (
            !this.permitted(request, 'copilot.assistant.read') ||
            !this.permitted(request, 'copilot.usage.read') ||
            !this.permitted(request, 'copilot.usage.reconcile')
        )
            owner.reject('ERR_CPP_00002');
        if (
            Object.keys(body).some(
                (key) =>
                    ![
                        'periodKey',
                        'callId',
                        'evidenceDigest',
                        'changeId',
                        'reason',
                        'confirmed',
                    ].includes(key),
            ) ||
            !['periodKey', 'callId', 'changeId'].every((key) =>
                owner.identifier(body[key]),
            ) ||
            typeof body.evidenceDigest !== 'string' ||
            !/^[a-f0-9]{64}$/.test(body.evidenceDigest) ||
            typeof body.reason !== 'string' ||
            !body.reason.trim() ||
            body.reason.length > 500
        )
            owner.reject('ERR_CPP_00005');
        return {
            periodKey: body.periodKey,
            callId: body.callId,
            evidenceDigest: body.evidenceDigest,
            changeId: body.changeId,
            reason: body.reason.trim(),
        };
    },
    /** Previews verified measurement only. @param {Object} request Trusted command. @param {Object} policy Policy. @returns {Promise<Object>} Read-only impact. */
    preview: async function (request, policy) {
        const command = this.command(request),
            detail = await this.detail({ ...request, query: command }, policy);
        if (
            !detail.canReconcile ||
            detail.evidence.digest !== command.evidenceDigest
        )
            this.owner().reject('ERR_CPP_00006');
        return {
            contractVersion: 1,
            context: detail.context,
            command,
            reserved: detail.item.reserved,
            measured: detail.evidence.totalTokens,
        };
    },
    /** Applies verified measurement and audit in one journal CAS; never repeats a provider call. @param {Object} request Confirmed command. @param {Object} policy Policy. @returns {Promise<Object>} Acknowledged detail. */
    reconcile: async function (request, policy) {
        const command = this.command(request),
            owner = this.owner();
        owner.validate(policy);
        if (
            request.body.confirmed !== true ||
            !policy.reconciliation ||
            policy.reconciliation.enabled !== true
        )
            owner.reject('ERR_CPP_00005');
        const scopedRequest = { ...request, query: command };
        for (let attempt = 0; attempt < policy.maximumAttempts; attempt++) {
            const { scope, period, current, entry } = await this.context(
                scopedRequest,
                policy,
            );
            const fingerprint = this.digest({ scope, command });
            if (entry.reconciliation) {
                if (entry.reconciliation.commandDigest !== fingerprint)
                    owner.reject('ERR_CPP_00006');
                return this.detail(scopedRequest, policy);
            }
            if (entry.state === 'MEASURED') owner.reject('ERR_CPP_00006');
            const evidence = await this.receipt(
                request,
                { ...scope, principalCode: entry.principalCode },
                period,
                entry.callId,
            );
            if (!evidence || evidence.digest !== command.evidenceDigest)
                owner.reject('ERR_CPP_00006');
            const now = new Date().toISOString();
            const reconciliation = {
                changeId: command.changeId,
                actor: scope.principalCode,
                reason: command.reason,
                evidenceDigest: evidence.digest,
                commandDigest: fingerprint,
                beforeState: entry.state,
                beforeReservation: entry.reservation,
                measured: evidence.totalTokens,
                createdAt: now,
            };
            const next = {
                ...entry,
                state: 'MEASURED',
                totalTokens: evidence.totalTokens,
                completedAt: now,
                reconciliation,
            };
            if (
                await owner.write(
                    current,
                    {
                        ...current.journal,
                        items: current.journal.items.map((item) =>
                            item.callId === entry.callId ? next : item,
                        ),
                    },
                    request,
                    scope,
                    period,
                )
            )
                return this.detail(scopedRequest, policy);
        }
        return owner.reject('ERR_CPP_00001');
    },
};
