/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/facade/enterprise/DefaultEnterpriseManagementFacade
 * @description Provides the replaceable Profile facade boundary for enterprise management reads.
 * @layer facade
 * @owner profile
 * @override Later modules may compose additional policy while delegating persistence and projection to Profile services.
 */
module.exports = {
    /** Delegates bounded enterprise search to the authoritative Profile service. */
    search: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.search(request);
    },
    /** Delegates confirmed enterprise creation to the authoritative Profile service. */
    create: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.createFromModel(request);
    },
    /** Delegates bounded enterprise access-assignment search to the authoritative Profile service. */
    searchAccessAssignments: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.searchAccessAssignments(request);
    },
    /** Delegates governed enterprise access pre-assignment to the authoritative Profile service. */
    preAssignAccess: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.preAssignAccess(request);
    },
    /** Delegates public access-assignment resolution to the authoritative Profile service. */
    resolvePreAssignedAccess: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.resolvePreAssignedAccess(request);
    },
    /** Delegates pre-approved enterprise employee registration to the authoritative Profile service. */
    registerPreAssignedEmployee: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.registerPreAssignedEmployee(request);
    },
    /** Delegates backend-driven workspace delivery to the authoritative Profile service. */
    getAccessWorkspace: function (request) {
        return Promise.resolve(SERVICE.DefaultEnterpriseManagementService.getAccessWorkspace(request));
    }
};
