/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/core-v002/headers/axis/axisAssistantKnowledgeHeader
 * @description Declares the versioned Axis Assistant knowledge-status CMS update.
 * @layer data
 * @owner axis
 * @override Later Axis releases may replace these records through a newer immutable version.
 */
module.exports = {
    cms: {
        axisAssistantKnowledgeTypeCodeData: {
            options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'axisAssistantKnowledgeTypeCodeData' },
            query: { code: '$code' }
        },
        axisAssistantKnowledgeComponentData: {
            options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'axisAssistantKnowledgeComponentData' },
            query: { code: '$code' }
        }
    }
};
