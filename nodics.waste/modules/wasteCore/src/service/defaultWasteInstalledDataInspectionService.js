/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');
// Owner defaults bound disclosure; effective configuration may only narrow it.
const resourceCeiling = Object.freeze({ ...require('../../config/properties').waste.installedDataInspection.resources });

/** @module wasteCore/service/defaultWasteInstalledDataInspectionService @description Provides bounded read-only installed evidence through generated owner repositories, without migration authority. @layer service @owner wasteCore @override Later layers may narrow resources or page size; preserve authorization and transaction redaction. */
module.exports = {
    /** Raises a sanitized domain error. */
    fail: function (code, message) {
        return SERVICE.DefaultWastePersistenceService.fail(code, message);
    },

    /** Serializes detached JSON deterministically, retaining every record field. */
    canonical: function (value) {
        if (Array.isArray(value)) return '[' + value.map((item) => this.canonical(item)).join(',') + ']';
        if (value && typeof value === 'object') {
            return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + this.canonical(value[key])).join(',') + '}';
        }
        return JSON.stringify(value);
    },

    /** Hashes complete detached records, including identity, revision and historical evidence. */
    checksum: function (value) {
        return crypto.createHash('sha256').update(this.canonical(value)).digest('hex');
    },

    /** Requires explicit tenant-wide inspection authority even for internal invocation. */
    authorize: function (request) {
        const auth = request.authData || {};
        const router = SERVICE.DefaultSecuredRequestPipelineService;
        if (auth.principalType !== 'human' || !auth.loginId || typeof auth.tenant !== 'string' || !auth.tenant.trim() ||
            !router || !router.getEffectiveUserGroupCodes(auth.userGroups || []).includes('adminGroup') ||
            !router.isPermissionGranted('waste.audit.read', router.getGrantedPermissions(request), {})) {
            this.fail('ERR_WASTE_INSPECTION_FORBIDDEN', 'Tenant-wide installed-data inspection authority is required');
        }
        return { authData: auth, tenant: auth.tenant };
    },

    /** Reads a single ordered page. It never installs, repairs, authorizes or marks a release CURRENT. */
    inspect: async function (request = {}) {
        const context = this.authorize(request);
        const payload = request.payload === undefined ? {} : request.payload;
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            this.fail('ERR_WASTE_INSPECTION_INVALID', 'Use an inspection request object');
        }
        const settings = (CONFIG.get('waste') || {}).installedDataInspection || {};
        const resource = payload.resource;
        const mode = settings.resources && Object.hasOwn(settings.resources, resource) && settings.resources[resource];
        const page = payload.page === undefined ? 1 : payload.page;
        const limit = settings.pageSize;
        if (Object.keys(payload).some((key) => !['resource', 'page', 'expectedPageChecksum'].includes(key)) ||
            typeof resource !== 'string' || !/^waste[A-Z][A-Za-z]+$/.test(resource) ||
            !['REFERENCE', 'FINGERPRINT'].includes(mode) ||
            !Object.hasOwn(resourceCeiling, resource) ||
            (resourceCeiling[resource] === 'FINGERPRINT' && mode !== 'FINGERPRINT') ||
            !Number.isSafeInteger(page) || page < 1 ||
            !Number.isSafeInteger(limit) || limit < 1 || limit > 500 ||
            !Number.isSafeInteger((page - 1) * limit) ||
            (payload.expectedPageChecksum !== undefined && (typeof payload.expectedPageChecksum !== 'string' || !/^[a-f0-9]{64}$/.test(payload.expectedPageChecksum)))) {
            this.fail('ERR_WASTE_INSPECTION_INVALID', 'Use one allowed resource and a bounded page; caller queries and tenant overrides are prohibited');
        }
        const result = await SERVICE.DefaultWastePersistenceService.page(resource, context, {}, page, limit, { code: 1 });
        const expectedLength = Math.min(limit, Math.max(0, result.total - (page - 1) * limit));
        const codes = result.items.map((record) => record.code);
        if (!Number.isSafeInteger(result.total) || result.total < 0 || result.items.length !== expectedLength ||
            codes.some((code) => typeof code !== 'string' || !code) || new Set(codes).size !== codes.length) {
            this.fail('ERR_WASTE_RUNTIME_UNAVAILABLE', 'Installed evidence is incomplete or ambiguously identified');
        }
        const items = result.items.map((record) => {
            const entry = { code: record.code, checksum: this.checksum(record) };
            if (mode === 'REFERENCE') entry.record = record;
            return entry;
        });
        const evidence = { tenant: context.tenant, resource, page, limit, total: result.total,
            items: items.map(({ code, checksum }) => ({ code, checksum })) };
        const pageChecksum = this.checksum(evidence);
        if (payload.expectedPageChecksum !== undefined && pageChecksum !== payload.expectedPageChecksum) {
            this.fail('ERR_WASTE_INSPECTION_CONFLICT', 'Installed evidence changed; requalify before any import');
        }
        return { resource, mode, page, limit, total: result.total, items, pageChecksum,
            nextPage: page * limit < result.total ? page + 1 : null, migrationAuthorized: false };
    },

    /** Rejects authored-field policy drift against a separately provenance-qualified historical record; this is not an import permit. */
    assertReferenceFields: function (installed, expected) {
        if (!installed || !expected || typeof expected.code !== 'string' || installed.code !== expected.code) {
            this.fail('ERR_WASTE_INSPECTION_CONFLICT', 'A required installed reference is missing or has another identity');
        }
        for (const key of Object.keys(expected)) {
            if (this.canonical(installed[key]) !== this.canonical(expected[key])) {
                this.fail('ERR_WASTE_INSPECTION_CONFLICT', 'Installed policy differs from the qualified historical reference');
            }
        }
        return true;
    }
};
