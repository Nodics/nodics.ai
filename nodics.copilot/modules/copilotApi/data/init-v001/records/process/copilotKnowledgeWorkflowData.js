/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module copilotApi/data/CopilotKnowledgeWorkflowData
 * @description Explicit-install Process definition for one governed static-source refresh. No schedule, source grant or runtime activation is installed.
 * @layer data @owner copilotApi
 * @override Future graph changes require a new immutable contribution release; deployment selects the action target and source assignment.
 */
module.exports = {
    definitions: [
        {
            code: 'copilotKnowledgeRefresh',
            name: 'Copilot knowledge refresh',
            description:
                'One audited source refresh with no automatic retry after an uncertain result.',
            category: 'knowledge',
            ownerModule: 'copilotApi',
            graph: {
                nodes: [
                    { code: 'start', type: 'START', name: 'Start' },
                    {
                        code: 'refresh',
                        type: 'ACTION',
                        name: 'Refresh knowledge',
                        action: {
                            moduleName: 'copilotApi',
                            operation: 'refreshKnowledge',
                        },
                        retry: { maximumAttempts: 1, delayMs: 0 },
                    },
                    { code: 'end', type: 'END', name: 'End' },
                ],
                transitions: [
                    {
                        code: 'start_refresh',
                        source: 'start',
                        target: 'refresh',
                    },
                    { code: 'refresh_end', source: 'refresh', target: 'end' },
                ],
            },
        },
    ],
};
