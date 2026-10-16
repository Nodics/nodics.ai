/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultIdentityCatalogueService
 * @description Reads governed permission vocabulary and enterprise role definitions from Profile's authority partition.
 * @layer service
 * @owner profile
 * @override Extend through Profile services and owner-module data packs, never configuration fallbacks or cached authority.
 */
module.exports = {
  /** Rejects incomplete or unavailable authority evidence. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003", "Identity catalogue evidence is unavailable or invalid"); },
  /** Uses the existing Profile authority partition, independent of the caller's selected enterprise. */
  tenant: function () { return CONFIG.get("defaultTenant") || "default"; },
  /** Validates exact persisted reference codes without normalising untrusted selectors. */
  codes: function (values, allowEmpty = true, allowFullAccess = false) {
    if (!Array.isArray(values) || (!allowEmpty && !values.length) || values.length > 10000 ||
        values.some(value => typeof value !== "string" || !(allowFullAccess && value === "*") && !/^[A-Za-z0-9][A-Za-z0-9_.:*-]{0,191}$/.test(value)) ||
        new Set(values).size !== values.length) this.fail();
    return values;
  },
  /** Reads a complete fresh catalogue using the existing bounded security inventory owner. */
  rows: async function (serviceName, query) {
    const service = SERVICE[serviceName], owner = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    if (typeof service?.get !== "function" || typeof owner?.inventory !== "function") this.fail();
    return owner.inventory({ get: request => SERVICE.DefaultIdentityCatalogueGovernanceService.read(service, request) }, this.tenant(), query);
  },
  /** Validates vocabulary only; this method never establishes a caller's grant or delegation ceiling. */
  requirePermissions: async function (codes) {
    this.codes(codes, true, true);
    if (!codes.length) return [];
    const rows = await this.rows("DefaultPermissionService", { code: { $in: codes }, active: true });
    if (rows.length !== codes.length || new Set(rows.map(row => row.code)).size !== rows.length ||
        rows.some(row => row.active !== true || !codes.includes(row.code))) this.fail();
    return rows;
  },
  /** Resolves a fresh exact role; persisted groups remain the permission mapping authority. */
  role: async function (code) {
    this.codes([code], false);
    const rows = await this.rows("DefaultEnterpriseRoleService", { code, active: true });
    if (rows.length !== 1 || rows[0].code !== code || rows[0].active !== true) this.fail();
    const role = rows[0];
    this.businessMetadata(role);
    this.codes(role.groupCodes, false);
    if (role.groupCodes.includes("platformAdministratorUserGroup")) this.fail();
    this.codes(role.assignmentPermissions);
    if (role.scopeType !== "ENTERPRISE" || typeof role.delegable !== "boolean") this.fail();
    await this.requirePermissions(role.assignmentPermissions);
    const groups = await this.rows("DefaultUserGroupService", { code: { $in: role.groupCodes }, active: true });
    if (groups.length !== role.groupCodes.length || new Set(groups.map(row => row.code)).size !== groups.length ||
        groups.some(row => row.active !== true || !role.groupCodes.includes(row.code))) this.fail();
    return { ...role, label: role.label || role.name, groupCodes: [...role.groupCodes], assignmentPermissions: [...role.assignmentPermissions] };
  },
  /** Returns current role definitions for governed selection, never as a substitute for assignment authorisation. */
  roles: async function () {
    const rows = await this.rows("DefaultEnterpriseRoleService", { active: true });
    const result = {};
    for (const row of rows) {
      if (Object.hasOwn(result, row.code)) this.fail();
      result[row.code] = await this.role(row.code);
    }
    return result;
  },
  /** Validates optional all-or-nothing business presentation; special responsibilities have no access level.
   * @param {Object} role Fresh persisted role definition, never a caller grant.
   * @returns {Object|null} Inert area metadata; no mutation or permission expansion.
   * @throws {Error} Incomplete metadata, administrative roles or unsupported scopes reject.
   */
  businessMetadata: function (role) {
    const fields = ["businessArea", "businessAreaLabel", "accessLevel"];
    if (fields.every(field => role[field] === undefined)) return null;
    this.codes([role.businessArea], false);
    this.codes([role.ownerModule], false);
    if (typeof role.businessAreaLabel !== "string" || !role.businessAreaLabel.trim() || role.businessAreaLabel.length > 192 ||
        !["view", "edit", "fullControl"].includes(role.accessLevel) || role.administrationClass || role.scopeType !== "ENTERPRISE") this.fail();
    return { code: role.businessArea, label: role.businessAreaLabel, ownerModule: role.ownerModule, scopeType: role.scopeType };
  },
  /** Projects explicit persisted definitions only; duplicate area/level ownership rejects rather than picking a winner.
   * @param {Object} roles Fresh validated role catalogue from roles().
   * @returns {Object[]} Sorted inert business choices with canonical role references.
   * @throws {Error} Ambiguous definitions reject; later owners customize persisted records, not verb classifiers.
   */
  businessAreas: function (roles) {
    const areas = new Map();
    for (const role of Object.values(roles)) {
      const metadata = this.businessMetadata(role);
      if (!metadata || role.active !== true || role.delegable !== true) continue;
      const area = areas.get(metadata.code) || { ...metadata, levels: [] };
      if (area.ownerModule !== metadata.ownerModule || area.label !== metadata.label || area.scopeType !== metadata.scopeType ||
          area.levels.some(level => level.value === role.accessLevel)) this.fail();
      area.levels.push({ value: role.accessLevel, roleCode: role.code });
      areas.set(area.code, area);
    }
    const order = ["view", "edit", "fullControl"];
    return [...areas.values()].sort((left, right) => left.code.localeCompare(right.code)).map(area => ({
      ...area, levels: area.levels.sort((left, right) => order.indexOf(left.value) - order.indexOf(right.value)),
    }));
  },
  /** Imports reference definitions insert-only through existing generated owners, preserving all installed Axis decisions. */
  ensureReferenceAll: async function (service, request) {
    const models = request?.models;
    if (!request?.tenant || !request.authData || !Array.isArray(models) || models.length > 1000 ||
        ![SERVICE.DefaultPermissionService, SERVICE.DefaultEnterpriseRoleService, SERVICE.DefaultUserGroupService].includes(service) ||
        typeof service?.get !== "function" || typeof service?.save !== "function") this.fail();
    this.codes(models.map(model => model?.code), true, service === SERVICE.DefaultPermissionService);
    await SERVICE.DefaultIdentityCatalogueGovernanceService.authorizeSeed(request, service);
    const result = [];
    for (const model of models) {
      if (!model || Object.getPrototypeOf(model) !== Object.prototype || model._id ||
          Object.keys(model).some(key => key.startsWith("$") || key.includes("."))) this.fail();
      const read = async () => {
        const response = await SERVICE.DefaultIdentityCatalogueGovernanceService.read(service, { tenant: request.tenant, authData: request.authData,
          query: { code: model.code }, options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 2, pageNumber: 1 } });
        if (!/^SUC_/.test(response?.code || "") ||
            response.success !== undefined && response.success !== true ||
            response.acknowledged !== undefined && response.acknowledged !== true || response.error ||
            response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
            !Array.isArray(response.result) || response.count !== response.result.length || response.result.length > 1 ||
            response.result.some(row => row.code !== model.code || !row._id)) this.fail();
        return response.result;
      };
      const existing = await read();
      if (existing.length) {
        if (model.ownerModule && existing[0].ownerModule !== model.ownerModule) this.fail();
      } else {
        // No update query or upsert: concurrent seed attempts cannot overwrite a winner.
        const saved = await SERVICE.DefaultIdentityCatalogueGovernanceService.createReference(service, {
          tenant: request.tenant, authData: request.authData, model: structuredClone(model), options: { insertOnly: true },
        });
        if (!/^SUC_/.test(saved?.code || "") ||
            saved.success !== undefined && saved.success !== true ||
            saved.acknowledged !== undefined && saved.acknowledged !== true ||
            saved.result?.acknowledged !== undefined && saved.result.acknowledged !== true || saved.error ||
            saved.errors && (!Array.isArray(saved.errors) || saved.errors.length)) this.fail();
        if ((await read()).length !== 1) this.fail();
      }
      result.push({ code: model.code });
    }
    return { result };
  },
};
