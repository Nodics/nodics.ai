/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/facade/defaultDigitalCommerceMerchantFacade @description Fixed customer/staff merchant orchestration; domain services retain live Profile membership, Store scopes and canonical monetary authority. @layer facade @owner digitalCore @override Later layers may extend orchestration without introducing caller finance or bypassing owner guards. */
module.exports = {
  /** Validates a presented coupon and trusted monetary source. @param {Object} r Signed context. @returns {Promise<Object>} */
  validate: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.validate(r),
    );
  },
  /** Lists customer-owned available merchant targets. @param {Object} r Signed context. @returns {Promise<Object>} */
  eligibleMerchants: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.eligibleMerchants(r),
    );
  },
  /** Records a customer claim through its canonical owner. @param {Object} r Signed context. @returns {Promise<Object>} */
  claim: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.claim(r),
    );
  },
  /** Reads current scope-bound merchant requests. @param {Object} r Signed context. @returns {Promise<Object>} */
  queue: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.queue(r),
    );
  },
  /** Reads live authorized outlet presentation. @param {Object} r Signed context. @returns {Promise<Object>} */
  workspace: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.workspace(r),
    );
  },
  /** Confirms only the original validated source and durable instruction. @param {Object} r Signed context. @returns {Promise<Object>} */
  confirm: function (r) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceMerchantService.confirm(r),
    );
  },
};
