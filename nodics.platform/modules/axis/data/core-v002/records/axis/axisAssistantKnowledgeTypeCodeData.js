/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/core-v002/records/axis/axisAssistantKnowledgeTypeCodeData
 * @description Extends the managed Assistant component contract with governed knowledge-status labels.
 * @layer data
 * @owner axis
 * @override Later Axis releases may evolve the property contract through a newer immutable version.
 */
module.exports = {
    record0: {
        code: 'axisAssistantWorkspaceComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: {
            title: 'string', welcomeMessage: 'string', inputPlaceholder: 'string', submitLabel: 'string', stopLabel: 'string',
            emptyState: 'string', employeeLabel: 'string', assistantLabel: 'string', workingLabel: 'string',
            cancellingLabel: 'string', errorLabel: 'string', historyLabel: 'string', newConversationLabel: 'string',
            noConversationsLabel: 'string', loadMoreLabel: 'string', clarificationTitle: 'string', clarificationSubmitLabel: 'string',
            toolPlanTitle: 'string', confirmationTitle: 'string', rejectLabel: 'string', approveLabel: 'string', executeLabel: 'string',
            confirmationExpiredLabel: 'string', confirmationCompletedLabel: 'string', toolPlannedLabel: 'string', toolRunningLabel: 'string',
            toolSucceededLabel: 'string', toolFailedLabel: 'string', citationsTitle: 'string', noCitationsLabel: 'string',
            usageTitle: 'string', inputTokensLabel: 'string', outputTokensLabel: 'string', cachedTokensLabel: 'string',
            reasoningTokensLabel: 'string', embeddingTokensLabel: 'string', reconciliationLabel: 'string',
            knowledgeTitle: 'string', knowledgeSourcesLabel: 'string', knowledgeChunksLabel: 'string',
            knowledgeLastRefreshLabel: 'string', knowledgeRefreshLabel: 'string', knowledgeRefreshingLabel: 'string',
            knowledgeUnavailableLabel: 'string'
        },
        functionalModule: 'nodics.platform',
        activationMode: 'PLATFORM_ACTIVE',
        active: true
    }
};
