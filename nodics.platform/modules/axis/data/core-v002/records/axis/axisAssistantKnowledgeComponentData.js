/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/core-v002/records/axis/axisAssistantKnowledgeComponentData
 * @description Publishes client-safe labels for the Axis Assistant knowledge-status experience.
 * @layer data
 * @owner axis
 * @override Later Axis releases may localize or replace these labels through a newer immutable version.
 */
module.exports = {
    record0: {
        code: 'axisAssistantWorkspaceComponent',
        typeCode: 'axisAssistantWorkspaceComponentType',
        accessMode: 'AUTHENTICATED',
        properties: {
            title: 'How can I help?', welcomeMessage: 'Ask about authorized Nodics business data or operations.',
            inputPlaceholder: 'Describe what you want to do', submitLabel: 'Send', stopLabel: 'Stop',
            emptyState: 'Responses, tool activity, confirmations, and workflow progress will appear here.',
            employeeLabel: 'You', assistantLabel: 'Axis Assistant', workingLabel: 'Working on your request',
            cancellingLabel: 'Stopping the current request', errorLabel: 'The request could not be completed',
            historyLabel: 'Conversations', newConversationLabel: 'New conversation',
            noConversationsLabel: 'No saved conversations yet', loadMoreLabel: 'Load more',
            clarificationTitle: 'More information required', clarificationSubmitLabel: 'Continue',
            toolPlanTitle: 'Proposed governed action', confirmationTitle: 'Review and confirm', rejectLabel: 'Reject',
            approveLabel: 'Approve action', executeLabel: 'Execute approved action',
            confirmationExpiredLabel: 'This confirmation has expired. Submit the request again.',
            confirmationCompletedLabel: 'The approved action completed successfully.',
            toolPlannedLabel: 'Action prepared', toolRunningLabel: 'Action in progress',
            toolSucceededLabel: 'Action completed', toolFailedLabel: 'Action failed', citationsTitle: 'Sources',
            noCitationsLabel: 'No sources were supplied for this response.', usageTitle: 'AI usage',
            inputTokensLabel: 'Input', outputTokensLabel: 'Output', cachedTokensLabel: 'Cached input',
            reasoningTokensLabel: 'Reasoning', embeddingTokensLabel: 'Embedding', reconciliationLabel: 'Accounting status',
            knowledgeTitle: 'Knowledge sources', knowledgeSourcesLabel: 'Sources', knowledgeChunksLabel: 'Indexed chunks',
            knowledgeLastRefreshLabel: 'Last refresh', knowledgeRefreshLabel: 'Refresh', knowledgeRefreshingLabel: 'Refreshing',
            knowledgeUnavailableLabel: 'Knowledge status unavailable'
        },
        functionalModule: 'nodics.platform',
        activationMode: 'PLATFORM_ACTIVE',
        active: true
    }
};
