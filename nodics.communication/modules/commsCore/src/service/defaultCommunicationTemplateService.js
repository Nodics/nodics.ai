/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const handlebars = require("handlebars");
const { Parser } = require("htmlparser2");

/**
 * @module commsCore/service/defaultCommunicationTemplateService
 * @description Resolves trusted module-owned presentation resources and renders typed
 * parameters. Reads bounded local artifacts only; never activates modules, sends mail,
 * writes storage or logs content. Invalid resources fail before intent creation.
 * @owner commsCore
 * @layer service
 * @override Later modules may override exported members through the service loader;
 * preserve path confinement, parameter safety, owner identity and immutable retry content.
 */
module.exports = {
  /**
   * Reads effective resource bounds without retaining tenant configuration.
   * @param {object} policy Effective Communication policy.
   * @returns {object} Validated resource policy; throws for invalid limits.
   */
  limits: function (policy) {
    const limits = policy.templateResources;
    if (
      !limits ||
      !Number.isSafeInteger(limits.maximumFileBytes) ||
      limits.maximumFileBytes < 1 ||
      !Number.isSafeInteger(limits.maximumTemplatesPerModule) ||
      limits.maximumTemplatesPerModule < 1 ||
      !Number.isSafeInteger(limits.maximumLayers) ||
      limits.maximumLayers < 1
    )
      throw new Error(
        "Communication template resource limits are invalid",
      );
    return limits;
  },

  /**
   * Reuses discovered owners and indexed module order, followed by selected runtime scopes.
   * Explicit non-active resource owners contribute files only, never executable services.
   * @param {object} policy Effective Communication policy.
   * @returns {object[]} Ordered known module paths; throws for an undiscovered selected owner.
   */
  layers: function (policy) {
    const limits = this.limits(policy);
    if (typeof NODICS === "undefined")
      throw new Error("Communication template discovery is unavailable");
    const runtime = [
      ...new Set(
        [
          NODICS.getEnvironmentName?.(),
          NODICS.getServerRootName?.(),
          NODICS.getServerName?.(),
          NODICS.getNodeName?.(),
        ].filter(Boolean),
      ),
    ];
    const indexed = [...NODICS.getIndexedModules().values()].map(
      (module) => module.name,
    );
    const selected = Object.entries(limits.modules || {})
      .filter(([, enabled]) => enabled === true)
      .map(([name]) => name);
    const names = [
      ...new Set([
        ...selected.filter((name) => !indexed.includes(name)),
        ...indexed.filter((name) => !runtime.includes(name)),
        ...runtime,
      ]),
    ];
    if (names.length > limits.maximumLayers)
      throw new Error("Communication template layer limit exceeded");
    return names
      .map((name) => {
        const module = NODICS.getRawModule(name);
        if (!module?.path)
          throw new Error(
            "Communication template resource owner is unavailable",
          );
        if (
          ["application", "project"].includes(
            module.metaData?.nodics?.kind,
          )
        ) {
          if (selected.includes(name))
            throw new Error(
              "Communication templates require a concrete module owner",
            );
          return undefined;
        }
        return { name, path: module.path };
      })
      .filter(Boolean);
  },

  /**
   * Confines every path component to a discovered module, rejecting symlinks and traversal.
   * @param {object} layer Discovered module metadata.
   * @param {string[]} parts Validated relative path components.
   * @returns {string|undefined} Existing local path; missing paths permit lower-layer fallback.
   */
  localPath: function (layer, parts) {
    const root = fs.realpathSync(layer.path);
    let current = root;
    for (const part of ["src", "templates", ...parts]) {
      if (
        !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part) ||
        part.includes("..")
      )
        throw new Error("Communication template path is invalid");
      current = path.join(current, part);
      let stat;
      try {
        stat = fs.lstatSync(current);
      } catch (error) {
        if (error.code === "ENOENT") return undefined;
        throw new Error(
          "Communication template resource could not be read",
        );
      }
      if (
        stat.isSymbolicLink() ||
        !fs.realpathSync(current).startsWith(root + path.sep)
      )
        throw new Error(
          "Communication template resource escapes its owner",
        );
    }
    return current;
  },

  /**
   * Reads a bounded UTF-8 resource without exposing paths or content in errors.
   * @param {object} layer Discovered owner.
   * @param {string[]} parts Relative resource components.
   * @param {object} limits Resource bounds.
   * @returns {string|undefined} File content, or undefined when absent; throws for unsafe files.
   */
  readFile: function (layer, parts, limits) {
    const file = this.localPath(layer, parts);
    if (!file) return undefined;
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > limits.maximumFileBytes)
      throw new Error(
        "Communication template file is invalid or too large",
      );
    const content = fs.readFileSync(file, "utf8");
    if (Buffer.byteLength(content) > limits.maximumFileBytes)
      throw new Error("Communication template file is too large");
    return content;
  },

  /**
   * Validates an inert manifest. Presentation overrides cannot redefine security ownership.
   * @param {object} manifest Parsed manifest.
   * @param {string} channel Requested delivery channel.
   * @returns {object} Validated manifest; throws without including supplied content.
   */
  validateManifest: function (manifest, channel) {
    if (
      !manifest ||
      manifest.formatVersion !== 1 ||
      manifest.channel !== channel ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(manifest.code || "") ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(
        manifest.ownerModule || "",
      ) ||
      !Number.isSafeInteger(manifest.version) ||
      manifest.version < 1 ||
      manifest.status !== "ACTIVE" ||
      (manifest.requiresSelection !== undefined &&
        typeof manifest.requiresSelection !== "boolean") ||
      typeof manifest.purpose !== "string" ||
      !manifest.purpose ||
      !Array.isArray(manifest.sourceModules) ||
      !manifest.sourceModules.length ||
      manifest.sourceModules.some(
        (name) => typeof name !== "string" || !name,
      ) ||
      !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(
        manifest.defaultLocale || "",
      ) ||
      !manifest.parameters ||
      typeof manifest.parameters !== "object" ||
      Array.isArray(manifest.parameters)
    )
      throw new Error("Communication template manifest is invalid");
    for (const [name, declaration] of Object.entries(
      manifest.parameters,
    )) {
      if (
        !/^[A-Za-z][A-Za-z0-9_]*$/.test(name) ||
        [
          "constructor",
          "prototype",
          "__proto__",
          "if",
          "unless",
          "each",
          "with",
          "lookup",
          "log",
          "helperMissing",
          "blockHelperMissing",
        ].includes(name) ||
        !declaration ||
        declaration.type !== "string" ||
        typeof declaration.required !== "boolean" ||
        !Number.isSafeInteger(declaration.maximumLength) ||
        declaration.maximumLength < 1 ||
        (declaration.required && declaration.default !== undefined) ||
        (declaration.format !== undefined &&
          declaration.format !== "https-url") ||
        (declaration.presentation !== undefined &&
          (declaration.presentation !== "date-time" ||
            declaration.format !== undefined))
      )
        throw new Error(
          "Communication template parameter declaration is invalid",
        );
    }
    return manifest;
  },

  /**
   * Separates the stable parameter contract from customizable optional presentation defaults.
   * @param {object} manifest Validated template declaration.
   * @returns {string} Comparable security/shape identity without branding defaults.
   */
  contractIdentity: function (manifest) {
    return JSON.stringify([
      manifest.code,
      manifest.ownerModule,
      manifest.purpose,
      manifest.channel,
      manifest.requiresSelection === true,
      [...manifest.sourceModules].sort(),
      Object.entries(manifest.parameters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, parameter]) => [
          name,
          parameter.type,
          parameter.required,
          parameter.maximumLength,
          parameter.format,
        ]),
    ]);
  },

  /**
   * Finds matching resource manifests across the existing module graph; duplicate identities
   * at different resource names or changed owner/parameter contracts fail closed.
   * @param {object[]} layers Ordered discovered owners.
   * @param {object} command Template code, channel and locale.
   * @param {object} limits Resource bounds.
   * @returns {object|undefined} Winning manifest and relative resource name.
   */
  manifest: function (layers, command, limits) {
    let found;
    const channel = command.channel.toLowerCase();
    for (const layer of layers) {
      const directory = this.localPath(layer, [channel]);
      if (!directory) continue;
      const names = fs.readdirSync(directory).sort();
      if (names.length > limits.maximumTemplatesPerModule)
        throw new Error("Communication template catalogue limit exceeded");
      for (const name of names) {
        const content = this.readFile(
          layer,
          [channel, name, "template.json"],
          limits,
        );
        if (content === undefined) continue;
        let manifest;
        try {
          manifest = JSON.parse(content);
        } catch (_) {
          throw new Error("Communication template manifest is invalid");
        }
        if (
          !manifest ||
          typeof manifest !== "object" ||
          Array.isArray(manifest)
        )
          throw new Error("Communication template manifest is invalid");
        if (manifest.code !== command.templateCode) continue;
        this.validateManifest(manifest, command.channel);
        if (!found && manifest.ownerModule !== layer.name)
          throw new Error(
            "Communication template must originate from its declared owner",
          );
        if (
          found &&
          (found.name !== name ||
            this.contractIdentity(found.manifest) !==
              this.contractIdentity(manifest))
        )
          throw new Error(
            "Communication template override changes its contract",
          );
        found = { manifest, name };
      }
    }
    return found;
  },

  /**
   * Resolves each file from the requested locale first, then the declared default locale.
   * Later layers replace individual files; malformed files never silently fall back.
   * @param {object} command Immutable caller template selection.
   * @param {object} policy Effective Communication policy.
   * @returns {object|undefined} Detached renderable template with content identity/provenance.
   */
  resolve: function (command, policy) {
    if (
      !["EMAIL", "SMS"].includes(command.channel) ||
      policy.templateResources?.enabled !== true
    )
      return undefined;
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(command.locale || ""))
      throw new Error("Communication template locale is invalid");
    const limits = this.limits(policy),
      layers = this.layers(policy);
    const found = this.manifest(layers, command, limits);
    if (!found) return undefined;
    const manifest = found.manifest,
      files = {},
      provenance = {};
    if (
      manifest.requiresSelection === true &&
      limits.selections?.[manifest.code] !== true
    )
      return undefined;
    const names =
      command.channel === "EMAIL"
        ? ["subject.txt", "email.txt", "email.html"]
        : ["message.txt"];
    for (const file of names) {
      for (const locale of [
        ...new Set([manifest.defaultLocale, command.locale]),
      ]) {
        for (const layer of layers) {
          const parts = [
            command.channel.toLowerCase(),
            found.name,
            locale,
            file,
          ];
          const content = this.readFile(layer, parts, limits);
          if (content !== undefined) {
            files[file] = content;
            provenance[file] = {
              module: layer.name,
              locale,
              resource: parts.join("/"),
            };
          }
        }
      }
      if (files[file] === undefined)
        throw new Error("Communication template bundle is incomplete");
    }
    const resourceIdentity = {
      checksum: crypto
        .createHash("sha256")
        .update(JSON.stringify({ manifest, files }))
        .digest("hex"),
      ownerModule: manifest.ownerModule,
      provenance,
    };
    return {
      ...manifest,
      channels: [manifest.channel],
      declaredVariables: Object.keys(manifest.parameters),
      subjectTemplate: (files["subject.txt"] || "").trimEnd(),
      bodyTemplate: files["email.txt"] ?? files["message.txt"],
      htmlTemplate: files["email.html"],
      resourceIdentity,
    };
  },

  /**
   * Builds scalar render data from declared caller inputs and optional trusted defaults.
   * @param {object} template Resolved template contract.
   * @param {object} variables Caller-supplied values.
   * @param {object} policy Effective rendering bounds.
   * @returns {object} Own-property-only string values; throws on unknown/missing/unsafe input.
   */
  parameters: function (template, variables, policy) {
    if (
      !variables ||
      typeof variables !== "object" ||
      Array.isArray(variables) ||
      Object.keys(template.parameters).length >
        policy.rendering.maximumVariables ||
      Object.keys(variables).some(
        (name) => !Object.hasOwn(template.parameters, name),
      )
    )
      throw new Error("Communication template variable is not declared");
    const data = Object.create(null);
    for (const [name, declaration] of Object.entries(
      template.parameters,
    )) {
      const value = Object.hasOwn(variables, name)
        ? variables[name]
        : declaration.default;
      if (value === undefined && !declaration.required) {
        data[name] = "";
        continue;
      }
      if (
        typeof value !== "string" ||
        (declaration.required && !value.trim()) ||
        value.length > declaration.maximumLength
      )
        throw new Error(
          "Communication template parameter is missing or invalid",
        );
      if (declaration.format === "https-url") {
        let url;
        try {
          url = new URL(value);
        } catch (_) {
          throw new Error("Communication template URL is invalid");
        }
        if (
          url.protocol !== "https:" ||
          url.username ||
          url.password ||
          /[\r\n]/.test(value)
        )
          throw new Error("Communication template URL is invalid");
      }
      data[name] =
        declaration.presentation === "date-time"
          ? this.presentDateTime(value, policy)
          : value;
      if (data[name].length > declaration.maximumLength)
        throw new Error(
          "Communication template presentation exceeds parameter bounds",
        );
    }
    return data;
  },

  /**
   * Formats an absolute timestamp for message text only, never challenge or intent state.
   * @param {string} value Existing canonical timestamp parameter with explicit offset.
   * @param {object} policy Effective layered rendering policy; never host locale/timezone.
   * @returns {string} Readable date, time and timezone; failures omit supplied values.
   * @override Later layers may replace presentation while preserving canonical inputs and bounds.
   */
  presentDateTime: function (value, policy) {
    const settings = policy.rendering.dateTime;
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) ||
      !Number.isFinite(Date.parse(value)) ||
      typeof settings?.locale !== "string" ||
      !settings.locale ||
      settings.locale.length > 64 ||
      typeof settings?.timeZone !== "string" ||
      !settings.timeZone ||
      settings.timeZone.length > 128
    )
      throw new Error("Communication date-time presentation is invalid");
    try {
      if (
        Intl.DateTimeFormat.supportedLocalesOf([settings.locale])
          .length !== 1
      )
        throw new Error("Unsupported locale");
      return new Intl.DateTimeFormat(settings.locale, {
        timeZone: settings.timeZone,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        timeZoneName: "short",
      }).format(new Date(value));
    } catch (_) {
      throw new Error("Communication date-time presentation is invalid");
    }
  },

  /**
   * Uses Handlebars parsing/escaping with only simple declared expressions, no executable
   * helpers, blocks, partials, raw values, prototype traversal or dynamic lookup.
   * @param {string} source Trusted authored presentation file.
   * @param {object} data Validated own-property scalar values.
   * @param {boolean} html Whether to HTML-escape dynamic values.
   * @returns {string} Rendered representation; throws for unsupported template syntax.
   */
  interpolate: function (source, data, html) {
    let ast;
    try {
      ast = handlebars.parse(source);
    } catch (_) {
      throw new Error("Communication template syntax is invalid");
    }
    for (const node of ast.body) {
      if (
        node.type === "ContentStatement" ||
        node.type === "CommentStatement"
      )
        continue;
      if (
        node.type !== "MustacheStatement" ||
        !node.escaped ||
        node.params.length ||
        node.hash?.pairs.length ||
        node.path?.type !== "PathExpression" ||
        !/^[A-Za-z][A-Za-z0-9_]*$/.test(node.path.original) ||
        !Object.hasOwn(data, node.path.original)
      )
        throw new Error(
          "Communication template executable or undeclared expression is prohibited",
        );
    }
    return handlebars.compile(ast, {
      strict: true,
      noEscape: !html,
      knownHelpersOnly: true,
    })(data, {
      allowProtoMethodsByDefault: false,
      allowProtoPropertiesByDefault: false,
    });
  },

  /**
   * Rejects executable email elements/attributes and enforces typed, quoted URL placeholders.
   * Templates are trusted deployment resources, not an arbitrary HTML upload/sanitization API.
   * @param {string} source Authored HTML before interpolation.
   * @param {object} parameters Declared parameter contracts.
   * @returns {void} Throws for active markup or unsafe dynamic attribute contexts.
   */
  validateHtml: function (source, parameters) {
    const parser = new Parser(
      {
        onopentagname: (name) => {
          if (
            name.includes("{{") ||
            [
              "script",
              "style",
              "iframe",
              "object",
              "embed",
              "form",
              "input",
              "button",
              "textarea",
              "select",
              "svg",
              "math",
              "base",
              "link",
            ].includes(name)
          )
            throw new Error(
              "Communication template active HTML is prohibited",
            );
        },
        onattribute: (name, value, quote) => {
          if (
            name.includes("{{") ||
            name.startsWith("on") ||
            [
              "srcdoc",
              "http-equiv",
              "srcset",
              "background",
              "action",
              "formaction",
              "xlink:href",
            ].includes(name)
          )
            throw new Error(
              "Communication template active HTML attribute is prohibited",
            );
          const dynamic = value.includes("{{");
          if (dynamic) {
            const match = /^{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}$/.exec(
              value,
            );
            if (
              !["href", "src"].includes(name) ||
              !quote ||
              !match ||
              parameters[match[1]]?.format !== "https-url"
            )
              throw new Error(
                "Communication template dynamic attribute requires a quoted HTTPS URL parameter",
              );
          } else if (["href", "src"].includes(name)) {
            let url;
            try {
              url = new URL(value);
            } catch (_) {
              throw new Error("Communication template URL is invalid");
            }
            if (url.protocol !== "https:" || url.username || url.password)
              throw new Error("Communication template URL is invalid");
          }
          if (
            name === "style" &&
            /url\s*\(|expression\s*\(|@import|\\/i.test(value)
          )
            throw new Error(
              "Communication template active CSS is prohibited",
            );
        },
      },
      { decodeEntities: true },
    );
    parser.write(source);
    parser.end();
  },

  /**
   * Produces plain text and optional HTML, preserving private provenance for durable intents.
   * @param {object} template Resolved resource bundle.
   * @param {object} variables Dynamic message values; never logged.
   * @param {object} policy Effective rendering bounds.
   * @returns {object} Subject/body/optional HTML plus content-free template identity.
   */
  render: function (template, variables, policy) {
    const data = this.parameters(template, variables || {}, policy);
    const rendered = {
      subject: this.interpolate(template.subjectTemplate, data, false),
      body: this.interpolate(template.bodyTemplate, data, false),
    };
    if (template.htmlTemplate !== undefined) {
      this.validateHtml(template.htmlTemplate, template.parameters);
      rendered.html = this.interpolate(template.htmlTemplate, data, true);
    }
    if (/[\r\n\0]/.test(rendered.subject))
      throw new Error("Communication template subject is invalid");
    if (template.resourceIdentity)
      rendered.templateIdentity = template.resourceIdentity;
    if (
      Buffer.byteLength(JSON.stringify(rendered)) >
      policy.rendering.maximumRenderedBytes
    )
      throw new Error(
        "Communication template rendered content is too large",
      );
    return rendered;
  },

  /**
   * Adapts persisted/configured legacy text to the same parser and rendering contract.
   * Preserves optional blank text variables, but rejects objects and executable syntax.
   * @param {object} template Legacy subject/body and declared variable names.
   * @param {object} variables Scalar legacy input values.
   * @param {object} policy Effective rendering limits.
   * @returns {object} Plain subject/body; never upgrades legacy text to executable HTML.
   */
  renderLegacy: function (template, variables, policy) {
    if (
      !template ||
      typeof template.bodyTemplate !== "string" ||
      (template.subjectTemplate !== undefined &&
        typeof template.subjectTemplate !== "string") ||
      template.htmlTemplate !== undefined ||
      !Array.isArray(template.declaredVariables)
    )
      throw new Error("Communication legacy text template is invalid");
    const limit = policy.rendering.maximumRenderedBytes;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      Buffer.byteLength(template.bodyTemplate) > limit ||
      Buffer.byteLength(template.subjectTemplate || "") > limit ||
      template.declaredVariables.length > policy.rendering.maximumVariables
    )
      throw new Error("Communication legacy text template exceeds limits");
    const parameters = Object.fromEntries(
      template.declaredVariables.map((name) => [
        name,
        {
          type: "string",
          required: false,
          maximumLength: policy.rendering.maximumRenderedBytes,
        },
      ]),
    );
    this.validateManifest(
      {
        formatVersion: 1,
        code: "LegacyText",
        ownerModule: "commsCore",
        channel: "TEXT",
        version: 1,
        status: "ACTIVE",
        purpose: "COMPATIBILITY",
        sourceModules: ["commsCore"],
        defaultLocale: "en",
        parameters,
      },
      "TEXT",
    );
    const values = Object.create(null);
    for (const [key, value] of Object.entries(variables || {})) {
      if (!Object.hasOwn(parameters, key))
        throw new Error("communication variable is not declared");
      if (!["string", "number", "boolean"].includes(typeof value))
        throw new Error("Communication legacy parameter is invalid");
      values[key] = String(value);
    }
    return this.render(
      {
        subjectTemplate: template.subjectTemplate || "",
        bodyTemplate: template.bodyTemplate,
        parameters,
      },
      values,
      policy,
    );
  },
};
