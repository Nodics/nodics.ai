/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");
const { v4: uuid } = require("uuid");

const INSECURE_SECRETS = ["nodics", "secret", "password", "changeme"];
const INSECURE_BOOTSTRAP_VALUES = [
  "nodics",
  "admin",
  "apiadmin",
  "password",
  "secret",
  "changeme",
  "change-me",
];

/**
 * @module nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService
 * @description Implements nAuth token security configuration, JWT option, and payload construction behavior.
 * @layer service
 * @owner nAuth
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Copies bounded JSON-only verified claims and freezes every nested value before invoking an owning validator. @param {Object} payload Verified claims. @returns {Object} Detached immutable claims. */
  cloneAuthorizationClaims: function (payload) {
    let nodes = 0,
      characters = 0;
    const inspect = (value, depth) => {
      if (++nodes > 4096 || depth > 16) throw new Error("Unbounded claims");
      if (value === null || typeof value === "boolean") return;
      if (typeof value === "string") {
        characters += value.length;
        if (characters > 65536) throw new Error("Unbounded claims");
        return;
      }
      if (typeof value === "number" && Number.isFinite(value)) return;
      if (
        !value ||
        typeof value !== "object" ||
        (Array.isArray(value)
          ? Object.getPrototypeOf(value) !== Array.prototype
          : ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
      )
        throw new Error("Non-JSON claims");
      const descriptors = Object.getOwnPropertyDescriptors(value),
        keys = Object.keys(descriptors);
      if (Reflect.ownKeys(value).length !== keys.length || keys.length > 257)
        throw new Error("Unbounded claims");
      if (Array.isArray(value)) {
        if (value.length > 256 || keys.length !== value.length + 1)
          throw new Error("Non-JSON claims");
        for (let index = 0; index < value.length; index++) {
          const descriptor = descriptors[index];
          if (
            !descriptor ||
            descriptor.enumerable !== true ||
            !Object.hasOwn(descriptor, "value")
          )
            throw new Error("Non-JSON claims");
          inspect(descriptor.value, depth + 1);
        }
      } else {
        for (const key of keys) {
          const descriptor = descriptors[key];
          characters += key.length;
          if (
            characters > 65536 ||
            descriptor.enumerable !== true ||
            !Object.hasOwn(descriptor, "value")
          )
            throw new Error("Non-JSON claims");
          inspect(descriptor.value, depth + 1);
        }
      }
    };
    inspect(payload, 0);
    const json = JSON.stringify(payload);
    if (Buffer.byteLength(json, "utf8") > 65536)
      throw new Error("Unbounded claims");
    const freeze = (value) => {
      if (value && typeof value === "object") {
        for (const nested of Object.values(value)) freeze(nested);
        Object.freeze(value);
      }
      return value;
    };
    return freeze(JSON.parse(json));
  },
  /**
   * Requires current capability-owner admission for a signed session context;
   * stamps alone never establish live consent or membership authority.
   * @param {Object} payload Verified JWT payload, after stamp validation.
   * @param {string} [authToken] Original transient signed credential for an authenticated remote owner; never copied into claims, logs or errors.
   * @returns {Promise<boolean>} True only for contextless payloads or exact qualified owner proof.
   * @throws {NodicsError} Stable ERR_AUTH_00001 without private validator error material.
   */
  validateAuthorizationContext: async function (payload, authToken) {
    try {
      if (payload.sessionContext === undefined) {
        if(!["human","customer"].includes(payload.principalType))return true;
        const policy = (CONFIG.get("authSecurity") || {}).sessionContextValidation;
        if(policy?.qualified === true && policy.requiredPrincipalTypes !== undefined){
          if(!Array.isArray(policy.requiredPrincipalTypes) || policy.requiredPrincipalTypes.length>2 ||
            policy.requiredPrincipalTypes.some(value=>!["human","customer"].includes(value)))throw new Error("Invalid required context policy");
          if(policy.requiredPrincipalTypes.includes(payload.principalType))throw new Error("Missing required person context");
        }
        return true;
      }
      const context = payload.sessionContext;
      if (
        !context ||
        typeof context !== "object" ||
        Array.isArray(context) ||
        Object.keys(context).sort().join(",") !== "code,owner,version" ||
        typeof context.owner !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(context.owner) ||
        typeof context.code !== "string" ||
        !/^[A-Za-z0-9_.:-]{1,192}$/.test(context.code) ||
        !Number.isSafeInteger(context.version) ||
        context.version < 1 ||
        payload.tokenType !== "access" ||
        !["human", "customer"].includes(payload.principalType) ||
        payload.securityBindings === undefined
      )
        throw new Error("Invalid context");
      // Capture signed coordinates before awaiting the selected owner.
      const { owner, code, version } = context;
      const policy = (CONFIG.get("authSecurity") || {})
        .sessionContextValidation;
      if (
        policy?.qualified !== true ||
        typeof policy.validatorService !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(policy.validatorService)
      )
        throw new Error("Unavailable validator");
      const validator = SERVICE[policy.validatorService];
      if (typeof validator?.validate !== "function")
        throw new Error("Unavailable validator");
      const proof = await validator.validate(
        this.cloneAuthorizationClaims(payload),
        authToken,
      );
      if (
        payload.sessionContext !== context ||
        context.owner !== owner ||
        context.code !== code ||
        context.version !== version ||
        Object.keys(context).sort().join(",") !== "code,owner,version" ||
        !proof ||
        typeof proof !== "object" ||
        Array.isArray(proof) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(proof)) ||
        Reflect.ownKeys(proof).length !== 4 ||
        Object.keys(proof).sort().join(",") !== "code,owner,valid,version" ||
        proof.valid !== true ||
        proof.owner !== owner ||
        proof.code !== code ||
        proof.version !== version
      )
        throw new Error("Unconfirmed context");
      return true;
    } catch (_) {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    }
  },
  /** Resolves the explicitly governed deployment-wide policy epoch; qualification and rollout remain operator gates. */
  getAuthorizationPolicyVersion: function () {
    const policy = (CONFIG.get("authSecurity") || {}).authorizationPolicy || {};
    if (policy.enabled !== true) return undefined;
    if (
      policy.qualified !== true ||
      !Number.isSafeInteger(policy.version) ||
      policy.version < 1 ||
      policy.version > 2147483647
    )
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00001",
        "Authorization policy epoch is unqualified",
      );
    return policy.version;
  },
  /** Denies access and retained refresh proofs from a prior policy epoch, independently of legacy stamp exceptions. */
  validateAuthorizationPolicy: function (payload) {
    const version = this.getAuthorizationPolicyVersion();
    if (version !== undefined && payload.authorizationPolicyVersion !== version)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00001",
        "Authorization policy proof is stale",
      );
    return true;
  },
  /**
   * Reads a configuration value from the active layered configuration object.
   *
   * @param {*} config Layered configuration facade.
   * @param {string} key Configuration key.
   * @returns {*} Configured value.
   */
  read: function (config, key) {
    return config && typeof config.get === "function"
      ? config.get(key)
      : undefined;
  },

  /**
   * Resolves effective authentication security configuration.
   *
   * @param {*} config Layered configuration facade.
   * @returns {Object} Effective security configuration.
   */
  getSecurityConfiguration: function (config) {
    const configuration = this.read(config, "authSecurity");
    if (
      !configuration ||
      !configuration.jwt ||
      !configuration.compatibility ||
      !configuration.bootstrapIdentity
    ) {
      throw new Error(
        "Layered authentication security configuration is incomplete",
      );
    }
    return _.merge({}, configuration);
  },

  /**
   * Resolves and validates bootstrap identity credentials from layered configuration.
   *
   * @param {*} config Layered configuration facade.
   * @returns {Object} Validated bootstrap identity values.
   * @throws {Error} When required bootstrap credentials or their declared source are unsafe.
   */
  validateBootstrapIdentity: function (config) {
    const security = this.getSecurityConfiguration(config);
    const policy = security.bootstrapIdentity || {};
    const identity = this.read(config, "bootstrapIdentity") || {};
    if (policy.required === false && !identity.source) {
      return identity;
    }
    const source = identity.source;
    const allowedSources = [].concat(policy.allowedSources || []);
    const localSources = [].concat(policy.localSources || []);
    const localSource = localSources.indexOf(source) >= 0;
    if (!source || (allowedSources.indexOf(source) < 0 && !localSource)) {
      throw new Error(
        "Bootstrap identity source must be declared through bootstrapIdentity.source",
      );
    }
    if (
      localSource &&
      security.compatibility.allowLocalBootstrapIdentity !== true
    ) {
      throw new Error(
        "Local bootstrap identity sources are disabled outside explicit local/test configuration",
      );
    }
    this.validateBootstrapSecretValue(
      "adminPassword",
      identity.adminPassword,
      policy.minimumPasswordLength,
      security,
    );
    this.validateBootstrapSecretValue(
      "servicePassword",
      identity.servicePassword,
      policy.minimumPasswordLength,
      security,
    );
    this.validateBootstrapSecretValue(
      "serviceApiKey",
      identity.serviceApiKey,
      policy.minimumApiKeyLength,
      security,
    );
    if (identity.adminPassword === identity.servicePassword) {
      throw new Error(
        "Bootstrap admin and service passwords must be different",
      );
    }
    return identity;
  },

  /**
   * Validates one bootstrap credential value.
   *
   * @param {string} name Credential name.
   * @param {string} value Credential value.
   * @param {number} minimumLength Required minimum length.
   * @param {Object} security Effective auth security configuration.
   * @returns {void}
   */
  validateBootstrapSecretValue: function (
    name,
    value,
    minimumLength,
    security,
  ) {
    const normalized = typeof value === "string" ? value.toLowerCase() : "";
    const insecure =
      typeof value !== "string" ||
      value.length < minimumLength ||
      INSECURE_BOOTSTRAP_VALUES.indexOf(normalized) >= 0 ||
      normalized.indexOf("change-me") >= 0;
    if (
      insecure &&
      security.compatibility.allowLocalBootstrapIdentity !== true
    ) {
      throw new Error(
        "A strong bootstrap " +
          name +
          " must be supplied through governed bootstrapIdentity configuration",
      );
    }
  },

  /**
   * Resolves and validates the JWT secret from layered configuration.
   *
   * @param {*} config Layered configuration facade.
   * @returns {string} JWT secret.
   */
  getJwtSecret: function (config) {
    const security = this.getSecurityConfiguration(config);
    const secret = security.jwt.secret || this.read(config, "jwtSecretKey");
    const insecure =
      typeof secret !== "string" ||
      secret.length < security.jwt.minimumSecretLength ||
      INSECURE_SECRETS.includes(secret.toLowerCase());
    if (
      insecure &&
      security.compatibility.allowInsecureDevelopmentSecret !== true
    ) {
      throw new Error(
        "A strong JWT secret must be supplied through layered authSecurity.jwt.secret configuration",
      );
    }
    return secret;
  },

  /**
   * Builds JWT signing options for human and service tokens.
   *
   * @param {*} config Layered configuration facade.
   * @param {Object} options Token request options.
   * @returns {Object} JWT signing options.
   */
  getSignOptions: function (config, options) {
    const security = this.getSecurityConfiguration(config);
    const profile = this.read(config, "profile") || {};
    const tokenType =
      options.tokenType || (options.serviceId ? "service" : "access");
    const signOptions = _.merge(
      {},
      profile.jwtSignOptions || {},
      security.jwt.signOptions || {},
    );
    signOptions.algorithm = signOptions.algorithm || security.jwt.algorithms[0];
    signOptions.issuer = signOptions.issuer || security.jwt.issuer;
    signOptions.audience =
      options.audience || signOptions.audience || security.jwt.audience;
    signOptions.jwtid = options.jti || uuid();
    signOptions.subject =
      options.subject || options.loginId || options.serviceId || tokenType;
    if (options.tokenLife) {
      signOptions.expiresIn = options.tokenLife;
    } else if (!signOptions.expiresIn) {
      signOptions.expiresIn =
        tokenType === "service"
          ? security.jwt.serviceTokenExpiresIn
          : security.jwt.accessTokenExpiresIn;
    }
    if (options.lifetime === true) {
      if (security.compatibility.allowNonExpiringTokens !== true) {
        throw new Error("Non-expiring authentication tokens are disabled");
      }
      delete signOptions.expiresIn;
    }
    return signOptions;
  },

  /**
   * Builds JWT verification options from layered auth configuration.
   *
   * @param {*} config Layered configuration facade.
   * @returns {Object} JWT verification options.
   */
  getVerifyOptions: function (config, options) {
    options = options || {};
    const security = this.getSecurityConfiguration(config);
    const profile = this.read(config, "profile") || {};
    const verifyOptions = _.merge(
      {},
      profile.jwtVerifyOptions || {},
      security.jwt.verifyOptions || {},
    );
    if (verifyOptions.algorithm && !verifyOptions.algorithms) {
      verifyOptions.algorithms = Array.isArray(verifyOptions.algorithm)
        ? verifyOptions.algorithm
        : [verifyOptions.algorithm];
    }
    delete verifyOptions.algorithm;
    verifyOptions.algorithms =
      verifyOptions.algorithms || security.jwt.algorithms;
    verifyOptions.issuer = verifyOptions.issuer || security.jwt.issuer;
    verifyOptions.audience =
      options.audience || verifyOptions.audience || security.jwt.audience;
    return verifyOptions;
  },

  /**
   * Resolves the audience that a browser access token must carry for one
   * directly called module. This does not apply to service or Cron tokens.
   *
   * @param {*} config Layered configuration facade.
   * @param {string} moduleName Target module name.
   * @returns {string} Stable module audience.
   */
  getBrowserAudience: function (config, moduleName) {
    const security = this.getSecurityConfiguration(config);
    const browser = security.browserAccess || {};
    const normalized = String(moduleName || "").trim();
    const pattern = new RegExp(
      browser.moduleNamePattern || "^[A-Za-z][A-Za-z0-9_-]{0,127}$",
    );
    if (!pattern.test(normalized)) {
      throw new Error(
        "A valid target module is required for browser access tokens",
      );
    }
    const configured = browser.moduleAudiences || {};
    return (
      configured[normalized] ||
      String(browser.audiencePrefix || "nodics-module:") + normalized
    );
  },

  /**
   * Builds the token payload while excluding credential material.
   *
   * @param {Object} options Token request options.
   * @returns {Object} JWT payload.
   */
  buildPayload: function (options) {
    const authorizationPolicyVersion = this.getAuthorizationPolicyVersion();
    if (
      options.authorizationPolicyVersion !== undefined &&
      options.authorizationPolicyVersion !== authorizationPolicyVersion
    )
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00001",
        "Authorization policy changed during issuance",
      );
    const tokenType =
      options.tokenType || (options.serviceId ? "service" : "access");
    const payload = {
      entCode: options.entCode,
      tenant: options.tenant,
      tokenType: tokenType,
    };
    if (options.loginId) payload.loginId = options.loginId;
    if (authorizationPolicyVersion !== undefined)
      payload.authorizationPolicyVersion = authorizationPolicyVersion;
    if (options.serviceId) payload.serviceId = options.serviceId;
    if (options.runtimeInstanceId)
      payload.runtimeInstanceId = options.runtimeInstanceId;
    if (options.runtimeScope) {
      if (
        tokenType !== "service" ||
        !options.runtimeInstanceId ||
        options.runtimeScope.instanceCode !== options.runtimeInstanceId
      ) {
        throw new Error("Runtime scope requires a bound service instance");
      }
      const keys = [
        "projectCode",
        "environmentCode",
        "serverCode",
        "instanceCode",
        "assignmentCode",
      ];
      if (
        Object.keys(options.runtimeScope).length !== keys.length ||
        keys.some(
          (key) =>
            typeof options.runtimeScope[key] !== "string" ||
            !/^[A-Za-z][A-Za-z0-9_.:-]{0,191}$/.test(options.runtimeScope[key]),
        )
      ) {
        throw new Error("Runtime scope requires bounded approved coordinates");
      }
      payload.runtimeScope = Object.fromEntries(
        keys.map((key) => [key, options.runtimeScope[key]]),
      );
    }
    if (Array.isArray(options.modules) && options.modules.length > 0)
      payload.modules = options.modules.slice();
    if (options.principalType) payload.principalType = options.principalType;
    if (options.userGroups && options.userGroups.length > 0)
      payload.userGroups = options.userGroups;
    if (options.permissions && options.permissions.length > 0)
      payload.permissions = options.permissions;
    if (options.authVersion !== undefined)
      payload.authVersion = options.authVersion;
    if (options.securityBindings !== undefined) {
      if (
        tokenType !== "access" ||
        !["human", "customer"].includes(options.principalType)
      )
        throw new Error("Independent bindings require a person access token");
      payload.securityBindings =
        SERVICE.DefaultPrincipalSecurityStampService.normalizeBindings(
          options.securityBindings,
        );
    }
    if (options.sessionContext !== undefined) {
      const context = options.sessionContext;
      if (
        !payload.securityBindings ||
        !context ||
        Object.keys(context).sort().join(",") !== "code,owner,version" ||
        typeof context.owner !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(context.owner) ||
        typeof context.code !== "string" ||
        !/^[A-Za-z0-9_.:-]{1,192}$/.test(context.code) ||
        !Number.isSafeInteger(context.version) ||
        context.version < 1
      )
        throw new Error(
          "Session context requires bounded capability coordinates and independent bindings",
        );
      payload.sessionContext = {
        owner: context.owner,
        code: context.code,
        version: context.version,
      };
    }
    if (options.authenticationMethod !== undefined) {
      if (
        tokenType !== "access" ||
        !["human", "customer"].includes(options.principalType) ||
        !["PASSWORD", "EXTERNAL"].includes(options.authenticationMethod)
      )
        throw new Error("Unsupported person authentication method");
      payload.authenticationMethod = options.authenticationMethod;
    }
    // Profile supplies this opaque binding only after external proof succeeds.
    if (options.externalIdentityLinkCode !== undefined) {
      if (
        tokenType !== "access" ||
        options.principalType !== "customer" ||
        typeof options.externalIdentityLinkCode !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(options.externalIdentityLinkCode)
      ) {
        throw new Error(
          "External identity binding requires a customer access token and bounded link code",
        );
      }
      payload.externalIdentityLinkCode = options.externalIdentityLinkCode;
    }
    return payload;
  },
};
