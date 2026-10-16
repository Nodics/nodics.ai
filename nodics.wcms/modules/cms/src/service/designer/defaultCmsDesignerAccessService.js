/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the repository LICENSE. */

/**
 * @module cms/service/designer/DefaultCmsDesignerAccessService
 * @description Admits explicit CMS authoring permissions and pins existing Site/Catalog enterprise ownership.
 * @owner cms
 * @layer service
 * @override Extend CMS-owned scope checks without granting human principals generic persistence authority.
 */
const _ = require('lodash');
const admissionKey = Symbol('cmsDesignerAdmission');
const catalogOwned = new Set(['DefaultCmsComponentService', 'DefaultCmsComponentLocalizationService',
    'DefaultCmsComponentMediaService', 'DefaultCmsPageTemplateService', 'DefaultCmsTypeCodeService',
    'DefaultCmsTypeCode2RendererService', 'DefaultCmsSlotDefinitionService', 'DefaultCmsComponentTypeGroupService']);
module.exports = {
    /** Rejects unavailable authority without revealing foreign content. */
    deny: function () {
        throw new CLASSES.NodicsError('ERR_AUTH_00003', 'CMS authoring permission or Site scope is unavailable');
    },

    /** Bounds claim structure before the shared security owner walks hydrated permissions or ancestry. */
    validGroups: function (groups) {
        const ancestors = new Set();
        let remaining = 1024;
        const visit = (items, depth) => Array.isArray(items) && items.length <= remaining && depth < 64 &&
            Array.from(items).every(group => {
                if (--remaining < 0) return false;
                if (typeof group === 'string') return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(group);
                if (!_.isPlainObject(group) || ancestors.has(group) ||
                    Object.values(Object.getOwnPropertyDescriptors(group)).some(descriptor => !Object.hasOwn(descriptor, 'value')) ||
                    typeof group.code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(group.code) ||
                    group.active !== undefined && typeof group.active !== 'boolean' ||
                    group.permissions !== undefined && !this.validPermissions(group.permissions)) return false;
                ancestors.add(group);
                const valid = group.parentGroups === undefined || visit(group.parentGroups, depth + 1);
                ancestors.delete(group);
                return valid;
            });
        return visit(groups, 0);
    },

    /** Rejects malformed or excessive permission lists, without deriving any new authority. */
    validPermissions: function (permissions) {
        return Array.isArray(permissions) && permissions.length <= 1024 && Array.from(permissions)
            .every(permission => typeof permission === 'string' && permission.length <= 256 && permission.trim().length > 0);
    },

    /** Validates original employee claims and one explicit owner permission, including service-direct calls. */
    authorize: function (request, permission) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const enterpriseCode = auth.enterpriseCode || auth.entCode;
        const validCode = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
        if (auth.principalType !== 'human' || auth.tokenType !== 'access' || !auth.loginId ||
            auth.isSystem || auth.runtimeScope || (auth.type !== undefined && auth.type !== 'Employee') ||
            !validCode(auth.tenant) || !validCode(enterpriseCode) || request.tenant !== auth.tenant ||
            typeof auth.loginId !== 'string' || auth.loginId.length > 256 || !auth.loginId.trim() ||
            !/^Bearer \S+$/i.test(request.authorization || '') ||
            !this.validGroups(auth.userGroups) || auth.groups !== undefined && !this.validGroups(auth.groups) ||
            ['permissions', 'userGroupPermissions', 'actionPermissions', 'authorities', 'scopes'].some(key =>
                auth[key] !== undefined && !this.validPermissions(auth[key])) ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
            [auth.entCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
            !security?.getGrantedPermissions || !security?.isPermissionGranted || !security?.getEffectiveUserGroupCodes ||
            !(security.getEffectiveUserGroupCodes(auth.userGroups).includes('employeeUserGroup') ||
                security.hasPlatformFullAccess?.(request) === true) ||
            !security.isPermissionGranted(permission, security.getGrantedPermissions(request), {})) this.deny();
        if (permission !== 'cms.backoffice.view' && CONFIG.get('runtimeRole')?.publication !== 'STAGED') this.deny();
        for (const input of [request.cmsDesigner, request.body].filter(Boolean)) {
            if (['tenant', 'tenantCode', 'enterpriseCode', 'entCode'].some(key => input[key] !== undefined &&
                input[key] !== (key.startsWith('tenant') ? request.tenant : enterpriseCode))) this.deny();
        }
        let admitted = request[admissionKey];
        if (!admitted) {
            admitted = { original: request, identity: this.identity(request),
                originalScope: this.inputScope(request), originalAliases: this.inputAliases(request), permissions: new Set() };
            request[admissionKey] = admitted;
        }
        if (!_.isEqual(admitted.identity, this.identity(request)) ||
            !_.isEqual(admitted.identity, this.identity(admitted.original)) ||
            !_.isEqual(admitted.originalScope, this.inputScope(admitted.original)) ||
            !_.isEqual(admitted.originalAliases, this.inputAliases(admitted.original)) ||
            admitted.scope && !_.isEqual(admitted.scope, this.inputScope(request))) this.deny();
        admitted.permissions.add(permission);
        for (const required of admitted.permissions) {
            if (!security.isPermissionGranted(required, security.getGrantedPermissions(request), {}) ||
                required !== 'cms.backoffice.view' && CONFIG.get('runtimeRole')?.publication !== 'STAGED') this.deny();
        }
        return { enterpriseCode, tenant: request.tenant };
    },

    /** Takes an independent identity snapshot; nested owner calls retain the original admission symbol. */
    identity: function (request) {
        return _.cloneDeep(_.pick(request, ['authData', 'authorization', 'tenant', 'tenantCode', 'enterpriseCode', 'entCode']));
    },

    /** Extracts only the owner-command Site/Catalog selection, not mutable composition content. */
    inputScope: function (request) {
        const input = request.cmsDesigner || request.body || {};
        if (input.siteCode && input.site && input.siteCode !== input.site) this.deny();
        return { siteCode: input.siteCode || input.site, catalogCode: input.catalogCode };
    },

    /** Pins supplied scope aliases on the original command even when nested commands normalize their own body. */
    inputAliases: function (request) {
        return [request.body, request.cmsDesigner].map(input => _.pick(input || {}, ['tenant', 'tenantCode', 'enterpriseCode', 'entCode']));
    },

    /** Verifies the returned provider query and every row against the exact bounded owner lookup. */
    queryMatches: function (row, query) {
        return _.isPlainObject(row) && Object.entries(query).every(([key, expected]) => {
            const actual = _.get(row, key);
            return _.isPlainObject(expected) && Object.keys(expected).length === 1 && Array.isArray(expected.$in)
                ? expected.$in.some(value => _.isEqual(value, actual)) : _.isEqual(actual, expected);
        });
    },

    /** Reads bounded generated records with the original employee; CMS schema ACL permits reads, never writes. */
    records: async function (serviceName, request, query) {
        const context = this.authorize(request, 'cms.backoffice.view');
        const service = SERVICE[serviceName];
        if (!service?.get) this.deny();
        const expected = _.cloneDeep(query);
        const read = { tenant: context.tenant, authData: _.cloneDeep(request.authData),
            query: _.cloneDeep(query), options: { recursive: false, skipItemCache: true },
            searchOptions: { limit: 101, sort: { versionId: -1 } } };
        const response = await service.get(read);
        this.authorize(request, 'cms.backoffice.view');
        // Generated services select a tenant-bound model; their success envelope has no tenant field.
        if (read.tenant !== context.tenant || read.schemaModel?.tenant !== context.tenant ||
            !_.isEqual(read.authData, request.authData) || !_.isEqual(read.query, expected) ||
            !_.isPlainObject(response) || response.code !== 'SUC_FIND_00000' || response.error ||
            response.success !== undefined && response.success !== true ||
            response.acknowledged !== undefined && response.acknowledged !== true ||
            response.errors !== undefined && response.errors !== null &&
                (!Array.isArray(response.errors) || response.errors.length > 0) ||
            !_.isEqual(response.query, expected) || !Array.isArray(response.result) ||
            !Number.isSafeInteger(response.count) || response.count < 0 || response.count > 100 ||
            response.result.length !== response.count ||
            response.total !== undefined && response.total !== response.count ||
            [response, ...response.result].some(row => !row ||
                ['tenant', 'tenantCode'].some(key => row[key] !== undefined && row[key] !== context.tenant)) ||
            response.result.some(row => !this.queryMatches(row, expected))) this.deny();
        return response.result;
    },

    /** Requires one persisted owner record and rejects contradictory save acknowledgements, never retrying the write. */
    savedRecord: function (response) {
        if (!_.isPlainObject(response) || response.error ||
            response.code !== undefined && response.code !== 'SUC_SAVE_00000' ||
            response.success !== undefined && response.success !== true ||
            response.acknowledged !== undefined && response.acknowledged !== true ||
            response.errors !== undefined && response.errors !== null &&
                (!Array.isArray(response.errors) || response.errors.length > 0)) this.deny();
        const records = Array.isArray(response.result) ? response.result : [response.result];
        if (records.length !== 1 || !_.isPlainObject(records[0])) this.deny();
        return records[0];
    },

    /** Resolves an explicitly enterprise-bound Site and refuses shared/foreign Catalog ownership. */
    scope: async function (request, permission) {
        const context = this.authorize(request, permission), input = request.cmsDesigner || request.body || {};
        const siteCode = input.siteCode || input.site, catalogCode = input.catalogCode;
        if (![siteCode, catalogCode].every(value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value))) this.deny();
        request[admissionKey].scope = { siteCode, catalogCode };
        const sites = await this.records('DefaultCmsSiteService', request, { code: siteCode, active: true });
        if (!sites.length || sites.some(site => site.code !== siteCode || site.enterpriseCode !== context.enterpriseCode ||
            site.catalog !== catalogCode)) this.deny();
        const catalogueSites = await this.records('DefaultCmsSiteService', request, { catalog: catalogCode, active: true });
        if (!catalogueSites.length || catalogueSites.some(site => site.catalog !== catalogCode ||
            site.enterpriseCode !== context.enterpriseCode)) this.deny();
        this.authorize(request, permission);
        return { enterpriseCode: context.enterpriseCode, siteCode, catalogCode };
    },

    /** Requires an exact persisted authoring scope; missing legacy ownership never grants a business employee authority. */
    matches: function (record, scope, serviceName) {
        const shared = catalogOwned.has(serviceName) || serviceName === 'DefaultCmsComponentDetailService' &&
            record?.authoringScope?.siteCode === undefined;
        const keys = shared ? ['enterpriseCode', 'catalogCode'] : ['enterpriseCode', 'siteCode', 'catalogCode'];
        return Boolean(record?.authoringScope && keys
            .every(key => record.authoringScope[key] === scope[key]));
    },

    /** Shared components and reference definitions belong to a Catalog; pages and placements retain their Site. */
    ownedScope: function (scope, serviceName) {
        return _.pick(scope, catalogOwned.has(serviceName) ? ['enterpriseCode', 'catalogCode'] : ['enterpriseCode', 'siteCode', 'catalogCode']);
    },

    /** Checks every retained version before a code can be authored; unowned/foreign identities are never adopted. */
    assertIdentity: async function (serviceName, request, code, scope, required = false) {
        if (typeof code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code)) this.deny();
        const rows = await this.records(serviceName, request, { code });
        if ((required && !rows.length) || rows.some(row => row.code !== code || !this.matches(row, scope, serviceName))) this.deny();
        if (serviceName === 'DefaultCmsComponentDetailService') {
            for (const row of rows.filter(item => item.authoringScope.siteCode === undefined)) {
                if ((await this.records('DefaultCmsPageService', request, { code: row.source })).length) this.deny();
                await this.assertIdentity('DefaultCmsComponentService', request, row.source, scope, true);
            }
        }
        return rows;
    },

    /** Chooses the next immutable version from owner-read history, never from caller-supplied version fields. */
    nextModel: function (model, rows) {
        const candidate = Object.assign({}, model);
        delete candidate._id;
        delete candidate.versionId;
        if (rows.some(row => row.versionId !== undefined)) {
            if (rows.some(row => !Number.isSafeInteger(row.versionId) || row.versionId < 0)) this.deny();
            const next = Math.max(...rows.map(row => row.versionId)) + 1;
            if (!Number.isSafeInteger(next)) this.deny();
            candidate.versionId = next;
        }
        return candidate;
    },

    /** Resolves internal persistence credentials only after the caller and exact scope were admitted by the owner. */
    persistenceAuth: function () {
        const auth = SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData?.();
        if (!auth) this.deny();
        return auth;
    },
};
