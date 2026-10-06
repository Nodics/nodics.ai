/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";

/**
 * @module copilotPolicy/service/DefaultCopilotRefreshAdministrationService
 * @description Builds scoped refresh assignment proposals for existing nDynamo governance without installing Process definitions or granting runtime authority.
 * @layer service
 * @owner copilotPolicy
 * @override Preserve source/group authorization, exact deployment binding, unique publisher identity and proposal-only execution.
 */
module.exports = {
  /** Rejects unsafe configuration without exposing foreign assignments. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPL_00009");
  },
  /** Identifies the current deployment using authenticated context only. @param {Object} scope Trusted context. @returns {Object} Fixed binding. */
  binding: function (scope) {
    return {
      tenantCode: scope.tenant,
      enterpriseCode: scope.enterprise,
      projectCode: scope.customerProject,
      environmentCode: scope.environment,
    };
  },
  /** Requires elevated settings management and independent source management. @param {Object} scope Trusted context. @returns {boolean} Admission. */
  admitted: function (scope) {
    return (
      scope.superadmin === true &&
      scope.canManage === true &&
      Object.values(this.binding(scope)).every(
        (value) =>
          typeof value === "string" &&
          /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value),
      ) &&
      SERVICE.DefaultCopilotPolicyService.hasPermission(
        scope,
        "copilot.knowledge.source.manage",
      )
    );
  },
  /** Returns only enabled, currently authorized, group-visible indexable sources. @param {Object} configuration Current configuration. @param {Object} scope Trusted context. @returns {string[]} Source choices. */
  sources: function (configuration, scope) {
    let registry =
      SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration);
    if (configuration.knowledge.groups?.enabled === true)
      registry = SERVICE.DefaultCopilotKnowledgeGroupService.resolve(
        registry,
        configuration.knowledge.groups,
        scope,
        SERVICE.DefaultCopilotPolicyService,
        configuration.policy,
        undefined,
        true,
      ).registry;
    return registry.sources
      .filter(
        (source) =>
          source.enabled === true &&
          !["DATABASE", "EXTERNAL_LOG"].includes(source.sourceType) &&
          SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
            source,
            scope,
            configuration.policy,
          ).allowed,
      )
      .map((source) => source.code);
  },
  /** Reads and validates bounded canonical arrays; no alternate assignment registry is created. @param {Object} configuration Current configuration. @returns {Object} Canonical arrays. */
  records: function (configuration) {
    const workflows =
      configuration.knowledge?.workflowRefresh?.assignments || [];
    const publishers = configuration.knowledge?.eventRefresh?.publishers || [];
    for (const [kind, rows] of [
      ["workflow", workflows],
      ["publisher", publishers],
    ]) {
      if (!Array.isArray(rows) || rows.length > 100) this.fail();
      const seen = new Set();
      for (const row of rows) {
        const keys = [
          "tenantCode",
          "enterpriseCode",
          "projectCode",
          "environmentCode",
          "sourceCode",
          "definitionCode",
        ];
        if (kind === "publisher") keys.push("publisherId");
        if (
          !row ||
          typeof row !== "object" ||
          Array.isArray(row) ||
          Object.keys(row).some((key) => ![...keys, "version"].includes(key)) ||
          keys.some(
            (key) =>
              typeof row[key] !== "string" ||
              !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(row[key]),
          ) ||
          !Number.isSafeInteger(row.version) ||
          row.version < 1
        )
          this.fail();
        const identity = JSON.stringify(
          keys
            .filter((key) => kind !== "publisher" || key !== "definitionCode")
            .map((key) => row[key])
            .concat(kind === "workflow" ? [row.version] : []),
        );
        if (seen.has(identity)) this.fail();
        seen.add(identity);
      }
    }
    return { workflows, publishers };
  },
  /** Projects fixed deployment assignment forms using the existing declarative settings fields. @param {Object} configuration Current configuration. @param {Object} scope Trusted context. @returns {Array} Safe sections. */
  sections: function (configuration, scope) {
    if (!this.admitted(scope) || !configuration.knowledge?.workflowRefresh)
      return [];
    const sources = this.sources(configuration, scope);
    const records = this.records(configuration),
      binding = this.binding(scope);
    const field = (...args) =>
      SERVICE.DefaultCopilotAdministrationService.field(...args);
    const fields = (row, publisher) => [
      field("assigned", "Assignment enabled", "boolean", true),
      ...(publisher
        ? [
            field(
              "publisherId",
              "Publisher service identity",
              "text",
              row.publisherId || "",
            ),
          ]
        : []),
      field(
        "sourceCode",
        "Knowledge source",
        "select",
        row.sourceCode || sources[0] || "",
        { options: sources },
      ),
      field(
        "definitionCode",
        "Process definition",
        "text",
        row.definitionCode || "",
      ),
      field(
        "version",
        "Published Process version",
        "number",
        row.version || 1,
        { minimum: 1, maximum: 2147483647 },
      ),
    ];
    const sections = [];
    for (const [kind, rows] of [
      ["workflow", records.workflows],
      ["publisher", records.publishers],
    ]) {
      if (sources.length && rows.length < 100)
        sections.push({
          code: "refresh-" + kind + "-new",
          title:
            kind === "workflow"
              ? "Assign source refresh workflow"
              : "Assign source event publisher",
          editable: true,
          fields: fields({}, kind === "publisher"),
        });
      rows.forEach((row, index) => {
        if (
          Object.entries(binding).every(([key, value]) => row[key] === value) &&
          sources.includes(row.sourceCode)
        )
          sections.push({
            code: "refresh-" + kind + "-" + index,
            title:
              (kind === "workflow"
                ? "Refresh workflow: "
                : "Event publisher: ") + row.sourceCode.slice(0, 95),
            editable: true,
            fields: fields(row, kind === "publisher"),
          });
      });
    }
    return sections;
  },
  /** Builds a canonical property-array patch while retaining every foreign deployment row. @param {Object} configuration Current configuration. @param {Object} scope Trusted context. @param {string} section Requested section. @param {Object} values Validated form values. @returns {Object} Fixed property entry. */
  patch: function (configuration, scope, section, values) {
    const selected = this.sections(configuration, scope).find(
      (item) => item.code === section,
    );
    if (!selected) this.fail();
    SERVICE.DefaultCopilotAdministrationService.validate(selected, values);
    const match = /^refresh-(workflow|publisher)-(new|[0-9]+)$/.exec(section);
    if (!match) this.fail();
    const records = this.records(configuration),
      publisher = match[1] === "publisher";
    const rows = structuredClone(
      publisher ? records.publishers : records.workflows,
    );
    const row = {
      ...this.binding(scope),
      sourceCode: values.sourceCode,
      definitionCode: values.definitionCode,
      version: values.version,
      ...(publisher ? { publisherId: values.publisherId } : {}),
    };
    if (match[2] === "new") {
      if (!values.assigned) this.fail();
      rows.push(row);
    } else if (values.assigned) rows[Number(match[2])] = row;
    else rows.splice(Number(match[2]), 1);
    const next = {
      ...configuration,
      knowledge: {
        ...configuration.knowledge,
        workflowRefresh: {
          ...configuration.knowledge.workflowRefresh,
          assignments: publisher ? records.workflows : rows,
        },
        eventRefresh: {
          ...configuration.knowledge.eventRefresh,
          publishers: publisher ? rows : records.publishers,
        },
      },
    };
    const validated = this.records(next);
    const binding = this.binding(scope);
    for (const assignment of validated.publishers.filter((item) =>
      Object.entries(binding).every(([key, value]) => item[key] === value),
    )) {
      if (
        !validated.workflows.some((item) =>
          Object.entries(assignment)
            .filter(([key]) => key !== "publisherId")
            .every(([key, value]) => item[key] === value),
        )
      )
        this.fail();
    }
    return {
      path: publisher
        ? "copilot.knowledge.eventRefresh.publishers"
        : "copilot.knowledge.workflowRefresh.assignments",
      value: rows,
    };
  },
};
