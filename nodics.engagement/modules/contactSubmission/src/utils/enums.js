/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/utils/enums @description Defines loader-compatible contact actions and visibility categories. @layer utility @owner contactSubmission @override Later modules may add actions without redefining lifecycle meaning. */
module.exports = { ContactAction: { definition: ['REQUEST_INFORMATION', 'ATTEMPT_CONTACT', 'RESOLVE', 'CLOSE', 'REOPEN', 'MARK_DUPLICATE', 'MARK_SPAM'] }, ContactVisibility: { definition: ['CUSTOMER', 'INTERNAL'] } };
