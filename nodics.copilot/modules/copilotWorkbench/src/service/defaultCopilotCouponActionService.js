/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");

/** @module copilotWorkbench/service/DefaultCopilotCouponActionService
 * @description Prepares sensitive coupon fulfillment through Digital Core and executes only an employee-approved, owner-validated command. Raw tokens never enter stored plans or model context.
 * @layer service @owner copilotWorkbench
 * @override Preserve original employee identity, immutable review/target, domain proof expiry, owner receipts and no uncertain replay. Promotion remains redemption authority.
 */
module.exports = {
  /** Rejects without reflecting a token, owner error or private customer detail. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError(
      "ERR_CPW_00004",
      "Coupon fulfillment could not be confirmed",
    );
  },
  /** Recognizes requests that must use sensitive input instead of a model or transcript. @param {string} message Human text. @returns {boolean} Secure journey needed. */
  handlesMessage: function (message) {
    return (
      typeof message === "string" &&
      (/"operation"\s*:\s*"commerce\.coupon\.redeem"/i.test(message) ||
        /\bcoupon(?:Token|Code)\b/i.test(message) ||
        (/\bcoupons?\b/i.test(message) &&
          /\bredeem(?:ed|ing)?\b|\bredemption\b/i.test(message)))
    );
  },
  /** Requires independent Copilot and Commerce grants and original employee credentials. @param {Object} request Trusted request. @param {Object} configuration Current settings. @param {boolean} execute Execution phase. @returns {Object} Trusted scope. */
  authorize: function (request, configuration, execute = false) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.enterprise ||
      context.tenant !== request.tenant ||
      !context.tenant ||
      [
        "copilot.mutation.prepare",
        "commerce.coupon.pos.redeem",
        ...(execute ? ["copilot.mutation.execute"] : []),
      ].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    core.employeeExecutionHeaders(request);
    return context;
  },
  /** Requires the independent Copilot data grant and native merchant permission for a queue read. @param {Object} request Trusted request. @param {Object} configuration Current settings. @returns {Object} Trusted scope. */
  authorizeQueue: function (request, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.enterprise ||
      context.tenant !== request.tenant ||
      !context.tenant ||
      ["copilot.data.query", "commerce.coupon.pos.redeem"].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    core.employeeExecutionHeaders(request);
    return context;
  },
  /** Resolves only the explicitly configured operational Commerce owner, never caller routing. @param {Object} configuration Effective settings. @returns {Object} Digest-bound target. */
  target: function (configuration) {
    const target = configuration.workbench?.couponTarget;
    if (
      target?.enabled !== true ||
      target.moduleName !== "digitalCore" ||
      typeof target.connectionName !== "string" ||
      target.connectionName === "default" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName) ||
      target.targetAuthority?.runtimeRole !== "COMMERCE"
    )
      this.fail();
    return {
      moduleName: "digitalCore",
      connectionName: target.connectionName,
      targetAuthority: structuredClone(target.targetAuthority),
    };
  },
  /** Selects bounded owner-authored form copy; the projection grants no domain authority. @param {Object} context Current scope. @param {Object} configuration Effective settings. @returns {Object|undefined} Inert availability. */
  catalogue: function (context, configuration) {
    if (
      context.channel !== "EMPLOYEE" ||
      ["copilot.mutation.prepare", "commerce.coupon.pos.redeem"].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      return undefined;
    try {
      this.target(configuration);
    } catch {
      return undefined;
    }
    const keys = [
      "redeemTab",
      "redemptionsTab",
      "refreshRedemptions",
      "emptyRedemptions",
      "recoveryRequired",
      "product",
      "status",
      "open",
      "title",
      "coupon",
      "receipt",
      "prepare",
      "close",
      "unavailable",
      "approve",
      "execute",
      "reject",
      "expired",
      "completed",
      "secureMessage",
      "inspect",
      "reload",
      "resume",
      "actionReference",
      "unconfirmed",
    ];
    const copy = configuration.workbench?.couponPresentation;
    if (
      !copy ||
      keys.some(
        (key) =>
          typeof copy[key] !== "string" ||
          !copy[key].trim() ||
          copy[key].length > 1000,
      )
    )
      this.fail();
    return {
      contractVersion: 1,
      redemptionsAvailable: SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.data.query",
      ),
      presentation: Object.fromEntries(keys.map((key) => [key, copy[key]])),
    };
  },
  /** Unwraps the canonical owner's transport while rejecting explicit errors at every layer. @param {Object} response Owner envelope. @returns {Object} Typed owner candidate. */
  unwrap: function (response) {
    let value = response;
    for (let depth = 0; depth < 7; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.error ||
        value.success === false ||
        (value.code !== undefined && !/^SUC_/.test(value.code)) ||
        (value.errors !== undefined &&
          (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    this.fail();
  },
  /** Sends one fixed-route owner call using the employee credential; never retries or exposes raw failures. @param {Object} request Trusted employee context. @param {Object} target Configured owner. @param {string} apiName Adapter-owned route. @param {Object|undefined} body Fixed payload. @param {string|undefined} key Original command reference. @returns {Promise<Object>} Owner evidence. */
  invoke: async function (request, target, apiName, body, key) {
    try {
      const invocation = {
        ...target,
        tenant: request.tenant,
        local: false,
        apiName,
        methodName: body === undefined ? "GET" : "POST",
        maxAttempts: 1,
        timeoutMs: 10000,
        header: {
          ...SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
            request,
          ),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(key ? { idempotencyKey: key } : {}),
        ...(body === undefined ? {} : { requestBody: body }),
      };
      SERVICE.DefaultLoggerService.inheritRequestPrivacy(invocation, request);
      return this.unwrap(
        await SERVICE.DefaultModuleService.invokeModule(invocation),
      );
    } catch {
      this.fail();
    }
  },
  /** Projects canonical current outlet choices without adding a merchant registry. @param {Object} request Employee request. @param {Object} configuration Current settings. @returns {Promise<Object>} Bounded form metadata. */
  workspace: async function (request, configuration) {
    this.authorize(request, configuration);
    const target = this.target(configuration);
    const owner = await this.invoke(
      request,
      target,
      "/merchant/redemptions/workspace",
    );
    if (
      typeof owner.storeRequired !== "boolean" ||
      typeof owner.pricedSourceRequired !== "boolean" ||
      typeof owner.storeLabel !== "string" ||
      !owner.storeLabel.trim() ||
      owner.storeLabel.length > 192 ||
      (owner.pricedSourceRequired &&
        (typeof owner.pricedSourceLabel !== "string" ||
          !owner.pricedSourceLabel.trim() ||
          owner.pricedSourceLabel.length > 192)) ||
      !Array.isArray(owner.stores) ||
      owner.stores.length > 100
    )
      this.fail();
    const stores = owner.stores.map((store) => {
      if (
        !store ||
        !/^[A-Za-z0-9_.:-]{1,128}$/.test(store.code || "") ||
        typeof store.name !== "string" ||
        !store.name.trim() ||
        store.name.length > 256 ||
        !Number.isSafeInteger(store.revision) ||
        store.revision < 1
      )
        this.fail();
      return {
        code: store.code,
        name: store.name,
        revision: store.revision,
      };
    });
    if (new Set(stores.map((store) => store.code)).size !== stores.length)
      this.fail();
    const fresh = CONFIG.get("copilot");
    this.authorize(request, fresh);
    if (JSON.stringify(target) !== JSON.stringify(this.target(fresh)))
      this.fail();
    return {
      contractVersion: 1,
      enterpriseCode:
        request.authData.enterpriseCode || request.authData.entCode,
      storeRequired: owner.storeRequired,
      storeLabel: owner.storeLabel,
      pricedSourceRequired: owner.pricedSourceRequired,
      ...(owner.pricedSourceRequired
        ? { pricedSourceLabel: owner.pricedSourceLabel }
        : {}),
      stores,
    };
  },
  /** Reads and minimizes the native merchant redemption queue without exposing coupon tokens, customer identities or command keys. @param {Object} request Employee request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Bounded current queue. */
  queue: async function (request, configuration) {
    this.authorizeQueue(request, configuration);
    const target = this.target(configuration);
    const owner = await this.invoke(request, target, "/merchant/redemptions");
    if (!Array.isArray(owner.redemptions) || owner.redemptions.length > 100)
      this.fail();
    const text = (value, maximum = 256) =>
      value === undefined ||
      (typeof value === "string" &&
        value.length > 0 &&
        value.length <= maximum &&
        !/[\u0000-\u001f]/.test(value));
    const optionalInteger = (value) =>
      value === undefined || (Number.isSafeInteger(value) && value >= 0);
    const redemptions = owner.redemptions.map((row) => {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        ![
          "entitlementCode",
          "productCode",
          "claimStatus",
          "status",
          "merchantCode",
          "merchantLabel",
          "mode",
        ].every((key) => text(row[key])) ||
        !Number.isSafeInteger(row.revision) ||
        row.revision < 0 ||
        ![
          "redemptionCode",
          "requestedAt",
          "receiptCode",
          "merchantReceiptReference",
          "confirmedAt",
          "storeCode",
        ].every((key) => text(row[key])) ||
        !optionalInteger(row.storeRevision) ||
        typeof row.recoveryRequired !== "boolean"
      )
        this.fail();
      return Object.fromEntries(
        [
          "entitlementCode",
          "productCode",
          "claimStatus",
          "status",
          "revision",
          "merchantCode",
          "merchantLabel",
          "mode",
          "redemptionCode",
          "requestedAt",
          "receiptCode",
          "merchantReceiptReference",
          "confirmedAt",
          "recoveryRequired",
          "storeCode",
          "storeRevision",
        ]
          .filter((key) => row[key] !== undefined)
          .map((key) => [key, row[key]]),
      );
    });
    const fresh = CONFIG.get("copilot");
    this.authorizeQueue(request, fresh);
    if (JSON.stringify(target) !== JSON.stringify(this.target(fresh)))
      this.fail();
    return {
      contractVersion: 1,
      enterpriseCode:
        request.authData.enterpriseCode || request.authData.entCode,
      observedAt: new Date().toISOString(),
      redemptions,
      limitation:
        "Current enterprise-scoped merchant fulfillment records; this read does not validate or redeem a coupon.",
    };
  },
  /** Validates explicit sensitive input; no raw code is ever returned for persistence. @param {Object} body Human form. @returns {Object} Owner validation payload. */
  input: function (body) {
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) =>
          !["couponToken", "merchantReceiptReference", "storeCode"].includes(
            key,
          ),
      ) ||
      typeof body.couponToken !== "string" ||
      body.couponToken.trim().length < 4 ||
      body.couponToken.length > 256 ||
      /[\u0000-\u001f]/.test(body.couponToken) ||
      typeof body.merchantReceiptReference !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9 ._:/-]{2,119}$/.test(
        body.merchantReceiptReference,
      ) ||
      (body.storeCode !== undefined &&
        (typeof body.storeCode !== "string" ||
          !/^[A-Za-z0-9_.:-]{1,128}$/.test(body.storeCode)))
    )
      this.fail();
    return {
      couponToken: body.couponToken,
      merchantReceiptReference: body.merchantReceiptReference,
      ...(body.storeCode ? { storeCode: body.storeCode } : {}),
    };
  },
  /** Creates a minimized complete business review; unsupported owner benefit shapes fail closed. @param {Object} owner Validated coupon evidence. @param {Object} input Human receipt/outlet. @returns {Object} Review and owner proof record. */
  proposal: function (owner, input) {
    const text = (value, maximum = 256) =>
      typeof value === "string" &&
      value.trim() &&
      value.length <= maximum &&
      !/[\u0000-\u001f]/.test(value);
    const expiry = Date.parse(owner.validationExpiresAt);
    if (
      owner.eligible !== true ||
      owner.status !== "ACTIVE" ||
      owner.confirmationKey ||
      owner.recoveryRequired === true ||
      !["UNCLAIMED", "CLAIMED"].includes(owner.claimStatus) ||
      !["MERCHANT_SCREEN", "LOCAL_SAMPLE"].includes(owner.mode) ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(owner.entitlementCode || "") ||
      !["productCode", "merchantCode", "merchantLabel", "validationCode"].every(
        (key) => text(owner[key]),
      ) ||
      !Number.isSafeInteger(owner.revision) ||
      owner.revision < 0 ||
      typeof owner.validationExpiresAt !== "string" ||
      owner.validationExpiresAt.length > 64 ||
      !Number.isFinite(expiry) ||
      expiry <= Date.now() ||
      expiry > Date.now() + 300000 ||
      owner.storeCode !== input.storeCode ||
      (owner.storeCode &&
        (!Number.isSafeInteger(owner.storeRevision) || owner.storeRevision < 1))
    )
      this.fail();
    const fields = [
      ["Entitlement", owner.entitlementCode],
      ["Product", owner.productCode],
      ["Issuing enterprise", owner.merchantLabel],
      ["Enterprise code", owner.merchantCode],
      ["Fulfillment mode", owner.mode],
      ["Receipt reference", input.merchantReceiptReference],
      ["Revision", String(owner.revision)],
      ["Validation expires", owner.validationExpiresAt],
      ...(owner.storeCode
        ? [
            ["Outlet", owner.storeCode],
            ["Outlet revision", String(owner.storeRevision)],
          ]
        : []),
    ];
    const conditions = owner.conditions || {};
    if (
      typeof conditions !== "object" ||
      Array.isArray(conditions) ||
      Object.keys(conditions).some(
        (key) =>
          ![
            "name",
            "validFrom",
            "validTo",
            "discountType",
            "discountValue",
            "benefit",
          ].includes(key),
      )
    )
      this.fail();
    for (const [key, value] of Object.entries(conditions)) {
      if (value == null) continue;
      if (key === "benefit") continue;
      if (
        key === "name" &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        if (Object.keys(value).length > 10) this.fail();
        for (const [locale, name] of Object.entries(value)) {
          if (!/^[A-Za-z0-9-]{2,16}$/.test(locale) || !text(name)) this.fail();
          fields.push(["Benefit (" + locale + ")", name]);
        }
      } else {
        if (
          !["string", "number"].includes(typeof value) ||
          !text(String(value))
        )
          this.fail();
        fields.push([key, String(value)]);
      }
    }
    if (conditions.benefit) {
      const benefit = conditions.benefit;
      const allowed = [
        "sourceStage",
        "sourceReference",
        "currency",
        "subtotalAmount",
        "discountAmount",
        "sourceHash",
        "sourceRevision",
        "storeCode",
        "storeRevision",
      ];
      if (
        typeof benefit !== "object" ||
        Array.isArray(benefit) ||
        Object.keys(benefit).some((key) => !allowed.includes(key)) ||
        benefit.sourceStage !== "PRICED_CART" ||
        benefit.sourceReference !== input.merchantReceiptReference ||
        benefit.storeCode !== owner.storeCode ||
        benefit.storeRevision !== owner.storeRevision ||
        !/^[A-Z]{3}$/.test(benefit.currency || "") ||
        !/^[a-f0-9]{64}$/.test(benefit.sourceHash || "") ||
        !Number.isSafeInteger(benefit.sourceRevision) ||
        benefit.sourceRevision < 0 ||
        ["subtotalAmount", "discountAmount"].some(
          (key) =>
            typeof benefit[key] !== "string" ||
            benefit[key].length > 128 ||
            !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(benefit[key]),
        )
      )
        this.fail();
      for (const key of allowed) fields.push([key, String(benefit[key])]);
    }
    const record = {
      code: owner.entitlementCode,
      expectedRevision: owner.revision,
      validationCode: owner.validationCode,
      validationExpiresAt: owner.validationExpiresAt,
      merchantReceiptReference: input.merchantReceiptReference,
      merchantCode: owner.merchantCode,
      mode: owner.mode,
      ...(owner.storeCode
        ? {
            storeCode: owner.storeCode,
            storeRevision: owner.storeRevision,
          }
        : {}),
    };
    return {
      record,
      review: [
        {
          title: "Coupon fulfillment",
          fields: fields.map(([label, value]) => ({ label, value })),
        },
      ],
    };
  },
  /** Validates once at the domain, then stores only an immutable owner proof and business review. @param {Object} request Sensitive human form. @param {Object} configuration Current settings. @returns {Promise<Object>} Existing confirmation contract. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration);
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const target = this.target(configuration);
    const input = this.input(request.body);
    const owner = await this.invoke(
      request,
      target,
      "/merchant/redemptions/validate",
      input,
    );
    const proposal = this.proposal(owner, input);
    if (
      JSON.stringify(proposal)
        .toUpperCase()
        .includes(input.couponToken.trim().toUpperCase())
    )
      this.fail();
    const fresh = CONFIG.get("copilot");
    this.authorize(request, fresh);
    if (JSON.stringify(target) !== JSON.stringify(this.target(fresh)))
      this.fail();
    const plan = {
      id: "coupon-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "couponRedemption",
      records: [proposal.record],
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary:
          "Confirm that the reviewed coupon benefit has been fulfilled. Redemption uses the original employee and Commerce receipt.",
        validation: "DIGITAL_CORE_VALIDATED",
        review: proposal.review,
      },
    };
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      "commerce.coupon.redeem",
      request,
      context,
    );
  },
  /** Derives a bounded original owner command reference from the immutable plan row key. @param {string} key Canonical action row key. @returns {string} Stable owner key. */
  commandKey: function (key) {
    return (
      "coupon-confirm:" + crypto.createHash("sha256").update(key).digest("hex")
    );
  },
  /** Reconciles an uncertain action from its original domain receipt without reissuing fulfillment. Expired approvals may be inspected, never reused. @param {Object} action Owned action. @param {Object} request Current revision intent. @param {Object} configuration Effective settings. @returns {Promise<Object>} Current confirmation and bounded receipt evidence. */
  reconcile: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const target = this.target(configuration);
    const executor = SERVICE.DefaultCopilotActionExecutionService;
    executor.assertCurrent(action, request);
    const plan = action.audit?.plan;
    const challenge = action.audit?.challenge;
    const record = plan?.records?.[0];
    if (
      !["EXECUTING", "OUTCOME_UNKNOWN"].includes(action.state) ||
      action.capability !== "commerce.coupon.redeem" ||
      plan?.schema !== "couponRedemption" ||
      plan.state !== "VALIDATED" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).length ||
      !record ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(record.code || "") ||
      challenge?.contractVersion !== 2 ||
      challenge.confirmed !== true ||
      challenge.actor !== context.actor ||
      challenge.tenant !== context.tenant ||
      challenge.enterprise !== context.enterprise ||
      challenge.planDigest !==
        SERVICE.DefaultCopilotPolicyService.planDigest(plan) ||
      JSON.stringify(plan.executionTarget) !== JSON.stringify(target)
    )
      this.fail();
    const key = this.commandKey(
      plan.id + ":" + plan.schema + ":" + record.code,
    );
    const owner = await this.invoke(
      request,
      target,
      "/merchant/redemptions/" +
        encodeURIComponent(record.code) +
        "/receipt/query",
      {
        merchantReceiptReference: record.merchantReceiptReference,
        ...(record.storeCode ? { storeCode: record.storeCode } : {}),
      },
      key,
    );
    const fresh = CONFIG.get("copilot");
    this.authorize(request, fresh, true);
    if (
      JSON.stringify(target) !== JSON.stringify(this.target(fresh)) ||
      owner.contractVersion !== 1 ||
      owner.entitlementCode !== record.code ||
      !["UNCONFIRMED", "COMPLETED"].includes(owner.state)
    )
      this.fail();
    const core = SERVICE.DefaultCopilotOrchestrationService;
    if (owner.state === "UNCONFIRMED")
      return {
        confirmation: core.projectConfirmation(action),
        receiptState: "UNCONFIRMED",
      };
    if (
      owner.confirmationKey !== key ||
      owner.merchantReceiptReference !== record.merchantReceiptReference ||
      owner.merchantCode !== record.merchantCode ||
      owner.mode !== record.mode ||
      owner.storeCode !== record.storeCode ||
      owner.storeRevision !== record.storeRevision ||
      typeof owner.receiptCode !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,192}$/.test(owner.receiptCode)
    )
      this.fail();
    const updated = await executor.transition(
      action,
      "EXECUTED",
      {
        rows: [
          {
            index: 0,
            schema: plan.schema,
            code: record.code,
            state: "COMPLETED",
          },
        ],
        reconciledAt: new Date().toISOString(),
        reconciledBy: context.actor,
        result: {
          operationsCompleted: 1,
          receiptCode: owner.receiptCode,
        },
      },
      request,
    );
    return {
      confirmation: core.projectConfirmation(updated),
      receiptState: "COMPLETED",
      receiptCode: owner.receiptCode,
    };
  },
  /** Rechecks the pinned owner proof and delegates one confirmed command through the existing atomic executor. @param {Object} action Owned approved action. @param {Object} request Confirmation command. @param {Object} configuration Current settings. @returns {Promise<Object>} Durable per-row outcome. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const target = this.target(configuration);
    const plan = action.audit?.plan;
    const record = plan?.records?.[0];
    if (
      action.capability !== "commerce.coupon.redeem" ||
      plan?.schema !== "couponRedemption" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).length ||
      JSON.stringify(plan.executionTarget) !== JSON.stringify(target) ||
      !record ||
      Object.keys(record).some(
        (key) =>
          ![
            "code",
            "expectedRevision",
            "validationCode",
            "validationExpiresAt",
            "merchantReceiptReference",
            "storeCode",
            "storeRevision",
            "merchantCode",
            "mode",
          ].includes(key),
      ) ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(record.code || "") ||
      !Number.isSafeInteger(record.expectedRevision) ||
      record.expectedRevision < 0 ||
      typeof record.validationCode !== "string" ||
      !record.validationCode ||
      record.validationCode.length > 256 ||
      !Number.isFinite(Date.parse(record.validationExpiresAt)) ||
      Date.parse(record.validationExpiresAt) <= Date.now()
    )
      this.fail();
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      async (row, key) => {
        const current = CONFIG.get("copilot");
        this.authorize(request, current, true);
        if (
          JSON.stringify(this.target(current)) !== JSON.stringify(target) ||
          Date.parse(record.validationExpiresAt) <= Date.now()
        )
          this.fail();
        const { code, merchantCode, mode, storeRevision, ...payload } =
          row.record;
        const owner = await this.invoke(
          request,
          target,
          "/merchant/redemptions/" + encodeURIComponent(code) + "/confirm",
          { ...payload, confirmed: true },
          this.commandKey(key),
        );
        if (
          owner.entitlementCode !== code ||
          owner.claimStatus !== "REDEEMED" ||
          typeof owner.receiptCode !== "string" ||
          !/^[A-Za-z0-9_.:-]{1,192}$/.test(owner.receiptCode) ||
          owner.merchantReceiptReference !== record.merchantReceiptReference ||
          owner.storeCode !== record.storeCode ||
          owner.storeRevision !== storeRevision ||
          owner.merchantCode !== merchantCode ||
          owner.mode !== mode
        )
          this.fail();
        return { code: "SUC_COPILOT_DOMAIN", result: { code } };
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
