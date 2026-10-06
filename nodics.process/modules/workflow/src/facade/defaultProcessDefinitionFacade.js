/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module nodics.process/modules/workflow/src/facade/defaultProcessDefinitionFacade
 * @description Facade boundary for process definition lifecycle APIs.
 * @layer facade
 * @owner workflow
 * @override Customer process overlays may add approval, policy, or domain-specific orchestration before delegating to lifecycle services.
 */
module.exports = {
  /** Delegates definition listing. */
  listDefinitions: function (request) {
    return SERVICE.DefaultProcessDefinitionLifecycleService.listDefinitions(
      request,
    );
  },
  /** Delegates definition read. */
  getDefinition: function (request) {
    return SERVICE.DefaultProcessDefinitionLifecycleService.getDefinition(
      request,
    );
  },
  /** Delegates draft creation. */
  createDefinition: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "create",
    );
  },
  /** Delegates draft update. */
  updateDraft: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "update",
    );
  },
  /** Delegates draft validation. */
  validateDraft: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "validate",
    );
  },
  /** Delegates draft publication. */
  publishDraft: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "publish",
    );
  },
  /** Delegates next-draft preparation from latest published version. */
  prepareNextDraft: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "prepare",
    );
  },
  /** Delegates draft delete or published archive. */
  deleteOrArchive: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.execute(
      request,
      "delete",
    );
  },
  /** Inspects a fixed original definition command without replay. */
  inspectDefinitionCommand: function (request) {
    return SERVICE.DefaultProcessDefinitionCommandReceiptService.inspect(
      request,
    );
  },
  /** Delegates version listing. */
  listVersions: function (request) {
    return SERVICE.DefaultProcessDefinitionLifecycleService.listVersions(
      request,
    );
  },
};
