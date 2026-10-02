/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/**
 * @module profile/service/contact/DefaultProfileVerifiedContactWorkspaceService
 * @description Publishes read-only verified Contact task metadata for the live Customer projection, never contact destinations or private identity/proof evidence.
 * @layer service
 * @owner profile
 * @override Later Profile layers may customize configured plain text and focused members while preserving private self admission, qualified Contact policy and exact public projection.
 */
module.exports = {
  /** Raises one credential-free refusal without exposing provider or identity facts. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_AUTH_00003");
  },
  /** Refuses every browser selector, including hidden fields, on this metadata route. @param {*} value Empty route input. @returns {void} Validated empty input. */
  emptyInput: function (value) {
    if (
      value !== undefined &&
      (!value ||
        Object.getPrototypeOf(value) !== Object.prototype ||
        Reflect.ownKeys(value).length)
    )
      this.fail();
  },
  /** Returns the fixed presentation contract, not a permission or executable command registry. @returns {string[]} Exact task text keys. */
  presentationKeys: function () {
    return [
      "title",
      "inspectLabel",
      "emptyMessage",
      "workingLabel",
      "reviewTitle",
      "confirmLabel",
      "cancelLabel",
      "uncertainMessage",
      "unavailableMessage",
      "recordedMessage",
      "channelLabel",
      "purposeLabel",
      "ownerLabel",
      "verificationCodeLabel",
      "beginLabel",
      "verifyLabel",
      "consentLabel",
      "suppressionLabel",
      "grantedLabel",
      "suppressedLabel",
    ];
  },
  /** Copies exact enumerable own string fields without evaluating accessors or accepting HTML/authority extensions. @param {*} value Configured plain-text object. @param {string[]} keys Exact fields. @param {number} [titleMaximum] Title-like field bound for labels versus task title. @returns {Object} Detached bounded strings. */
  textMap: function (value, keys, titleMaximum = 160) {
    if (
      !value ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Reflect.ownKeys(value).length !== keys.length
    )
      this.fail();
    return Object.fromEntries(
      keys.map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key),
          text = descriptor?.value;
        if (
          !descriptor?.enumerable ||
          typeof text !== "string" ||
          !text.trim() ||
          text.length > (key === "title" ? titleMaximum : 500)
        )
          this.fail();
        return [key, text];
      }),
    );
  },
  /** Resolves approved purpose versions/channels through the existing Contact owner while keeping labels separate from its strict descriptor schema. @param {Object} policy Qualified Contact policy. @returns {Object} Plain configured metadata. */
  metadata: function (policy) {
    const owner = SERVICE.DefaultProfileVerifiedContactService,
      codes = Object.keys(policy.purposes),
      labels = this.textMap(policy.purposeLabels, codes, 500);
    const presentation = this.textMap(
      policy.presentation,
      this.presentationKeys(),
    );
    const purposes = codes.map((code) => {
      const entry = policy.purposes[code];
      if (
        !entry ||
        !Array.isArray(entry.channels) ||
        !entry.channels.length ||
        entry.channels.length > 2
      )
        this.fail();
      for (const channel of entry.channels) owner.purpose(code, channel);
      return {
        code,
        version: entry.version,
        channels: [...entry.channels],
        label: labels[code],
      };
    });
    return {
      channels: ["EMAIL", "SMS"].filter((channel) =>
        purposes.some((purpose) => purpose.channels.includes(channel)),
      ),
      purposes,
      presentation,
    };
  },
  /** Reads exactly the signed Customer projection through existing bounded generated inventory and resolves its original canonical identity. @param {Object} request Signed private context. @returns {Promise<Object>} Fresh Customer projection and canonical evidence, retained privately. */
  projection: async function (request) {
    const m = SERVICE.DefaultEnterpriseMembershipService,
      auth = request.authData;
    const rows = await m.inventory("DefaultCustomerService", request.tenant, {
      loginId: auth.loginId,
    });
    if (
      !Array.isArray(rows) ||
      rows.length !== 1 ||
      rows[0].loginId !== auth.loginId ||
      rows[0].active !== true ||
      rows[0].principalType !== "customer"
    )
      this.fail();
    const person = rows[0],
      canonical = await m.resolve(person, request.tenant, "CUSTOMER");
    if (
      !["CUSTOMER", "EMPLOYEE"].includes(canonical.identity?.recordKind) ||
      ((person.authenticationIdentity ||
        canonical.identity.recordKind === "EMPLOYEE") &&
        auth.sessionContext?.owner !== "profile.customerParticipation")
    )
      this.fail();
    return { ownerId: m.recordId(person._id), identity: canonical.identity };
  },
  /** Validates and copies only the published DTO so later owner extensions cannot accidentally return contacts, destinations or proof fields. @param {Object} value Owner result. @returns {Object} Exact content-free public workspace. */
  publicWorkspace: function (value) {
    const keys = [
      "contractVersion",
      "kind",
      "ownerId",
      "channels",
      "purposes",
      "presentation",
    ];
    if (
      !value ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Reflect.ownKeys(value).length !== keys.length ||
      keys.some(
        (key) =>
          !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
          !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value"),
      )
    )
      this.fail();
    if (
      value.contractVersion !== 1 ||
      value.kind !== "PROFILE_VERIFIED_CONTACT_WORKSPACE"
    )
      this.fail();
    const ownerId = SERVICE.DefaultProfileVerifiedContactService.reference(
      value.ownerId,
    );
    const channels = value.channels;
    if (
      !Array.isArray(channels) ||
      !channels.length ||
      channels.length > 2 ||
      new Set(channels).size !== channels.length ||
      channels.some((channel) => !["EMAIL", "SMS"].includes(channel)) ||
      !Array.isArray(value.purposes) ||
      !value.purposes.length ||
      value.purposes.length > 32
    )
      this.fail();
    const purposes = value.purposes.map((purpose) => {
      const fields = ["code", "version", "channels", "label"];
      if (
        !purpose ||
        Object.getPrototypeOf(purpose) !== Object.prototype ||
        Reflect.ownKeys(purpose).length !== fields.length ||
        fields.some(
          (key) =>
            !Object.getOwnPropertyDescriptor(purpose, key)?.enumerable ||
            !Object.hasOwn(
              Object.getOwnPropertyDescriptor(purpose, key),
              "value",
            ),
        )
      )
        this.fail();
      SERVICE.DefaultProfileVerifiedContactService.reference(purpose.code);
      if (
        !Number.isSafeInteger(purpose.version) ||
        purpose.version < 1 ||
        purpose.version > 2147483647 ||
        !Array.isArray(purpose.channels) ||
        !purpose.channels.length ||
        purpose.channels.length > 2 ||
        new Set(purpose.channels).size !== purpose.channels.length ||
        purpose.channels.some((channel) => !channels.includes(channel)) ||
        typeof purpose.label !== "string" ||
        !purpose.label.trim() ||
        purpose.label.length > 500
      )
        this.fail();
      return {
        code: purpose.code,
        version: purpose.version,
        channels: [...purpose.channels],
        label: purpose.label,
      };
    });
    if (
      new Set(purposes.map((purpose) => purpose.code)).size !==
        purposes.length ||
      channels.some(
        (channel) =>
          !purposes.some((purpose) => purpose.channels.includes(channel)),
      )
    )
      this.fail();
    return {
      contractVersion: 1,
      kind: "PROFILE_VERIFIED_CONTACT_WORKSPACE",
      ownerId,
      channels: [...channels],
      purposes,
      presentation: this.textMap(value.presentation, this.presentationKeys()),
    };
  },
  /** Publishes self-only inert metadata after exact sensitive capture, qualified Contact policy and fresh signed Customer/canonical checks. @param {Object} request Signed Customer GET context without selectors. @returns {Promise<Object>} Bounded public metadata, no mutation or Communication call. */
  workspace: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    this.emptyInput(request.body);
    this.emptyInput(request.query);
    this.emptyInput(request.params);
    const auth = request.authData,
      m = SERVICE.DefaultEnterpriseMembershipService;
    if (
      !auth ||
      auth.tokenType !== "access" ||
      auth.principalType !== "customer" ||
      auth.isSystem ||
      typeof request.tenant !== "string" ||
      auth.tenant !== request.tenant ||
      typeof auth.loginId !== "string" ||
      !auth.loginId ||
      auth.loginId.length > 320
    )
      this.fail();
    const policy = SERVICE.DefaultProfileVerifiedContactService.policy();
    if (typeof policy.permission !== "string" || !policy.permission.trim())
      this.fail();
    const metadata = this.metadata(policy);
    const permission = policy.permission;
    const actor = await m.actor(request);
    m.permission(request, permission);
    const selected = await this.projection(request);
    if (m.digest(selected.identity) !== m.digest(actor.identity)) this.fail();
    const current = await this.projection(request),
      currentActor = await m.actor(request);
    const currentPolicy = SERVICE.DefaultProfileVerifiedContactService.policy();
    if (
      typeof currentPolicy.permission !== "string" ||
      !currentPolicy.permission.trim() ||
      currentPolicy.permission !== permission ||
      m.digest(this.metadata(currentPolicy)) !== m.digest(metadata)
    )
      this.fail();
    m.permission(request, currentPolicy.permission);
    if (
      current.ownerId !== selected.ownerId ||
      m.digest(current.identity) !== m.digest(selected.identity) ||
      m.digest(currentActor.identity) !== m.digest(selected.identity)
    )
      this.fail();
    return this.publicWorkspace({
      contractVersion: 1,
      kind: "PROFILE_VERIFIED_CONTACT_WORKSPACE",
      ownerId: selected.ownerId,
      ...metadata,
    });
  },
};
