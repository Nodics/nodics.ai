/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialTaxonomyPolicyService @description Validates governed Editorial taxonomy terms. @layer service @owner editorial */
module.exports = { /** Returns whether a taxonomy term can classify an article. */ isAssignable: function (term) { return Boolean(term && term.code && term.taxonomyCode && term.active === true); } };
