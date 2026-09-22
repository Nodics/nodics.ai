/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module nodics.platform/modules/profile/src/service/authentication/defaultAuthenticationProviderService
 * @description Implements profile default authentication provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /** Returns effective group codes from persisted principal groups and framework governance defaults. */
    resolveSessionUserGroups: function (person) {
        const directGroups = person && person.userGroupCodes ? person.userGroupCodes : UTILS.getUserGroupCodes(person && person.userGroups);
        const identityGovernance = CONFIG.get('identityGovernance') || {};
        const groupTargets = identityGovernance.migration && identityGovernance.migration.groupTargets ? identityGovernance.migration.groupTargets : {};
        const resolved = [];
        const visited = {};
        const visit = group => {
            const code = typeof group === 'string' ? group : group && group.code;
            if (!code || visited[code]) return;
            visited[code] = true;
            resolved.push(code);
            const modelParents = group && typeof group === 'object' && Array.isArray(group.parentGroups) ? group.parentGroups : [];
            const targetParents = groupTargets[code] && Array.isArray(groupTargets[code].parentGroups) ? groupTargets[code].parentGroups : [];
            modelParents.concat(targetParents).forEach(parent => visit(parent));
        };
        (directGroups || []).forEach(group => visit(group));
        return resolved;
    },

    /**

     * Executes record auth event behavior.

     *

     * @param {*} event Method input.

     * @returns {*} Method result.

     */

    recordAuthEvent: function (event) {
        if (!SERVICE.DefaultAuthAuditService) return Promise.resolve(false);
        let audit = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').audit || {};
        return SERVICE.DefaultAuthAuditService.record(event).catch(error => {
            if (audit.failClosed === true) throw error;
            this.LOG.error('Authentication audit recording failed', error);
            return false;
        });
    },

    /**

     * Updates auth data information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    updateAuthData: function (options) {
        let _self = this;
        options.state.lastAttempt = new Date();
        return SERVICE.DefaultUserStateService.save({
            tenant: options.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            model: options.state
        }).then(success => {
            _self.LOG.debug('State data has been updated with current time');
            return success;
        }).catch(error => {
            _self.LOG.error('While updating Active data with current time : ', error);
            throw error;
        });
    },

    /**

     * Updates failed auth data information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    updateFailedAuthData: function (options) {
        let threshold = CONFIG.get('attemptsToLockAccount') || 5;
        options.state.attempts = (options.state.attempts || 0) + 1;
        if (options.state.attempts >= threshold) {
            options.state.locked = true;
            options.state.lockedTime = new Date();
        }
        return this.updateAuthData(options);
    },

    /** Resolves an embedded or referenced password credential before proof comparison. */
    resolvePasswordCredential: function (options) {
        const password = options.person && options.person.password;
        if (password && typeof password === 'object' && typeof password.password === 'string') {
            return Promise.resolve(password);
        }
        if (!password || !SERVICE.DefaultPasswordService || typeof SERVICE.DefaultPasswordService.get !== 'function') {
            return Promise.resolve(null);
        }
        const query = typeof password === 'string' ? { $or: [{ _id: password }, { code: password }] } : { _id: password };
        return SERVICE.DefaultPasswordService.get({
            tenant: options.enterprise.tenant.code,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            query,
            searchOptions: { pageSize: 1, pageNumber: 1 },
            options: { recursive: false }
        }).then(response => {
            const result = response && (response.result || response.data || response);
            return Array.isArray(result) ? result[0] : result;
        }).catch(() => null);
    },

    /**

     * Executes authenticate apikey behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByAPIKey({
                    tenant: enterprise.tenant.code,
                    apiKey: request.apiKey
                }).then(employee => {
                    return this.recordAuthEvent({
                        eventType: 'api_key.authentication',
                        outcome: 'success',
                        tenant: enterprise.tenant.code,
                        entCode: enterprise.code,
                        principalId: employee.loginId
                    }).then(() => resolve({
                        enterprise: enterprise,
                        person: employee,
                        tenant: enterprise.tenant.code
                    }));
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate employee behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateEmployee: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultEmployeeService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId,
                }).then(employee => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: employee,
                        type: 'Employee'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00001',
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate customer behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateCustomer: function (request) {
        return new Promise((resolve, reject) => {
            let _self = this;
            SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode).then(enterprise => {
                SERVICE.DefaultCustomerService.findByLoginId({
                    tenant: enterprise.tenant.code,
                    loginId: request.loginId
                }).then(customer => {
                    _self.authenticate({
                        request: request,
                        enterprise: enterprise,
                        person: customer,
                        type: 'Customer'
                    }).then(success => {
                        resolve({
                            code: 'SUC_AUTH_00001',
                            result: success
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Executes authenticate behavior.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    authenticate: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultUserStateService.findUserState({
                    tenant: options.enterprise.tenant.code,
                    loginId: options.person.loginId,
                    _id: options.person._id
                }).then(state => this.resolvePasswordCredential(options).then(passwordCredential => {
                    if (passwordCredential) options.person.password = passwordCredential;
                    if (state.locked || !options.person.active || !passwordCredential || passwordCredential.active === false ||
                        typeof options.request.password !== 'string' ||
                        typeof passwordCredential.password !== 'string' || options.person.principalType === 'service') {
                        reject(new CLASSES.NodicsError('ERR_LIN_00002'));
                    } else {
                        UTILS.compareHash(options.request.password, passwordCredential.password).then(match => {
                            if (match) {
                                _self.issueSession(options, state, 'password.authentication').then(resolve).catch(reject);
                            } else {
                                _self.updateFailedAuthData({
                                    state: state,
                                    tenant: options.enterprise.tenant.code
                                }).then(() => {
                                    _self.recordAuthEvent({
                                        eventType: 'password.authentication',
                                        outcome: 'failure',
                                        tenant: options.enterprise.tenant.code,
                                        entCode: options.enterprise.code,
                                        principalId: options.person.loginId,
                                        reasonCode: 'INVALID_CREDENTIALS'
                                    }).then(() => reject(new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid login attempt'))).catch(reject);
                                }).catch(error => {
                                    reject(new CLASSES.NodicsError(error, 'Could not persist failed login state', 'ERR_AUTH_00000'));
                                });
                            }
                        }).catch(error => {
                            reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                        });
                    }
                })).catch(error => {
                    reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    },

    /** Issues tokens after an owning authentication method has verified proof and account eligibility. @param {object} options Fresh enterprise/person/type. @param {object} state Profile account state. @param {string} eventType Stable audit event. @returns {Promise<object>} Access/refresh pair; persists last attempt, refresh state, security stamp and audit. */
    issueSession: async function (options, state, eventType) {
        const person = options.person, enterprise = options.enterprise;
        if (!enterprise.active || !enterprise.tenant || enterprise.tenant.active === false || !person.active || person.principalType === 'service' || state.locked || !person.password || person.password.active === false) throw new CLASSES.NodicsError('ERR_AUTH_00001');
        const session = { entCode: enterprise.code, tenant: enterprise.tenant.code, loginId: person.loginId, type: options.type, principalType: person.principalType, authVersion: person.authVersion || 1, tokenLife: person.tokenLife, userGroups: this.resolveSessionUserGroups(person), permissions: person.userGroupPermissions || UTILS.getUserGroupPermissions(person.userGroups) };
        if (options.externalIdentityLinkCode !== undefined) {
            if (eventType !== 'external_identity.authentication' || session.principalType !== 'customer' || session.type !== 'Customer' ||
                !/^EID_[a-f0-9]{64}$/.test(options.externalIdentityLinkCode)) throw new CLASSES.NodicsError('ERR_AUTH_00001');
            session.externalIdentityLinkCode = options.externalIdentityLinkCode;
        }
        state.attempts = 0;
        await this.updateAuthData({ state, tenant: session.tenant });
        const refreshToken = await this.createRefreshToken(session);
        try {
            const authToken = this.generateAuthToken(session);
            await SERVICE.DefaultPrincipalSecurityStampService.register(session.tenant, session.loginId, session.authVersion);
            await this.recordAuthEvent({ eventType, outcome: 'success', tenant: session.tenant, entCode: session.entCode, principalId: session.loginId, tokenType: 'access' });
            return { authToken, refreshToken };
        } catch (error) { await this.removeToken(CONFIG.get('profileModuleName') || 'profile', refreshToken); throw error; }
    },

    /**

     * Updates refresh token information.

     *

     * @param {*} options Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    createRefreshToken: function (options, callback) {
        return new Promise((resolve, reject) => {
            try {
                let refreshToken = crypto.randomBytes(48).toString('base64url');
                let security = CONFIG.get('authSecurity') || {};
                let refreshPolicy = security.refreshToken || {};
                this.addToken(CONFIG.get('profileModuleName') || 'profile', true, refreshToken, {
                    entCode: options.entCode,
                    tenant: options.tenant,
                    loginId: options.loginId,
                    type: options.type,
                    principalType: options.principalType,
                    authVersion: options.authVersion,
                    userGroups: options.userGroups,
                    permissions: options.permissions,
                    ...(options.externalIdentityLinkCode ? { externalIdentityLinkCode: options.externalIdentityLinkCode } : {})
                }, refreshPolicy.expiresInSeconds).then(success => {
                    resolve(refreshToken);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError('ERR_AUTH_00000'));
            }
        });
    },

    /**

     * Executes rotate refresh token behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    rotateRefreshToken: function (request) {
        let _self = this;
        let refreshToken = request.refreshToken;
        if (!refreshToken) {
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00002', 'Refresh token is required'));
        }
        let moduleName = CONFIG.get('profileModuleName') || 'profile';
        return this.consumeToken(moduleName, refreshToken).then(session => {
            if (!session || !session.tenant || !session.loginId || request.type && request.type !== session.type) {
                throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session is invalid');
            }
            if (request.entCode && request.entCode !== session.entCode) {
                throw new CLASSES.NodicsError(
                    'ERR_AUTH_00001', 'Refresh session enterprise is mismatched'
                );
            }
            return SERVICE.DefaultEnterpriseService.retrieveEnterprise(session.entCode).then(enterprise => {
                if (!enterprise.active || !enterprise.tenant || enterprise.tenant.active === false || enterprise.tenant.code !== session.tenant) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session enterprise is inactive or mismatched');
                }
                let finder = session.type === 'Customer' ? SERVICE.DefaultCustomerService : SERVICE.DefaultEmployeeService;
                return finder.findByLoginId({ tenant: session.tenant, loginId: session.loginId });
            }).then(async person => {
                const state = await SERVICE.DefaultUserStateService.findUserState({ tenant: session.tenant, loginId: person.loginId, _id: person._id });
                if (state.locked || !person.password || person.password.active === false || !person.active || person.principalType === 'service') {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh principal is inactive or not eligible');
                }
                if (String(session.authVersion) !== String(person.authVersion || 1)) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Refresh session security stamp is stale');
                }
                if (session.externalIdentityLinkCode) {
                    await SERVICE.DefaultExternalIdentityService.validateSessionBinding(session);
                }
                session.userGroups = _self.resolveSessionUserGroups(person);
                session.permissions = person.userGroupPermissions || UTILS.getUserGroupPermissions(person.userGroups);
                session.principalType = person.principalType;
                return _self.createRefreshToken(session);
            }).then(nextRefreshToken => {
                let result = {
                    authToken: _self.generateAuthToken({
                        entCode: session.entCode,
                        tenant: session.tenant,
                        loginId: session.loginId,
                        principalType: session.principalType,
                        authVersion: session.authVersion,
                        userGroups: session.userGroups,
                        permissions: session.permissions,
                        ...(session.externalIdentityLinkCode ? { externalIdentityLinkCode: session.externalIdentityLinkCode } : {})
                    }),
                    refreshToken: nextRefreshToken,
                    loginId: session.loginId
                };
                return _self.recordAuthEvent({
                    eventType: 'refresh_token.rotation',
                    outcome: 'success',
                    tenant: session.tenant,
                    entCode: session.entCode,
                    principalId: session.loginId,
                    tokenType: 'refresh'
                }).then(() => result);
            });
        });
    },

    /**

     * Removes or clears session information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    revokeSession: function (request) {
        let operations = [this.revokeAccessToken(request.authData)];
        if (request.refreshToken) {
            operations.push(this.removeToken(CONFIG.get('profileModuleName') || 'profile', request.refreshToken));
        }
        return Promise.all(operations).then(() => this.recordAuthEvent({
            eventType: 'session.logout',
            outcome: 'success',
            tenant: request.authData && request.authData.tenant,
            entCode: request.authData && request.authData.entCode,
            principalId: request.authData && (request.authData.loginId || request.authData.serviceId)
        })).then(() => true);
    }
};
