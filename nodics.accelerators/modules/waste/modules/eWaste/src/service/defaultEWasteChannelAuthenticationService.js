/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module eWaste/service/defaultEWasteChannelAuthenticationService
 * @description Owns channel-entry policy, shared-account fallback and authenticated channel association for eWaste. Composes Profile APIs; never verifies signatures, persists identities or issues credentials.
 * @owner eWaste @layer service
 * @override Projects configure enabled channels and Profile application references; later service members may customize journey policy while retaining owner validation and trusted request context. Remote errors propagate without exposing proof or account details.
 */
module.exports = {
  /** Resolves one server-configured channel; request bodies cannot select applications, providers or services. */
  policy: function (channel) {
    const config = CONFIG.get("eWaste")?.channelAuthentication;
    if (
      !config?.enabled ||
      typeof channel !== "string" ||
      !Object.hasOwn(config.channels || {}, channel)
    )
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_UNAVAILABLE");
    const selected = config.channels[channel];
    if (
      !selected.enabled ||
      typeof selected.applicationCode !== "string" ||
      !selected.applicationCode ||
      typeof selected.seamlessSignIn !== "boolean"
    )
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_UNAVAILABLE");
    return { ...selected, timeoutMs: config.timeoutMs };
  },
  /** Calls Profile through runtime owner discovery. Service commands use the internal service identity; customer-link/origin commands preserve the authenticated customer bearer. */
  profile: async function (request, channel, path, proof, customer = false) {
    const policy = this.policy(channel),
      headers = request.httpRequest?.headers || {};
    const authorization = request.authorization || headers.authorization;
    if (
      customer &&
      (!authorization || request.authData?.principalType !== "customer")
    )
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_IDENTITY");
    const result = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: (CONFIG.get("eWaste")?.targetAuthorities || {}).profile,
      apiName: path,
      methodName: "POST",
      tenant: request.authData?.tenant || request.tenant,
      request: { tenant: request.authData?.tenant || request.tenant },
      requestBody: { applicationCode: policy.applicationCode, proof },
      header: {
        "X-Enterprise-Code": request.authData?.entCode || request.entCode,
        ...(headers.origin ? { Origin: headers.origin } : {}),
        ...(headers["x-correlation-id"]
          ? { "X-Correlation-Id": headers["x-correlation-id"] }
          : {}),
        ...(customer ? { Authorization: authorization } : {}),
      },
      timeoutMs: policy.timeoutMs,
      maxAttempts: 1,
    }).catch((error) => {
      const code =
        error.code === "ERR_PROFILE_EXTERNAL_CONFLICT"
          ? "ERR_EWASTE_CHANNEL_LINK_CONFLICT"
          : ["ERR_PROFILE_EXTERNAL_ASSERTION", "ERR_AUTH_00001"].includes(
                error.code,
              )
            ? "ERR_EWASTE_CHANNEL_IDENTITY"
            : "ERR_EWASTE_CHANNEL_UNAVAILABLE";
      throw new CLASSES.NodicsError(code);
    });
    return SERVICE.DefaultEWasteExperienceService.unwrap(result);
  },
  /** Selects seamless linked-channel sign-in or the shared account form. Returns only an opaque Profile handoff, never refresh credentials or caller-selected redirects. */
  enter: async function (request) {
    const channel = request.channel,
      policy = this.policy(channel);
    if (!policy.seamlessSignIn) {
      await this.bootstrap(request.proof, request, channel);
      return { contractVersion: 1, channel, requiresAuthentication: true };
    }
    const result = await this.profile(
      request,
      channel,
      "/internal/external-identity/browser-handoff",
      request.proof,
    );
    if (result.requiresProfileSession === true)
      return { contractVersion: 1, channel, requiresAuthentication: true };
    if (
      result.requiresProfileSession !== false ||
      typeof result.handoffToken !== "string"
    )
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_IDENTITY");
    return {
      contractVersion: 1,
      channel,
      requiresAuthentication: false,
      handoffToken: result.handoffToken,
    };
  },
  /** Associates verified channel proof only after shared account authentication; Profile enforces ownership and retry/conflict behavior. */
  link: async function (request) {
    const result = await this.profile(
      request,
      request.channel,
      "/customer/browser/external/link",
      request.proof,
      true,
    );
    if (result.linked !== true)
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_IDENTITY");
    return { contractVersion: 1, channel: request.channel, linked: true };
  },
  /** Validates launch context for legacy/project adapters without choosing a customer or issuing a session. */
  bootstrap: async function (proof, request, channel) {
    const result = await this.profile(
      request,
      channel,
      "/customer/external/launch",
      proof,
    );
    if (result.provider !== channel)
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_IDENTITY");
    return { contractVersion: 1, channel, requiresProfileSession: true };
  },
  /** Maps a Profile-authorized external origin into the common eWaste journey reference; storage remains with the domain owner. */
  origin: async function (proof, request, channel) {
    const result = await this.profile(
      request,
      channel,
      "/customer/external/origin",
      proof,
      true,
    );
    if (result.provider !== channel)
      throw new CLASSES.NodicsError("ERR_EWASTE_CHANNEL_IDENTITY");
    return {
      channel,
      subject: result.providerSubject,
      botId: result.applicationSubject,
      identityLinkCode: result.identityLinkCode,
      applicationCode: result.applicationCode,
      allowsWrite: result.allowsWrite,
    };
  },
};
