/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/enterprise/DefaultEnterpriseManagementService
 * @description Implements bounded, human-only enterprise discovery over the generated Profile enterprise service.
 * @layer service
 * @owner profile
 * @override Later modules may tighten filters, bounds, or projection through layered configuration without creating another persistence path.
 */
const crypto = require('node:crypto');

module.exports = {
    /** Canonicalizes command input for retry comparison without persisting personal input twice. */
    commandDigest: function (value) {
        const canonical = this.canonicalCommand(value);
        return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
    },

    /** Returns stable JSON field ordering while retaining array order and scalar types. */
    canonicalCommand: function (value) {
        if (Array.isArray(value)) return value.map(item => this.canonicalCommand(item));
        if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => {
            if (value[key] !== undefined) result[key] = this.canonicalCommand(value[key]);
            return result;
        }, {});
        return value;
    },
    /** Returns effective layered enterprise-search policy. */
    policy: function () {
        return (CONFIG.get('enterpriseManagement') || {}).search || {};
    },

    /** Returns effective layered enterprise access-assignment policy. */
    accessPolicy: function () {
        return (CONFIG.get('enterpriseManagement') || {}).accessAssignments || {};
    },

    /** Creates a stable Profile validation error. */
    error: function (message) {
        return new CLASSES.NodicsError('ERR_PRFL_00003', message);
    },

    /** Requires an authenticated human access-token principal. */
    authorize: function (request) {
        let auth = request && request.authData || {};
        if (auth.tokenType !== 'access' || !(auth.principalId || auth.loginId || auth.code)) {
            throw this.error('Enterprise search requires an authenticated employee access token');
        }
    },

    /** Returns true when the authenticated principal acts from the Platform Owner enterprise. */
    isPlatformAdministrator: function (auth) {
        let groups = [].concat(auth && auth.userGroups || [], auth && auth.allUserGroupCodes || []);
        if (groups.includes('serviceAccountUserGroup') || auth && auth.isSystem) return true;
        let platformEnterprise = CONFIG.get('defaultEnterprise') || 'default';
        let currentEnterprise = auth && (auth.entCode || auth.enterpriseCode);
        return currentEnterprise === platformEnterprise &&
            ['runtimeConfigAdminUserGroup', 'adminGroup'].some(group => groups.includes(group));
    },

    /** Returns the principal login/code used for audit fields. */
    principalCode: function (auth) {
        return auth && (auth.loginId || auth.principalId || auth.code || auth.principalCode) || 'unknown';
    },

    /** Requires platform admin or same-enterprise administrator scope for a target enterprise. */
    authorizeEnterpriseAccess: function (request, enterpriseCode) {
        this.authorize(request);
        let auth = request && request.authData || {};
        if (this.isPlatformAdministrator(auth)) return;
        let currentEnterprise = auth.entCode || auth.enterpriseCode || request.entCode || request.enterpriseCode;
        if (currentEnterprise && currentEnterprise === enterpriseCode) return;
        throw this.error('Enterprise access assignment is limited to the caller enterprise');
    },

    /** Parses one positive bounded integer without silently changing caller intent. */
    boundedInteger: function (value, fallback, maximum, name) {
        if (value === undefined || value === null || value === '') return fallback;
        let normalized = typeof value === 'number' ? value : Number(String(value));
        if (!Number.isSafeInteger(normalized) || normalized < 1 || normalized > maximum) {
            throw this.error(name + ' is outside the configured boundary');
        }
        return normalized;
    },

    /** Validates and maps scalar HTTP filters to the authoritative generated-service query. */
    buildQuery: function (input, policy) {
        let allowed = ['code', 'name', 'active', 'page', 'limit'];
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !allowed.includes(key)) ||
            Object.values(input).some(value => value !== null && typeof value === 'object')) {
            throw this.error('Enterprise search filters are invalid');
        }
        let query = {};
        if (input.code !== undefined) {
            let code = String(input.code).trim();
            if (!code || code.length > Number(policy.maximumCodeLength || 128) ||
                !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code)) {
                throw this.error('Enterprise code filter is invalid');
            }
            query.code = code;
        }
        if (input.name !== undefined) {
            let name = String(input.name).trim();
            if (!name || name.length > Number(policy.maximumNameLength || 256)) {
                throw this.error('Enterprise name filter is invalid');
            }
            query.name = name;
        }
        if (input.active !== undefined) {
            if (input.active !== true && input.active !== false &&
                input.active !== 'true' && input.active !== 'false') {
                throw this.error('Enterprise active filter must be true or false');
            }
            query.active = input.active === true || input.active === 'true';
        }
        return query;
    },

    /** Projects only configured client-safe enterprise fields. */
    project: function (item, fields) {
        return fields.reduce((result, field) => {
            if (!item || item[field] === undefined) return result;
            if (field === 'tenant') {
                result.tenantCode = item.tenant && typeof item.tenant === 'object' ? item.tenant.code : item.tenant;
            } else if (field === 'superEnterprise') {
                result.superEnterpriseCode = item.superEnterprise && typeof item.superEnterprise === 'object' ?
                    item.superEnterprise.code : item.superEnterprise;
            } else {
                result[field] = item[field];
            }
            return result;
        }, {});
    },

    /** Projects only configured client-safe access assignment fields. */
    projectAssignment: function (item, fields) {
        return fields.reduce((result, field) => {
            if (!item || item[field] === undefined) return result;
            result[field] = item[field];
            return result;
        }, {});
    },

    /** Normalizes and validates one email address for invite lookup. */
    normalizeEmail: function (value) {
        let email = String(value || '').trim().toLowerCase();
        let policy = this.accessPolicy();
        if (!email || email.length > Number(policy.maximumEmailLength || 320) ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw this.error('Enterprise user email is invalid');
        }
        return email;
    },

    /** Validates one configured enterprise employee role. */
    rolePolicy: function (roleCode) {
        let roles = this.accessPolicy().roles || {};
        let role = roles[String(roleCode || '').trim()];
        if (!role || !Array.isArray(role.groupCodes) || role.groupCodes.length === 0) {
            throw this.error('Enterprise user role is not configured');
        }
        return role;
    },

    /** Builds an access-assignment lookup query without exposing recursive identity data. */
    buildAssignmentQuery: function (input, policy) {
        let allowed = ['code', 'email', 'enterpriseCode', 'tenantCode', 'roleCode', 'status', 'page', 'limit'];
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !allowed.includes(key)) ||
            Object.values(input).some(value => value !== null && typeof value === 'object')) {
            throw this.error('Enterprise access assignment filters are invalid');
        }
        let query = {};
        if (input.code !== undefined) query.code = String(input.code).trim();
        if (input.email !== undefined) query.normalizedEmail = this.normalizeEmail(input.email);
        ['enterpriseCode', 'tenantCode', 'roleCode'].forEach(key => {
            if (input[key] === undefined) return;
            let value = String(input[key]).trim();
            if (!value || value.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) {
                throw this.error('Enterprise access assignment filter is invalid: ' + key);
            }
            query[key] = value;
        });
        if (input.status !== undefined) {
            let status = String(input.status).trim();
            if (!status) return;
            if (!Array.isArray(policy.statuses) || !policy.statuses.includes(status)) {
                throw this.error('Enterprise access assignment status is invalid');
            }
            query.status = status;
        }
        return query;
    },

    /** Loads one enterprise and returns the tenant code that owns its employees. */
    retrieveEnterpriseForAccess: async function (enterpriseCode) {
        let code = String(enterpriseCode || '').trim();
        if (!code || code.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code)) {
            throw this.error('Enterprise code is invalid');
        }
        let enterprise = await SERVICE.DefaultEnterpriseService.retrieveEnterprise(code);
        if (!enterprise || enterprise.active === false) {
            throw this.error('Enterprise is inactive or unavailable');
        }
        let tenantCode = typeof enterprise.tenant === 'object' ? enterprise.tenant.code : enterprise.tenant;
        if (!tenantCode) throw this.error('Enterprise tenant is unavailable');
        return { enterprise: enterprise, tenantCode: tenantCode };
    },

    /** Builds a deterministic assignment code for idempotent pre-registration state. */
    assignmentCode: function (enterpriseCode, normalizedEmail) {
        return ['enterpriseAccess', enterpriseCode, normalizedEmail.replace(/[^a-z0-9]+/g, '_')]
            .join('_').replace(/_+/g, '_').replace(/_$/g, '');
    },

    /** Returns the Profile authority tenant for enterprise access-assignment registry state. */
    assignmentTenant: function () {
        return CONFIG.get('defaultTenant') || 'default';
    },

    /** Creates the tenant backing a newly created enterprise when it is not already present. */
    ensureTenant: async function (tenantCode, request, enterpriseName) {
        if (!SERVICE.DefaultTenantService) return;
        let persistenceTenant = CONFIG.get('defaultTenant') || 'default';
        let existing = await SERVICE.DefaultTenantService.get({
            tenant: persistenceTenant,
            authData: request.authData,
            query: { code: tenantCode },
            options: { recursive: false },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (existing && Array.isArray(existing.result) && existing.result.length) return;
        await SERVICE.DefaultTenantService.save({
            tenant: persistenceTenant,
            authData: request.authData,
            model: {
                code: tenantCode,
                active: true,
                description: 'Tenant for ' + enterpriseName
            },
            idempotencyKey: request.body && request.body.idempotencyKey ?
                'tenant-' + request.body.idempotencyKey : undefined
        });
    },

    /** Ensures the newly created enterprise tenant is addressable before registration begins. */
    activateEnterpriseRuntime: async function (enterprise, tenantCode) {
        if (!SERVICE.DefaultEnterpriseHandlerService || typeof NODICS === 'undefined' ||
            !NODICS.getActiveTenants || !SERVICE.DefaultEnterpriseHandlerService.buildEnterprise) {
            return;
        }
        if (NODICS.getActiveTenants().includes(tenantCode)) return;
        let tenant = enterprise && enterprise.tenant && typeof enterprise.tenant === 'object' ?
            enterprise.tenant : { code: tenantCode, active: true };
        if (tenant.active === false) return;
        await SERVICE.DefaultEnterpriseHandlerService.buildEnterprise([
            Object.assign({}, enterprise || {}, {
                tenant: tenant,
                active: !enterprise || enterprise.active !== false
            })
        ]);
    },

    /** Returns a backend-driven enterprise access workspace contract. */
    getAccessWorkspace: function (request) {
        let workspace = (CONFIG.get('enterpriseManagement') || {}).workspace;
        if (!workspace) throw this.error('Enterprise access workspace is not configured');
        let effective = JSON.parse(JSON.stringify(workspace));
        let publicOnly = request && request.publicOnly === true;
        if (!publicOnly) return effective;
        effective.tabs = (effective.tabs || []).map(tab => {
            let sections = (tab.sections || []).filter(section => section.public === true);
            return Object.assign({}, tab, { sections: sections });
        }).filter(tab => tab.sections.length > 0);
        effective.defaultTab = effective.tabs[0] && effective.tabs[0].id || effective.defaultTab;
        return effective;
    },

    /** Finds active assignment candidates for one normalized email and enterprise. */
    findActiveAssignment: async function (normalizedEmail, enterpriseCode, authData) {
        let policy = this.accessPolicy();
        let activeStatuses = Array.isArray(policy.activeStatuses) ? policy.activeStatuses : ['PENDING', 'ACTIVE'];
        let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
            tenant: this.assignmentTenant(),
            authData: authData,
            query: {
                normalizedEmail: normalizedEmail,
                enterpriseCode: enterpriseCode
            },
            options: { recursive: false },
            searchOptions: { pageSize: 25, pageNumber: 1, sort: { created: -1 } }
        });
        let assignments = response && Array.isArray(response.result) ? response.result : [];
        return assignments.find(item => activeStatuses.includes(item.status) &&
            (!item.expiresAt || new Date(item.expiresAt).getTime() >= Date.now()));
    },

    /** Searches enterprises through the existing generated Profile service. */
    search: async function (request) {
        this.authorize(request);
        let policy = this.policy();
        let input = request.query || {};
        let limit = this.boundedInteger(input.limit, Number(policy.defaultResultCount || 25),
            Number(policy.maximumResultCount || 100), 'limit');
        let page = this.boundedInteger(input.page, 1,
            Number(policy.maximumPageNumber || 10000), 'page');
        let response = await SERVICE.DefaultEnterpriseService.get({
            tenant: CONFIG.get('defaultTenant') || 'default',
            authData: request.authData,
            query: this.buildQuery(input, policy),
            options: { recursive: false },
            searchOptions: {
                pageSize: limit,
                pageNumber: page,
                sort: { code: 1 }
            }
        });
        let items = response && Array.isArray(response.result) ? response.result : [];
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'name', 'active', 'tenant'];
        return {
            page: page,
            limit: limit,
            count: items.length,
            items: items.map(item => this.project(item, fields))
        };
    },

    /**
     * Adapts the schema editor's declared CREATE aggregate to Profile enterprise setup.
     * Tenant provisioning stays server-owned; later schema fields are accepted only
     * when the effective descriptor declares them writable. No client service names
     * or runtime coordinates are accepted.
     * @param {Object} request Authenticated aggregate request with payload.model.
     * @returns {Promise<Object>} Persisted enterprise, including reference identities.
     */
    createFromModel: async function (request) {
        this.authorize(request);
        if (!this.isPlatformAdministrator(request.authData)) throw this.error('Enterprise creation is limited to the Platform Owner enterprise');
        let schemaUtility = SERVICE.DefaultSchemaUtilityService;
        if (!schemaUtility || typeof schemaUtility.buildDescriptor !== 'function') {
            throw this.error('Schema metadata is unavailable for enterprise setup');
        }
        let moduleObject = NODICS.getModule('profile');
        let descriptor = schemaUtility.buildDescriptor(request, moduleObject, 'enterprise', 'profile');
        let input = request.payload && request.payload.model;
        if (!descriptor || !descriptor.operations.includes('create') || !input || typeof input !== 'object' || Array.isArray(input)) {
            throw this.error('Enterprise creation input is invalid');
        }
        let writable = new Set(descriptor.fields.filter(field => !field.readOnly).map(field => field.name));
        let reserved = new Set(['tenant', 'capabilityScopes']);
        if (Object.keys(input).some(key => !writable.has(key) || reserved.has(key))) {
            throw this.error('Enterprise creation contains a managed or unavailable field');
        }
        const idempotencyKey = schemaUtility.getIdempotencyKey(request);
        if (!idempotencyKey) throw this.error('Enterprise setup requires a valid Idempotency-Key');
        let { code, name, active, roleCodes, superEnterprise, ...additional } = input;
        await this.create({ ...request, body: {
            code, name, active, roleCodes, superEnterpriseCode: superEnterprise,
            tenantCode: code, idempotencyKey,
        } }, additional);
        let result = await SERVICE.DefaultEnterpriseService.get({
            tenant: CONFIG.get('defaultTenant') || 'default', authData: request.authData,
            query: { code }, options: { recursive: false }, searchOptions: { pageSize: 1, pageNumber: 1 },
        });
        let saved = result && result.result && result.result[0];
        if (!saved) throw this.error('Enterprise was created but could not be reloaded');
        return descriptor.fields.reduce((record, field) => {
            if (saved[field.name] !== undefined) record[field.name] = saved[field.name];
            return record;
        }, {});
    },

    /** Creates one enterprise; additionalModel is a server-only, descriptor-validated contribution. */
    create: async function (request, additionalModel) {
        this.authorize(request);
        if (!this.isPlatformAdministrator(request.authData)) {
            throw this.error('Enterprise creation is limited to the Platform Owner enterprise');
        }
        let policy = (CONFIG.get('enterpriseManagement') || {}).create || {};
        let input = request.body || {};
        let allowed = ['code', 'name', 'tenantCode', 'superEnterpriseCode', 'active', 'roleCodes', 'idempotencyKey'];
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !allowed.includes(key))) {
            throw this.error('Enterprise creation input is invalid');
        }
        let code = String(input.code || '').trim();
        let name = String(input.name || '').trim();
        let tenantCode = String(input.tenantCode || request.tenant || CONFIG.get('defaultTenant') || 'default').trim();
        let persistenceTenant = CONFIG.get('defaultTenant') || 'default';
        let requestKey = input.idempotencyKey ? this.commandDigest([this.principalCode(request.authData), String(input.idempotencyKey)]) : undefined;
        let requestHash = requestKey ? this.commandDigest({ input, additionalModel }) : undefined;
        if (!code || code.length > Number(policy.maximumCodeLength || 128) ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(code) ||
            !name || name.length > Number(policy.maximumNameLength || 256) ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(tenantCode)) {
            throw this.error('Enterprise creation fields are invalid');
        }
        let existing = await SERVICE.DefaultEnterpriseService.get({
            tenant: persistenceTenant, authData: request.authData, query: { code: code },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (existing && Array.isArray(existing.result) && existing.result.length) {
            let saved = existing.result[0];
            if (requestKey && saved.setupRequestKey === requestKey) {
                if (saved.setupRequestHash !== requestHash) throw this.error('This setup request has changed. Open the existing enterprise before making further changes.');
                await this.activateEnterpriseRuntime(saved, tenantCode);
                return this.project(saved, policy.projectedFields || ['code', 'name', 'active', 'tenant']);
            }
            throw this.error('Enterprise code already exists');
        }
        let tenantOwner = await SERVICE.DefaultEnterpriseService.get({
            tenant: persistenceTenant, authData: request.authData, query: { tenant: tenantCode },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (tenantOwner && Array.isArray(tenantOwner.result) && tenantOwner.result.length) {
            throw this.error('Enterprise tenant is already assigned');
        }
        let model = Object.assign({}, additionalModel || {}, { code: code, name: name, tenant: tenantCode, active: input.active !== false });
        if (requestKey) { model.setupRequestKey = requestKey; model.setupRequestHash = requestHash; }
        if (input.superEnterpriseCode) model.superEnterprise = String(input.superEnterpriseCode);
        if (Array.isArray(input.roleCodes) && input.roleCodes.length) {
            let allowedRoles = Array.isArray(policy.allowedRoleCodes) ? policy.allowedRoleCodes : [];
            let roleCodes = Array.from(new Set(input.roleCodes.map(item => String(item || '').trim())
                .filter(Boolean)));
            if (roleCodes.some(role => !allowedRoles.includes(role))) {
                throw this.error('Enterprise role code is invalid');
            }
            model.roleCodes = roleCodes;
        }
        await this.ensureTenant(tenantCode, request, name);
        let response = await SERVICE.DefaultEnterpriseService.save({
            tenant: persistenceTenant, authData: request.authData, model: model,
            idempotencyKey: input.idempotencyKey
        });
        let saved = response && (response.result || response.data || response);
        await this.activateEnterpriseRuntime(saved, tenantCode);
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'name', 'active', 'tenant'];
        return this.project(saved, fields);
    },

    /** Lists pre-assigned enterprise access records through the Profile-owned generated service. */
    searchAccessAssignments: async function (request) {
        this.authorize(request);
        let policy = this.accessPolicy();
        let input = request.query || {};
        let limit = this.boundedInteger(input.limit, Number(policy.defaultResultCount || 25),
            Number(policy.maximumResultCount || 100), 'limit');
        let page = this.boundedInteger(input.page, 1,
            Number(policy.maximumPageNumber || 10000), 'page');
        let query = this.buildAssignmentQuery(input, policy);
        if (!this.isPlatformAdministrator(request.authData)) {
            let callerEnterprise = request.authData && (request.authData.entCode || request.authData.enterpriseCode);
            if (!callerEnterprise) throw this.error('Enterprise assignment search requires caller enterprise scope');
            if (query.enterpriseCode && query.enterpriseCode !== callerEnterprise) {
                throw this.error('Enterprise assignment search is limited to the caller enterprise');
            }
            query.enterpriseCode = callerEnterprise;
        }
        let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
            tenant: this.assignmentTenant(),
            authData: request.authData,
            query: query,
            options: { recursive: false },
            searchOptions: { pageSize: limit, pageNumber: page, sort: { created: -1 } }
        });
        let items = response && Array.isArray(response.result) ? response.result : [];
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'email', 'enterpriseCode', 'tenantCode', 'roleCode', 'status'];
        return { page: page, limit: limit, count: items.length, items: items.map(item =>
            this.projectAssignment(item, fields)) };
    },

    /** Creates or refreshes one email pre-assignment for enterprise employee registration. */
    preAssignAccess: async function (request) {
        let body = request.body || {};
        let enterpriseCode = String(request.params && request.params.enterpriseCode || body.enterpriseCode || '').trim();
        this.authorizeEnterpriseAccess(request, enterpriseCode);
        let policy = this.accessPolicy();
        let normalizedEmail = this.normalizeEmail(body.email);
        let roleCode = String(body.roleCode || '').trim();
        let role = this.rolePolicy(roleCode);
        let enterprise = await this.retrieveEnterpriseForAccess(enterpriseCode);
        let existing = await this.findActiveAssignment(normalizedEmail, enterpriseCode, request.authData);
        if (existing && existing.status === 'REGISTERED') {
            throw this.error('Enterprise user email is already registered');
        }
        let expiresAt = body.expiresAt ? new Date(body.expiresAt) : new Date(
            Date.now() + Number(policy.defaultExpiryDays || 14) * 24 * 60 * 60 * 1000);
        if (!Number.isFinite(expiresAt.getTime())) throw this.error('Enterprise access expiry is invalid');
        let message = body.message === undefined ? undefined : String(body.message).trim();
        if (message && message.length > Number(policy.maximumMessageLength || 1000)) {
            throw this.error('Enterprise access message exceeds configured length');
        }
        let model = {
            code: existing && existing.code || this.assignmentCode(enterpriseCode, normalizedEmail),
            email: String(body.email || '').trim(),
            normalizedEmail: normalizedEmail,
            enterpriseCode: enterpriseCode,
            tenantCode: enterprise.tenantCode,
            roleCode: roleCode,
            groupCodes: role.groupCodes,
            scopeType: role.scopeType || 'ENTERPRISE',
            scopeCode: enterpriseCode,
            status: 'PENDING',
            active: true,
            expiresAt: expiresAt,
            invitedBy: this.principalCode(request.authData)
        };
        if (message) model.message = message;
        let response = await SERVICE.DefaultEnterpriseAccessAssignmentService.save({
            tenant: this.assignmentTenant(),
            authData: request.authData,
            model: model,
            idempotencyKey: body.idempotencyKey
        });
        let saved = response && (response.result || response.data || response);
        let fields = Array.isArray(policy.projectedFields) ? policy.projectedFields :
            ['code', 'email', 'enterpriseCode', 'tenantCode', 'roleCode', 'status'];
        return this.projectAssignment(saved, fields);
    },

    /** Resolves one public pre-assignment for the registration page without exposing private identity data. */
    resolvePreAssignedAccess: async function (request) {
        let input = request.query || request.body || {};
        let enterpriseCode = String(input.enterpriseCode || '').trim();
        let normalizedEmail = this.normalizeEmail(input.email);
        let enterprise = await this.retrieveEnterpriseForAccess(enterpriseCode);
        let assignment = await this.findActiveAssignment(normalizedEmail, enterpriseCode,
            { isSystem: true, userGroups: ['serviceAccountUserGroup'] });
        if (!assignment) return { status: 'NOT_FOUND', matched: false };
        let role = this.rolePolicy(assignment.roleCode);
        return {
            status: assignment.status,
            matched: true,
            enterpriseCode: assignment.enterpriseCode,
            tenantCode: assignment.tenantCode,
            email: assignment.email,
            roleCode: assignment.roleCode,
            roleLabel: role.label || assignment.roleCode,
            expiresAt: assignment.expiresAt
        };
    },

    /** Completes pre-approved employee registration and binds the new principal to its enterprise scope. */
    registerPreAssignedEmployee: async function (request) {
        let input = request.body || {};
        let enterpriseCode = String(input.enterpriseCode || '').trim();
        let normalizedEmail = this.normalizeEmail(input.email);
        let password = String(input.password || '');
        let firstName = String(input.firstName || '').trim();
        let lastName = String(input.lastName || '').trim();
        if (!password || !firstName || !lastName) throw this.error('Enterprise registration fields are required');
        let enterprise = await this.retrieveEnterpriseForAccess(enterpriseCode);
        let systemAuth = { isSystem: true, userGroups: ['serviceAccountUserGroup'] };
        let assignment = await this.findActiveAssignment(normalizedEmail, enterpriseCode, systemAuth);
        if (!assignment) throw this.error('Enterprise access assignment was not found');
        let existing = await SERVICE.DefaultEmployeeService.get({
            tenant: enterprise.tenantCode,
            authData: systemAuth,
            query: { loginId: normalizedEmail },
            options: { recursive: false },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        if (existing && Array.isArray(existing.result) && existing.result.length) {
            throw this.error('Employee already exists for this enterprise');
        }
        let passwordResponse = await SERVICE.DefaultPasswordService.save({
            tenant: enterprise.tenantCode,
            authData: systemAuth,
            model: {
                code: 'password_' + normalizedEmail.replace(/[^a-z0-9]+/g, '_'),
                loginId: normalizedEmail,
                password: password,
                active: true
            },
            idempotencyKey: input.idempotencyKey
        });
        let savedPassword = passwordResponse && (passwordResponse.result || passwordResponse.data || passwordResponse);
        let employeeModel = {
            code: normalizedEmail,
            loginId: normalizedEmail,
            name: {
                firstName: firstName,
                lastName: lastName
            },
            password: savedPassword && (savedPassword._id || savedPassword.code) ||
                ('password_' + normalizedEmail.replace(/[^a-z0-9]+/g, '_')),
            principalType: 'human',
            userGroups: assignment.groupCodes,
            active: true
        };
        let employeeResponse = await SERVICE.DefaultEmployeeService.save({
            tenant: enterprise.tenantCode,
            authData: systemAuth,
            model: employeeModel,
            idempotencyKey: input.idempotencyKey
        });
        let employee = employeeResponse && (employeeResponse.result || employeeResponse.data || employeeResponse);
        await SERVICE.DefaultPrincipalScopeAssignmentService.save({
            tenant: enterprise.tenantCode,
            authData: systemAuth,
            model: {
                code: 'principalScope_' + enterpriseCode + '_' + normalizedEmail.replace(/[^a-z0-9]+/g, '_'),
                principalType: 'human',
                principalCode: normalizedEmail,
                scopeType: assignment.scopeType || 'ENTERPRISE',
                scopeCode: assignment.scopeCode || enterpriseCode,
                tenantCode: enterprise.tenantCode,
                enterpriseCode: enterpriseCode,
                effect: 'ALLOW',
                inheritanceMode: 'DIRECT',
                status: 'ACTIVE',
                reasonCode: 'ENTERPRISE_ACCESS_ASSIGNMENT',
                active: true
            },
            idempotencyKey: input.idempotencyKey
        });
        assignment.status = 'REGISTERED';
        assignment.registeredLoginId = normalizedEmail;
        assignment.registeredAt = new Date();
        await SERVICE.DefaultEnterpriseAccessAssignmentService.save({
            tenant: this.assignmentTenant(),
            authData: systemAuth,
            model: assignment,
            idempotencyKey: input.idempotencyKey
        });
        return {
            status: 'REGISTERED',
            loginId: normalizedEmail,
            enterpriseCode: enterpriseCode,
            tenantCode: enterprise.tenantCode,
            employeeCode: employee && employee.code || normalizedEmail
        };
    }
};
