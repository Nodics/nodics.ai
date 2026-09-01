/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardPayment/config/properties @description Defines Commerce payment-method defaults for paying with Loyalty reward balances. @layer config @owner loyaltyRewardPayment */
module.exports = { loyaltyRewardPayment: { enabled: true, providerCode: 'loyalty-reward-points', defaultCurrency: 'POINTS', defaultProgramCode: 'default', defaultRewardTypeCode: 'points' } };
