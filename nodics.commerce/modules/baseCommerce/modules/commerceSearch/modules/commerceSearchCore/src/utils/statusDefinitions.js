/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commerceSearchCore/statusDefinitions @description Static index confirmation diagnostics for authorized publishers. @layer utility @owner commerceSearchCore */
module.exports = {
    ERR_COMMERCE_SEARCH_INDEX_WRITE: { code: '503', message: 'Search publication unconfirmed at INDEX_WRITE.' },
    ERR_COMMERCE_SEARCH_INDEX_ACK: { code: '503', message: 'Search publication unconfirmed at INDEX_ACK.' },
    ERR_COMMERCE_SEARCH_INDEX_READ: { code: '503', message: 'Search publication unconfirmed at INDEX_READ.' },
    ERR_COMMERCE_SEARCH_INDEX_MISSING: { code: '503', message: 'Search publication unconfirmed at INDEX_MISSING.' },
    ERR_COMMERCE_SEARCH_INDEX_BINDING: { code: '503', message: 'Search publication unconfirmed at INDEX_BINDING.' },
};
