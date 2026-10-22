/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module checkoutCore/facade/defaultCheckoutCustomerFacade
 * @description Admits personal and represented Enterprise owners through the existing Commerce
 * participant boundary, preserving original credentials.
 * @layer facade
 * @owner checkoutCore
 * @remarks Checkout facade re-resolves Profile participant and retained merchant scope before every
 * owner command. OwnerRef, actorRef and participant namespace remain distinct from merchant
 * persistence.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: context, commandStatus, recoverCompensation, resumeBundle, status, place.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Uses current Profile evidence; caller fields cannot supply purchasing identity or groups.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Fresh participant context with independently retained merchant placement.
     * @remarks Effects: Reads Profile and existing Cart/checkpoint scope; does not grant replacement
     * credentials.
     * Failure behavior: Rejects denied, foreign, missing or changed participant/merchant bindings.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    context: async function (request) {
        const participant = await FACADE.DefaultCartCustomerFacade.resolveContext(request, 'commerce.checkout.place');
        return SERVICE.DefaultCheckoutMerchantScopeService.resolve(participant);
    },
    /**
     * Reads the original owner's command, including processing and recovery evidence.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Result of the corresponding Checkout operation after fresh owner
     * admission.
     * @remarks Effects: Reads retained command/completion evidence only.
     * Failure behavior: Propagates participant denial, retained binding drift and original owner-operation
     * failures.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    commandStatus: async function (request) {
        return SERVICE.DefaultCheckoutOperationService.commandStatus(await this.context(request));
    },
    /**
     * Reconciles only the original authorized command.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Result of the corresponding Checkout operation after fresh owner
     * admission.
     * @remarks Effects: Delegates only the requested existing placement/recovery workflow and its owner
     * effects.
     * Failure behavior: Propagates participant denial, retained binding drift and original owner-operation
     * failures.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    recoverCompensation: async function (request) {
        return SERVICE.DefaultCheckoutOperationService.recoverCompensation(await this.context(request));
    },
    /**
     * Reauthorizes the owner before original-key forward recovery.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Result of the corresponding Checkout operation after fresh owner
     * admission.
     * @remarks Effects: Delegates only the requested existing placement/recovery workflow and its owner
     * effects.
     * Failure behavior: Propagates participant denial, retained binding drift and original owner-operation
     * failures.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    resumeBundle: async function (request) {
        return SERVICE.DefaultCheckoutOperationService.resumeBundle(await this.context(request));
    },
    /**
     * Reads an owner-scoped completed checkout.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Result of the corresponding Checkout operation after fresh owner
     * admission.
     * @remarks Effects: Reads retained command/completion evidence only.
     * Failure behavior: Propagates participant denial, retained binding drift and original owner-operation
     * failures.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    status: async function (request) {
        return SERVICE.DefaultCheckoutOperationService.status(await this.context(request));
    },
    /**
     * Preserves canonical owner and separate actor through common placement.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @returns {Promise<Object>} Result of the corresponding Checkout operation after fresh owner
     * admission.
     * @remarks Effects: Delegates only the requested existing placement/recovery workflow and its owner
     * effects.
     * Failure behavior: Propagates participant denial, retained binding drift and original owner-operation
     * failures.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    place: async function (request) {
        return SERVICE.DefaultCheckoutOperationService.place(await this.context(request));
    },
};
