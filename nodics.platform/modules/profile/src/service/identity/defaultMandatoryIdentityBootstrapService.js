/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultMandatoryIdentityBootstrapService
 * @description Reconciles missing identity-governance groups and configured service-principal metadata after init data is available. Local generated runtime credentials may be reconciled before the first local token request; non-local credential material remains operator-owned.
 * @layer service
 * @owner profile
 * @override Projects may replace this service or the configured mandatory-bootstrap service list while preserving idempotency, auditability, and fail-closed identity startup.
 */
module.exports = {
    /**
     * Applies required tenant Init releases and existing identity reconciliation before runtime authentication.
     * Provisioned credentials and deployment grants remain explicit operator-owned records outside generated local runtime startup.
     * @param {Object} request Tenant and selected module context.
     * @returns {Promise<Object>} Completed identity reconciliation.
     */
    prepareTenant: async function (request) {
        await SERVICE.DefaultDataReleaseService.installStartupReleases(this.systemRequest(request, {
            modules: request.modules, source: request.source
        }));
        return this.reconcile(request);
    },

    /** Returns the effective layered migration policy. */
    getPolicy: function () {
        return CONFIG.get('identityGovernance') && CONFIG.get('identityGovernance').migration || {};
    },

    /** Builds a trusted, tenant-scoped generated-service request. */
    systemRequest: function (request, additions) {
        return Object.assign({
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            options: { recursive: false }
        }, additions || {});
    },

    /** Orders missing groups so configured parent groups are created before their children. */
    orderMissingGroups: function (targets, existingCodes) {
        const available = new Set(existingCodes);
        const pending = Object.keys(targets).filter(code => !available.has(code));
        const ordered = [];
        while (pending.length > 0) {
            const readyIndex = pending.findIndex(code => [].concat(targets[code].parentGroups || []).every(parent => available.has(parent)));
            if (readyIndex < 0) {
                throw new Error('Mandatory identity groups contain unresolved or cyclic parents: ' + pending.join(', '));
            }
            const code = pending.splice(readyIndex, 1)[0];
            ordered.push(code);
            available.add(code);
        }
        return ordered;
    },

    /** Builds a bounded query for only the configured mandatory groups. */
    buildMandatoryGroupLookup: function (targets) {
        const codes = Object.keys(targets || {});
        return {
            query: codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
            searchOptions: {
                pageSize: Math.max(codes.length, 1),
                pageNumber: 1
            }
        };
    },

    /** Saves missing mandatory groups as per-code upserts so startup remains idempotent on partially seeded databases. */
    saveMissingGroups: function (request, models) {
        return models.reduce((promise, model) => promise.then(createdGroups => {
            return SERVICE.DefaultUserGroupService.save(this.systemRequest(request, {
                query: { code: model.code },
                model: model
            })).then(response => {
                if (response && response.errors && response.errors.length > 0) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Mandatory identity group could not be reconciled: ' + model.code);
                }
                return createdGroups.concat(model.code);
            });
        }), Promise.resolve([]));
    },

    /** Builds a bounded query for only configured service principals. */
    buildServicePrincipalLookup: function (policy) {
        const codes = [].concat(policy.servicePrincipalCodes || []);
        return {
            query: codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
            searchOptions: {
                pageSize: Math.max(codes.length, 1),
                pageNumber: 1
            }
        };
    },

    /** Builds a non-secret metadata update for an existing configured service principal. */
    buildServicePrincipalUpdate: function (principal, policy) {
        const serviceGroup = policy.serviceGroup;
        const configuredScopes = policy.servicePrincipalScopes && policy.servicePrincipalScopes[principal.code] || [];
        const codeOf = item => item && typeof item === 'object' ? item.code : item;
        const sameSet = (left, right) => {
            const leftSet = new Set([].concat(left || []).map(codeOf).filter(Boolean));
            const rightSet = new Set([].concat(right || []).map(codeOf).filter(Boolean));
            return leftSet.size === rightSet.size && Array.from(leftSet).every(item => rightSet.has(item));
        };
        const target = {
            principalType: 'service',
            userGroups: serviceGroup ? [serviceGroup] : [].concat(principal.userGroups || []),
            apiKeyScopes: Array.from(new Set([].concat(principal.apiKeyScopes || [], configuredScopes).filter(Boolean))),
            identityMigrationVersion: policy.version || 1
        };
        if ((principal.apiKey || principal.apiKeyHash) && !principal.apiKeyStatus) {
            target.apiKeyStatus = 'active';
        }
        const checks = {
            principalType: principal.principalType !== target.principalType,
            userGroups: !sameSet(principal.userGroups, target.userGroups),
            apiKeyScopes: !sameSet(principal.apiKeyScopes, target.apiKeyScopes),
            identityMigrationVersion: principal.identityMigrationVersion !== target.identityMigrationVersion,
            apiKeyStatus: Boolean(target.apiKeyStatus && principal.apiKeyStatus !== target.apiKeyStatus)
        };
        const changed = Object.keys(checks).some(key => checks[key]);
        return changed ? target : null;
    },

    /** Resolves the selected native-local environment code, when available. */
    getSelectedEnvironmentCode: function () {
        if (typeof NODICS !== 'undefined' && NODICS && typeof NODICS.getSelectedEnvironmentName === 'function') {
            return NODICS.getSelectedEnvironmentName();
        }
        return process.env.ENV || process.env.E || '';
    },

    /** Local generated credentials are allowed to repair only native local startup records. */
    isLocalRuntimeCredentialBootstrapEnabled: function () {
        const environmentCode = this.getSelectedEnvironmentCode();
        if (!/Local$/u.test(String(environmentCode || ''))) return false;
        const credentials = CONFIG.get('defaultAuthDetail') || {};
        const apiKey = credentials.apiKey || process.env.NODICS_RUNTIME_API_KEY;
        return typeof apiKey === 'string' && apiKey.length >= 32;
    },

    /** Builds a governed local-only API-key update for an existing service principal. */
    buildLocalRuntimeCredentialUpdate: function (principal, policy) {
        if (!this.isLocalRuntimeCredentialBootstrapEnabled()) return null;
        if (!principal || ![].concat(policy.servicePrincipalCodes || []).includes(principal.code)) return null;
        if (!SERVICE.DefaultAPIKeyCredentialService || typeof SERVICE.DefaultAPIKeyCredentialService.prepare !== 'function' ||
            typeof SERVICE.DefaultAPIKeyCredentialService.digest !== 'function') return null;
        const credentials = CONFIG.get('defaultAuthDetail') || {};
        const apiKey = credentials.apiKey || process.env.NODICS_RUNTIME_API_KEY;
        if (typeof apiKey !== 'string' || apiKey.length < 32) return null;
        const apiKeyHash = SERVICE.DefaultAPIKeyCredentialService.digest(apiKey);
        const configuredScopes = policy.servicePrincipalScopes && policy.servicePrincipalScopes[principal.code] || [];
        const scopes = Array.from(new Set([].concat(principal.apiKeyScopes || [], configuredScopes).filter(Boolean)));
        const currentScopes = Array.from(new Set([].concat(principal.apiKeyScopes || []).filter(Boolean)));
        const scopesChanged = JSON.stringify(currentScopes.slice().sort()) !== JSON.stringify(scopes.slice().sort());
        if (principal.apiKeyHash === apiKeyHash && !principal.apiKey && !scopesChanged && principal.apiKeyStatus === 'active' &&
            principal.identityMigrationVersion === (policy.version || 1)) return null;
        const credential = SERVICE.DefaultAPIKeyCredentialService.prepare(apiKey);
        credential.apiKeyScopes = scopes;
        credential.apiKeyStatus = 'active';
        credential.identityMigrationVersion = policy.version || 1;
        return credential;
    },

    /** Builds the local runtime deployment grant code used by project tooling. */
    localRuntimeGrantCode: function (environmentCode, serverCode) {
        return String(environmentCode || '').replace(/[A-Z]/gu, match => '-' + match.toLowerCase()).replace(/^-/, '') +
            '-' + String(serverCode || '').replace(/Server$/u, '').replace(/[A-Z]/gu, match => '-' + match.toLowerCase()) +
            '-runtime-deployment';
    },

    /** Returns the current runtime identity declaration for local bootstrap repair. */
    currentRuntimeScope: function (policy) {
        if (typeof NODICS === 'undefined' || !NODICS) return null;
        const projectCode = typeof NODICS.getEnvironmentName === 'function' ? NODICS.getEnvironmentName() : undefined;
        const environmentCode = this.getSelectedEnvironmentCode();
        const serverCode = typeof NODICS.getServerName === 'function' ? NODICS.getServerName() : undefined;
        const identity = CONFIG.get('runtimeIdentity') || {};
        const activeModules = typeof NODICS.getActiveModules === 'function' ? NODICS.getActiveModules() : [];
        const modules = Array.from(new Set([].concat(activeModules || [], identity.remoteModules || []).filter(Boolean)));
        const permissions = Array.from(new Set([].concat(policy.servicePrincipalScopes && policy.servicePrincipalScopes.apiAdmin || []).filter(Boolean)));
        if (!projectCode || !environmentCode || !serverCode || !identity.instanceCode || modules.length === 0 || permissions.length === 0) return null;
        return { projectCode, environmentCode, serverCode, instanceCode: identity.instanceCode, modules, permissions };
    },

    /** Reconciles the current local runtime grant before first internal-token issuance. */
    reconcileLocalRuntimeDeploymentGrant: function (request, policy) {
        if (!this.isLocalRuntimeCredentialBootstrapEnabled() || !SERVICE.DefaultPrincipalScopeAssignmentService) return Promise.resolve([]);
        const scope = this.currentRuntimeScope(policy);
        if (!scope) return Promise.resolve([]);
        const tenantCode = request.tenant || CONFIG.get('defaultTenant') || 'default';
        const enterpriseCode = CONFIG.get('defaultEnterprise') || 'default';
        const code = this.localRuntimeGrantCode(scope.environmentCode, scope.serverCode);
        const model = {
            code,
            active: true,
            principalType: 'service',
            principalCode: 'apiAdmin',
            scopeType: 'RUNTIME_DEPLOYMENT',
            scopeCode: code,
            tenantCode,
            enterpriseCode,
            effect: 'ALLOW',
            inheritanceMode: 'DIRECT',
            status: 'ACTIVE',
            runtimeScope: scope,
            reasonCode: 'LOCAL_RUNTIME_BOOTSTRAP'
        };
        const lookup = this.systemRequest(request, { query: { code }, options: { recursive: false } });
        return SERVICE.DefaultPrincipalScopeAssignmentService.get(lookup).then(response => {
            const current = response && response.result && response.result[0];
            if (current && JSON.stringify(current.runtimeScope || {}) === JSON.stringify(scope) &&
                current.status === model.status && current.effect === model.effect && current.principalCode === model.principalCode) {
                return [];
            }
            const serviceRequest = this.systemRequest(request, current ? {
                query: { code },
                model: {
                    principalType: model.principalType,
                    principalCode: model.principalCode,
                    scopeType: model.scopeType,
                    scopeCode: model.scopeCode,
                    tenantCode: model.tenantCode,
                    enterpriseCode: model.enterpriseCode,
                    effect: model.effect,
                    inheritanceMode: model.inheritanceMode,
                    status: model.status,
                    runtimeScope: model.runtimeScope,
                    reasonCode: model.reasonCode
                }
            } : { query: { code }, model });
            const operation = current ? SERVICE.DefaultPrincipalScopeAssignmentService.update : SERVICE.DefaultPrincipalScopeAssignmentService.save;
            return operation.call(SERVICE.DefaultPrincipalScopeAssignmentService, serviceRequest).then(() => [code]);
        });
    },

    /** Resolves the local bootstrap administrator password when safe to repair local startup. */
    getLocalBootstrapAdminPassword: function () {
        if (!this.isLocalRuntimeCredentialBootstrapEnabled()) return null;
        const bootstrap = CONFIG.get('bootstrapIdentity') || {};
        return typeof bootstrap.adminPassword === 'string' && bootstrap.adminPassword.length > 0 ? bootstrap.adminPassword : null;
    },

    /** Reconciles local administrator password state when a reused local DB lacks a usable password hash. */
    reconcileLocalAdministratorCredential: function (request, policy) {
        const password = this.getLocalBootstrapAdminPassword();
        if (!password || !SERVICE.DefaultPasswordService || !SERVICE.DefaultEmployeeService) return Promise.resolve([]);
        const administrators = [].concat(policy.administratorCodes || []).filter(Boolean);
        if (administrators.length === 0) return Promise.resolve([]);
        return SERVICE.DefaultEmployeeService.get(this.systemRequest(request, {
            query: { code: { $in: administrators } },
            searchOptions: { pageSize: administrators.length, pageNumber: 1 }
        })).then(response => {
            const employees = response.result || [];
            return employees.reduce((promise, employee) => promise.then(reconciled => {
                const currentHash = employee.password && employee.password.password;
                const compare = typeof currentHash === 'string' && typeof UTILS !== 'undefined' && UTILS && typeof UTILS.compareHash === 'function' ?
                    UTILS.compareHash(password, currentHash).catch(() => false) : Promise.resolve(false);
                return compare.then(matches => {
                    if (matches) return reconciled;
                    const passwordCode = 'password_' + employee.loginId.replace(/[^A-Za-z0-9]+/gu, '_');
                    return SERVICE.DefaultPasswordService.save(this.systemRequest(request, {
                        query: { code: passwordCode },
                        model: { code: passwordCode, loginId: employee.loginId, password, active: true }
                    })).then(saved => {
                        const savedPassword = saved && (saved.result || saved.data || saved);
                        const reference = savedPassword && (savedPassword._id || savedPassword.code) || passwordCode;
                        return SERVICE.DefaultEmployeeService.update(this.systemRequest(request, {
                            query: { code: employee.code },
                            model: { password: reference }
                        })).then(() => reconciled.concat(employee.code));
                    });
                });
            }), Promise.resolve([]));
        });
    },

    /** Clears stale local administrator failed-login state after repairing local bootstrap credentials. */
    reconcileLocalAdministratorState: function (request, administrators) {
        if (!this.isLocalRuntimeCredentialBootstrapEnabled() || !SERVICE.DefaultUserStateService || typeof SERVICE.DefaultUserStateService.findUserState !== 'function' ||
            typeof SERVICE.DefaultUserStateService.save !== 'function') return Promise.resolve([]);
        const tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
        return [].concat(administrators || []).reduce((promise, employee) => promise.then(reconciled => {
            if (!employee || !employee.loginId) return reconciled;
            return SERVICE.DefaultUserStateService.findUserState({
                tenant,
                loginId: employee.loginId,
                _id: employee._id
            }).then(state => {
                const stale = state && (state.locked || state.attempts > 0 || state.active === false);
                if (!stale) return reconciled;
                return SERVICE.DefaultUserStateService.save(this.systemRequest(request, {
                    model: Object.assign({}, state, {
                        loginId: employee.loginId,
                        personId: employee._id || state.personId,
                        attempts: 0,
                        locked: false,
                        lockedTime: null,
                        active: true
                    })
                })).then(() => reconciled.concat(employee.code || employee.loginId));
            });
        }), Promise.resolve([]));
    },

    /** Looks up configured local administrators and clears stale failed-login state. */
    reconcileConfiguredLocalAdministratorState: function (request, policy) {
        if (!this.isLocalRuntimeCredentialBootstrapEnabled() || !SERVICE.DefaultEmployeeService) return Promise.resolve([]);
        const administrators = [].concat(policy.administratorCodes || []).filter(Boolean);
        if (administrators.length === 0) return Promise.resolve([]);
        return SERVICE.DefaultEmployeeService.get(this.systemRequest(request, {
            query: { code: { $in: administrators } },
            searchOptions: { pageSize: administrators.length, pageNumber: 1 }
        })).then(response => this.reconcileLocalAdministratorState(request, response.result || []));
    },

    /** Reconciles existing configured service principals without exposing credential material. */
    reconcileServicePrincipals: function (request, policy) {
        const lookup = this.buildServicePrincipalLookup(policy);
        const configuredCodes = new Set([].concat(policy.servicePrincipalCodes || []));
        if (configuredCodes.size === 0) return Promise.resolve([]);
        return SERVICE.DefaultEmployeeService.get(this.systemRequest(request, lookup)).then(response => {
            const principals = (response.result || []).filter(principal => configuredCodes.has(principal.code));
            return principals.reduce((promise, principal) => promise.then(reconciled => {
                const target = this.buildServicePrincipalUpdate(principal, policy);
                const credential = this.buildLocalRuntimeCredentialUpdate(principal, policy);
                if (!target && !credential) return reconciled;
                const model = credential ? {
                    $set: Object.assign({}, target || {}, credential),
                    $unset: { apiKey: 1 }
                } : target;
                return SERVICE.DefaultEmployeeService.update(this.systemRequest(request, {
                    query: { code: principal.code },
                    model: model
                })).then(() => reconciled.concat(principal.code));
            }), Promise.resolve([]));
        });
    },

    /**
     * Creates only missing configured groups, reconciles configured service principals, and records the resulting startup change.
     *
     * @param {Object} request Bootstrap tenant and trace context.
     * @returns {Promise<Object>} Idempotent reconciliation summary.
     */
    reconcile: function (request) {
        const policy = this.getPolicy();
        if (policy.reconcileMissingGroupsOnStartup === false) {
            return Promise.resolve({ status: 'DISABLED', createdGroups: [] });
        }
        const targets = policy.groupTargets || {};
        const lookup = this.buildMandatoryGroupLookup(targets);
        return SERVICE.DefaultUserGroupService.get(this.systemRequest(request, lookup)).then(response => {
            const existingCodes = new Set((response.result || []).map(group => group.code));
            const creationOrder = this.orderMissingGroups(targets, existingCodes);
            const models = creationOrder.map(code => Object.assign({ code: code, name: code, active: true }, targets[code]));
            const save = models.length > 0 ? this.saveMissingGroups(request, models) : Promise.resolve([]);
            return save.then(createdGroups => {
                return this.reconcileServicePrincipals(request, policy).then(reconciledServicePrincipals => {
                    return this.reconcileLocalRuntimeDeploymentGrant(request, policy).then(reconciledRuntimeDeploymentGrants => this.reconcileLocalAdministratorCredential(request, policy).then(reconciledAdministratorCredentials => {
                        return this.reconcileConfiguredLocalAdministratorState(request, policy).then(reconciledAdministratorStates => {
                            const reconciledAdministrators = Array.from(new Set([].concat(reconciledAdministratorCredentials || [], reconciledAdministratorStates || [])));
                        return this.recordAudit(request, createdGroups, reconciledServicePrincipals, reconciledRuntimeDeploymentGrants, reconciledAdministrators).then(() => ({
                            status: createdGroups.length > 0 || reconciledServicePrincipals.length > 0 ||
                                reconciledRuntimeDeploymentGrants.length > 0 || reconciledAdministrators.length > 0 ? 'RECONCILED' : 'NO_CHANGES',
                            createdGroups: createdGroups,
                            reconciledServicePrincipals: reconciledServicePrincipals,
                            reconciledRuntimeDeploymentGrants: reconciledRuntimeDeploymentGrants,
                            reconciledAdministrators: reconciledAdministrators
                        }));
                        });
                    }));
                });
            });
        });
    },

    /** Persists a sanitized audit entry when startup creates mandatory groups or reconciles service-principal metadata. */
    recordAudit: function (request, createdGroups, reconciledServicePrincipals, reconciledRuntimeDeploymentGrants, reconciledAdministrators) {
        reconciledRuntimeDeploymentGrants = reconciledRuntimeDeploymentGrants || [];
        reconciledAdministrators = reconciledAdministrators || [];
        if (createdGroups.length === 0 && reconciledServicePrincipals.length === 0 &&
            reconciledRuntimeDeploymentGrants.length === 0 && reconciledAdministrators.length === 0) return Promise.resolve(true);
        return SERVICE.DefaultIdentityMigrationAuditService.save(this.systemRequest(request, {
            model: {
                code: 'mandatoryIdentityBootstrap_' + (request.tenant || 'default') + '_' + Date.now(),
                active: true,
                migrationVersion: this.getPolicy().version || 1,
                status: 'BOOTSTRAP_RECONCILED',
                tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: 'nodics-startup',
                result: { createdGroups: createdGroups, reconciledServicePrincipals: reconciledServicePrincipals,
                    reconciledRuntimeDeploymentGrants: reconciledRuntimeDeploymentGrants, reconciledAdministrators: reconciledAdministrators },
                correlationId: request.correlationId
            }
        }));
    }
};
