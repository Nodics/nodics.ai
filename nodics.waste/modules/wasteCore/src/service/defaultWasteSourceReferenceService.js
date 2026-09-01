/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../utils/utils');

/** @module wasteCore/src/service/defaultWasteSourceReferenceService @description Validates and normalizes source references used by Waste to point at Location, Profile, Media, Commerce, Workflow, and partner-owned records. @layer service @owner wasteCore @override Later modules may add reference resolvers without changing the base shape. */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns true when a value is a source reference with module, schema, and code. */
    isValid: function (reference) {
        return !!reference && !!UTILS.normalizeString(reference.module) && !!UTILS.normalizeString(reference.schema) && !!UTILS.normalizeString(reference.code);
    },

    /** Normalizes a source reference without resolving the referenced owner. */
    normalize: function (reference, required) {
        if (!this.isValid(reference)) {
            if (required === false && (reference === undefined || reference === null)) return undefined;
            this.fail('ERR_WASTE_SOURCE_REFERENCE_INVALID', 'source reference requires module, schema, and code');
        }
        return {
            module: UTILS.normalizeString(reference.module),
            schema: UTILS.normalizeString(reference.schema),
            code: UTILS.normalizeString(reference.code)
        };
    }
};
