/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotKnowledge/test/DefaultEmployeeService
 * @description Supplies bounded first-install service scopes only inside the disposable acceptance composition.
 * @layer test @owner copilotKnowledge
 */
module.exports = {
  /** Delegates private Init admission and create-or-preserve semantics to Profile. */
  ensureBootstrapAll: function (request) {
    const fixture = SERVICE.DefaultCopilotAcceptanceBootstrapService;
    const permissions = fixture.runtimePermissions();
    return SERVICE.DefaultMandatoryIdentityBootstrapService.ensureBootstrapAll(
      this,
      "employee",
      {
        ...request,
        models: request.models.map((model) => model.code === "apiAdmin"
          ? { ...model, apiKeyScopes: [...new Set([...model.apiKeyScopes, ...permissions])] }
          : model),
      },
    );
  },
};
