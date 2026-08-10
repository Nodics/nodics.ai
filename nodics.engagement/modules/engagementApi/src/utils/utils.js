/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementApi/src/utils/utils @description Provides side-effect-free API normalization helpers. @layer utility @owner engagementApi @override Later modules may extend helpers without weakening validation. */
module.exports = {
    /** Handles normalize string within the module-owned contract. */
    normalizeString: function (value) { return value === undefined || value === null ? '' : String(value).trim(); },
    /** Handles bounded number within the module-owned contract. */
    boundedNumber: function (value, minimum, maximum, fallback) { let number = Number(value); return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback; }
};
