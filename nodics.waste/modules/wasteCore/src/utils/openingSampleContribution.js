/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/utils/openingSampleContribution @description Installs sealed Local illustrations through fixed Waste owners, with conflict detection and recoverable creation. @layer utility @owner wasteCore */
const { isDeepStrictEqual } = require("node:util");

// Only deployment-pinned, sealed data for these owner-declared schemas can reach generated writes.
module.exports = function openingSample(owner, installer, schemas, dependencies) {
  function fail(message) {
    throw Object.assign(new Error(message), { code: "ERR_WASTE_OPENING_SAMPLE" });
  }

  function exact(row, expected) {
    return row && Object.keys(expected).every(key => isDeepStrictEqual(row[key], expected[key]));
  }

  async function read(request, schema, code, dependencyOwner) {
    const store = SERVICE.DefaultWastePersistenceService;
    const lookup = {
      tenant: request.tenant, authData: request.authData, query: { code }, searchOptions: { pageSize: 2, pageNumber: 1 },
      options: { recursive: false, skipItemCache: true },
    };
    const response = dependencyOwner ? await SERVICE.DefaultModuleService.invokeModule({
      moduleName: dependencyOwner, targetAuthority: { publication: "OPERATIONAL", server: NODICS.getServerName() },
      serviceName: "Default" + schema[0].toUpperCase() + schema.slice(1) + "Service",
      operationName: "get", request: lookup,
    }) : await store.repository(schema).get({ ...lookup, ...store.context(request) });
    if (!/^SUC_/.test(response?.code) || response.error || response.success === false ||
        response.acknowledged === false || response.errors?.length)
      fail("Opening sample read is unconfirmed for " + schema);
    const rows = store.records(response);
    if (rows.length > 1 || rows.some(row => row.code !== code) ||
        (response.count !== undefined && response.count !== rows.length))
      fail("Opening sample identity is ambiguous for " + schema);
    return rows[0];
  }

  async function plan(request) {
    const { contribution, authData: auth } = request;
    const review = CONFIG.get("wasteOpeningSamples")?.reviewed?.[contribution?.releaseCode];
    if (!review || review.checksum !== contribution.checksum || contribution.installer !== installer ||
        contribution.owningDomain !== owner || contribution.dataType !== "sample" ||
        contribution.selectionPolicy !== "EXPLICIT" || contribution.lifecycle !== "REFERENCE" ||
        !isDeepStrictEqual(contribution.environmentScope, ["LOCAL"]) ||
        CONFIG.get("environment")?.class !== "LOCAL" || CONFIG.get("runtimeRole")?.publication !== "OPERATIONAL" ||
        review.tenant !== request.tenant || auth?.tenant !== request.tenant || auth?.principalType !== "human" ||
        !auth.loginId || auth.tokenType !== "access" || auth.isSystem || (auth.entCode || auth.enterpriseCode) !== review.enterprise ||
        [auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== review.enterprise))
      fail("Select the reviewed Local opening sample with the authorized tenant and enterprise");
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    const permissions = security.getGrantedPermissions(request);
    for (const grant of ["import.sample.run", "waste.review.approve"]) {
      if (!security.isPermissionGranted(grant, permissions, {})) fail("Opening sample requires " + grant);
    }
    for (const moduleName of [owner, ...dependencies]) {
      if (!SERVICE.DefaultModuleService.isLocalModuleActive(moduleName))
        fail("Opening samples require co-located operational owner " + moduleName);
    }
    const result = [];
    for (const schema of schemas) {
      const model = NODICS.getModels(owner, request.tenant)?.[UTILS.createModelName(schema)];
      if (!NODICS.getActiveModules().includes(owner) || !model || model.versioned || model.primaryKey !== "code" ||
          typeof model.compareAndSetItem !== "function") fail("Activate the owning Waste model for " + schema);
      const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
      if (!indexes?.indexes?.some(index => index.unique && !index.sparse && !index.partialFilterExpression &&
          (!index.collation || index.collation.locale === "simple") && index.key?.code === 1 &&
          Object.keys(index.key).every(key => ["tenant", "code"].includes(key))))
        fail("Opening sample requires a unique code index on " + schema);
      const managed = SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema);
      if (managed !== (schema === "wasteAsset" ? "revision" : undefined)) fail("Unexpected revision policy for " + schema);
      const payload = await SERVICE.DefaultDataReleaseService.readContributionPayload(contribution, installer, review.files[schema]);
      const rows = Object.values(payload || {});
      if (!rows.length || rows.length > 500 || new Set(rows.map(row => row?.code)).size !== rows.length)
        fail("Opening sample requires distinct records for " + schema);
      for (const row of rows) {
        if (typeof row?.code !== "string" || !row.code || row.revision !== 0 || row.active !== true || row.metadata?.sample !== true ||
            schema === "wasteImpactResult" && (row.calculationStatus !== "ESTIMATED" || row.metadata.publicClaimAllowed !== false) ||
            schema === "wasteAssetOwnershipEvent" && row.transferType !== "CREATE")
          fail("Invalid opening illustration for " + schema);
        const expected = managed ? { ...row, revision: 1 } : row;
        const existing = await read(request, schema, row.code);
        if (existing && !exact(existing, expected)) fail("Opening sample conflicts with existing " + schema + " " + row.code);
        result.push({ schema, row, expected, managed, existing });
      }
    }
    return result;
  }

  async function verifySources(request, items) {
    const events = new Map(items.filter(item => item.schema === "wasteAssetOwnershipEvent")
      .map(item => [item.row.assetCode, item]));
    const assets = items.filter(item => item.schema === "wasteAsset");
    const ordered = [];
    if (assets.length !== events.size || events.size !== items.filter(item => item.schema === "wasteAssetOwnershipEvent").length) fail("Opening assets require one creation event each");
    for (const item of items) {
      const { schema, row } = item;
      if (schema === "wasteAssetOwnershipEvent") continue;
      const submission = await read(request, "wasteSubmission", row.sourceSubmissionCode || row.sourceRef?.code, "wasteSubmission");
      if (submission?.submissionStatus !== "APPROVED" || submission.metadata?.sample !== true ||
          submission.impactRef?.code !== (schema === "wasteImpactResult" ? row.code : row.impactRef?.code))
        fail("Install the matching approved opening submission before " + row.code);
      if (schema === "wasteAsset") {
        const event = events.get(row.code)?.row;
        const verification = await read(request, "wasteVerification", row.verificationRef?.code, "wasteVerification");
        const impact = await read(request, "wasteImpactResult", row.impactRef?.code, "wasteImpact");
        if (event?.triggerRef?.code !== submission.code || !isDeepStrictEqual(event.toOwnerRef, row.originalOwnerRef) ||
            !isDeepStrictEqual(submission.submitterRef, row.originalOwnerRef) || verification?.submissionCode !== submission.code ||
            verification.verificationStatus !== "APPROVED" || impact?.sourceRef?.code !== submission.code ||
            impact.metadata?.sample !== true || impact.metadata?.publicClaimAllowed !== false)
          fail("Install matching opening verification, impact and ownership evidence for " + row.code);
        ordered.push(events.get(row.code));
      }
      ordered.push(item);
    }
    return ordered;
  }

  return {
    async preflightContribution(request) {
      const items = await plan(request);
      return { ready: true, plan: { requiredLocalOwners: [owner, ...dependencies], count: items.length, current: items.filter(item => item.existing).length } };
    },
    async installContribution(request) {
      const items = await plan(request);
      const ordered = await verifySources(request, items);
      for (const { schema, row, existing, expected, managed } of ordered) {
        if (existing) continue;
        const store = SERVICE.DefaultWastePersistenceService;
        const model = { ...row };
        // Tokenless managed save can only create. On an existing row its CAS owner rejects the missing token.
        if (managed) delete model.revision;
        try {
          await store.repository(schema).save({
            ...store.context(request), query: { code: row.code }, model,
            options: managed ? { recursive: false } : { recursive: false, insertOnly: true },
          });
        } catch (error) {
          if (!exact(await read(request, schema, row.code), expected)) throw error;
          continue;
        }
        if (!exact(await read(request, schema, row.code), expected)) fail("Opening sample creation unconfirmed for " + row.code);
      }
      return { installed: items.length };
    },
  };
};
