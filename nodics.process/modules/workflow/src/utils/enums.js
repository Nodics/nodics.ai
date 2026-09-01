/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/src/utils/enums
 * @description Provides the workflow lifecycle vocabulary owned by the active workflow module.
 * @layer utils
 * @owner workflow
 * @override Later active modules may add enum definitions without weakening the standard process lifecycle vocabulary.
 */
module.exports = {
    WorkflowCarrierType: {
        _options: {
            name: 'WorkflowCarrierType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'FIXED',
            'FLEXI'
        ]
    },

    WorkflowCarrierState: {
        _options: {
            name: 'WorkflowCarrierState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'INIT',
            'RELEASED',
            'PROCESSING',
            'PROCESSED',
            'SPLITTED',
            'PAUSED',
            'BLOCKED',
            'FINISHED',
            'ERROR',
            'FATAL'
        ]
    },

    WorkflowActionState: {
        _options: {
            name: 'WorkflowActionState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'PROCESSING',
            'FINISHED',
            'ERROR',
            'FATAL'
        ]
    },

    WorkflowActionResponseType: {
        _options: {
            name: 'WorkflowActionResponseType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'SUCCESS',
            'REJECTED',
            'ERROR'
        ]
    },

    WorkflowActionType: {
        _options: {
            name: 'WorkflowActionType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'MANUAL',
            'AUTO',
            'PARALLEL'
        ]
    },

    WorkflowActionPosition: {
        _options: {
            name: 'WorkflowActionPosition',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'HEAD',
            'ACTION',
            'END'
        ]
    }
};
