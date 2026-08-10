/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/utils/utils @description Provides side-effect-free contact normalization helpers. @layer utility @owner contactSubmission @override Later modules may extend without weakening bounds. */
module.exports = { text: value => value === undefined || value === null ? '' : String(value).trim(), now: request => ((request && request.clock && request.clock.now ? request.clock.now() : new Date()).toISOString()) };
