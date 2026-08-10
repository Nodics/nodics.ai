/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementCore/src/utils/statusDefinitions
 * @description Defines stable Engagement Core error and reason codes for validation, lifecycle, tenant, consent, protection, integration, and reconciliation outcomes.
 * @layer utility
 * @owner engagementCore
 * @override Later modules may add codes but must preserve existing meanings and fail-closed behavior.
 */
module.exports = {
    ERR_ENG_00000: { code: '400', message: 'Invalid engagement request' },
    ERR_ENG_00001: { code: '400', message: 'Engagement tenant context is required' },
    ERR_ENG_00002: { code: '400', message: 'Engagement correlation identity is required' },
    ERR_ENG_00003: { code: '409', message: 'Engagement idempotency conflict' },
    ERR_ENG_00004: { code: '409', message: 'Invalid engagement lifecycle transition' },
    ERR_ENG_00005: { code: '409', message: 'Engagement revision conflict' },
    ERR_ENG_00006: { code: '422', message: 'Engagement validation failed' },
    ERR_ENG_00007: { code: '403', message: 'Engagement ownership or permission denied' },
    ERR_ENG_00008: { code: '422', message: 'Engagement consent evidence is invalid' },
    ERR_ENG_00009: { code: '429', message: 'Engagement protection policy rejected the request' },
    ERR_ENG_00010: { code: '503', message: 'Engagement integration is unavailable' },
    ERR_ENG_00011: { code: '422', message: 'Engagement retention policy is not configured' },
    RSN_ENG_ACCEPTED: { code: 'ENG_ACCEPTED', message: 'Engagement submission accepted' },
    RSN_ENG_DUPLICATE: { code: 'ENG_DUPLICATE', message: 'Idempotent engagement replay returned the existing record' },
    RSN_ENG_DEFERRED: { code: 'ENG_DEFERRED', message: 'Optional integration work was safely deferred' },
    RSN_ENG_RECONCILED: { code: 'ENG_RECONCILED', message: 'Engagement integration reference reconciled' }
};
