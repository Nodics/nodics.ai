/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/service/defaultOrderBusinessWorkbenchService @description Projects immutable Order business records through existing Workbench metadata and bounded safe-query parsing. @layer service @owner order */
module.exports = {
  /** Fixed owner projections exclude private financial and workflow evidence. */
  selection: function (schemaName) {
    const common = ["code", "orderCode", "cartCode", "status", "revision", "occurredAt"];
    if (schemaName === "commerceOrder") return { permission: "commerce.order.read", service: "DefaultCommerceOrderService",
      fields: [...common, "currency", "subtotalAmount", "promotionDiscountAmount", "taxAmount", "totalAmount"], prefix: "order" };
    if (schemaName === "orderLifecycleRequest") return { permission: "commerce.lifecycle.read", service: "DefaultOrderLifecycleRequestService",
      fields: [...common, "requestType", "reasonCode"], prefix: "lifecycle" };
    throw new Error("Order business schema is unavailable");
  },
  /** Derives effective schema metadata without conferring generic schema authority. */
  descriptor: function (request, schemaName) {
    const selection = this.selection(schemaName), access = SERVICE.DefaultOrderBusinessAccessService;
    access.context(request, selection.permission);
    const utility = SERVICE.DefaultSchemaUtilityService;
    const source = utility.resolveDescriptor({ ...request, moduleName: "order", authData: access.persistenceAuth() }, "order", schemaName);
    if (!source || source.moduleName !== "order" || source.schemaName !== schemaName) throw new Error("Order business descriptor is unavailable");
    const allowed = new Set(selection.fields), fields = source.fields.filter(field => allowed.has(field.name)).map(field => ({ ...field, readOnly: true }));
    if (!fields.some(field => field.name === "code")) throw new Error("Order business identity field is unavailable");
    const query = source.queryCapabilities;
    const maximumPageSize = Math.min(query.maximumPageSize, 100);
    const allowedPageSizes = query.allowedPageSizes.filter(size => Number.isSafeInteger(size) && size > 0 && size <= maximumPageSize);
    if (!allowedPageSizes.length) throw new Error("Order business paging is unavailable");
    const sortableFields = query.sortableFields.filter(name => allowed.has(name));
    const defaultSort = sortableFields.includes(query.defaultSort?.field) ? query.defaultSort : { field: "code", direction: "ASC" };
    if (!sortableFields.includes(defaultSort.field)) throw new Error("Order business sorting is unavailable");
    const capabilities = utility.findOperationRoute("order", "DefaultOrderBusinessWorkbenchController", selection.prefix + "Capabilities");
    const search = utility.findOperationRoute("order", "DefaultOrderBusinessWorkbenchController", selection.prefix + "Search");
    if (!capabilities || !search || capabilities.active === false || search.active === false) throw new Error("Order business routes are unavailable");
    return { ...source, fields, displayProperty: "code", displayProperties: ["code"],
      operations: ["search", "read"], mutationMode: "READ_ONLY", relationships: [], aggregateOperations: [], form: undefined,
      bulkCapabilities: { operations: [], maximumItems: 100, idempotencyRequired: true, outcomeMode: "AUTHORITATIVE_RESULT" },
      apiOperations: { capabilities, search },
      queryCapabilities: { ...query, searchableFields: query.searchableFields.filter(name => allowed.has(name)),
        sortableFields, defaultSort, filterFields: query.filterFields.filter(field => allowed.has(field.field)),
        maximumPageSize, defaultPageSize: allowedPageSizes.includes(query.defaultPageSize) ? query.defaultPageSize : allowedPageSizes[0],
        allowedPageSizes },
    };
  },
  /** Discovers only owner projections admitted by the current employee's permissions. */
  schemas: function (request) {
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    const granted = security.getGrantedPermissions(request);
    const schemas = ["commerceOrder", "orderLifecycleRequest"].filter(name => security.isPermissionGranted(this.selection(name).permission, granted, {}))
      .map(name => this.descriptor(request, name));
    if (!schemas.length) throw new Error("Order business access is required");
    return { schemas };
  },
  /** Searches a fixed owner projection; caller filters can never replace signed scope. */
  search: async function (request, schemaName) {
    const selection = this.selection(schemaName), access = SERVICE.DefaultOrderBusinessAccessService;
    const context = access.context(request, selection.permission), descriptor = this.descriptor(request, schemaName);
    const input = SERVICE.DefaultSchemaSafeQueryService.buildSearchInput(request.payload || {}, descriptor);
    const response = await SERVICE[selection.service].get({ tenant: context.tenant, authData: access.persistenceAuth(),
      query: { $and: [{ tenant: context.tenant, enterpriseCode: context.enterpriseCode }, input.query] },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { ...input.searchOptions, projection: { ...input.searchOptions.projection, tenant: 1, enterpriseCode: 1 } } });
    access.assertCurrent(request, context);
    const rows = access.confirmRows(response, context, input.pageSize);
    if (!Number.isSafeInteger(response.count) || response.count < rows.length) throw new Error("Order business count is unconfirmed");
    const records = rows.map(row => Object.fromEntries(descriptor.fields.filter(field => Object.hasOwn(row, field.name)).map(field => {
      const value = row[field.name];
      if (value !== null && !["string", "number", "boolean"].includes(typeof value) &&
          !(field.type === "date" && value instanceof Date && Number.isFinite(value.getTime()))) throw new Error("Order business projection is unconfirmed");
      return [field.name, value];
    })));
    return { records,
      totalCount: response.count, pageNumber: input.pageNumber, pageSize: input.pageSize, sort: input.sort };
  },
};
