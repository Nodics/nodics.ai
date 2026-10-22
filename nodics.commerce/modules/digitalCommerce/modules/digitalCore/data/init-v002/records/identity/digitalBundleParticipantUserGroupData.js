/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/data/bundleParticipantAccess @description Owns the customer group for composing, gifting and publishing self-owned Digital bundles. @owner digitalCore @layer data */
module.exports = {
  digitalBundleCustomerUserGroup: {
    code: "digitalBundleCustomerUserGroup",
    name: "Digital bundle customer",
    active: true,
    parentGroups: ["customerUserGroup"],
    permissions: ["commerce.digital.bundle.manage"],
  },
};
