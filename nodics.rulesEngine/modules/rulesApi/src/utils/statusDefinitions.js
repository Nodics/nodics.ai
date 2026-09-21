/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesApi/src/utils/statusDefinitions @description Status and error definitions owned by rulesApi. @layer utility @owner rulesApi */
module.exports = {
    RULE_SET_LIST: { code: '200', message: 'Rule definitions returned successfully' },
    RULE_SET_DETAIL: { code: '200', message: 'Rule definition returned successfully' },
    RULE_SET_CREATED: { code: '201', message: 'Rule definition draft created successfully' },
    RULE_SET_UPDATED: { code: '200', message: 'Rule definition draft updated successfully' },
    RULE_SET_VALID: { code: '200', message: 'Rule definition draft validated successfully' },
    RULE_SIMULATION: { code: '200', message: 'Rule definition draft simulated successfully' },
    RULE_SET_PUBLISHED: { code: '200', message: 'Rule definition published successfully' },
    RULE_SET_DRAFT_READY: { code: '200', message: 'Rule definition draft prepared successfully' },
    RULE_SET_VERSIONS: { code: '200', message: 'Rule definition versions returned successfully' },
    RULE_SET_AUDIT: { code: '200', message: 'Rule definition audit returned successfully' },
    RULE_PROPERTY_CATALOGUE: { code: '200', message: 'Rule property catalogue returned successfully' },
    RULE_PROPERTY_VALUES: { code: '200', message: 'Rule property values returned successfully' },
    RULE_APPROVAL_PENDING: { code: '202', message: 'Rule definition approval request is pending' },
    SCORE_BAND_SET_LIST: { code: '200', message: 'Score band sets returned successfully' },
    SCORE_BAND_SET_DETAIL: { code: '200', message: 'Score band set returned successfully' },
    SCORE_BAND_SET_CREATED: { code: '201', message: 'Score band set draft created successfully' },
    SCORE_BAND_SET_UPDATED: { code: '200', message: 'Score band set draft updated successfully' },
    SCORE_BAND_SET_PUBLISHED: { code: '200', message: 'Score band set published successfully' },
    SCORE_BAND_SET_DRAFT_READY: { code: '200', message: 'Score band set draft prepared successfully' },
    SCORE_BAND_SET_VERSIONS: { code: '200', message: 'Score band set versions returned successfully' }
};
