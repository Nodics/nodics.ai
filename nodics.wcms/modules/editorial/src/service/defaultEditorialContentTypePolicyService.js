/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialContentTypePolicyService @description Evaluates Editorial content-type authoring policy. @layer service @owner editorial */
module.exports = { /** Returns whether a content type may accept new authoring work. */ isAuthoringEnabled: function (contentType) { return Boolean(contentType && contentType.code && contentType.active === true); } };
