/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/service/DefaultCopilotKnowledgeMigrationService
 * @description Authorizes reviewed retirement of dedicated legacy indexes only after policy-current replacement generations have been physically verified.
 * @layer service @owner copilotKnowledge
 * @override Preserve independent grants, exact configured tenant/enterprise plans, all-source authorization, native provider barriers and honest retained-data status. Never infer historical writer completion.
 */
module.exports = {
  /** Rejects without disclosing physical topology or inaccessible sources. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPK_00025");
  },
  /** Selects a server-owned migration plan with current permissions for every replacement source. @param {Object} request Employee request. @param {boolean|string} write False for inspection, true for retirement, or ERASE for independent erasure admission. @returns {Object} Authorized declaration. */
  authorize: function (request, write = false) {
    const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
    const configuration = runtime.configuration();
    const policy = configuration.knowledge?.legacyMigration;
    const context = runtime.securityContext(request, configuration);
    const code = request.migrationCode;
    if (
      context.channel !== "EMPLOYEE" ||
      context.tenant !== request.tenant ||
      context.actor !== request.authData?.loginId ||
      !context.enterprise ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.knowledge.migration.read",
      ) ||
      (write &&
        (policy?.enabled !== true ||
          !SERVICE.DefaultCopilotPolicyService.hasPermission(
            context,
            "copilot.knowledge.migration.execute",
          ))) ||
      (write === "ERASE" &&
        (policy?.erasureEnabled !== true ||
          !SERVICE.DefaultCopilotPolicyService.hasPermission(
            context,
            "copilot.knowledge.migration.erase",
          ))) ||
      typeof code !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code) ||
      !Object.hasOwn(policy?.plans || {}, code)
    )
      this.fail();
    const plan = policy.plans[code];
    if (
      !plan ||
      plan.tenantCode !== context.tenant ||
      plan.enterpriseCode !== context.enterprise ||
      typeof plan.label !== "string" ||
      !plan.label.trim() ||
      plan.label.length > 160 ||
      typeof plan.legacyIndexName !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(plan.legacyIndexName) ||
      !Array.isArray(plan.sourceCodes) ||
      plan.sourceCodes.length < 1 ||
      plan.sourceCodes.length > 100 ||
      new Set(plan.sourceCodes).size !== plan.sourceCodes.length
    )
      this.fail();
    const selections = plan.sourceCodes.map((sourceCode) =>
      SERVICE.DefaultCopilotKnowledgeCleanupService.authorize(
        { ...request, sourceCode, securityContext: context },
        "copilot.knowledge.migration.read",
      ),
    );
    if (
      selections.some(
        (selected) => selected.scope.indexName === plan.legacyIndexName,
      )
    )
      this.fail();
    return {
      plan: structuredClone(plan),
      context,
      selections,
      fingerprint: SERVICE.DefaultModelCommandReceiptService.digest([
        context.tenant,
        context.enterprise,
        context.actor,
        plan,
        selections.map((selected) => [
          [
            selected.scope.tenant,
            selected.scope.indexName,
            selected.scope.indexConfigurationCode,
            selected.scope.ownerType,
            selected.scope.ownerCode,
          ],
          selected.binding,
          selected.source.sourcePolicyDigest,
        ]),
      ]),
    };
  },
  /** Exposes only plans fully visible to the current actor, with backend-owned copy. @param {Object} request Employee request. @returns {Object|null} Inert inventory. */
  inventory: function (request) {
    const policy =
      SERVICE.DefaultCopilotKnowledgeRuntimeService.configuration().knowledge
        ?.legacyMigration;
    const entries = Object.keys(policy?.plans || {});
    if (!entries.length || entries.length > 20) return null;
    const plans = entries.flatMap((code) => {
      try {
        const selected = this.authorize({ ...request, migrationCode: code });
        return [
          {
            code,
            label: selected.plan.label,
            canExecute:
              policy.enabled === true &&
              SERVICE.DefaultCopilotPolicyService.hasPermission(
                selected.context,
                "copilot.knowledge.migration.execute",
              ),
            canErase:
              policy.enabled === true &&
              policy.erasureEnabled === true &&
              [
                "copilot.knowledge.migration.execute",
                "copilot.knowledge.migration.erase",
              ].every((grant) =>
                SERVICE.DefaultCopilotPolicyService.hasPermission(
                  selected.context,
                  grant,
                ),
              ),
          },
        ];
      } catch {
        return [];
      }
    });
    return plans.length ? { plans, presentation: policy.presentation } : null;
  },
  /** Builds a generic Discovery declaration with fresh source and replacement checks. @param {Object} request Employee request. @param {boolean|string} write False for inspection, true for retirement, or ERASE for independent erasure admission. @returns {Object} Trusted owner request. */
  declaration: function (request, write) {
    const selected = this.authorize(request, write);
    const assertCurrent = () => {
      if (this.authorize(request, write).fingerprint !== selected.fingerprint)
        this.fail();
    };
    return {
      tenant: request.tenant,
      enterpriseCode: selected.context.enterprise,
      principalCode: selected.context.actor,
      authData: request.authData,
      planCode: request.migrationCode,
      ownerType: "COPILOT_KNOWLEDGE",
      legacyIndexName: selected.plan.legacyIndexName,
      assertCurrent,
      replacementEvidence: async (legacy) => {
        const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
        const evidence = [];
        for (const selection of selected.selections) {
          assertCurrent();
          const model =
            SERVICE.DefaultDiscoveryDocumentProjectionService.getSearchModel({
              ...selection.scope,
            });
          if (
            !model?.indexDef?.indexName ||
            model.indexDef.indexName.toLowerCase() === legacy.index
          )
            this.fail();
          const manifest = await owner.read(selection.scope);
          if (
            !manifest?.currentGeneration ||
            manifest.pendingGeneration ||
            manifest.currentGeneration.digest !==
              selection.source.sourcePolicyDigest ||
            manifest.currentGeneration.writer?.state !== "SEALED"
          )
            this.fail();
          const count = await owner.count(
            selection.scope,
            manifest.currentGeneration.token,
          );
          const current = await owner.read(selection.scope);
          if (
            count !== manifest.currentGeneration.count ||
            current?.revision !== manifest.revision ||
            current.currentGeneration?.token !==
              manifest.currentGeneration.token ||
            SERVICE.DefaultDiscoveryDocumentProjectionService.getSearchModel({
              ...selection.scope,
            }) !== model
          )
            this.fail();
          evidence.push({
            sourceCode: selection.source.code,
            logicalIndexName: selection.scope.indexName,
            indexConfigurationCode: selection.scope.indexConfigurationCode,
            revision: manifest.revision,
            generation: manifest.currentGeneration,
            indexName: model.indexDef.indexName,
          });
        }
        assertCurrent();
        return evidence;
      },
    };
  },
  /** Reviews replacement readiness without touching legacy writes. @param {Object} request Employee request. @returns {Promise<Object>} Review. */
  preview: async function (request) {
    try {
      if (Object.keys(request.body || {}).length) this.fail();
      return await SERVICE.DefaultDiscoveryIndexRetirementService.preview(
        this.declaration(request, true),
      );
    } catch {
      this.fail();
    }
  },
  /** Executes one explicit, exact review through the canonical Discovery owner. @param {Object} request Employee confirmation. @returns {Promise<Object>} Original result. */
  execute: async function (request) {
    try {
      const body = request.body || {};
      if (
        Object.keys(body).length !== 2 ||
        body.confirmed !== true ||
        !/^[a-f0-9]{64}$/.test(body.reviewDigest || "")
      )
        this.fail();
      return await SERVICE.DefaultDiscoveryIndexRetirementService.execute(
        this.declaration(request, true),
        body.reviewDigest,
      );
    } catch {
      this.fail();
    }
  },
  /** Reads original evidence with mutation disabled; missing evidence never enables retry. @param {Object} request Employee request. @returns {Promise<Object>} Original status. */
  inspect: async function (request) {
    try {
      if (Object.keys(request.body || {}).length) this.fail();
      const declaration = this.declaration(request, false);
      const owner = SERVICE.DefaultDiscoveryIndexRetirementService;
      return owner.project(declaration, await owner.inspect(declaration));
    } catch {
      this.fail();
    }
  },
  /** Reviews separately authorized physical erasure; accepts no caller topology or credential evidence. @param {Object} request Employee request. @returns {Promise<Object>} Erasure review. */
  previewErasure: async function (request) {
    try {
      if (Object.keys(request.body || {}).length) this.fail();
      return await SERVICE.DefaultDiscoveryIndexRetirementService.previewErasure(
        this.declaration(request, "ERASE"),
      );
    } catch {
      this.fail();
    }
  },
  /** Deletes only the exact independently reviewed original legacy index once. @param {Object} request Explicit employee confirmation. @returns {Promise<Object>} Original erasure result. */
  erase: async function (request) {
    try {
      const body = request.body || {};
      if (
        Object.keys(body).length !== 2 ||
        body.confirmed !== true ||
        !/^[a-f0-9]{64}$/.test(body.reviewDigest || "")
      )
        this.fail();
      return await SERVICE.DefaultDiscoveryIndexRetirementService.erase(
        this.declaration(request, "ERASE"),
        body.reviewDigest,
      );
    } catch {
      this.fail();
    }
  },
  /** Inspects original erasure with command gates disabled; absent bytes alone do not prove an acknowledged command. @param {Object} request Employee request. @returns {Promise<Object>} Original status. */
  inspectErasure: async function (request) {
    try {
      if (Object.keys(request.body || {}).length) this.fail();
      const declaration = this.declaration(request, false);
      const owner = SERVICE.DefaultDiscoveryIndexRetirementService;
      return owner.projectErasure(
        declaration,
        await owner.erasureEvidence(declaration),
      );
    } catch {
      this.fail();
    }
  },
};
