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
  /** Detaches the generated persistence result. */
  rows: function (response) {
    return JSON.parse(JSON.stringify(response.result || []));
  },
  /** Builds owner storage context after caller authorization. */
  context: function (request) {
    const tenant = request.authData?.tenant || request.tenant;
    if (!tenant) throw new Error("Trusted communication context is required");
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
    await SERVICE["Default" + schema + "Service"].save({
      ...this.context(request),
      model: { ...model, tenant: this.context(request).tenant, active: true },
      options: { recursive: false },
    });
  },
  /** Claims an exact intent revision; concurrent sends fail before transport invocation. */
  update: async function (request, current, patch) {
    if (!Number.isSafeInteger(current.revision))
      throw new Error("Communication revision is required");
    await SERVICE.DefaultCommsIntentService.update({
      ...this.context(request),
      query: { code: current.code, revision: current.revision },
      model: { ...patch, code: current.code, revision: current.revision },
      options: { recursive: false },
    });
    return this.read(request, current.code);
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
    const configured = policy.templates?.[command.templateCode];
    let template = configured;
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
    const rendered = core.render(template, command.variables, policy);
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
        const provider = policy.providers?.[current.channel];
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
