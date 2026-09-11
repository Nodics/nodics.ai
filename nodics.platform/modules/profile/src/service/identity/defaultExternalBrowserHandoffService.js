/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require("node:crypto");

/**
 * @module profile/service/defaultExternalBrowserHandoffService
 * @description Prepares one-use browser handoffs for verified external identities through the existing Profile auth cache. No customer sessions or refresh credentials leave Profile during preparation.
 * @owner profile @layer service
 * @override Later layers configure expiry and provider applications while preserving proof, origin, scope, atomic consumption and account/link revalidation. Cache loss requires a fresh channel entry.
 */
module.exports = {
  /** Validates the trusted browser origin using the same policy as final cookie issuance. */
  origin: function (request) {
    SERVICE.DefaultBrowserSessionService.validateOrigin(
      request,
      SERVICE.DefaultBrowserSessionService.config(request),
    );
    return request.httpRequest.headers.origin;
  },
  /** Resolves the bounded handoff lifetime; malformed configuration fails closed. */
  lifetime: function () {
    const seconds = (CONFIG.get("profileExternalIdentity") || {})
      .browserHandoffLifetimeSeconds;
    if (!Number.isSafeInteger(seconds) || seconds < 10 || seconds > 300)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_UNAVAILABLE");
    return seconds;
  },
  /** Hashes an opaque one-use code in a purpose-specific Profile auth-cache namespace. */
  key: function (code) {
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(code))
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return (
      "external-browser-handoff:" +
      crypto.createHash("sha256").update(code).digest("hex")
    );
  },
  /** Prepares a linked identity for browser completion. Requires a service principal; verifies proof before lookup and stores only binding metadata for a short lifetime. */
  prepare: async function (request) {
    if (request.authData?.principalType !== "service")
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const origin = this.origin(request),
      identity = SERVICE.DefaultExternalIdentityService;
    const context = await identity.context(request);
    if (
      request.authData.tenant !== context.tenant ||
      request.authData.entCode !== context.enterprise.code
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const link = await identity.read(context);
    if (!link || link.status !== "ACTIVE")
      return { requiresProfileSession: true };
    const { person } = await identity.customer(context, link.principalCode);
    if (String(link.authVersion) !== String(person.authVersion || 1))
      return { requiresProfileSession: true };
    const code = crypto.randomBytes(32).toString("base64url"),
      seconds = this.lifetime();
    await SERVICE.DefaultAuthenticationProviderService.addToken(
      CONFIG.get("profileModuleName") || "profile",
      true,
      this.key(code),
      {
        purpose: "EXTERNAL_BROWSER_SESSION",
        origin,
        applicationCode: context.applicationCode,
        entCode: context.enterprise.code,
        tenant: context.tenant,
        linkCode: link.code,
        revision: link.revision,
        principalCode: link.principalCode,
        authVersion: link.authVersion,
        expiresAt: Date.now() + seconds * 1000,
      },
      seconds,
    );
    return { requiresProfileSession: false, handoffToken: code };
  },
  /** Consumes one grant and revalidates current provider proof, link revision, account and enterprise before invoking Profile's existing session issuer. A replay or expired grant never issues another session. */
  complete: async function (request) {
    const origin = this.origin(request);
    let grant;
    try {
      grant = await SERVICE.DefaultAuthenticationProviderService.consumeToken(
        CONFIG.get("profileModuleName") || "profile",
        this.key(request.handoffToken),
      );
    } catch (error) {
      if (error.code === "ERR_CACHE_00001")
        throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
      throw error;
    }
    if (
      !grant ||
      grant.purpose !== "EXTERNAL_BROWSER_SESSION" ||
      grant.expiresAt <= Date.now() ||
      grant.origin !== origin ||
      grant.entCode !== request.entCode
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    const identity = SERVICE.DefaultExternalIdentityService;
    const input = { ...request, applicationCode: grant.applicationCode };
    const context = await identity.context(input),
      link = await identity.read(context);
    if (
      context.tenant !== grant.tenant ||
      !link ||
      link.code !== grant.linkCode ||
      link.status !== "ACTIVE" ||
      link.revision !== grant.revision ||
      link.principalCode !== grant.principalCode ||
      String(link.authVersion) !== String(grant.authVersion)
    ) {
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    }
    const tokens = await identity.session({
      ...input,
      expectedIdentityLink: {
        code: grant.linkCode,
        revision: grant.revision,
        principalCode: grant.principalCode,
        authVersion: grant.authVersion,
      },
    });
    if (tokens.requiresProfileSession)
      throw new CLASSES.NodicsError("ERR_PROFILE_EXTERNAL_ASSERTION");
    return tokens;
  },
};
