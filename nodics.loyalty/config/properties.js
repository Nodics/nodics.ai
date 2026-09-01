/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.loyalty/config/properties
 * @description Registers Loyalty as a discoverable capability without enabling project-specific earn/spend rules.
 * @layer config
 * @owner nodics.loyalty
 * @override Project, environment, server, node, tenant, or customer layers may refine feature policy without changing functional identity.
 */
module.exports = {
    loyalty: {
        capabilities: {
            programs: true,
            rewardTypes: true,
            wallets: true,
            ledger: true,
            reservations: true,
            redemptions: true
        },
        defaults: {
            amountScale: 2,
            reservationTtlSeconds: 900,
            idempotencyRequired: true
        }
    }
};
