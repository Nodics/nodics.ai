/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module commsCore/service/defaultCommunicationRuntimeService
 * @description Binds Communication intents to generated storage, optimistic delivery claims and configured transports. Rendered content remains private; retries never invoke source-domain decisions.
 * @owner commsCore @layer service
 * @override Deployments configure templates, transports and recipient resolvers. Preserve tenant isolation, immutable command identity and uncertain-send handling.
 */
const crypto = require("node:crypto");
module.exports = {
  /** Resolves an explicitly selected provider type; definitions never enroll credentials or enable channels. */
  providerPolicy: function (policy, channel) {
    const selected = policy.providers?.[channel];
    if (!selected || selected.type === undefined) return selected;
    const types = policy.providerTypes || {};
    if (
      typeof selected.type !== "string" ||
      !Object.hasOwn(types, selected.type)
    )
      throw new Error("COMMUNICATION_PROVIDER_TYPE_INVALID");
    const defaults = types[selected.type];
    if (
      !defaults ||
      typeof defaults !== "object" ||
      Array.isArray(defaults) ||
      Object.keys(defaults).some(
        (key) => !["code", "service", "timeoutMilliseconds"].includes(key),
      )
    )
      throw new Error("COMMUNICATION_PROVIDER_TYPE_INVALID");
    return { ...defaults, ...selected };
  },
  /** Detaches the generated persistence result. */
  rows: function (response) {
    if (
      !response ||
      response.error ||
      response.success === false ||
      typeof response.code !== "string" ||
      !response.code.startsWith("SUC_") ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result)
    ) {
      throw new Error("Communication storage read could not be confirmed");
    }
    return JSON.parse(JSON.stringify(response.result));
  },
  /** Builds owner storage context after caller authorization. */
  context: function (request) {
    const tenant = request.authData?.tenant || request.tenant;
    if (
      typeof tenant !== "string" ||
      !tenant ||
      (request.tenant && request.tenant !== tenant)
    )
      throw new Error("Trusted communication context is required");
    return {
      tenant,
      authData: {
        tenant,
        principalType: "service",
        principalId: "communicationRuntime",
        code: "communicationRuntime",
        loginId: "communicationRuntime",
        groups: ["serviceAccountUserGroup"],
        userGroups: ["serviceAccountUserGroup"],
      },
    };
  },
  /** Reads only within the trusted tenant using generated repositories. */
  list: async function (schema, request, query, limit = 100) {
    const context = this.context(request);
    return this.rows(
      await SERVICE["Default" + schema + "Service"].get({
        ...context,
        query: { ...query, tenant: context.tenant },
        searchOptions: { pageSize: limit, pageNumber: 1 },
        options: { recursive: false, skipItemCache: true },
      }),
    );
  },
  /** Loads a private intent by exact stable code. */
  read: async function (request, code) {
    return (await this.list("CommsIntent", request, { code }, 1))[0];
  },
  /** Creates a unique record without upsert so a competing request cannot overwrite evidence. */
  create: async function (schema, request, model) {
    const response = await SERVICE["Default" + schema + "Service"].save({
      ...this.context(request),
      model: { ...model, tenant: this.context(request).tenant, active: true },
      options: { recursive: false },
    });
    this.assertWrite(response);
  },
  /** Requires canonical acknowledgement before a persisted command can be treated as applied. */
  assertWrite: function (response) {
    if (
      !response ||
      response.error ||
      response.success === false ||
      typeof response.code !== "string" ||
      !response.code.startsWith("SUC_") ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length))
    ) {
      throw new Error("Communication storage write could not be confirmed");
    }
  },
  /** Claims an exact revision and proves this writer by private marker/readback before invoking transport. */
  update: async function (request, current, patch) {
    if (
      !current ||
      !Number.isSafeInteger(current.revision) ||
      current.revision < 0
    )
      throw new Error("Communication revision is required");
    const context = this.context(request);
    if (current.tenant !== context.tenant)
      throw new Error("Communication context changed");
    const lastMutationId = crypto.randomBytes(32).toString("hex");
    const response = await SERVICE.DefaultCommsIntentService.update({
      ...context,
      query: {
        code: current.code,
        revision: current.revision,
        status: current.status,
      },
      model: {
        ...patch,
        code: current.code,
        revision: current.revision,
        lastMutationId,
      },
      options: { recursive: false },
    });
    this.assertWrite(response);
    if (
      response.result &&
      Object.hasOwn(response.result, "matchedCount") &&
      response.result.matchedCount !== 1
    )
      throw new Error("Communication claim was not applied");
    const saved = await this.read(request, current.code);
    if (
      !saved ||
      saved.code !== current.code ||
      saved.tenant !== context.tenant ||
      saved.revision !== current.revision + 1 ||
      saved.lastMutationId !== lastMutationId ||
      Object.entries(patch).some(([key, value]) =>
        value instanceof Date
          ? new Date(saved[key]).getTime() !== value.getTime()
          : JSON.stringify(saved[key]) !== JSON.stringify(value),
      )
    ) {
      throw new Error("Communication claim could not be confirmed");
    }
    return saved;
  },
  /** Exposes safe delivery evidence without content or recipient addresses. */
  project: function (intent) {
    return {
      intentCode: intent.code,
      status: intent.status,
      attempt: intent.attempt || 0,
      revision: intent.revision,
      nextAttemptAt:
        intent.status === "RETRY_PENDING" ? intent.nextAttemptAt : undefined,
      correlationId: intent.correlationId,
    };
  },
  /** Persists an immutable command using an active configured or published template. */
  request: async function (request, command) {
    const policy = CONFIG.get("communication") || {},
      context = this.context(request),
      core = SERVICE.DefaultCommunicationCoreService;
    if (!(policy.trustedSourceModules || []).includes(command.sourceModule))
      throw new Error("Communication source is not configured");
    for (const key of [
      "sourceType",
      "sourceCode",
      "templateCode",
      "recipientId",
      "recipientAddressReference",
      "purpose",
      "channel",
      "locale",
      "idempotencyKey",
    ])
      if (
        typeof command[key] !== "string" ||
        !command[key] ||
        command[key].length > 512
      )
        throw new Error("Communication command is incomplete");
    command = { ...command, tenant: context.tenant };
    const code =
      "COMM_" +
      crypto
        .createHash("sha256")
        .update(JSON.stringify([context.tenant, command.idempotencyKey]))
        .digest("hex");
    const commandHash = core.hash([
      command.sourceModule,
      command.sourceType,
      command.sourceCode,
      command.templateCode,
      command.recipientId,
      command.recipientAddressReference,
      command.purpose,
      command.channel,
      command.locale,
      command.variables,
    ]);
    let existing = await this.read(request, code);
    if (existing) {
      if (existing.commandHash !== commandHash)
        throw new Error("Communication idempotency conflict");
      return this.project(existing);
    }
    const configured = policy.templates?.[command.templateCode];
    let template =
      configured ||
      SERVICE.DefaultCommunicationTemplateService?.resolve(command, policy);
    if (!template) {
      const parent = (
        await this.list(
          "CommsTemplate",
          request,
          { code: command.templateCode, status: "ACTIVE" },
          1,
        )
      )[0];
      if (parent) {
        const version = (
          await this.list(
            "CommsTemplateVersion",
            request,
            {
              templateCode: parent.code,
              version: parent.currentVersion,
              locale: command.locale,
              channel: command.channel,
              status: "ACTIVE",
            },
            1,
          )
        )[0];
        if (version)
          template = {
            ...version,
            declaredVariables: parent.declaredVariables,
            purpose: parent.purpose,
            channels: parent.channels,
            sourceModules: parent.sourceModules,
          };
      }
    }
    if (
      !template ||
      template.status !== "ACTIVE" ||
      template.purpose !== command.purpose ||
      !template.channels.includes(command.channel) ||
      !template.sourceModules?.includes(command.sourceModule)
    )
      throw new Error("Communication template is unavailable for this source");
    if (template.resourceCode) {
      if (
        template.bodyTemplate !== undefined ||
        template.subjectTemplate !== undefined
      )
        throw new Error(
          "Communication resource reference cannot contain inline presentation",
        );
      if (template.resourceCode !== command.templateCode)
        throw new Error("Communication template resource identity is invalid");
      const reference = template;
      template = SERVICE.DefaultCommunicationTemplateService.resolve(command, {
        ...policy,
        templateResources: {
          ...policy.templateResources,
          selections: {
            ...policy.templateResources?.selections,
            [command.templateCode]: true,
          },
        },
      });
      if (
        !template ||
        template.version !== reference.version ||
        template.purpose !== command.purpose ||
        !template.sourceModules.includes(command.sourceModule)
      )
        throw new Error(
          "Communication template resource reference is unavailable",
        );
    }
    const rendered = template.resourceIdentity
      ? SERVICE.DefaultCommunicationTemplateService.render(
          template,
          command.variables,
          policy,
        )
      : core.render(template, command.variables, policy);
    const suppressions = await this.list("CommsSuppression", request, {
      recipientId: command.recipientId,
      purpose: command.purpose,
      channel: command.channel,
    });
    const prepared = core.intent(command, template, suppressions, null, policy);
    const intent = {
      ...prepared.intent,
      code,
      commandHash,
      renderedContent: rendered,
      attempt: 0,
      revision: 0,
      correlationId: command.correlationId || code,
    };
    try {
      await this.create("CommsIntent", request, intent);
    } catch (error) {
      existing = await this.read(request, code);
      if (!existing) throw error;
      if (existing.commandHash !== commandHash)
        throw new Error("Communication idempotency conflict");
      return this.project(existing);
    }
    return prepared.suppressed
      ? this.project(intent)
      : this.deliver(request, code);
  },
  /** Sends one persisted command; an expired external-send claim is uncertain and never blindly replayed. */
  deliver: async function (request, code) {
    try {
      const envelope = this.context(request);
      const enterpriseCode = request.authData?.entCode || request.entCode;
      if (enterpriseCode !== undefined) {
        if (
          typeof enterpriseCode !== "string" ||
          !/^[A-Za-z0-9_.:@-]{1,128}$/.test(enterpriseCode)
        )
          throw new Error("COMMUNICATION_PRIVATE_CONTEXT_INVALID");
        envelope.entCode = enterpriseCode;
      }
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(
        envelope,
        () => this.deliverPrivate(envelope, code),
      );
    } catch {
      throw new Error("COMMUNICATION_PRIVATE_DELIVERY_UNCONFIRMED");
    }
  },
  /** Reads private persisted content and invokes providers only after exact non-HTTP capture admission. Keeps existing claims, retries and immutable intent semantics. @param {Object} request Detached protected owner context. @param {string} code Original intent code. @returns {Promise<Object>} Content-free delivery projection. */
  deliverPrivate: async function (request, code) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    let current = await this.read(request, code);
    if (!current) throw new Error("Communication intent not found");
    const policy = CONFIG.get("communication") || {};
    if (current.status === "DELIVERING") {
      if (new Date(current.leaseExpiresAt).getTime() > Date.now())
        return this.project(current);
      current = await this.update(request, current, {
        status: current.channel === "IN_APP" ? "RETRY_PENDING" : "UNCERTAIN",
      });
    }
    if (!["ACCEPTED", "RETRY_PENDING"].includes(current.status))
      return this.project(current);
    if (
      current.nextAttemptAt &&
      new Date(current.nextAttemptAt).getTime() > Date.now()
    )
      return this.project(current);
    if (
      current.expiresAt &&
      new Date(current.expiresAt).getTime() <= Date.now()
    )
      return this.project(
        await this.update(request, current, { status: "CANCELLED" }),
      );
    const suppressions = await this.list("CommsSuppression", request, {
      recipientId: current.recipientId,
      purpose: current.purpose,
      channel: current.channel,
    });
    if (
      suppressions.some(
        (s) =>
          (!s.activeFrom || new Date(s.activeFrom) <= new Date()) &&
          (!s.activeUntil || new Date(s.activeUntil) > new Date()),
      )
    )
      return this.project(
        await this.update(request, current, { status: "SUPPRESSED" }),
      );
    if ((current.attempt || 0) >= policy.maximumAttempts)
      return this.project(
        await this.update(request, current, { status: "DEAD_LETTER" }),
      );
    current = await this.update(request, current, {
      status: "DELIVERING",
      attempt: (current.attempt || 0) + 1,
      leaseExpiresAt: new Date(
        Date.now() + (policy.deliveryLeaseMilliseconds || 120000),
      ),
    });
    let outcome,
      providerCode = "in-app";
    try {
      if (current.channel === "IN_APP") {
        const inboxCode = "INBOX_" + current.code,
          found = (
            await this.list(
              "CommsInboxMessage",
              request,
              { code: inboxCode },
              1,
            )
          )[0];
        if (!found) {
          try {
            await this.create("CommsInboxMessage", request, {
              code: inboxCode,
              recipientId: current.recipientId,
              intentCode: current.code,
              title: current.renderedContent.subject || "Update",
              body: current.renderedContent.body,
              status: "UNREAD",
              createdAt: new Date(),
              correlationId: current.correlationId,
            });
          } catch (error) {
            if (
              !(
                await this.list(
                  "CommsInboxMessage",
                  request,
                  { code: inboxCode },
                  1,
                )
              )[0]
            )
              throw error;
          }
        }
        outcome = { status: "DELIVERED", providerReference: inboxCode };
      } else {
        const provider = this.providerPolicy(policy, current.channel);
        providerCode = provider?.code || current.channel;
        const adapter = provider && SERVICE[provider.service];
        if (!adapter)
          outcome = {
            status: "RETRY_PENDING",
            responseCode: "PROVIDER_UNAVAILABLE",
          };
        else
          outcome = await adapter.deliver({
            request,
            intent: current,
            policy: provider,
          });
      }
    } catch (error) {
      outcome = {
        status: current.channel === "IN_APP" ? "RETRY_PENDING" : "UNCERTAIN",
        responseCode: "DELIVERY_INTERRUPTED",
      };
    }
    if (
      ![
        "DELIVERED",
        "RETRY_PENDING",
        "FAILED",
        "UNCERTAIN",
        "SUPPRESSED",
        "UNCONFIGURED",
      ].includes(outcome.status)
    )
      outcome = {
        status: "UNCERTAIN",
        responseCode: "INVALID_PROVIDER_OUTCOME",
      };
    if (outcome.status === "RETRY_PENDING") {
      if (current.attempt >= policy.maximumAttempts)
        outcome.status = "DEAD_LETTER";
      else
        outcome.nextAttemptAt = new Date(
          Date.now() +
            Math.min(
              policy.maximumRetryMilliseconds || 300000,
              (policy.baseRetryMilliseconds || 1000) *
                2 ** (current.attempt - 1),
            ),
        );
    }
    const evidence = SERVICE.DefaultCommunicationCoreService.outcome(
      current.code,
      providerCode,
      current.channel,
      current.attempt,
      outcome,
      { tenant: current.tenant, correlationId: current.correlationId },
    );
    await this.create("CommsDeliveryAttempt", request, {
      ...evidence,
      code: current.code + "_" + current.attempt,
      nextAttemptAt: outcome.nextAttemptAt,
    });
    return this.project(
      await this.update(request, current, {
        status: outcome.status,
        nextAttemptAt: outcome.nextAttemptAt || new Date(0),
        ...(outcome.providerReference
          ? { providerReference: outcome.providerReference }
          : {}),
      }),
    );
  },
  /** Records an explicit operator decision on an uncertain send without silently retrying it. */
  resolveUncertain: async function (request, code, decision) {
    const current = await this.read(request, code);
    if (
      !current ||
      current.status !== "UNCERTAIN" ||
      current.revision !== decision.expectedRevision
    )
      throw new Error(
        "Communication outcome changed; reload before reconciliation",
      );
    if (
      decision.confirmed !== true ||
      !["MARK_DELIVERED", "AUTHORIZE_RESEND", "CANCEL"].includes(
        decision.action,
      ) ||
      typeof decision.reason !== "string" ||
      !decision.reason.trim() ||
      decision.reason.length > 1000 ||
      !decision.operatorRef?.code
    )
      throw new Error("Explicit operator confirmation and reason are required");
    if (
      decision.sourceCode &&
      (current.sourceCode !== decision.sourceCode ||
        current.sourceModule !== decision.sourceModule)
    )
      throw new Error("Communication source mismatch");
    const evidence = {
      action: decision.action,
      reason: decision.reason.trim(),
      operatorRef: decision.operatorRef,
      at: new Date().toISOString(),
      intentRevision: current.revision,
    };
    const history = (current.reconciliation || []).concat(evidence);
    if (history.length > 10)
      throw new Error("Communication reconciliation limit reached");
    if (
      decision.action === "AUTHORIZE_RESEND" &&
      current.attempt >= (CONFIG.get("communication") || {}).maximumAttempts
    )
      throw new Error("Delivery attempt budget is exhausted");
    const status =
      decision.action === "MARK_DELIVERED"
        ? "DELIVERED"
        : decision.action === "CANCEL"
          ? "CANCELLED"
          : "RETRY_PENDING";
    return this.project(
      await this.update(request, current, {
        status,
        reconciliation: history,
        nextAttemptAt: new Date(0),
      }),
    );
  },
  /** Bounded retry reads only persisted state and refuses uncertain or exhausted external sends. */
  retry: async function (request, code) {
    const current = await this.read(request, code);
    if (
      !current ||
      !["ACCEPTED", "RETRY_PENDING", "DELIVERING"].includes(current.status)
    )
      throw new Error("Delivery needs operator review or is not retryable");
    return this.deliver(request, code);
  },
};
