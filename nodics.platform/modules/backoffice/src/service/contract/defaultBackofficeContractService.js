/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const contracts = require("../../schemas/apiContracts");

/**
 * @module backoffice/service/contract/DefaultBackofficeContractService
 * @description Validates BackOffice registration and module-owned catalogue metadata against the authoritative API contracts.
 * @layer service
 * @owner backoffice
 * @override Later modules may extend validation while preserving bounds, field allowlists, and error behavior.
 */
module.exports = {
  /** Initializes the API contract service. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes the API contract service initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns the authoritative BackOffice API contract definitions. */
  getContracts: function () {
    return contracts;
  },
  /** Returns the declared field names for a bounded object contract. */
  getContractFieldNames: function (contract) {
    return contract &&
      contract.properties &&
      typeof contract.properties === "object"
      ? Object.keys(contract.properties)
      : [];
  },
  /** Returns whether an object only contains fields declared by its API contract. */
  hasOnlyContractFields: function (value, contract) {
    let allowed = this.getContractFieldNames(contract);
    return !Object.keys(value).some((key) => !allowed.includes(key));
  },
  /** Returns whether a value is a non-empty bounded string. */
  isString: function (value, maxLength = 256) {
    return (
      typeof value === "string" && value.length > 0 && value.length <= maxLength
    );
  },
  /** Returns whether a list contains unique bounded strings. */
  isStringList: function (value, maxItems = 128) {
    return (
      Array.isArray(value) &&
      value.length <= maxItems &&
      value.every((item) => this.isString(item, 256)) &&
      new Set(value).size === value.length
    );
  },
  /** Validates one bounded navigation group declaration. */
  validateNavigationGroup: function (group) {
    return (
      group &&
      typeof group === "object" &&
      !Array.isArray(group) &&
      !Object.keys(group).some(
        (key) => !["id", "label", "labelKey", "order"].includes(key),
      ) &&
      this.isString(group.id, 128) &&
      this.isString(group.label) &&
      (group.labelKey === undefined || this.isString(group.labelKey)) &&
      (group.order === undefined || Number.isInteger(group.order))
    );
  },
  /** Validates one non-executable badge-provider reference. */
  validateNavigationBadgeProvider: function (provider) {
    return (
      provider &&
      typeof provider === "object" &&
      !Array.isArray(provider) &&
      !Object.keys(provider).some(
        (key) => !["moduleName", "operationId"].includes(key),
      ) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(
        provider.moduleName || "",
      ) &&
      this.isString(provider.operationId)
    );
  },
  /** Validates one bounded non-executable schema-workbench navigation target. */
  validateNavigationWorkbenchTarget: function (target) {
    let optionalRoutes = [
      "governanceService",
      "authoringModelRoute",
      "validationRoute",
      "renderProjectionRoute",
      "searchRoute",
      "publicationHandoffRoute",
      "migrationPlanRoute",
    ];
    return (
      target &&
      typeof target === "object" &&
      !Array.isArray(target) &&
      !Object.keys(target).some(
        (key) =>
          !["moduleName", "schemaName", "mode"]
            .concat(optionalRoutes)
            .includes(key),
      ) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(target.moduleName || "") &&
      this.isString(target.schemaName, 128) &&
      /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.schemaName) &&
      (target.mode === undefined || target.mode === "create") &&
      (target.governanceService === undefined ||
        this.isString(target.governanceService, 128)) &&
      optionalRoutes
        .filter((key) => key !== "governanceService")
        .every(
          (key) => target[key] === undefined || this.isSafePath(target[key]),
        )
    );
  },
  /** Validates backend-owned reusable detail panel declarations for schema workspaces. */
  validateNavigationDetailPanels: function (panels) {
    if (!Array.isArray(panels) || panels.length > 16) return false;
    let ids = panels.map((panel) => panel && panel.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return panels.every((panel) => {
      if (!panel || typeof panel !== "object" || Array.isArray(panel))
        return false;
      if (
        Object.keys(panel).some(
          (key) =>
            !["id", "label", "summary", "order", "target", "relation"].includes(
              key,
            ),
        ) ||
        !this.isString(panel.label) ||
        (panel.summary !== undefined && !this.isString(panel.summary, 320)) ||
        (panel.order !== undefined && !Number.isInteger(panel.order)) ||
        !this.validateNavigationWorkbenchTarget(panel.target)
      )
        return false;
      if (panel.relation === undefined) return true;
      return (
        panel.relation &&
        typeof panel.relation === "object" &&
        !Array.isArray(panel.relation) &&
        !Object.keys(panel.relation).some(
          (key) => !["sourceField", "targetField", "cardinality"].includes(key),
        ) &&
        this.isString(panel.relation.sourceField, 128) &&
        this.isString(panel.relation.targetField, 128) &&
        (panel.relation.cardinality === undefined ||
          ["ONE", "MANY"].includes(panel.relation.cardinality))
      );
    });
  },
  /** Validates bounded schema-workbench presentation hints owned by backend modules. */
  validateNavigationWorkbenchPresentation: function (presentation) {
    if (
      !presentation ||
      typeof presentation !== "object" ||
      Array.isArray(presentation)
    )
      return false;
    if (
      Object.keys(presentation).some(
        (key) =>
          ![
            "defaultColumns",
            "hiddenFields",
            "editableFields",
            "readonlyFields",
            "forbiddenFields",
            "summary",
            "detailSections",
            "quickFilters",
            "fixedFilters",
            "recoveryActions",
          ].includes(key),
      )
    )
      return false;
    if (
      presentation.summary !== undefined &&
      !this.isString(presentation.summary, 320)
    )
      return false;
    if (
      presentation.defaultColumns !== undefined &&
      !this.isStringList(presentation.defaultColumns, 32)
    )
      return false;
    if (
      presentation.hiddenFields !== undefined &&
      !this.isStringList(presentation.hiddenFields, 64)
    )
      return false;
    if (
      presentation.editableFields !== undefined &&
      !this.isStringList(presentation.editableFields, 64)
    )
      return false;
    if (
      presentation.readonlyFields !== undefined &&
      !this.isStringList(presentation.readonlyFields, 64)
    )
      return false;
    if (
      presentation.forbiddenFields !== undefined &&
      !this.isStringList(presentation.forbiddenFields, 64)
    )
      return false;
    if (presentation.detailSections !== undefined) {
      if (
        !Array.isArray(presentation.detailSections) ||
        presentation.detailSections.length > 24
      )
        return false;
      let ids = presentation.detailSections.map(
        (section) => section && section.id,
      );
      if (
        ids.some((id) => !this.isString(id, 128)) ||
        new Set(ids).size !== ids.length
      )
        return false;
      if (
        !presentation.detailSections.every(
          (section) =>
            section &&
            typeof section === "object" &&
            !Array.isArray(section) &&
            !Object.keys(section).some(
              (key) => !["id", "label", "fields", "order"].includes(key),
            ) &&
            this.isString(section.label, 128) &&
            this.isStringList(section.fields, 64) &&
            (section.order === undefined || Number.isInteger(section.order)),
        )
      )
        return false;
    }
    for (let filterGroupName of ["quickFilters", "fixedFilters"]) {
      let filters = presentation[filterGroupName];
      if (filters === undefined) continue;
      if (!Array.isArray(filters) || filters.length > 24) return false;
      let ids = filters.map((filter) => filter && filter.id);
      if (
        ids.some((id) => !this.isString(id, 128)) ||
        new Set(ids).size !== ids.length
      )
        return false;
      if (
        !filters.every(
          (filter) =>
            filter &&
            typeof filter === "object" &&
            !Array.isArray(filter) &&
            !Object.keys(filter).some(
              (key) =>
                !["id", "label", "field", "value", "values", "order"].includes(
                  key,
                ),
            ) &&
            this.isString(filter.label, 128) &&
            this.isString(filter.field, 128) &&
            (filter.value === undefined || this.isString(filter.value, 128)) &&
            (filter.values === undefined ||
              this.isStringList(filter.values, 24)) &&
            (filter.value !== undefined || filter.values !== undefined) &&
            (filter.order === undefined || Number.isInteger(filter.order)),
        )
      )
        return false;
    }
    if (presentation.recoveryActions !== undefined) {
      if (
        !Array.isArray(presentation.recoveryActions) ||
        presentation.recoveryActions.length > 24
      )
        return false;
      let ids = presentation.recoveryActions.map(
        (action) => action && action.id,
      );
      if (
        ids.some((id) => !this.isString(id, 128)) ||
        new Set(ids).size !== ids.length
      )
        return false;
      if (
        !presentation.recoveryActions.every(
          (action) =>
            action &&
            typeof action === "object" &&
            !Array.isArray(action) &&
            !Object.keys(action).some(
              (key) =>
                ![
                  "id",
                  "label",
                  "ownerModule",
                  "strategy",
                  "handlerAction",
                  "summary",
                  "order",
                ].includes(key),
            ) &&
            this.isString(action.label, 128) &&
            this.isString(action.ownerModule, 128) &&
            this.isString(action.strategy, 128) &&
            this.isString(action.handlerAction, 128) &&
            (action.summary === undefined ||
              this.isString(action.summary, 320)) &&
            (action.order === undefined || Number.isInteger(action.order)),
        )
      )
        return false;
    }
    return true;
  },
  /** Validates bounded non-executable navigation help metadata for Axis workspaces. */
  validateNavigationHelp: function (help) {
    return (
      help &&
      typeof help === "object" &&
      !Array.isArray(help) &&
      !Object.keys(help).some(
        (key) =>
          !["summary", "documentationRoute", "documentationFragment"].includes(
            key,
          ),
      ) &&
      this.isString(help.summary, 320) &&
      (help.documentationRoute === undefined ||
        this.isSafeDocumentationRoute(help.documentationRoute)) &&
      (help.documentationFragment === undefined ||
        (typeof help.documentationFragment === "string" &&
          /^[A-Za-z0-9._:-]{1,128}$/.test(help.documentationFragment)))
    );
  },
  /** Validates bounded non-executable readiness ownership metadata for Axis workspaces. */
  validateNavigationReadiness: function (readiness) {
    return (
      readiness &&
      typeof readiness === "object" &&
      !Array.isArray(readiness) &&
      !Object.keys(readiness).some(
        (key) =>
          ![
            "kind",
            "ownerModule",
            "sourceModule",
            "sourceSchema",
            "statusField",
            "freshnessField",
            "desiredFreshnessSeconds",
            "repairRoute",
            "summary",
          ].includes(key),
      ) &&
      this.isString(readiness.kind, 64) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(
        readiness.ownerModule || "",
      ) &&
      (readiness.sourceModule === undefined ||
        new RegExp(contracts.moduleName.pattern).test(
          readiness.sourceModule,
        )) &&
      (readiness.sourceSchema === undefined ||
        /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(readiness.sourceSchema)) &&
      (readiness.statusField === undefined ||
        /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(readiness.statusField)) &&
      (readiness.freshnessField === undefined ||
        /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(readiness.freshnessField)) &&
      (readiness.desiredFreshnessSeconds === undefined ||
        (Number.isInteger(readiness.desiredFreshnessSeconds) &&
          readiness.desiredFreshnessSeconds >= 1 &&
          readiness.desiredFreshnessSeconds <= 31536000)) &&
      (readiness.repairRoute === undefined ||
        this.isSafePath(readiness.repairRoute)) &&
      (readiness.summary === undefined || this.isString(readiness.summary, 320))
    );
  },
  /** Validates bounded non-executable lifecycle action hints for Axis workspaces. */
  validateNavigationLifecycleActions: function (actions) {
    if (!Array.isArray(actions) || actions.length > 24) return false;
    let allowedFeatureStates = ["ACTIVE", "PREVIEW", "DISABLED", "HIDDEN"];
    let ids = actions.map((action) => action && action.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return actions.every((action) => {
      if (!action || typeof action !== "object" || Array.isArray(action))
        return false;
      if (
        Object.keys(action).some(
          (key) =>
            ![
              "id",
              "label",
              "intent",
              "permission",
              "summary",
              "targetStatuses",
              "featureState",
              "ownerModule",
              "handlerAction",
              "operationRoute",
              "httpMethod",
              "inputFields",
              "order",
            ].includes(key),
        ) ||
        !this.isString(action.label, 128) ||
        !this.isString(action.intent, 64) ||
        (action.permission !== undefined &&
          !this.isString(action.permission, 128)) ||
        (action.summary !== undefined && !this.isString(action.summary, 320)) ||
        (action.targetStatuses !== undefined &&
          !this.isStringList(action.targetStatuses, 32)) ||
        (action.featureState !== undefined &&
          !allowedFeatureStates.includes(action.featureState)) ||
        (action.ownerModule !== undefined &&
          !(
            contracts.moduleName.pattern &&
            new RegExp(contracts.moduleName.pattern).test(action.ownerModule)
          )) ||
        (action.handlerAction !== undefined &&
          !this.isString(action.handlerAction, 128)) ||
        (action.operationRoute !== undefined &&
          !this.isSafePath(action.operationRoute)) ||
        (action.httpMethod !== undefined &&
          !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(
            action.httpMethod,
          )) ||
        (action.inputFields !== undefined &&
          (!Array.isArray(action.inputFields) ||
            action.inputFields.length > 16 ||
            action.inputFields.some(
              (field) =>
                !field ||
                typeof field !== "object" ||
                Array.isArray(field) ||
                Object.keys(field).some(
                  (key) =>
                    ![
                      "name",
                      "label",
                      "type",
                      "required",
                      "options",
                      "valueFromRecord",
                      "defaultValue",
                      "maximumLength",
                    ].includes(key),
                ) ||
                !this.isString(field.name, 128) ||
                !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(field.name) ||
                !this.isString(field.label, 128) ||
                !["TEXT", "MULTILINE", "SELECT", "JSON", "HIDDEN"].includes(
                  field.type,
                ) ||
                (field.required !== undefined &&
                  typeof field.required !== "boolean") ||
                (field.options !== undefined &&
                  !this.isStringList(field.options, 32)) ||
                (field.type === "SELECT" &&
                  (!field.options || field.options.length === 0)) ||
                (field.valueFromRecord !== undefined &&
                  !this.isString(field.valueFromRecord, 128)) ||
                (field.defaultValue !== undefined &&
                  !this.isString(field.defaultValue, 4000)) ||
                (field.maximumLength !== undefined &&
                  (!Number.isInteger(field.maximumLength) ||
                    field.maximumLength < 1 ||
                    field.maximumLength > 4000)),
            ))) ||
        (action.order !== undefined && !Number.isInteger(action.order))
      )
        return false;
      return true;
    });
  },
  /** Validates one backend-driven Axis workspace option. */
  validateBackendWorkspaceOption: function (option) {
    return (
      option &&
      typeof option === "object" &&
      !Array.isArray(option) &&
      !Object.keys(option).some((key) => !["value", "label"].includes(key)) &&
      typeof option.value === "string" &&
      option.value.length <= 128 &&
      this.isString(option.label, 128)
    );
  },
  /** Validates one backend-driven Axis workspace field declaration. */
  validateBackendWorkspaceField: function (field) {
    let fieldTypes = [
      "TEXT",
      "EMAIL",
      "PASSWORD",
      "MULTILINE",
      "SELECT",
      "MULTISELECT",
      "CHECKBOX",
      "HIDDEN",
      "IDEMPOTENCY",
    ];
    return (
      field &&
      typeof field === "object" &&
      !Array.isArray(field) &&
      !Object.keys(field).some(
        (key) =>
          ![
            "name",
            "label",
            "type",
            "required",
            "maximumLength",
            "defaultValue",
            "bindToPath",
            "defaultFromParameter",
            "options",
          ].includes(key),
      ) &&
      this.isString(field.name, 128) &&
      /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(field.name) &&
      this.isString(field.label, 128) &&
      fieldTypes.includes(field.type) &&
      (field.required === undefined || typeof field.required === "boolean") &&
      (field.maximumLength === undefined ||
        (Number.isInteger(field.maximumLength) &&
          field.maximumLength >= 1 &&
          field.maximumLength <= 4000)) &&
      (field.bindToPath === undefined ||
        typeof field.bindToPath === "boolean") &&
      (field.defaultFromParameter === undefined ||
        (field.type === "TEXT" &&
          this.isString(field.defaultFromParameter, 128) &&
          /^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(field.defaultFromParameter))) &&
      (field.options === undefined ||
        (Array.isArray(field.options) &&
          field.options.length <= 64 &&
          field.options.every((option) =>
            this.validateBackendWorkspaceOption(option),
          ))) &&
      (!["SELECT", "MULTISELECT"].includes(field.type) ||
        (Array.isArray(field.options) && field.options.length > 0))
    );
  },
  /** Validates one backend-driven Axis workspace endpoint. */
  validateBackendWorkspaceEndpoint: function (endpoint) {
    return (
      endpoint &&
      typeof endpoint === "object" &&
      !Array.isArray(endpoint) &&
      !Object.keys(endpoint).some(
        (key) =>
          ![
            "method",
            "path",
            "resultPath",
            "bodyShape",
            "idempotencyField",
          ].includes(key),
      ) &&
      ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method) &&
      this.isSafePath(endpoint.path) &&
      (endpoint.bodyShape === undefined ||
        ["FIELDS", "MODEL"].includes(endpoint.bodyShape)) &&
      (endpoint.idempotencyField === undefined ||
        (typeof endpoint.idempotencyField === "string" &&
          /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(endpoint.idempotencyField))) &&
      (endpoint.bodyShape !== "MODEL" ||
        (endpoint.method !== "GET" &&
          endpoint.idempotencyField !== undefined)) &&
      (endpoint.resultPath === undefined ||
        this.isString(endpoint.resultPath, 256))
    );
  },
  /** Validates bounded direct scalar mappings, never expressions or nested private projections. */
  validateWorkspaceMapping: function (mapping) {
    return (
      mapping &&
      typeof mapping === "object" &&
      !Array.isArray(mapping) &&
      Object.keys(mapping).length >= 1 &&
      Object.keys(mapping).length <= 8 &&
      Object.entries(mapping).every(
        ([key, value]) =>
          /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key) &&
          typeof value === "string" &&
          /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value),
      )
    );
  },
  /** Bounds listing navigation to declared scalar columns and a non-executable local route. */
  validateWorkspaceRowNavigation: function (section) {
    const action = section.rowNavigation;
    return (
      section.type === "listing" &&
      action &&
      typeof action === "object" &&
      !Array.isArray(action) &&
      Object.keys(action).every((key) =>
        ["label", "route", "parameters"].includes(key),
      ) &&
      this.isString(action.label, 128) &&
      this.isString(action.route, 512) &&
      /^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(action.route) &&
      this.validateWorkspaceMapping(action.parameters) &&
      Object.values(action.parameters).every(
        (field) =>
          Array.isArray(section.columns) &&
          section.columns.some((column) => column && column.field === field),
      )
    );
  },
  /** Bounds fresh inspection to one path parameter, the fixed POST owner and required frozen TEXT fields. */
  validateWorkspaceReadSource: function (section) {
    const read = section.readSource;
    if (
      section.type !== "form" ||
      section.public === true ||
      section.endpoint.method !== "POST" ||
      (section.endpoint.bodyShape !== undefined &&
        section.endpoint.bodyShape !== "FIELDS") ||
      !read ||
      typeof read !== "object" ||
      Array.isArray(read) ||
      !Object.keys(read).every((key) =>
        [
          "endpoint",
          "parameter",
          "fields",
          "commandId",
          "unavailableMessage",
          "unavailableMessagePath",
        ].includes(key),
      ) ||
      typeof read.parameter !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(read.parameter) ||
      !this.isString(read.commandId, 128) ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(read.commandId) ||
      !this.isString(read.unavailableMessage, 512) ||
      (read.unavailableMessagePath !== undefined &&
        (!this.isString(read.unavailableMessagePath, 256) ||
          !/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.test(
            read.unavailableMessagePath,
          ) ||
          read.unavailableMessagePath
            .split(".")
            .some((segment) =>
              ["constructor", "prototype", "__proto__"].includes(segment),
            ))) ||
      !this.validateWorkspaceMapping(read.fields) ||
      !read.endpoint ||
      typeof read.endpoint !== "object" ||
      Array.isArray(read.endpoint) ||
      !Object.keys(read.endpoint).every((key) =>
        ["method", "path", "resultPath"].includes(key),
      ) ||
      read.endpoint.method !== "GET" ||
      !this.isString(read.endpoint.path, 512)
    )
      return false;
    const segments = read.endpoint.path.split("/").slice(1);
    if (
      segments.filter((segment) => segment === "{" + read.parameter + "}")
        .length !== 1 ||
      segments.some(
        (segment) =>
          segment !== "{" + read.parameter + "}" &&
          !/^[A-Za-z0-9_-]+$/.test(segment),
      ) ||
      (read.endpoint.resultPath !== undefined &&
        (!this.isString(read.endpoint.resultPath, 256) ||
          !/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.test(
            read.endpoint.resultPath,
          )))
    )
      return false;
    const prefix = /^\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/v[0-9]+\//;
    const readPrefix = read.endpoint.path.match(prefix);
    const writePrefix = section.endpoint.path.match(prefix);
    if (
      !readPrefix ||
      !writePrefix ||
      readPrefix[0] !== writePrefix[0] ||
      !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(section.endpoint.path) ||
      !Object.prototype.hasOwnProperty.call(read.fields, read.parameter)
    )
      return false;
    return Object.keys(read.fields).every(
      (name) =>
        Array.isArray(section.fields) &&
        section.fields.filter(
          (field) =>
            field &&
            field.name === name &&
            field.type === "TEXT" &&
            field.required === true &&
            field.bindToPath !== true,
        ).length === 1,
    );
  },
  /** Validates one backend-driven Axis workspace section. */
  validateBackendWorkspaceSection: function (section) {
    if (!section || typeof section !== "object" || Array.isArray(section))
      return false;
    if (
      Object.keys(section).some(
        (key) =>
          ![
            "id",
            "type",
            "title",
            "submitLabel",
            "successMessage",
            "public",
            "endpoint",
            "columns",
            "filters",
            "fields",
            "rowNavigation",
            "readSource",
          ].includes(key),
      ) ||
      !this.isString(section.id, 128) ||
      !["listing", "form"].includes(section.type) ||
      !this.isString(section.title, 160) ||
      (section.submitLabel !== undefined &&
        !this.isString(section.submitLabel, 128)) ||
      (section.successMessage !== undefined &&
        !this.isString(section.successMessage, 512)) ||
      (section.public !== undefined && typeof section.public !== "boolean") ||
      !this.validateBackendWorkspaceEndpoint(section.endpoint)
    )
      return false;
    if (
      (section.rowNavigation !== undefined &&
        !this.validateWorkspaceRowNavigation(section)) ||
      (section.readSource !== undefined &&
        !this.validateWorkspaceReadSource(section))
    )
      return false;
    if (
      section.endpoint.bodyShape === "MODEL" &&
      (section.type !== "form" ||
        !Array.isArray(section.fields) ||
        section.fields.filter(
          (field) =>
            field &&
            field.name === section.endpoint.idempotencyField &&
            field.type === "IDEMPOTENCY" &&
            field.required === true,
        ).length !== 1)
    )
      return false;
    if (
      section.columns !== undefined &&
      (!Array.isArray(section.columns) ||
        section.columns.length > 32 ||
        section.columns.some(
          (column) =>
            !column ||
            typeof column !== "object" ||
            Array.isArray(column) ||
            !this.isString(column.field, 128) ||
            !this.isString(column.label, 128),
        ))
    )
      return false;
    return ["filters", "fields"].every(
      (key) =>
        section[key] === undefined ||
        (Array.isArray(section[key]) &&
          section[key].length <= 32 &&
          section[key].every((field) =>
            this.validateBackendWorkspaceField(field),
          )),
    );
  },
  /** Bounds selection to existing authorized connection role facts, never endpoints or credentials. */
  validateWorkspaceOwnerSelector: function (selector) {
    if (!selector || typeof selector !== "object" || Array.isArray(selector))
      return false;
    const keys = Object.keys(selector);
    return (
      keys.length > 0 &&
      keys.every((key) =>
        ["runtimeRoleCode", "publicationRole"].includes(key),
      ) &&
      (selector.runtimeRoleCode === undefined ||
        (this.isString(selector.runtimeRoleCode, 64) &&
          /^[A-Z][A-Z0-9_]{0,63}$/.test(selector.runtimeRoleCode))) &&
      (selector.publicationRole === undefined ||
        ["STAGED", "ONLINE"].includes(selector.publicationRole)) &&
      keys.every((key) => selector[key] !== undefined)
    );
  },
  /**
   * Validates inert setup metadata, never stored intent, actor proof or replay authority.
   * @param {Object} descriptor Owner-projected metadata.
   * @returns {boolean} Exact contract admission.
   */
  validateEnterpriseSetupContinuation: function (descriptor) {
    const schema = contracts.enterpriseSetupContinuation;
    const exact = (value, definition) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).every((key) =>
        Object.hasOwn(definition.properties, key),
      ) &&
      (definition.required || []).every((key) => Object.hasOwn(value, key));
    if (
      !exact(descriptor, schema) ||
      descriptor.version !== 1 ||
      descriptor.type !== "enterpriseSetupContinuation" ||
      typeof descriptor.available !== "boolean" ||
      (descriptor.actions !== undefined &&
        !exact(descriptor.actions, schema.properties.actions)) ||
      !exact(descriptor.presentation, schema.properties.presentation)
    )
      return false;
    for (const [name, action] of Object.entries(descriptor.actions || {})) {
      const definition = schema.properties.actions.properties[name];
      if (
        !exact(action, definition) ||
        action.method !== (name === "inspect" ? "GET" : "POST") ||
        !this.isString(action.path, 512) ||
        !new RegExp(definition.properties.path.pattern).test(action.path) ||
        action.path
          .split("/")
          .some((segment) => segment === "." || segment === "..")
      )
        return false;
      if (
        name === "resume" &&
        (typeof action.qualified !== "boolean" ||
          !Array.isArray(action.bodyFields) ||
          action.bodyFields.length !== 1 ||
          action.bodyFields[0] !== "expectedRevision" ||
          (action.qualified && !descriptor.available))
      )
        return false;
    }
    if (
      descriptor.available &&
      (!descriptor.actions?.inspect || !descriptor.actions?.resume)
    )
      return false;
    for (const [key, value] of Object.entries(descriptor.presentation)) {
      const definition = schema.properties.presentation.properties[key];
      if (key === "reasons") {
        if (
          !exact(value, definition) ||
          Object.values(value).some((label) => !this.isString(label, 512))
        )
          return false;
      } else if (!this.isString(value, definition.maxLength)) return false;
    }
    return true;
  },
  /** Validates a bounded backend-driven Axis workspace. */
  /** Accepts only versioned non-executable keys for a client-installed native workspace. */
  validateNativeWorkspace: function (workspace) {
    return (
      workspace.contractVersion === 1 &&
      !Object.keys(workspace).some(
        (key) =>
          ![
            "contractVersion",
            "renderer",
            "workspaceCode",
            "viewCode",
            "title",
            "description",
            "ownerSelector",
          ].includes(key),
      ) &&
      this.isString(workspace.title, 160) &&
      (workspace.description === undefined ||
        this.isString(workspace.description, 512)) &&
      (workspace.ownerSelector === undefined ||
        this.validateWorkspaceOwnerSelector(workspace.ownerSelector)) &&
      ["workspaceCode", "viewCode"].every(
        (key) =>
          this.isString(workspace[key], 128) &&
          /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i.test(workspace[key]),
      )
    );
  },
  /** Validates the declarative native or form workspace before authenticated discovery exposes it. */
  validateBackendWorkspace: function (workspace) {
    if (!workspace || typeof workspace !== "object" || Array.isArray(workspace))
      return false;
    if (workspace.renderer === "axis.workspace.native")
      return this.validateNativeWorkspace(workspace);
    if (
      Object.keys(workspace).some(
        (key) =>
          ![
            "contractVersion",
            "title",
            "description",
            "renderer",
            "defaultTab",
            "tabs",
            "ownerSelector",
            "setupContinuation",
          ].includes(key),
      ) ||
      !Number.isInteger(workspace.contractVersion) ||
      workspace.contractVersion < 0 ||
      !this.isString(workspace.title, 160) ||
      (workspace.description !== undefined &&
        !this.isString(workspace.description, 512)) ||
      (workspace.ownerSelector !== undefined &&
        !this.validateWorkspaceOwnerSelector(workspace.ownerSelector)) ||
      (workspace.setupContinuation !== undefined &&
        !this.validateEnterpriseSetupContinuation(workspace.setupContinuation)) ||
      workspace.renderer !== "axis.workspace.backend-operations" ||
      (workspace.defaultTab !== undefined &&
        !this.isString(workspace.defaultTab, 128)) ||
      !Array.isArray(workspace.tabs) ||
      workspace.tabs.length === 0 ||
      workspace.tabs.length > 12
    )
      return false;
    let tabIds = workspace.tabs.map((tab) => tab && tab.id);
    if (
      tabIds.some((id) => !this.isString(id, 128)) ||
      new Set(tabIds).size !== tabIds.length
    )
      return false;
    return workspace.tabs.every(
      (tab) =>
        tab &&
        typeof tab === "object" &&
        !Array.isArray(tab) &&
        !Object.keys(tab).some(
          (key) => !["id", "label", "icon", "sections"].includes(key),
        ) &&
        this.isString(tab.label, 128) &&
        (tab.icon === undefined || this.isString(tab.icon, 64)) &&
        Array.isArray(tab.sections) &&
        tab.sections.length > 0 &&
        tab.sections.length <= 12 &&
        tab.sections.every((section) =>
          this.validateBackendWorkspaceSection(section),
        ),
    );
  },
  /** Validates bounded module-owned navigation metadata and hierarchy. */
  validateNavigation: function (navigation) {
    if (!Array.isArray(navigation) || navigation.length > 64) return false;
    let allowedContexts = [
      "environment",
      "tenant",
      "enterprise",
      "site",
      "catalog",
    ];
    let allowedFeatureStates = ["ACTIVE", "PREVIEW", "DISABLED", "HIDDEN"];
    let ids = navigation.map((item) => item && item.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    if (
      !navigation.every(
        (item) =>
          item &&
          !Object.keys(item).some(
            (key) =>
              ![
                "id",
                "label",
                "route",
                "icon",
                "order",
                "requiredPermissions",
                "labelKey",
                "parentId",
                "parentModuleName",
                "group",
                "perspectives",
                "contexts",
                "featureState",
                "badgeProvider",
                "workbenchTarget",
                "backendWorkspace",
                "detailPanels",
                "workbenchPresentation",
                "help",
                "readiness",
                "lifecycleActions",
              ].includes(key),
          ) &&
          this.isString(item.label) &&
          (item.route === undefined || this.isString(item.route, 512)) &&
          (item.order === undefined || Number.isInteger(item.order)) &&
          (item.icon === undefined || this.isString(item.icon, 64)) &&
          (item.labelKey === undefined || this.isString(item.labelKey)) &&
          (item.parentId === undefined ||
            (this.isString(item.parentId, 128) && item.parentId !== item.id)) &&
          (item.parentModuleName === undefined ||
            (item.parentId !== undefined &&
              contracts.moduleName.pattern &&
              new RegExp(contracts.moduleName.pattern).test(
                item.parentModuleName,
              ))) &&
          (item.group === undefined ||
            this.validateNavigationGroup(item.group)) &&
          (item.perspectives === undefined ||
            this.isStringList(item.perspectives, 16)) &&
          (item.contexts === undefined ||
            (this.isStringList(item.contexts, 8) &&
              item.contexts.every((context) =>
                allowedContexts.includes(context),
              ))) &&
          (item.featureState === undefined ||
            allowedFeatureStates.includes(item.featureState)) &&
          (item.badgeProvider === undefined ||
            this.validateNavigationBadgeProvider(item.badgeProvider)) &&
          (item.workbenchTarget === undefined ||
            this.validateNavigationWorkbenchTarget(item.workbenchTarget)) &&
          (item.backendWorkspace === undefined ||
            this.validateBackendWorkspace(item.backendWorkspace)) &&
          (item.detailPanels === undefined ||
            this.validateNavigationDetailPanels(item.detailPanels)) &&
          (item.workbenchPresentation === undefined ||
            this.validateNavigationWorkbenchPresentation(
              item.workbenchPresentation,
            )) &&
          (item.help === undefined || this.validateNavigationHelp(item.help)) &&
          (item.readiness === undefined ||
            this.validateNavigationReadiness(item.readiness)) &&
          (item.lifecycleActions === undefined ||
            this.validateNavigationLifecycleActions(item.lifecycleActions)) &&
          (item.requiredPermissions === undefined ||
            this.isStringList(item.requiredPermissions)),
      )
    )
      return false;
    let byId = Object.fromEntries(navigation.map((item) => [item.id, item]));
    if (
      navigation.some((item) =>
        ((item.backendWorkspace && item.backendWorkspace.tabs) || []).some(
          (tab) =>
            tab.sections.some(
              (section) =>
                section.rowNavigation &&
                !navigation.some((target) => {
                  if (
                    target.route !== section.rowNavigation.route ||
                    !target.backendWorkspace
                  )
                    return false;
                  const sources = (target.backendWorkspace.tabs || [])
                    .flatMap((targetTab) => targetTab.sections)
                    .filter((targetSection) => targetSection.readSource)
                    .map((targetSection) => targetSection.readSource);
                  const parameters = Object.keys(
                    section.rowNavigation.parameters,
                  );
                  return sources.some(
                    (read) =>
                      parameters.length === 1 &&
                      parameters[0] === read.parameter,
                  );
                }),
            ),
        ),
      )
    )
      return false;
    if (
      navigation.some(
        (item) =>
          item.parentId &&
          item.parentModuleName === undefined &&
          !byId[item.parentId],
      )
    )
      return false;
    return navigation.every((item) => {
      let visited = new Set([item.id]);
      let parentId = item.parentId;
      let parentModuleName = item.parentModuleName;
      while (parentId) {
        if (parentModuleName !== undefined) return true;
        if (visited.has(parentId)) return false;
        visited.add(parentId);
        parentId = byId[parentId] && byId[parentId].parentId;
      }
      return true;
    });
  },
  /** Validates bounded declarative documentation sources contributed by one owning module. */
  validateDocumentation: function (documentation) {
    if (!Array.isArray(documentation) || documentation.length > 32)
      return false;
    let ids = documentation.map((source) => source && source.id);
    if (
      ids.some((id) => !this.isString(id, 128)) ||
      new Set(ids).size !== ids.length
    )
      return false;
    return documentation.every((source) => {
      if (!source || typeof source !== "object" || Array.isArray(source))
        return false;
      let allowed = [
        "id",
        "label",
        "labelKey",
        "type",
        "route",
        "order",
        "connectionModule",
        "site",
        "catalog",
        "defaultPage",
        "packCode",
        "initializationProfile",
        "openApiPath",
        "swaggerPath",
        "requiredPermissions",
        "dashboard",
      ];
      if (
        Object.keys(source).some((key) => !allowed.includes(key)) ||
        !this.isString(source.label) ||
        !["CMS", "OPENAPI"].includes(source.type) ||
        !this.isSafePath(source.route) ||
        !Number.isInteger(source.order) ||
        !new RegExp(contracts.moduleName.pattern).test(
          source.connectionModule || "",
        ) ||
        (source.labelKey !== undefined && !this.isString(source.labelKey)) ||
        (source.requiredPermissions !== undefined &&
          !this.isStringList(source.requiredPermissions)) ||
        !this.validateDocumentationDashboard(source.dashboard)
      )
        return false;
      if (source.type === "CMS") {
        return (
          [
            "site",
            "catalog",
            "defaultPage",
            "packCode",
            "initializationProfile",
          ].every((key) => this.isString(source[key], 128)) &&
          this.isSafePath(source.defaultPage) &&
          source.openApiPath === undefined &&
          source.swaggerPath === undefined
        );
      }
      return (
        this.isSafePath(source.openApiPath) &&
        this.isSafePath(source.swaggerPath) &&
        [
          "site",
          "catalog",
          "defaultPage",
          "packCode",
          "initializationProfile",
        ].every((key) => source[key] === undefined)
      );
    });
  },
  /** Validates bounded presentation and coverage metadata for the documentation dashboard. */
  validateDocumentationDashboard: function (dashboard) {
    if (dashboard === undefined) return true;
    if (!dashboard || typeof dashboard !== "object" || Array.isArray(dashboard))
      return false;
    let allowed = ["summary", "kind", "icon", "audiences", "coverage"];
    if (Object.keys(dashboard).some((key) => !allowed.includes(key)))
      return false;
    if (
      ["summary", "kind", "icon"].some(
        (key) =>
          dashboard[key] !== undefined &&
          !this.isString(dashboard[key], key === "summary" ? 320 : 64),
      )
    )
      return false;
    if (
      dashboard.audiences !== undefined &&
      !this.isStringList(dashboard.audiences, 12)
    )
      return false;
    if (dashboard.coverage === undefined) return true;
    let coverage = dashboard.coverage;
    if (!coverage || typeof coverage !== "object" || Array.isArray(coverage))
      return false;
    let coverageAllowed = ["score", "status", "signals", "gaps"];
    if (Object.keys(coverage).some((key) => !coverageAllowed.includes(key)))
      return false;
    if (
      !Number.isInteger(coverage.score) ||
      coverage.score < 0 ||
      coverage.score > 100 ||
      !["STRONG", "PARTIAL", "NEEDS_WORK", "REFERENCE"].includes(
        coverage.status,
      )
    )
      return false;
    return ["signals", "gaps"].every(
      (key) =>
        coverage[key] === undefined ||
        (this.isStringList(coverage[key], 12) &&
          coverage[key].every((item) => this.isString(item, 160))),
    );
  },
  /** Returns whether a string is a bounded application-relative path. */
  isSafePath: function (value) {
    return (
      this.isString(value, 512) &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("://")
    );
  },
  /** Returns whether a string is a bounded application-relative documentation route. */
  isSafeDocumentationRoute: function (value) {
    return this.isSafePath(value) && value.startsWith("/docs");
  },
  /** Validates optional module-owned BackOffice catalogue metadata. */
  validateBackofficeMetadata: function (metadata) {
    if (metadata === undefined) return true;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata))
      return false;
    let allowed = [
      "enabled",
      "capabilityId",
      "displayName",
      "category",
      "icon",
      "contractVersion",
      "minimumClientContractVersion",
      "roles",
      "discovery",
      "uiComposition",
      "documentation",
      "requiredPermissions",
      "navigation",
    ];
    if (Object.keys(metadata).some((key) => !allowed.includes(key)))
      return false;
    if (metadata.enabled !== undefined && typeof metadata.enabled !== "boolean")
      return false;
    if (
      ["capabilityId", "displayName", "category", "icon"].some(
        (key) => metadata[key] !== undefined && !this.isString(metadata[key]),
      )
    )
      return false;
    if (
      ["contractVersion", "minimumClientContractVersion"].some(
        (key) =>
          metadata[key] !== undefined &&
          (!Number.isInteger(metadata[key]) || metadata[key] < 0),
      )
    )
      return false;
    if (
      metadata.requiredPermissions !== undefined &&
      !this.isStringList(metadata.requiredPermissions)
    )
      return false;
    let roleValues = contracts.moduleRole.enum;
    if (
      metadata.roles !== undefined &&
      (!this.isStringList(metadata.roles, roleValues.length) ||
        metadata.roles.some((role) => !roleValues.includes(role)))
    )
      return false;
    if (
      metadata.discovery !== undefined &&
      (!metadata.discovery ||
        typeof metadata.discovery !== "object" ||
        Array.isArray(metadata.discovery) ||
        Object.keys(metadata.discovery).some(
          (key) => !["openApiPath", "contractVersion"].includes(key),
        ) ||
        (metadata.discovery.openApiPath !== undefined &&
          (!this.isString(metadata.discovery.openApiPath, 512) ||
            !metadata.discovery.openApiPath.startsWith("/"))) ||
        (metadata.discovery.contractVersion !== undefined &&
          (!Number.isInteger(metadata.discovery.contractVersion) ||
            metadata.discovery.contractVersion < 0)))
    )
      return false;
    if (
      metadata.uiComposition !== undefined &&
      (!metadata.roles ||
        !metadata.roles.includes("UI_COMPOSITION_PROVIDER") ||
        !metadata.uiComposition ||
        typeof metadata.uiComposition !== "object" ||
        Array.isArray(metadata.uiComposition) ||
        Object.keys(metadata.uiComposition).some(
          (key) =>
            !["site", "catalog", "defaultPage", "fallbackMode"].includes(key),
        ) ||
        !["site", "catalog", "defaultPage"].every((key) =>
          this.isString(metadata.uiComposition[key]),
        ) ||
        metadata.uiComposition.fallbackMode !== "STATIC_RECOVERY_SHELL")
    )
      return false;
    if (
      metadata.contractVersion !== undefined &&
      metadata.minimumClientContractVersion !== undefined &&
      metadata.minimumClientContractVersion > metadata.contractVersion
    )
      return false;
    return (
      (metadata.navigation === undefined ||
        this.validateNavigation(metadata.navigation)) &&
      (metadata.documentation === undefined ||
        this.validateDocumentation(metadata.documentation))
    );
  },
  /** Validates one module registration against the bounded API contract. */
  validateRegistration: function (registration) {
    if (
      !registration ||
      typeof registration !== "object" ||
      Array.isArray(registration)
    )
      return false;
    return (
      this.hasOnlyContractFields(registration, contracts.registration) &&
      contracts.moduleName.pattern &&
      new RegExp(contracts.moduleName.pattern).test(
        registration.moduleName || "",
      ) &&
      this.isString(registration.displayName, 160) &&
      (registration.parentModule === undefined ||
        (registration.parentModule !== registration.moduleName &&
          new RegExp(contracts.moduleName.pattern).test(
            registration.parentModule,
          ))) &&
      this.isString(registration.canonicalIdentity, 2048) &&
      registration.canonicalIdentity
        .split("/")
        .every((segment) =>
          new RegExp(contracts.moduleName.pattern).test(segment),
        ) &&
      registration.canonicalIdentity.split("/").slice(-1)[0] ===
        registration.moduleName &&
      this.isString(registration.instanceId, 512) &&
      (registration.moduleIndex === undefined ||
        this.isString(registration.moduleIndex, 64)) &&
      typeof registration.clientCallable === "boolean" &&
      (registration.healthPath === undefined ||
        (this.isString(registration.healthPath, 512) &&
          registration.healthPath.startsWith("/") &&
          !registration.healthPath.startsWith("//"))) &&
      (registration.capabilities === undefined ||
        this.isStringList(registration.capabilities, 256)) &&
      (registration.leaseTtlMs === undefined ||
        (Number.isInteger(registration.leaseTtlMs) &&
          registration.leaseTtlMs >= 1000)) &&
      (registration.runtime === undefined ||
        (registration.runtime &&
          typeof registration.runtime === "object" &&
          !Object.keys(registration.runtime).some(
            (key) => !["router", "publish", "web"].includes(key),
          ) &&
          Object.keys(registration.runtime).every(
            (key) => typeof registration.runtime[key] === "boolean",
          ))) &&
      (registration.functionalModule === undefined ||
        (registration.functionalModule &&
          typeof registration.functionalModule === "object" &&
          !Array.isArray(registration.functionalModule) &&
          !Object.keys(registration.functionalModule).some(
            (key) =>
              !["identity", "displayName", "type", "protected"].includes(key),
          ) &&
          new RegExp(contracts.moduleName.pattern).test(
            registration.functionalModule.identity || "",
          ) &&
          this.isString(registration.functionalModule.displayName, 160) &&
          ["STANDARD", "EXTENSION"].includes(
            registration.functionalModule.type,
          ) &&
          typeof registration.functionalModule.protected === "boolean")) &&
      this.validateAuthorityClaims(
        registration.authorityClaims,
        registration.moduleName,
      ) &&
      this.validateActivationDataPackages(
        registration.activationDataPackages,
      ) &&
      this.validateBackofficeMetadata(registration.backoffice)
    );
  },
  /** Validates bounded schema/service authority claims carried by module registration. */
  validateAuthorityClaims: function (authorityClaims, moduleName) {
    if (authorityClaims === undefined) return true;
    if (!Array.isArray(authorityClaims) || authorityClaims.length > 512)
      return false;
    let modulePattern = new RegExp(contracts.moduleName.pattern);
    let claimPattern = /^[A-Za-z][A-Za-z0-9_.-]{0,255}$/;
    return authorityClaims.every(
      (claim) =>
        claim &&
        typeof claim === "object" &&
        !Array.isArray(claim) &&
        !Object.keys(claim).some(
          (key) =>
            !["kind", "moduleName", "claimName", "authorityContext"].includes(
              key,
            ),
        ) &&
        ["schema", "service"].includes(claim.kind) &&
        claim.moduleName === moduleName &&
        modulePattern.test(claim.moduleName || "") &&
        claimPattern.test(claim.claimName || "") &&
        claimPattern.test(claim.authorityContext || ""),
    );
  },
  /** Validates bounded module-owned activation data package descriptors. */
  validateActivationDataPackages: function (packages) {
    if (packages === undefined) return true;
    if (!Array.isArray(packages) || packages.length > 128) return false;
    let modulePattern = new RegExp(contracts.moduleName.pattern);
    return packages.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        !Object.keys(item).some(
          (key) =>
            ![
              "code",
              "classification",
              "owner",
              "required",
              "trigger",
              "targetModule",
              "targetServer",
              "targetDatabase",
              "operation",
              "dataType",
            ].includes(key),
        ) &&
        this.isString(item.code, 256) &&
        this.isString(item.classification, 64) &&
        modulePattern.test(item.owner || "") &&
        typeof item.required === "boolean" &&
        ["ACTIVATION", "USER"].includes(item.trigger) &&
        (item.targetModule === undefined ||
          modulePattern.test(item.targetModule || "")) &&
        (item.targetServer === undefined ||
          item.targetServer === "" ||
          this.isString(item.targetServer, 128)) &&
        (item.targetDatabase === undefined ||
          item.targetDatabase === "" ||
          this.isString(item.targetDatabase, 128)) &&
        this.isString(item.operation, 64) &&
        ["init", "core", "sample"].includes(item.dataType),
    );
  },
  /** Validates one bounded runtime registration batch and its stable instance identity. */
  validateRegistrationBatch: function (batch, limit) {
    if (
      !batch ||
      !this.isString(batch.instanceId, 512) ||
      !Array.isArray(batch.registrations) ||
      batch.registrations.length === 0 ||
      batch.registrations.length > Number(limit || 512)
    )
      return false;
    let moduleNames = batch.registrations.map(
      (registration) => registration.moduleName,
    );
    return (
      this.hasOnlyContractFields(batch, contracts.registrationBatch) &&
      (batch.project === undefined || this.isString(batch.project)) &&
      (batch.environment === undefined || this.isString(batch.environment)) &&
      (batch.server === undefined || this.isString(batch.server)) &&
      (batch.runtimeRole === undefined ||
        (batch.runtimeRole &&
          typeof batch.runtimeRole === "object" &&
          !Array.isArray(batch.runtimeRole) &&
          !Object.keys(batch.runtimeRole).some(
            (key) => !["code", "publication"].includes(key),
          ) &&
          this.isString(batch.runtimeRole.code, 64) &&
          this.isString(batch.runtimeRole.publication, 64))) &&
      (batch.node === undefined ||
        batch.node === null ||
        this.isString(batch.node)) &&
      new Set(moduleNames).size === moduleNames.length &&
      batch.registrations.every(
        (registration) =>
          registration.instanceId === batch.instanceId &&
          this.validateRegistration(registration),
      )
    );
  },
};
