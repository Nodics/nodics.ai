/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/facade/defaultDigitalCommerceOwnershipEvidenceFacade
 * @description Delegates fixed evidence/admission commands without identity rewriting.
 * @layer facade @owner digitalCore
 */
module.exports = {
  /**
   * Delegates fixed read-only evidence selectors without rewriting caller identity.
   * @param {Object} request Original private signed request.
   * @param {Object} input Versioned LISTING, BINDING, PURCHASE or REFUND selectors.
   * @returns {Promise<Object>} Owner evidence; propagates admission and read failures.
   */
  query: function (request, input) { return SERVICE.DefaultDigitalCommerceOwnershipEvidenceService.query(request, input); },
  /**
   * Delegates reviewed binding admission, including any owner-controlled insert.
   * @param {Object} request Original private signed request.
   * @param {Object} input Versioned ADMIT_BINDING selectors and reviewed plan digest.
   * @returns {Promise<Object>} Admitted binding; propagates owner validation and persistence failures.
   */
  admitBinding: function (request, input) { return SERVICE.DefaultDigitalCommerceOwnershipEvidenceService.admitBinding(request, input); },
};
