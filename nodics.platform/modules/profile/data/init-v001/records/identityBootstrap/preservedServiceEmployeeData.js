/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/data/init-v001/records/identityBootstrap/preservedServiceEmployeeData
 * @description Preserves the reviewed five-scope service baseline for fresh installs without changing installed principals or historical source records.
 * @layer data
 * @owner profile
 * @override Later layers may select forward governed data releases; existing principal credentials and authority remain Profile-owned.
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
      "location.location.read",
      "profile.address.reference.read",
      "profile.enterprise.reference.read",
    ],
    apiKeyStatus: "active",
    identityMigrationVersion: 5,
    principalType: "service",
    userGroups: ["serviceAccountUserGroup"],
    addresses: ["defaultEmployeeAddress"],
    contacts: ["defaultEmployeeContact"],
  },
};
