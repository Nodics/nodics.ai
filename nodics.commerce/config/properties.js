/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.commerce/config/properties
 * @description Publishes only cross-capability Commerce runtime operating defaults.
 * @layer config
 * @owner nodics.commerce
 * @override Project, environment, server, node, and tenant layers may override
 * intentional configuration deltas while concrete child modules retain all
 * business behavior and schema ownership.
 */

module.exports = {
    commerce: {
        capabilities: {
            baseCommerce: true,
            cart: true,
            order: true,
            payment: true,
            fulfillment: true,
            reverseLifecycle: true
        },
        operations: {
            budgetVersion: '1',
            limits: {
                maximumPageSize: 100,
                maximumCartEntries: 500,
                maximumBatchSize: 100,
                maximumConcurrentProviderRequests: 25
            },
            retries: {
                maximumAttempts: 5,
                baseDelayMs: 250,
                maximumDelayMs: 30000
            },
            referenceObjectives: {
                cartCalculationP95Ms: 250,
                checkoutPlacementP95Ms: 1500,
                operatorReadP95Ms: 500,
                recoveryPointMinutes: 15,
                recoveryTimeMinutes: 60
            },
            deploymentApprovalRequired: true,
            note: 'Reference objectives require environment-specific load, soak, provider, backup, restore, failover, and owner acceptance evidence.'
        },
        compatibility: {
            aliasWindow: '2_MINOR_RELEASES_OR_180_DAYS',
            rejectUnknownMajor: true
        },
        migration: {
            defaultStrategy: 'DRY_RUN',
            requireTenantCounts: true,
            requireSourceHashes: true,
            quarantineFailures: true,
            rollbackRequired: true
        }
    }
};
