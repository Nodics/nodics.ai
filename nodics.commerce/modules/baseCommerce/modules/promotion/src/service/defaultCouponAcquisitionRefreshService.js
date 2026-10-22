/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual: same } = require('node:util');
/**
 * @module promotion/service/defaultCouponAcquisitionRefreshService
 * @description Inactive Cron-to-Promotion binding for exact-channel complete acquisition projections. No timer, grants or activation.
 * @owner promotion @layer service
 * @override Override defined refresh policy in owner properties; select channel and cadence in governed Cron records. Preserve original runtime authority and complete-source watermarks.
 */
module.exports = {
    /** Refuses invalid configuration, changed admission or uncertain transport without fabricating coverage. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_REPORT_UNCONFIRMED'); },
    /** Validates an integer against its owner-defined range; no local policy defaults. */
    integer: function (value, range) {
        return Number.isSafeInteger(range?.minimum) && range.minimum > 0 && Number.isSafeInteger(range.maximum) &&
            range.maximum >= range.minimum && Number.isSafeInteger(value) && value >= range.minimum && value <= range.maximum;
    },
    /** Returns validated complete owner policy; missing or invalid definitions fail even while disabled. */
    settings: function () {
        const policy = CONFIG.get('promotion')?.acquisitionReporting, p = policy?.refresh;
        if (!policy || typeof policy.enabled !== 'boolean' || !p || typeof p.enabled !== 'boolean' ||
            !['pageSize', 'maximumPages', 'minimumDistinctOwners', 'refreshIntervalSeconds', 'maximumProjectionBytes']
                .every(key => this.integer(policy[key], p.validation?.[key])) || policy.minimumDistinctOwners < 2 ||
            !this.integer(p.maximumCallers, p.validation.maximumCallers) || !Array.isArray(p.callers) || p.callers.length > p.maximumCallers ||
            p.startNode !== 'DefaultCouponAcquisitionRefreshService.run' ||
            p.target?.moduleName !== 'promotion' || p.target.apiName !== '/internal/acquisition-report/refresh' ||
            typeof p.target.connectionName !== 'string' || !p.target.connectionName || p.target.apiVersion !== 'v0' ||
            !same(p.target.targetAuthority, { runtimeRole: 'COMMERCE' }) ||
            !this.integer(p.target.timeoutMs, p.validation.timeoutMs) || p.target.maxAttempts !== 1) this.fail();
        const keys = ['tenant', 'principalEnterpriseCode', 'serviceId', 'projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'];
        if (p.callers.some(c => !c || Object.keys(c).length !== keys.length || keys.some(key => typeof c[key] !== 'string' || !c[key]))) this.fail();
        return policy;
    },
    /** Requires a selected original runtime assignment and existing analytics grants for the exact signed tenant. */
    authority: function (request) {
        const p = this.settings();
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'promotion');
        if (!p.enabled || !p.refresh.enabled || auth.principalType !== 'service' ||
            !auth.modules.includes('digitalCore') || !Array.isArray(auth.permissions) || !auth.permissions.includes('commerce.promotion.analytics') ||
            [request.enterpriseCode, request.entCode, auth.enterpriseCode].some(value => value !== undefined && value !== auth.entCode) ||
            !p.refresh.callers.some(c => c.tenant === request.tenant && c.principalEnterpriseCode === auth.entCode && c.serviceId === auth.serviceId &&
                ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].every(key => c[key] === auth.runtimeScope[key]))) this.fail();
        return structuredClone(auth);
    },
    /**
     * Executes one exact-channel refresh or returns the retained watermark when not due.
     * @param {Object} request Original authenticated owner request.
     * @param {{channelCode:string}} body Exact channel selection, with no authority or query overrides.
     * @returns {Promise<Object>} Complete or not-due coverage only; never attribution rows.
     * @throws {CLASSES.NodicsError} On invalid admission, policy drift or incomplete source. Failed writes preserve the prior projection.
     */
    refresh: async function (request, body) {
        const p = structuredClone(this.settings()), auth = this.authority(request), selection = structuredClone(body);
        if (!body || Object.keys(body).length !== 1 || !Object.hasOwn(body, 'channelCode')) this.fail();
        SERVICE.DefaultCouponOfferService.identifier(body.channelCode);
        const r = { tenant: request.tenant, authData: auth, channelCode: body.channelCode };
        const bound = () => {
            if (!same(p, this.settings()) || !same(auth, this.authority(request)) || !same(selection, body) || request.tenant !== r.tenant) this.fail();
        };
        const reporting = SERVICE.DefaultCouponAcquisitionReportingService;
        const current = await SERVICE.DefaultCouponAcquisitionPersistenceService.read('couponAcquisitionProjection', r, reporting.code(r));
        bound();
        if (current) {
            const refreshed = Date.parse(current.evidence?.refreshedAt), coverage = Date.parse(current.evidence?.coverageThrough), now = Date.now();
            if (!Number.isFinite(refreshed) || !Number.isFinite(coverage) || refreshed > now || coverage > refreshed) this.fail();
            if ((now - refreshed) / 1000 < p.refreshIntervalSeconds)
                return { contractVersion: 1, status: 'NOT_DUE', channelCode: r.channelCode,
                    dataUpdatedThrough: current.evidence.coverageThrough, timezone: 'UTC' };
        }
        const result = await reporting.refresh(r);
        bound();
        return { contractVersion: 1, status: 'COMPLETE', channelCode: r.channelCode, ...result };
    },
    /**
     * Existing Cron start-node entry; forwards only the original operational credential and persisted channel selection.
     * @param {{definition:Object,authData:Object}} input Cron-owned job definition and freshly admitted principal.
     * @returns {Promise<Object>} Confirmed owner coverage response, without source events.
     * @throws {CLASSES.NodicsError} On disabled binding, changed definition/principal/token/policy or uncertain response; next invocation rechecks retained coverage.
     */
    run: async function (input) {
        const p = structuredClone(this.settings()), definition = structuredClone(input.definition), tenant = definition?.tenant;
        if (!p.enabled || !p.refresh.enabled || definition?.jobDetail?.startNode !== p.refresh.startNode ||
            Object.keys(definition.jobDetail).some(key => !['startNode', 'channelCode'].includes(key))) this.fail();
        SERVICE.DefaultCouponOfferService.identifier(tenant);
        SERVICE.DefaultCouponOfferService.identifier(definition.jobDetail.channelCode);
        const auth = structuredClone(await SERVICE.DefaultCronJobService.assertOperational(tenant));
        const token = NODICS.getInternalAuthToken(tenant);
        const bound = async () => {
            if (typeof token !== 'string' || !token || token !== NODICS.getInternalAuthToken(tenant) ||
                !same(p, this.settings()) || !same(definition, input.definition) || !same(auth, input.authData) ||
                !same(auth, await SERVICE.DefaultCronJobService.assertOperational(tenant))) this.fail();
        };
        await bound();
        const target = p.refresh.target;
        const response = await SERVICE.DefaultModuleService.invokeModule({ moduleName: target.moduleName,
            connectionName: target.connectionName, targetAuthority: target.targetAuthority, apiVersion: target.apiVersion,
            apiName: target.apiName, timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts,
            tenant, request: { tenant }, local: false, methodName: 'POST',
            header: { Authorization: 'Bearer ' + token, tenant }, requestBody: { channelCode: definition.jobDetail.channelCode },
            followRedirects: false, rejectUnauthorized: true });
        await bound();
        if (!response || response.error || response.success === false || response.acknowledged === false ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
            response.code && !/^SUC_/.test(response.code)) this.fail();
        const result = response.data;
        if (result?.contractVersion !== 1 || !['COMPLETE', 'NOT_DUE'].includes(result.status) || result.channelCode !== definition.jobDetail.channelCode ||
            result.timezone !== 'UTC' || typeof result.dataUpdatedThrough !== 'string' ||
            !Number.isFinite(Date.parse(result.dataUpdatedThrough)) || Date.parse(result.dataUpdatedThrough) > Date.now() ||
            new Date(result.dataUpdatedThrough).toISOString() !== result.dataUpdatedThrough ||
            Object.keys(result).some(key => !['contractVersion', 'status', 'channelCode', 'dataUpdatedThrough', 'timezone'].includes(key))) this.fail();
        return result;
    },
};
