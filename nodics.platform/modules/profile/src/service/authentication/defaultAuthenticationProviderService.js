/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require("crypto");

/**
 * @module nodics.platform/modules/profile/src/service/authentication/defaultAuthenticationProviderService
 * @description Implements profile default authentication provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Consumes a matching Employee refresh proof and issues a separately bound Customer context, never staff groups. @param {Object} request Cookie-admitted current access/refresh proof. @returns {Promise<Object>} Private refresh plus memory access result. */
  switchCustomerParticipationContext: async function (request) {
    const m = SERVICE.DefaultEnterpriseMembershipService,
      owner = SERVICE.DefaultCustomerRegistrationService;
    const prepared = await owner.prepareParticipationSession(request),
      moduleName = CONFIG.get("profileModuleName") || "profile";
    if (!request.refreshToken) m.fail("IDENTITY");
    const previous = await this.consumeToken(moduleName, request.refreshToken),
      auth = request.authData || {};
    SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(
      previous || {},
    );
    if (
      !previous ||
      previous.type !== "Employee" ||
      previous.principalType !== "human" ||
      previous.authenticationMethod !== "PASSWORD" ||
      previous.externalIdentityLinkCode ||
      ["entCode", "tenant", "loginId", "authVersion"].some(
        (key) => String(previous[key]) !== String(auth[key]),
      ) ||
      m.digest(previous.sessionContext || null) !==
        m.digest(auth.sessionContext || null) ||
      m.digest(previous.securityBindings || null) !==
        m.digest(auth.securityBindings || null)
    )
      m.fail("IDENTITY");
    const fresh = await m.actor(request);
    await m.credential(fresh);
    if (!previous.sessionContext)
      await this.assertEmployeeRegistrationSession(
        fresh.person,
        prepared.enterprise,
      );
    if (m.digest(fresh.identity) !== m.digest(prepared.context.anchor.identity))
      m.fail("IDENTITY");
    const person = prepared.context.person;
    const session = {
      authorizationPolicyVersion:
        SERVICE.DefaultAuthSecurityService.getAuthorizationPolicyVersion(),
      entCode: prepared.enterprise.code,
      tenant: prepared.tenantCode,
      loginId: person.loginId,
      type: "Customer",
      principalType: "customer",
      authVersion: person.authVersion || 1,
      userGroups: this.resolveSessionUserGroups(person),
      permissions: UTILS.getUserGroupPermissions(person.userGroups),
      authenticationMethod: "PASSWORD",
      sessionContext: prepared.context.sessionContext,
      securityBindings: prepared.context.securityBindings,
    };
    await owner.validateParticipationContext(session);
    const refreshToken = await this.createRefreshToken(session);
    try {
      const authToken = this.generateAuthToken(session);
      await owner.validateParticipationContext(session);
      await this.recordAuthEvent({
        eventType: "customer_participation.switch",
        outcome: "success",
        tenant: session.tenant,
        entCode: session.entCode,
        principalId: session.loginId,
        tokenType: "access",
      });
      return {
        authToken,
        refreshToken,
        loginId: session.loginId,
        enterpriseCode: session.entCode,
      };
    } catch (error) {
      await this.removeToken(moduleName, refreshToken);
      throw error;
    }
  },
  /** Consumes a same-person PASSWORD browser refresh proof and issues one target-only Employee context. @param {Object} request Signed actor, HttpOnly proof and reviewed target DTO. @returns {Promise<Object>} Private access/refresh pair for the browser owner only. */
  switchEnterpriseContext: async function (request) {
    const owner = SERVICE.DefaultEnterpriseMembershipService;
    const prepared = await owner.prepareContextSwitch(request);
    const moduleName = CONFIG.get("profileModuleName") || "profile";
    if (!request.refreshToken)
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_IDENTITY");
    const previous = await this.consumeToken(moduleName, request.refreshToken);
    SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(
      previous || {},
    );
    const auth = request.authData;
    if (
      !previous ||
      previous.type !== "Employee" ||
      previous.principalType !== "human" ||
      previous.authenticationMethod !== "PASSWORD" ||
      previous.externalIdentityLinkCode ||
      ["entCode", "tenant", "loginId"].some(
        (key) => previous[key] !== auth[key],
      ) ||
      String(previous.authVersion) !== String(auth.authVersion) ||
      owner.digest(previous.sessionContext || null) !==
        owner.digest(auth.sessionContext || null) ||
      owner.digest(previous.securityBindings || null) !==
        owner.digest(auth.securityBindings || null)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_IDENTITY");
    const currentEnterprise =
      await SERVICE.DefaultEnterpriseService.retrieveEnterprise(
        previous.entCode,
      );
    if (
      !currentEnterprise.active ||
      !currentEnterprise.tenant ||
      currentEnterprise.tenant.active === false ||
      currentEnterprise.tenant.code !== previous.tenant
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_IDENTITY");
    const freshAnchor = await owner.actor(request);
    await owner.credential(freshAnchor);
    if (!previous.sessionContext)
      await this.assertEmployeeRegistrationSession(
        freshAnchor.person,
        currentEnterprise,
      );
    if (
      owner.digest(freshAnchor.identity) !==
      owner.digest(prepared.context.anchor.identity)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_IDENTITY");
    const { context, item } = prepared;
    const person = context.person;
    const session = {
      authorizationPolicyVersion:
        SERVICE.DefaultAuthSecurityService.getAuthorizationPolicyVersion(),
      entCode: item.enterpriseCode,
      tenant: item.tenantCode,
      loginId: person.loginId,
      type: "Employee",
      principalType: "human",
      authVersion: person.authVersion || 1,
      userGroups: this.resolveSessionUserGroups(person),
      permissions:
        person.userGroupPermissions ||
        UTILS.getUserGroupPermissions(person.userGroups),
      sessionContext: context.sessionContext,
      securityBindings: context.securityBindings,
      authenticationMethod: previous.authenticationMethod,
    };
    await owner.validateContext(session);
    const refreshToken = await this.createRefreshToken(session);
    try {
      const authToken = this.generateAuthToken(session);
      await SERVICE.DefaultPrincipalSecurityStampService.register(
        session.tenant,
        session.loginId,
        session.authVersion,
      );
      await this.recordAuthEvent({
        eventType: "enterprise_context.switch",
        outcome: "success",
        tenant: session.tenant,
        entCode: session.entCode,
        principalId: session.loginId,
        tokenType: "access",
      });
      await owner.validateContext(session);
      return {
        authToken,
        refreshToken,
        loginId: session.loginId,
        enterpriseCode: session.entCode,
      };
    } catch (error) {
      await this.removeToken(moduleName, refreshToken);
      throw error;
    }
  },
  /** Revalidates initial registration readiness without creating another session or identity authority. */
  assertEmployeeRegistrationSession: async function (person, enterprise) {
    if (!person || !person.registrationAssignmentCode) return;
    const registration = SERVICE.DefaultEnterpriseRegistrationService;
    if (
      !registration ||
      typeof registration.assertSessionEligible !== "function"
    ) {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    }
    await registration.assertSessionEligible({ person, enterprise });
  },

  /** Returns effective group codes from persisted principal groups and framework governance defaults. */
  resolveSessionUserGroups: function (person) {
    const directGroups =
      person && person.userGroupCodes
        ? person.userGroupCodes
        : UTILS.getUserGroupCodes(person && person.userGroups);
    const identityGovernance = CONFIG.get("identityGovernance") || {};
    const groupTargets =
      identityGovernance.migration && identityGovernance.migration.groupTargets
        ? identityGovernance.migration.groupTargets
        : {};
    const resolved = [];
    const visited = {};
    const visit = (group) => {
      const code = typeof group === "string" ? group : group && group.code;
      if (!code || visited[code]) return;
      visited[code] = true;
      resolved.push(code);
      const modelParents =
        group && typeof group === "object" && Array.isArray(group.parentGroups)
          ? group.parentGroups
          : [];
      const targetParents =
        groupTargets[code] && Array.isArray(groupTargets[code].parentGroups)
          ? groupTargets[code].parentGroups
          : [];
      modelParents.concat(targetParents).forEach((parent) => visit(parent));
    };
    (directGroups || []).forEach((group) => visit(group));
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
    let audit =
      (CONFIG.get("authSecurity") && CONFIG.get("authSecurity").audit) || {};
    return SERVICE.DefaultAuthAuditService.record(event).catch((error) => {
      if (audit.failClosed === true) throw error;
      this.LOG.error("Authentication audit recording failed", error);
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
      model: options.state,
    })
      .then((success) => {
        _self.LOG.debug("State data has been updated with current time");
        return success;
      })
      .catch((error) => {
        _self.LOG.error(
          "While updating Active data with current time : ",
          error,
        );
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
    let threshold = CONFIG.get("attemptsToLockAccount") || 5;
    options.state.attempts = (options.state.attempts || 0) + 1;
    if (options.state.attempts >= threshold) {
      options.state.locked = true;
      options.state.lockedTime = new Date();
    }
    return this.updateAuthData(options);
  },

  /** Resolves a fresh original-owner Password before proof comparison; embedded cached hashes and wrong-owner references never authenticate. @param {Object} options Owner-resolved authentication coordinates. @returns {Promise<Object>} Existing canonical credential or content-free rejection. */
  resolvePasswordCredential: function (options) {
    if (options.membershipContext)
      return SERVICE.DefaultEnterpriseMembershipService.credential(
        options.membershipContext.anchor,
      );
    if (options.person && options.person.authenticationIdentity)
      return Promise.reject(new CLASSES.NodicsError("ERR_AUTH_00001"));
    const owner = SERVICE.DefaultPasswordSaveInterceptorService;
    if (typeof owner?.readPrincipalCredential !== "function")
      return Promise.reject(new CLASSES.NodicsError("ERR_AUTH_00001"));
    return owner
      .readPrincipalCredential(
        options.enterprise.tenant.code,
        options.person,
        options.type,
      )
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_AUTH_00001");
      });
  },

  /**

     * Executes authenticate apikey behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

  authenticateAPIKey: function (request) {
    return new Promise((resolve, reject) => {
      SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode)
        .then((enterprise) => {
          SERVICE.DefaultEmployeeService.findByAPIKey({
            tenant: enterprise.tenant.code,
            apiKey: request.apiKey,
          })
            .then((employee) => {
              return this.recordAuthEvent({
                eventType: "api_key.authentication",
                outcome: "success",
                tenant: enterprise.tenant.code,
                entCode: enterprise.code,
                principalId: employee.loginId,
              }).then(() =>
                resolve({
                  enterprise: enterprise,
                  person: employee,
                  tenant: enterprise.tenant.code,
                }),
              );
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
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
      SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode)
        .then((enterprise) => {
          SERVICE.DefaultEmployeeService.findByLoginId({
            tenant: enterprise.tenant.code,
            loginId: request.loginId,
            options: { recursive: false, skipItemCache: true },
          })
            .then((employee) => {
              _self
                .authenticate({
                  request: request,
                  enterprise: enterprise,
                  person: employee,
                  type: "Employee",
                })
                .then((success) => {
                  resolve({
                    code: "SUC_AUTH_00001",
                    result: success,
                  });
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
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
      SERVICE.DefaultEnterpriseService.retrieveEnterprise(request.entCode)
        .then((enterprise) => {
          SERVICE.DefaultCustomerService.findByLoginId({
            tenant: enterprise.tenant.code,
            loginId: request.loginId,
            options: { recursive: false, skipItemCache: true },
          })
            .then((customer) => {
              _self
                .authenticate({
                  request: request,
                  enterprise: enterprise,
                  person: customer,
                  type: "Customer",
                })
                .then((success) => {
                  resolve({
                    code: "SUC_AUTH_00001",
                    result: success,
                  });
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
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

  /** Resolves Profile-owned context before choosing the credential or lockout tenant. @param {Object} options Fresh target account. @returns {Promise<Object|null>} Qualified context or legacy. */
  resolveMembershipContext: async function (options) {
    const owner = SERVICE.DefaultEnterpriseMembershipService;
    if (owner && owner.enabled())
      return owner.sessionContext(
        options.person,
        options.enterprise,
        options.type,
      );
    if (options.person.authenticationIdentity)
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    return null;
  },

  /** Prepares a native customer context only inside a verified issuer/retained-refresh path, using fresh existing identity, group and lockout owners. @param {Object} options Owner-verified person/enterprise coordinates. @returns {Promise<Object>} Private live context with original account state. */
  prepareNativeCustomerContext: async function (options) {
    const context =
      await SERVICE.DefaultCustomerRegistrationService.prepareCustomerEligibilityContext(
        options.person,
        options.enterprise,
      );
    context.anchor.state = await SERVICE.DefaultUserStateService.findUserState({
      tenant: context.anchor.identity.tenantCode,
      loginId: context.anchor.person.loginId,
      _id: context.anchor.person._id,
    });
    if (!context.anchor.state || context.anchor.state.locked)
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    const groups = await SERVICE.DefaultEnterpriseMembershipService.groups(
      context.anchor.identity.tenantCode,
      this.resolveSessionUserGroups(context.person),
    );
    context.person = {
      ...context.person,
      userGroups: groups,
      userGroupCodes: undefined,
      userGroupPermissions: undefined,
    };
    return context;
  },

  /** Compares password proof at the canonical credential/lockout owner, then delegates context-bound issuance. @param {Object} options Target account and submitted proof. @returns {Promise<Object>} Issued tokens or rejection. */
  authenticate: async function (options) {
    options.membershipContext = await this.resolveMembershipContext(options);
    let _self = this;
    return new Promise((resolve, reject) => {
      try {
        const anchor =
          options.membershipContext && options.membershipContext.anchor;
        const stateTenant = anchor
          ? anchor.identity.tenantCode
          : options.enterprise.tenant.code;
        (anchor
          ? Promise.resolve(anchor.state)
          : SERVICE.DefaultUserStateService.findUserState({
              tenant: stateTenant,
              loginId: options.person.loginId,
              _id: options.person._id,
            })
        )
          .then((state) =>
            this.resolvePasswordCredential(options).then(
              (passwordCredential) => {
                if (passwordCredential && !options.membershipContext)
                  options.person.password = passwordCredential;
                if (
                  state.locked ||
                  !options.person.active ||
                  !passwordCredential ||
                  passwordCredential.active === false ||
                  typeof options.request.password !== "string" ||
                  typeof passwordCredential.password !== "string" ||
                  options.person.principalType === "service"
                ) {
                  reject(new CLASSES.NodicsError("ERR_LIN_00002"));
                } else {
                  UTILS.compareHash(
                    options.request.password,
                    passwordCredential.password,
                  )
                    .then((match) => {
                      if (match) {
                        _self
                          .issueSession(
                            options,
                            state,
                            "password.authentication",
                          )
                          .then(resolve)
                          .catch(reject);
                      } else {
                        _self
                          .updateFailedAuthData({
                            state: state,
                            tenant: stateTenant,
                          })
                          .then(() => {
                            _self
                              .recordAuthEvent({
                                eventType: "password.authentication",
                                outcome: "failure",
                                tenant: options.enterprise.tenant.code,
                                entCode: options.enterprise.code,
                                principalId: options.person.loginId,
                                reasonCode: "INVALID_CREDENTIALS",
                              })
                              .then(() =>
                                reject(
                                  new CLASSES.NodicsError(
                                    "ERR_AUTH_00002",
                                    "Invalid login attempt",
                                  ),
                                ),
                              )
                              .catch(reject);
                          })
                          .catch((error) => {
                            reject(
                              new CLASSES.NodicsError(
                                error,
                                "Could not persist failed login state",
                                "ERR_AUTH_00000",
                              ),
                            );
                          });
                      }
                    })
                    .catch((error) => {
                      reject(new CLASSES.NodicsError("ERR_AUTH_00000"));
                    });
                }
              },
            ),
          )
          .catch((error) => {
            reject(new CLASSES.NodicsError("ERR_AUTH_00000"));
          });
      } catch (error) {
        reject(new CLASSES.NodicsError("ERR_AUTH_00000"));
      }
    });
  },

  /** Issues tokens after an owning authentication method has verified proof and account eligibility. @param {object} options Fresh enterprise/person/type. @param {object} state Profile account state. @param {string} eventType Stable audit event. @returns {Promise<object>} Access/refresh pair; persists last attempt, refresh state, security stamp and audit. */
  issueSession: async function (options, state, eventType) {
    const authorizationPolicyVersion =
      SERVICE.DefaultAuthSecurityService.getAuthorizationPolicyVersion();
    let context = await this.resolveMembershipContext(options);
    const nativeCustomer =
      !context &&
      options.type === "Customer" &&
      (CONFIG.get("profileCustomerEligibility") || {})
        .nativeSessionQualified === true;
    if (nativeCustomer) {
      if (
        ![
          "password.authentication",
          "external_identity.authentication",
        ].includes(eventType)
      )
        throw new CLASSES.NodicsError("ERR_AUTH_00001");
      context = await this.prepareNativeCustomerContext(options);
      state = context.anchor.state;
    }
    const person = context ? context.person : options.person,
      enterprise = options.enterprise;
    if (
      !enterprise.active ||
      !enterprise.tenant ||
      enterprise.tenant.active === false ||
      !person.active ||
      person.principalType === "service" ||
      state.locked ||
      (!context && (!person.password || person.password.active === false))
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    if (
      context &&
      !nativeCustomer &&
      (eventType !== "password.authentication" ||
        !options.membershipContext ||
        SERVICE.DefaultEnterpriseMembershipService.digest(
          context.securityBindings,
        ) !==
          SERVICE.DefaultEnterpriseMembershipService.digest(
            options.membershipContext.securityBindings,
          ))
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    if (!context)
      await this.assertEmployeeRegistrationSession(person, enterprise);
    const session = {
      authorizationPolicyVersion,
      entCode: enterprise.code,
      tenant: enterprise.tenant.code,
      loginId: person.loginId,
      type: options.type,
      principalType: person.principalType,
      authVersion: person.authVersion || 1,
      tokenLife: person.tokenLife,
      userGroups: this.resolveSessionUserGroups(person),
      permissions:
        person.userGroupPermissions ||
        UTILS.getUserGroupPermissions(person.userGroups),
    };
    if (context)
      Object.assign(session, {
        sessionContext: context.sessionContext,
        securityBindings: context.securityBindings,
      });
    if (
      eventType === "password.authentication" &&
      ["human", "customer"].includes(session.principalType)
    )
      session.authenticationMethod = "PASSWORD";
    if (eventType === "external_identity.authentication")
      session.authenticationMethod = "EXTERNAL";
    if (options.externalIdentityLinkCode !== undefined) {
      if (
        eventType !== "external_identity.authentication" ||
        session.principalType !== "customer" ||
        session.type !== "Customer" ||
        !/^EID_[a-f0-9]{64}$/.test(options.externalIdentityLinkCode)
      )
        throw new CLASSES.NodicsError("ERR_AUTH_00001");
      session.externalIdentityLinkCode = options.externalIdentityLinkCode;
    }
    state.attempts = 0;
    await this.updateAuthData({
      state,
      tenant: context ? context.anchor.identity.tenantCode : session.tenant,
    });
    if (nativeCustomer)
      for (const binding of context.securityBindings)
        await SERVICE.DefaultPrincipalSecurityStampService.register(
          binding.tenant,
          binding.principalId,
          binding.authVersion,
        );
    const refreshToken = await this.createRefreshToken(session);
    try {
      const authToken = this.generateAuthToken(session);
      await SERVICE.DefaultPrincipalSecurityStampService.register(
        session.tenant,
        session.loginId,
        session.authVersion,
      );
      await this.recordAuthEvent({
        eventType,
        outcome: "success",
        tenant: session.tenant,
        entCode: session.entCode,
        principalId: session.loginId,
        tokenType: "access",
      });
      if (context)
        await SERVICE.DefaultEnterpriseMembershipService.validateContext(
          session,
        );
      else await this.assertEmployeeRegistrationSession(person, enterprise);
      return { authToken, refreshToken };
    } catch (error) {
      await this.removeToken(
        CONFIG.get("profileModuleName") || "profile",
        refreshToken,
      );
      throw error;
    }
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
        SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(options);
        const authorizationPolicyVersion =
          SERVICE.DefaultAuthSecurityService.getAuthorizationPolicyVersion();
        let refreshToken = crypto.randomBytes(48).toString("base64url");
        let security = CONFIG.get("authSecurity") || {};
        let refreshPolicy = security.refreshToken || {};
        this.addToken(
          CONFIG.get("profileModuleName") || "profile",
          true,
          refreshToken,
          {
            entCode: options.entCode,
            tenant: options.tenant,
            loginId: options.loginId,
            type: options.type,
            principalType: options.principalType,
            authVersion: options.authVersion,
            authorizationPolicyVersion,
            userGroups: options.userGroups,
            permissions: options.permissions,
            ...(options.securityBindings
              ? { securityBindings: options.securityBindings }
              : {}),
            ...(options.sessionContext
              ? { sessionContext: options.sessionContext }
              : {}),
            ...(options.authenticationMethod
              ? {
                  authenticationMethod: options.authenticationMethod,
                }
              : {}),
            ...(options.externalIdentityLinkCode
              ? {
                  externalIdentityLinkCode: options.externalIdentityLinkCode,
                }
              : {}),
          },
          refreshPolicy.expiresInSeconds,
        )
          .then((success) => {
            resolve(refreshToken);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(new CLASSES.NodicsError("ERR_AUTH_00000"));
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
      return Promise.reject(
        new CLASSES.NodicsError("ERR_AUTH_00002", "Refresh token is required"),
      );
    }
    let moduleName = CONFIG.get("profileModuleName") || "profile";
    return this.consumeToken(moduleName, refreshToken).then((session) => {
      SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(
        session || {},
      );
      if (
        !session ||
        !session.tenant ||
        !session.loginId ||
        (request.type && request.type !== session.type)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00001",
          "Refresh session is invalid",
        );
      }
      if (request.entCode && request.entCode !== session.entCode) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00001",
          "Refresh session enterprise is mismatched",
        );
      }
      return SERVICE.DefaultEnterpriseService.retrieveEnterprise(
        session.entCode,
      )
        .then((enterprise) => {
          if (
            !enterprise.active ||
            !enterprise.tenant ||
            enterprise.tenant.active === false ||
            enterprise.tenant.code !== session.tenant
          ) {
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00001",
              "Refresh session enterprise is inactive or mismatched",
            );
          }
          let finder =
            session.type === "Customer"
              ? SERVICE.DefaultCustomerService
              : SERVICE.DefaultEmployeeService;
          return finder.findByLoginId({
            tenant: session.tenant,
            loginId: session.loginId,
            options: { recursive: false, skipItemCache: true },
          });
        })
        .then(async (person) => {
          let context;
          if (session.sessionContext) {
            const owner = SERVICE.DefaultEnterpriseMembershipService;
            if (!owner) throw new CLASSES.NodicsError("ERR_AUTH_00001");
            await owner.validateContext(session);
            const contextOptions = {
              person,
              enterprise: {
                code: session.entCode,
                tenant: { code: session.tenant },
              },
              type: session.type,
            };
            context =
              session.sessionContext.owner === "profile.customerEligibility"
                ? await _self.prepareNativeCustomerContext(contextOptions)
                : await _self.resolveMembershipContext(contextOptions);
            if (!context) throw new CLASSES.NodicsError("ERR_AUTH_00001");
            person = context.person;
          } else if (person.authenticationIdentity)
            throw new CLASSES.NodicsError("ERR_AUTH_00001");
          const state = context
            ? context.anchor.state
            : await SERVICE.DefaultUserStateService.findUserState({
                tenant: session.tenant,
                loginId: person.loginId,
                _id: person._id,
              });
          const credential = context
            ? await SERVICE.DefaultEnterpriseMembershipService.credential(
                context.anchor,
              )
            : await _self.resolvePasswordCredential({
                person,
                type: session.type,
                enterprise: { tenant: { code: session.tenant } },
              });
          if (
            state.locked ||
            !credential ||
            credential.active === false ||
            !person.active ||
            person.principalType === "service"
          ) {
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00001",
              "Refresh principal is inactive or not eligible",
            );
          }
          if (String(session.authVersion) !== String(person.authVersion || 1)) {
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00001",
              "Refresh session security stamp is stale",
            );
          }
          if (!context)
            await _self.assertEmployeeRegistrationSession(person, {
              code: session.entCode,
              tenant: { code: session.tenant },
            });
          if (session.externalIdentityLinkCode) {
            await SERVICE.DefaultExternalIdentityService.validateSessionBinding(
              session,
            );
          }
          session.userGroups = _self.resolveSessionUserGroups(person);
          session.permissions =
            person.userGroupPermissions ||
            UTILS.getUserGroupPermissions(person.userGroups);
          session.principalType = person.principalType;
          return _self.createRefreshToken(session);
        })
        .then(async (nextRefreshToken) => {
          try {
            if (session.sessionContext)
              await SERVICE.DefaultEnterpriseMembershipService.validateContext(
                session,
              );
            let result = {
              authToken: _self.generateAuthToken({
                entCode: session.entCode,
                tenant: session.tenant,
                loginId: session.loginId,
                principalType: session.principalType,
                authVersion: session.authVersion,
                authorizationPolicyVersion: session.authorizationPolicyVersion,
                userGroups: session.userGroups,
                permissions: session.permissions,
                ...(session.securityBindings
                  ? { securityBindings: session.securityBindings }
                  : {}),
                ...(session.sessionContext
                  ? { sessionContext: session.sessionContext }
                  : {}),
                ...(session.authenticationMethod
                  ? {
                      authenticationMethod: session.authenticationMethod,
                    }
                  : {}),
                ...(session.externalIdentityLinkCode
                  ? {
                      externalIdentityLinkCode:
                        session.externalIdentityLinkCode,
                    }
                  : {}),
              }),
              refreshToken: nextRefreshToken,
              loginId: session.loginId,
            };
            const issued = await _self
              .recordAuthEvent({
                eventType: "refresh_token.rotation",
                outcome: "success",
                tenant: session.tenant,
                entCode: session.entCode,
                principalId: session.loginId,
                tokenType: "refresh",
              })
              .then(() => result);
            if (session.sessionContext)
              await SERVICE.DefaultEnterpriseMembershipService.validateContext(
                session,
              );
            return issued;
          } catch (error) {
            await _self.removeToken(
              CONFIG.get("profileModuleName") || "profile",
              nextRefreshToken,
            );
            throw new CLASSES.NodicsError("ERR_AUTH_00001");
          }
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
      operations.push(
        this.removeToken(
          CONFIG.get("profileModuleName") || "profile",
          request.refreshToken,
        ),
      );
    }
    return Promise.all(operations)
      .then(() =>
        this.recordAuthEvent({
          eventType: "session.logout",
          outcome: "success",
          tenant: request.authData && request.authData.tenant,
          entCode: request.authData && request.authData.entCode,
          principalId:
            request.authData &&
            (request.authData.loginId || request.authData.serviceId),
        }),
      )
      .then(() => true);
  },
};
