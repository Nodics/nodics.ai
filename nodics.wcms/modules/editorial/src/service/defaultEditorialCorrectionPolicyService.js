/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialCorrectionPolicyService @description Evaluates Editorial correction requests without applying publication changes. @layer service @owner editorial */
module.exports = { /** Returns whether a correction request has sufficient authoring evidence. */ isValidRequest: function (correction) { return Boolean(correction && correction.articleCode && correction.reason && correction.correctionText && correction.requestedBy); } };
