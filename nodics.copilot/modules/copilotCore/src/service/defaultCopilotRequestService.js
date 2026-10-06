/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotCore/src/service/defaultCopilotRequestService @description Normalizes tenant-bound Copilot requests without invoking a provider. @layer service @owner copilotCore @override Later modules may override individual normalization methods. */
module.exports = {
  /** Parses only the explicit Product command; untrusted values remain subject to productCommandInput. @param {string} message Human input. @returns {Object|null} Typed command or no match. */
  parseProductCommand: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const command = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      return command?.operation === "commerce.product.create" ? command : null;
    } catch {
      return null;
    }
  },
  /** Validates explicit product proposals before plan persistence; never supplies money or lifecycle defaults for model output. @param {Object} command Typed input. @returns {Object} Valid command or missing-field clarification. */
  productCommandInput: function (command) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    };
    const fields = [
      "count",
      "name",
      "codePrefix",
      "catalogVersion",
      "priceBookCode",
      "currency",
      "price",
      "active",
    ];
    if (
      !command ||
      typeof command !== "object" ||
      Array.isArray(command) ||
      command.operation !== "commerce.product.create" ||
      Object.keys(command).some(
        (key) => !["operation", ...fields].includes(key),
      )
    )
      fail();
    const missing = fields.filter(
      (key) =>
        command[key] === undefined ||
        command[key] === null ||
        command[key] === "",
    );
    for (const key of fields) {
      if (missing.includes(key)) continue;
      const value = command[key];
      if (key === "count") {
        if (!Number.isInteger(value) || value < 1 || value > 100) fail();
      } else if (key === "active") {
        if (typeof value !== "boolean") fail();
      } else {
        if (
          typeof value !== "string" ||
          !value.trim() ||
          value.length > 256 ||
          /[\u0000-\u001f]/.test(value)
        )
          fail();
        if (
          ["codePrefix", "catalogVersion", "priceBookCode"].includes(key) &&
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(value)
        )
          fail();
        if (key === "currency" && !/^[A-Z]{3}$/.test(value)) fail();
        if (key === "price" && !/^\d{1,24}(?:\.\d{1,12})?$/.test(value)) fail();
      }
    }
    return missing.length
      ? { state: "CLARIFICATION_REQUIRED", missing }
      : { command };
  },
  /** Classifies deterministic live-read and export routes before provider invocation. */
  assessReadIntent: function (message) {
    const prompt = String(message || "").trim();
    const moduleSubject =
      /\bmodules?\b/iu.test(prompt) &&
      /\b(nodics|framework|available|active|registered)\b/iu.test(prompt);
    const count = /\b(how many|number|count|total)\b/iu.test(prompt);
    const list = /\b(list|show|which|what)\b/iu.test(prompt);
    const exportMatch = prompt.match(
      /\b(?:export|download)\b[\s\S]*\b(csv|xlsx|excel|text|txt)\b/iu,
    );
    const explanation = /\b(explain|why|owns?|ownership|responsible|responsibility|handles?|implements?)\b/iu.test(prompt);
    if (!moduleSubject) return { type: "KNOWLEDGE" };
    if (explanation && !count && !exportMatch) return { type: "KNOWLEDGE" };
    if (!count && !list && !exportMatch) return { type: "KNOWLEDGE" };
    return {
      type: exportMatch ? "EXPORT" : "LIVE_READ",
      operation:
        count && !list ? "framework.modules.count" : "framework.modules.list",
      format: exportMatch
        ? { excel: "xlsx", txt: "text" }[exportMatch[1].toLowerCase()] ||
          exportMatch[1].toLowerCase()
        : undefined,
    };
  },
  /** Detects mutation intent that must be resolved before model generation or tool execution. */
  assessMutationIntent: function (message) {
    const prompt = String(message || "").trim();
    const mutation =
      /\b(create|add|update|change|delete|remove|configure)\b/iu.test(prompt);
    if (!mutation) return { mutation: false, ambiguous: false, missing: [] };
    const product = /\bproducts?\b/iu.test(prompt);
    if (
      !product ||
      !/\b(create|add)\b/iu.test(prompt) ||
      /\b(update|change|delete|remove)\b/iu.test(prompt)
    )
      return {
        mutation: true,
        ambiguous: true,
        missing: ["target and supported operation"],
        prompt:
          "Please specify a supported creation operation and all required values. No change will be made until you review and explicitly confirm the final plan.",
      };
    const missing = [];
    const hasValue = (label) =>
      new RegExp("\\b" + label + "\\s*(?::|=|is\\b)?\\s+[^,;]+", "iu").test(
        prompt,
      );
    if (
      !/\b(?:count|quantity)\s*[:=]\s*\d+\b/iu.test(prompt) &&
      !/\b\d+\s+[^.]*products?\b/iu.test(prompt)
    )
      missing.push("quantity");
    if (!hasValue("(?:codePrefix|code prefix)")) missing.push("code prefix");
    if (!hasValue("(?:catalogVersion|catalog version)"))
      missing.push("catalog version");
    if (!hasValue("(?:priceBookCode|price book)")) missing.push("price book");
    if (!/\bcurrency\s*(?::|=|is\b)?\s+[A-Z]{3}\b/u.test(prompt))
      missing.push("currency");
    if (
      !/\bprice\b(?!\s+book\b)\s*(?::|=|is\b)?\s+\d+(?:\.\d+)?\b/iu.test(prompt)
    )
      missing.push("price");
    return {
      mutation: true,
      ambiguous: missing.length > 0,
      missing: missing,
      prompt: missing.length
        ? "Before I prepare these products, please provide: " +
          missing.join(", ") +
          ". No product will be created until the completed preview is explicitly confirmed."
        : null,
    };
  },
  /** Extracts the bounded product-create fields after ambiguity checks have passed. */
  parseProductCreateIntent: function (message) {
    const prompt = String(message || "").trim(),
      value = (label) => {
        const match = prompt.match(
          new RegExp("\\b" + label + "\\s*(?::|=|is\\b)?\\s+([^,;]+)", "iu"),
        );
        return match && match[1].trim();
      };
    const count = prompt.match(/\b(\d+)\s+([^.]*?)\s+products?\b/iu);
    return {
      count: count ? Number(count[1]) : undefined,
      name: count
        ? count[2].replace(/^(?:create|add)\s+/iu, "").trim()
        : undefined,
      codePrefix: value("(?:codePrefix|code prefix)"),
      catalogVersion: value("(?:catalogVersion|catalog version)"),
      priceBookCode: value("(?:priceBookCode|price book)"),
      currency: value("currency"),
      price: value("price\\b(?!\\s+book\\b)"),
    };
  },
  /** Normalizes an inbound request. @param {Object} request Raw request. @returns {Object} Normalized request. @throws {Error} When required context is absent. */
  normalize: function (request) {
    const source = request || {};
    if (!source.tenant || !source.actor || !String(source.prompt || "").trim())
      throw new Error("COPILOT_REQUEST_CONTEXT_REQUIRED");
    return {
      tenant: String(source.tenant),
      actor: String(source.actor),
      prompt: String(source.prompt).trim(),
      conversationId: source.conversationId || null,
      channel: source.channel || "axis",
      locale: source.locale || "en",
      permissions: Array.isArray(source.permissions)
        ? source.permissions.slice()
        : [],
      correlationId: source.correlationId || null,
      metadata: Object.assign({}, source.metadata || {}),
    };
  },
};
