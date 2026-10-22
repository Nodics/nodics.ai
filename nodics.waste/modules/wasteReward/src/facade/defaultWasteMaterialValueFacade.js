/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/facade @description Delegates valuation and payment-gated release to their persisted domain services. @owner wasteReward @layer facade */
module.exports = {
    /**
     * Projects only the selected original owner's material-value allocations.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    allocations: function (request) { return SERVICE.DefaultWasteMaterialValueAssessmentService.allocations(request); },
    /**
     * Persists qualified immutable assessment evidence.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    assess: function (request) { return SERVICE.DefaultWasteMaterialValueAssessmentService.assess(request); },
    /**
     * Releases one payment-covered allocation through Loyalty.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    release: function (request) { return SERVICE.DefaultWasteMaterialValueSettlementService.release(request); },
    /**
     * Reads persisted assessment and release progress.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    read: function (request) { return SERVICE.DefaultWasteMaterialValueAssessmentService.read(request); }
};
