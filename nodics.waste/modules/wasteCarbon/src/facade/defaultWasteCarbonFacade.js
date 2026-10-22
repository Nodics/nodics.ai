/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/facade @description Delegates trusted owner commands to persisted service operations. @owner wasteCarbon @layer facade @override Preserve tenant/auth context and owner checks. */
module.exports = {
    /**
     * Executes holdings; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    holdings: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.holdings(request); },
    /**
     * Executes synchronize; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    synchronize: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.synchronize(request); },
    /**
     * Executes reserve; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reserve: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.reserve(request); },
    /**
     * Executes transfer; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transfer: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.transfer(request); },
    /**
     * Delegates original-operation finalization without weakening service admission.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    finalize: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.finalize(request); },
    /**
     * Executes release; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    release: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.release(request); },
    /**
     * Executes getOperation; returns the persisted owner result or a typed failure.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    getOperation: function (request) { return SERVICE.DefaultWasteCarbonHoldingService.getOperation(request); }
};
