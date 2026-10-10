/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/data/init-v001/records/user/defaultServiceEmployeeData
 * @description Provides the tenant-local runtime service principal without copying authority-tenant human accounts.
 * @layer data
 * @owner profile
 * @override Later layers may customize this separate service dataset and its header selectors through the existing governed Init release contract.
 */
const authSecurity = require("nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService");
const bootstrapIdentity = authSecurity.validateBootstrapIdentity(CONFIG);

module.exports = {
  record1: {
    code: "apiAdmin",
    active: true,
    name: { title: "Mr.", firstName: "apiAdmin", lastName: "Employee" },
    loginId: "apiAdmin",
    password: {
      loginId: "apiAdmin",
      password: bootstrapIdentity.servicePassword,
      active: true,
    },
    apiKey: bootstrapIdentity.serviceApiKey,
    apiKeyScopes: [
      "auth.internal.token.read",
      "auth.internal.token.read.anyTenant",
    ],
    apiKeyStatus: "active",
    identityMigrationVersion: 5,
    principalType: "service",
    userGroups: ["serviceAccountUserGroup"],
    addresses: ["defaultEmployeeAddress"],
    contacts: ["defaultEmployeeContact"],
  },
};
