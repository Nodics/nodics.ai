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
    SUC_PROCESS_00007: { code: '201', message: 'Process instance started successfully' },
    SUC_PROCESS_00008: { code: '200', message: 'Process task updated successfully' },
    SUC_PROCESS_00009: { code: '200', message: 'Process instance cancelled successfully' },
    SUC_PROCESS_00010: { code: '200', message: 'Process scheduled trigger metadata returned successfully' },
    SUC_PROCESS_00011: { code: '202', message: 'Process trigger execution accepted successfully' },
    SUC_PROCESS_00012: { code: '200', message: 'Process incident retry resolved successfully' },
    SUC_PROCESS_00013: { code: '200', message: 'Process domain compensation completed successfully' },

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
    ERR_PROCESS_00010: { code: '400', message: 'Process designer request is invalid' },
    ERR_PROCESS_00011: { code: '409', message: 'Process definition is not published for runtime start' },
    ERR_PROCESS_00012: { code: '409', message: 'Process task transition is not allowed' },
    ERR_PROCESS_00013: { code: '409', message: 'Process instance transition is not allowed' },
    ERR_PROCESS_00014: { code: '503', message: 'Process trigger service is unavailable' },
    ERR_PROCESS_00015: { code: '400', message: 'Process trigger status is invalid' },
    ERR_PROCESS_00016: { code: '404', message: 'Process trigger was not found' },
    ERR_PROCESS_00017: { code: '409', message: 'Archived process trigger cannot be updated' },
    ERR_PROCESS_00018: { code: '422', message: 'Unsupported process runtime node type' },
    ERR_PROCESS_00019: { code: '403', message: 'Process action adapter is not registered or allowed' },
    ERR_PROCESS_00020: { code: '409', message: 'Process trigger is not active' },
    ERR_PROCESS_00021: { code: '409', message: 'Process decision could not resolve a transition' },
    ERR_PROCESS_00022: { code: '404', message: 'Process recovery incident was not found' },
    ERR_PROCESS_00023: { code: '409', message: 'Process incident is not eligible for retry' },
    ERR_PROCESS_00024: { code: '409', message: 'Process incident changed; refresh before retrying' },
    ERR_PROCESS_00025: { code: '409', message: 'Process instance is not eligible for compensation' }
};
