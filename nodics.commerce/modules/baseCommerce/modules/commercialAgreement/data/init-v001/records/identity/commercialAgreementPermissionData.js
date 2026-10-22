/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/data/permissions @description Capability-owned permission definitions; grants remain Profile-owned. @layer data @owner commercialAgreement */
module.exports = {
    read: { code: 'commerce.agreement.read', name: 'Read commercial agreements', active: true, ownerModule: 'commercialAgreement' },
    manage: { code: 'commerce.agreement.manage', name: 'Record commercial agreements and amendments', active: true, ownerModule: 'commercialAgreement' }
};
