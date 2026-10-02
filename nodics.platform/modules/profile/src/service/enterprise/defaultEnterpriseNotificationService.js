/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/service/enterprise/DefaultEnterpriseNotificationService
 * @description Retains frozen lifecycle intent evidence on assignments and delegates delivery to Communication.
 * @layer service
 * @owner profile
 * @override Later Profile layers customize declarations/inputs, preserving current recipient, readiness, idempotency and private evidence.
 */
module.exports = {
  /** Resolves independently qualified notification policy. @returns {Object|undefined} Policy or disabled. */
  policy: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).notifications;
    if (!p || p.enabled !== true) return undefined;
    if (
      p.qualified !== true ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.connectionName || "") ||
      !Number.isSafeInteger(p.timeoutMilliseconds) ||
      p.timeoutMilliseconds < 1 ||
      p.timeoutMilliseconds > 60000
    )
      SERVICE.DefaultEnterpriseMembershipService.fail("UNAVAILABLE");
    return p;
  },
  /** Rechecks lifecycle facts; mail is never an access grant. @param {Object} item Assignment. @param {string} kind Fixed event. @returns {void} Admitted event. */
  assertEvent: function (item, kind) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      !["INVITATION", "ACCOUNT_READY"].includes(kind) ||
      item.active !== true ||
      item.invitationWithdrawal ||
      typeof item.normalizedEmail !== "string" ||
      !item.normalizedEmail
    )
      m.fail("CONFLICT");
    if (
      kind === "INVITATION" &&
      (!["PENDING", "ACTIVE"].includes(item.status) ||
        item.registration ||
        item.membership ||
        item.identityClaimed)
    )
      m.fail("CONFLICT");
    if (
      kind === "ACCOUNT_READY" &&
      (item.status !== "REGISTERED" ||
        (item.registration?.phase !== "COMPLETE" &&
          item.membership?.phase !== "COMPLETE"))
    )
      m.fail("CONFLICT");
    if (
      kind === "INVITATION" &&
      item.expiresAt &&
      (!Number.isFinite(Date.parse(item.expiresAt)) ||
        Date.parse(item.expiresAt) <= Date.now())
    )
      m.fail("CONFLICT");
  },
  /** Freezes one owner event and reconciles one Communication intent; delivery failure never reverses onboarding. @param {string} code Assignment. @param {string} kind Fixed event. @returns {Promise<Object>} Safe delivery progress. */
  request: async function (code, kind) {
    const m = SERVICE.DefaultEnterpriseMembershipService;
    try {
      const p = this.policy();
      if (!p)
        return {
          status: ENUMS.ProfileEmployeeNotificationStatus.NOT_REQUESTED.key,
        };
      m.policy();
      let { item, enterprise } = await m.assignment(code, true);
      this.assertEvent(item, kind);
      const declaration = p[kind];
      if (
        !declaration ||
        ["templateCode", "purpose", "locale", "nextStep"].some(
          (key) => typeof declaration[key] !== "string" || !declaration[key],
        )
      )
        m.fail("UNAVAILABLE");
      let evidence = item.lifecycleNotifications?.[kind];
      if (!evidence) {
        const message = {
          templateCode: declaration.templateCode,
          purpose: declaration.purpose,
          locale: declaration.locale,
          variables: {
            enterpriseName:
              typeof enterprise.name === "string"
                ? enterprise.name
                : enterprise.name?.en || enterprise.code,
            nextStep: declaration.nextStep,
            ...(kind === "INVITATION" ? { responsibility: item.roleCode } : {}),
          },
        };
        if (
          Object.values(message.variables).some(
            (value) =>
              typeof value !== "string" || !value || value.length > 1000,
          ) ||
          message.templateCode.length > 192 ||
          message.purpose.length > 128 ||
          message.locale.length > 32
        )
          m.fail("UNAVAILABLE");
        evidence = {
          message,
          recipient: item.normalizedEmail,
          status: ENUMS.ProfileEmployeeNotificationStatus.PENDING.key,
          idempotencyKey:
            "employee-lifecycle:" +
            m.digest([
              item.code,
              kind,
              item.revision,
              message,
              item.normalizedEmail,
            ]),
        };
        item = await m.write(item, {
          lifecycleNotifications: {
            ...item.lifecycleNotifications,
            [kind]: evidence,
          },
        });
      }
      if (
        evidence.recipient !== item.normalizedEmail ||
        !/^employee-lifecycle:[a-f0-9]{64}$/.test(evidence.idempotencyKey || "")
      )
        m.fail("CONFLICT");
      if (evidence.intentCode) {
        if (
          !/^COMM_[a-f0-9]{64}$/.test(evidence.intentCode) ||
          ![
            "ACCEPTED",
            "QUEUED",
            "DELIVERING",
            "DELIVERED",
            "RETRY_PENDING",
            "UNCERTAIN",
            "SUPPRESSED",
          ].includes(evidence.status)
        )
          m.fail("STORAGE");
        return { status: evidence.status, intentCode: evidence.intentCode };
      }
      const response =
        await SERVICE.DefaultEnterpriseManagementService.invokePrivateCommunication(
          {
            local: false,
            moduleName: "commsApi",
            connectionName: p.connectionName,
            tenant: m.authority(),
            header: { "X-Enterprise-Code": CONFIG.get("defaultEnterprise") },
            apiName: "/internal/communications",
            methodName: "POST",
            requestBody: {
              sourceModule: "profile",
              sourceType: "EMPLOYEE_LIFECYCLE",
              sourceCode: item.code,
              templateCode: evidence.message.templateCode,
              purpose: evidence.message.purpose,
              channel: "EMAIL",
              locale: evidence.message.locale,
              recipientId: "employee:" + m.digest(evidence.recipient),
              recipientAddressReference: evidence.recipient,
              variables: evidence.message.variables,
              idempotencyKey: evidence.idempotencyKey,
            },
            timeoutMs: p.timeoutMilliseconds,
            maxResponseBytes: 8192,
            maxAttempts: 1,
            followRedirects: false,
            requireInternalAuth: true,
          },
          p,
        );
      const outcome =
        SERVICE.DefaultEnterpriseApplicationReviewService.result(response);
      if (
        !/^COMM_[a-f0-9]{64}$/.test(outcome?.intentCode || "") ||
        ![
          "ACCEPTED",
          "QUEUED",
          "DELIVERING",
          "DELIVERED",
          "RETRY_PENDING",
          "UNCERTAIN",
          "SUPPRESSED",
        ].includes(outcome.status)
      )
        m.fail("STORAGE");
      ({ item } = await m.assignment(code, true));
      this.assertEvent(item, kind);
      const frozen = item.lifecycleNotifications?.[kind];
      if (
        m.digest(frozen?.message) !== m.digest(evidence.message) ||
        frozen?.idempotencyKey !== evidence.idempotencyKey ||
        frozen?.recipient !== evidence.recipient
      )
        m.fail("CONFLICT");
      if (frozen.intentCode && frozen.intentCode !== outcome.intentCode)
        m.fail("CONFLICT");
      if (!frozen.intentCode)
        await m.write(item, {
          lifecycleNotifications: {
            ...item.lifecycleNotifications,
            [kind]: {
              ...frozen,
              intentCode: outcome.intentCode,
              status: outcome.status,
              requestedAt: new Date().toISOString(),
            },
          },
        });
      return { status: outcome.status, intentCode: outcome.intentCode };
    } catch (_) {
      return {
        status: ENUMS.ProfileEmployeeNotificationStatus.UNCONFIRMED.key,
      };
    }
  },
  /** Admits explicit same-event retry without caller recipient/content. @param {Object} request Reviewed current administrator command. @returns {Promise<Object>} Safe progress. */
  retry: async function (request) {
    const m = SERVICE.DefaultEnterpriseMembershipService,
      input = m
        .base()
        .input(request.body || {}, ["assignmentCode", "revision", "kind"]);
    m.base().input(request.query || {}, []);
    const { item } = await m.assignment(input.assignmentCode, true);
    await m.administrator(request, item.enterpriseCode);
    if (
      !Number.isSafeInteger(input.revision) ||
      input.revision !== item.revision ||
      !["INVITATION", "ACCOUNT_READY"].includes(input.kind)
    )
      m.fail("CONFLICT");
    return this.request(item.code, input.kind);
  },
};
