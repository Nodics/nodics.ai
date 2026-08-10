/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');
/** @module contactSubmission/src/service/defaultContactValidationService @description Validates and allow-lists contact input before Core protection. @layer service @owner contactSubmission @override Later modules may add stricter fields and validation. */
module.exports = {
    /** Handles validate within the module-owned contract. */
    validate: function (request, configuration) {
        request = request || {}; configuration = configuration || {}; let payload = request.payload || request;
        (configuration.requiredFields || []).forEach(field => { if (!UTILS.text(payload[field])) { let error = new Error(field + ' is required'); error.code = 'ERR_CONTACT_00001'; throw error; } });
        let type = UTILS.text(payload.type || 'ENQUIRY').toUpperCase();
        if (!(configuration.types || []).includes(type)) { let error = new Error('contact type is invalid'); error.code = 'ERR_CONTACT_00000'; throw error; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(UTILS.text(payload.contactEmail))) { let error = new Error('contactEmail is invalid'); error.code = 'ERR_CONTACT_00000'; throw error; }
        if (UTILS.text(payload.subject).length > configuration.limits.subjectLength || UTILS.text(payload.message).length > configuration.limits.messageLength) { let error = new Error('contact content exceeds configured maximum'); error.code = 'ERR_CONTACT_00000'; throw error; }
        return { type: type, reasonCode: UTILS.text(payload.reasonCode), subject: UTILS.text(payload.subject), message: UTILS.text(payload.message), contactEmail: UTILS.text(payload.contactEmail).toLowerCase(), contactPhone: UTILS.text(payload.contactPhone), preferredChannel: UTILS.text(payload.preferredChannel || 'EMAIL').toUpperCase() };
    }
};
