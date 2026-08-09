/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.process/modules/workflow/modules/flowSchema/src/utils/statusDefinitions
 * @description Stable Process success and error status definitions used by workflow definition APIs, validation, and lifecycle services.
 * @layer utils
 * @owner flowSchema
 * @override Customer process overlays may add later status codes without weakening the standard lifecycle vocabulary.
 */
module.exports = {
    SUC_PROCESS_00000: { code: '200', message: 'Process request completed successfully' },
    SUC_PROCESS_00001: { code: '201', message: 'Process draft definition created successfully' },
    SUC_PROCESS_00002: { code: '200', message: 'Process draft definition updated successfully' },
    SUC_PROCESS_00003: { code: '200', message: 'Process definition validated successfully' },
    SUC_PROCESS_00004: { code: '200', message: 'Process definition published successfully' },
    SUC_PROCESS_00005: { code: '200', message: 'Process definition archived successfully' },
    SUC_PROCESS_00006: { code: '200', message: 'Process next draft prepared successfully' },

    ERR_PROCESS_00000: { code: '500', message: 'Process internal server error' },
    ERR_PROCESS_00001: { code: '400', message: 'Process request is invalid' },
    ERR_PROCESS_00002: { code: '404', message: 'Process definition was not found' },
    ERR_PROCESS_00003: { code: '409', message: 'Process definition already exists' },
    ERR_PROCESS_00004: { code: '422', message: 'Process graph validation failed' },
    ERR_PROCESS_00005: { code: '409', message: 'Only draft process definitions can be updated or deleted' },
    ERR_PROCESS_00006: { code: '400', message: 'Process runtime code is invalid' },
    ERR_PROCESS_00007: { code: '404', message: 'Process instance was not found' },
    ERR_PROCESS_00008: { code: '404', message: 'Process task was not found' },
    ERR_PROCESS_00009: { code: '409', message: 'Only published process definitions can prepare a next draft' },
    ERR_PROCESS_00010: { code: '400', message: 'Process designer request is invalid' }
};
