/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cart/src/pipelines/pipelines @description Defines the overrideable Cart validation, owner-delegation, aggregate, and persistence pipeline. @layer pipeline @owner cart */
module.exports = { commerceCartCalculationPipeline: {
    startNode: 'validate', hardStop: true, handleError: 'handleError',
    nodes: {
        validate: { type: 'function', handler: 'DefaultCartCalculationPipelineService.validate', success: 'calculate' },
        calculate: { type: 'function', handler: 'DefaultCartCalculationPipelineService.calculate', success: 'successEnd' },
        successEnd: { type: 'function', handler: 'DefaultCartCalculationPipelineService.successEnd' },
        handleError: { type: 'function', handler: 'DefaultCartCalculationPipelineService.handleError' }
    }
} };
