/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialSeriesPolicyService @description Validates governed Editorial series assignment. @layer service @owner editorial */
module.exports = { /** Returns whether a series can accept article assignments. */ isAssignable: function (series) { return Boolean(series && series.code && series.active === true); } };
