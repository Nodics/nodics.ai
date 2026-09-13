/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require("node:crypto");

/**
 * @module profile/service/defaultExternalIdentityService
 * @description Owns verified external customer identities, durable links and session exchange through Profile's generated repository and authentication pipeline. HTTP bodies never select a principal, repository, secret or verifier.
 * @owner profile @layer service
 * @override Applications contribute provider/application configuration; later modules may decorate member methods while preserving proof, scope, concurrency and security-stamp checks. Writes links and authentication audit; rejects invalid or conflicting identity operations.
 */
module.exports = {
  /** Returns validated effective provider policy; default installations expose no configured application. */
  policy: function () {
    const policy = CONFIG.get("profileExternalIdentity") || {};
    if (
      policy.enabled !== true ||
      !Number.isSafeInteger(policy.maximumAssertionAgeSeconds) ||
      policy.maximumAssertionAgeSeconds < 1 ||
      !Number.isSafeInteger(policy.maximumAssertionCharacters) ||
      policy.maximumAssertionCharacters < 1 ||
      !Number.isSafeInteger(policy.clockSkewSeconds) ||
      policy.clockSkewSeconds < 0
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_UNAVAILABLE");
    return policy;
  },
  /** Resolves one configured application and verifies proof before any identity lookup. @param {object} request Trusted runtime envelope plus applicationCode/proof. */
  context: async function (request) {
    const policy = this.policy(),
      code = request.applicationCode;
    if (
      typeof code !== "string" ||
      !Object.hasOwn(policy.applications || {}, code)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const application = policy.applications[code];
    const provider = (policy.providers || {})[application.provider];
    if (
      !application.enabled ||
      !provider ||
      !provider.service ||
      application.enterpriseCode !== request.entCode
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const verifier = SERVICE[provider.service];
    if (!verifier || typeof verifier.verify !== "function")
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_UNAVAILABLE");
    const assertion = await verifier.verify({
      proof: request.proof,
      application,
      policy,
    });
    if (
      !assertion ||
      typeof assertion.subject !== "string" ||
      !assertion.subject ||
      assertion.subject.length > 256 ||
      typeof assertion.applicationSubject !== "string" ||
      !assertion.applicationSubject
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const enterprise =
      await SERVICE.DefaultEnterpriseService.retrieveEnterprise(
        request.entCode,
      );
    if (
      !enterprise.active ||
      !enterprise.tenant ||
      enterprise.tenant.active === false ||
      typeof enterprise.tenant.code !== "string"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const scope = [
      enterprise.code,
      application.provider,
      code,
      assertion.applicationSubject,
      assertion.subject,
    ];
    return {
      enterprise,
      applicationCode: code,
      provider: application.provider,
      assertion,
      code:
        "EID_" +
        crypto.createHash("sha256").update(JSON.stringify(scope)).digest("hex"),
      tenant: enterprise.tenant.code,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    };
  },
  /** Reads only the exact verified key using the generated Profile service with cache disabled. */
  read: async function (context) {
    const result = await SERVICE.DefaultExternalIdentityLinkService.get({
      tenant: context.tenant,
      authData: context.authData,
      query: { code: context.code },
      searchOptions: { pageSize: 2, pageNumber: 1 },
      options: { recursive: false, skipItemCache: true },
    });
    const rows = result.result || [];
    if (rows.length > 1)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_CONFLICT");
    return rows[0];
  },
  /** Returns fresh customer data and checks activation, password eligibility, enterprise and account lock without disclosing which check failed. */
  customer: async function (context, loginId) {
    const person = await SERVICE.DefaultCustomerService.findByLoginId({
      tenant: context.tenant,
      loginId,
    });
    const state = await SERVICE.DefaultUserStateService.findUserState({
      tenant: context.tenant,
      loginId: person.loginId,
      _id: person._id,
    });
    if (
      !person.active ||
      person.principalType !== "customer" ||
      !person.password ||
      person.password.active === false ||
      state.locked
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return { person, state };
  },
  /** Requires a customer access token in the verified enterprise/tenant; body identifiers never participate. */
  principal: function (request, context) {
    const auth = request.authData || {};
    if (
      auth.principalType !== "customer" ||
      !auth.loginId ||
      auth.tenant !== context.tenant ||
      auth.entCode !== context.enterprise.code ||
      (auth.tokenType && auth.tokenType !== "access")
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return auth.loginId;
  },
  /** Validates launch proof for a public bootstrap without querying or exposing a customer. */
  launch: async function (request) {
    const context = await this.context(request);
    return {
      contractVersion: 1,
      provider: context.provider,
      requiresProfileSession: true,
    };
  },
  /** Revalidates an opaque binding from a verified customer token or Profile refresh record. A request body cannot supply this authority. */
  validateSessionBinding: async function (session, applicationCode) {
    const policy = this.policy();
    if (session.principalType !== "customer" || !session.loginId || !session.tenant || !session.entCode ||
        (session.tokenType && session.tokenType !== "access") ||
        typeof session.externalIdentityLinkCode !== "string" || !/^EID_[a-f0-9]{64}$/.test(session.externalIdentityLinkCode))
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const context = {
      tenant: session.tenant,
      code: session.externalIdentityLinkCode,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    };
    const link = await this.read(context);
    const application = link && policy.applications?.[link.applicationCode];
    if (!link || link.status !== "ACTIVE" || link.principalCode !== session.loginId ||
        link.enterpriseCode !== session.entCode || !application?.enabled ||
        application.enterpriseCode !== session.entCode || application.provider !== link.provider ||
        !policy.providers?.[link.provider]?.service ||
        (applicationCode !== undefined && link.applicationCode !== applicationCode))
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const enterprise = await SERVICE.DefaultEnterpriseService.retrieveEnterprise(session.entCode);
    if (!enterprise.active || !enterprise.tenant || enterprise.tenant.active === false || enterprise.tenant.code !== session.tenant)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const { person } = await this.customer(context, session.loginId);
    if (String(link.authVersion) !== String(person.authVersion || 1) ||
        String(session.authVersion) !== String(person.authVersion || 1))
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return link;
  },
  /** Resolves a source-channel recipient from an established channel-bound session, or fresh proof for a legacy unbound session, while rechecking the live account and link. */
  origin: async function (request) {
    if (request.authData?.externalIdentityLinkCode) {
      // Launch freshness applies at sign-in; an established session uses its live link.
      if (typeof request.applicationCode !== "string" || request.authData.entCode !== request.entCode)
        throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
      const link = await this.validateSessionBinding(request.authData, request.applicationCode);
      return { provider: link.provider, applicationCode: link.applicationCode,
        applicationSubject: link.applicationSubject, providerSubject: link.providerSubject,
        identityLinkCode: link.code, allowsWrite: link.allowsWrite === true };
    }
    const context = await this.context(request),
      principalCode = this.principal(request, context),
      link = await this.read(context);
    const { person } = await this.customer(context, principalCode);
    if (
      !link ||
      link.status !== "ACTIVE" ||
      link.principalCode !== principalCode ||
      String(link.authVersion) !== String(person.authVersion || 1) ||
      String(request.authData.authVersion) !== String(person.authVersion || 1)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return {
      provider: context.provider,
      applicationCode: context.applicationCode,
      applicationSubject: context.assertion.applicationSubject,
      providerSubject: context.assertion.subject,
      identityLinkCode: link.code,
      allowsWrite: context.assertion.allowsWrite === true,
    };
  },
  /** Resolves an active customer-owned destination for an authenticated Communication service, never a raw address from a client. */
  destination: async function (request) {
    if (request.authData?.principalType !== "service")
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const policy = this.policy(),
      context = {
        tenant: request.tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        code: request.linkCode,
      };
    const link = await this.read(context),
      app = link && policy.applications?.[link.applicationCode];
    if (
      !link ||
      link.status !== "ACTIVE" ||
      !link.allowsWrite ||
      !app?.enabled ||
      app.enterpriseCode !== request.entCode
    )
      return { allowed: false };
    const { person } = await this.customer(context, link.principalCode);
    if (
      person.code !== request.recipientId ||
      String(link.authVersion) !== String(person.authVersion || 1)
    )
      return { allowed: false };
    return {
      allowed: true,
      provider: link.provider,
      subject: link.providerSubject,
      applicationSubject: link.applicationSubject,
      credentialReference: app.secretEnvironmentVariable,
    };
  },
  /** Exchanges verified linked identity for the existing Profile token pair; unlinked/stale links return the same secure-sign-in requirement. */
  session: async function (request) {
    const context = await this.context(request),
      link = await this.read(context);
    if (!link || link.status !== "ACTIVE")
      return { requiresProfileSession: true };
    const expected = request.expectedIdentityLink;
    if (
      expected &&
      (link.code !== expected.code ||
        link.revision !== expected.revision ||
        link.principalCode !== expected.principalCode ||
        String(link.authVersion) !== String(expected.authVersion))
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const { person, state } = await this.customer(context, link.principalCode);
    if (String(link.authVersion) !== String(person.authVersion || 1))
      return { requiresProfileSession: true };
    const tokens =
      await SERVICE.DefaultAuthenticationProviderService.issueSession(
        { enterprise: context.enterprise, person, type: "Customer", externalIdentityLinkCode: link.code },
        state,
        "external_identity.authentication",
      );
    const current = await this.read(context);
    if (
      !current ||
      current.status !== "ACTIVE" ||
      current.revision !== link.revision
    ) {
      await SERVICE.DefaultAuthenticationProviderService.removeToken(
        CONFIG.get("profileModuleName") || "profile",
        tokens.refreshToken,
      );
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    }
    return Object.assign(
      { requiresProfileSession: false, loginId: person.loginId },
      tokens,
    );
  },
  /** Links only a verified external subject to the authenticated customer, with unique-key conflict protection and explicit reactivation. */
  link: async function (request) {
    const context = await this.context(request),
      principalCode = this.principal(request, context);
    const { person } = await this.customer(context, principalCode);
    if (
      String(request.authData.authVersion) !== String(person.authVersion || 1)
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    let current = await this.read(context);
    const model = {
      code: context.code,
      enterpriseCode: context.enterprise.code,
      provider: context.provider,
      applicationCode: context.applicationCode,
      applicationSubject: context.assertion.applicationSubject,
      providerSubject: context.assertion.subject,
      principalCode,
      authVersion: String(person.authVersion || 1),
      status: "ACTIVE",
      allowsWrite: context.assertion.allowsWrite === true,
      active: true,
      revision: 0,
    };
    if (!current) {
      try {
        await SERVICE.DefaultExternalIdentityLinkService.save({
          tenant: context.tenant,
          authData: context.authData,
          model,
          options: { recursive: false },
        });
      } catch (error) {
        current = await this.read(context);
        if (!current) throw error;
      }
      current = current || (await this.read(context));
    }
    if (!current || current.principalCode !== principalCode)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_CONFLICT");
    if (
      current.status !== "ACTIVE" ||
      String(current.authVersion) !== model.authVersion ||
      current.allowsWrite !== model.allowsWrite
    ) {
      await SERVICE.DefaultExternalIdentityLinkService.update({
        tenant: context.tenant,
        authData: context.authData,
        query: { code: context.code, revision: current.revision },
        model: {
          code: context.code,
          revision: current.revision,
          status: "ACTIVE",
          authVersion: model.authVersion,
          allowsWrite: model.allowsWrite,
        },
        options: { recursive: false },
      });
    }
    await SERVICE.DefaultAuthenticationProviderService.recordAuthEvent({
      eventType: "external_identity.link",
      outcome: "success",
      tenant: context.tenant,
      entCode: context.enterprise.code,
      principalId: principalCode,
    });
    return { linked: true, applicationCode: context.applicationCode };
  },
  /** Revokes the verified subject's link owned by the caller and advances Profile security stamp, invalidating prior sessions. */
  unlink: async function (request) {
    const context = await this.context(request),
      principalCode = this.principal(request, context),
      current = await this.read(context);
    if (!current || current.principalCode !== principalCode)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    if (current.status !== "REVOKED")
      await SERVICE.DefaultExternalIdentityLinkService.update({
        tenant: context.tenant,
        authData: context.authData,
        query: { code: context.code, revision: current.revision },
        model: {
          code: context.code,
          revision: current.revision,
          status: "REVOKED",
        },
        options: { recursive: false },
      });
    await SERVICE.DefaultCustomerService.update({
      tenant: context.tenant,
      authData: context.authData,
      query: { loginId: principalCode },
      model: {
        $set: {
          authVersion:
            1,
        },
      },
    });
    await SERVICE.DefaultAuthenticationProviderService.recordAuthEvent({
      eventType: "external_identity.unlink",
      outcome: "success",
      tenant: context.tenant,
      entCode: context.enterprise.code,
      principalId: principalCode,
    });
    return { linked: false };
  },
};
