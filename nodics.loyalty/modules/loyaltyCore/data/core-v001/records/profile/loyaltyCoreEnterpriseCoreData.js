/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyCore/data/core-v001/records/profile/loyaltyCoreEnterpriseCoreData @description Loyalty enterprise reference records contributed to Profile. @layer data @owner loyaltyCore */
module.exports = {
    record0: {
        code: 'NODICS_REWARDS_MARKETPLACE_CO',
        name: 'Nodics Rewards Marketplace Co.',
        active: true,
        description: 'Rewards marketplace and coupon redemption provider for Nodics Loyalty demo and reference data.',
        tenant: 'default:true',
        roleCodes: ['MARKETPLACE_VENDOR', 'ISSUER'],
        capabilityScopes: [{
            moduleName: 'loyaltyCore',
            roleCode: 'MARKETPLACE_VENDOR',
            scopeCode: 'REWARDS_MARKETPLACE'
        }, {
            moduleName: 'loyaltyCore',
            roleCode: 'ISSUER',
            scopeCode: 'LOYALTY_REWARD_ISSUANCE'
        }],
        addresses: [],
        contacts: []
    },
    record1: {
        code: 'NODICS_REWARDS_REDEMPTION_VENDOR_CO',
        name: 'Nodics Rewards Redemption Vendor Co.',
        active: true,
        description: 'Reference marketplace vendor where rewards coupons can be redeemed in Loyalty demonstrations.',
        tenant: 'default:true',
        roleCodes: ['MARKETPLACE_VENDOR', 'BUSINESS_PARTNER'],
        capabilityScopes: [{
            moduleName: 'loyaltyCore',
            roleCode: 'MARKETPLACE_VENDOR',
            scopeCode: 'COUPON_REDEMPTION'
        }, {
            moduleName: 'loyaltyCore',
            roleCode: 'BUSINESS_PARTNER',
            scopeCode: 'LOYALTY_MARKETPLACE_PARTNERSHIP'
        }],
        addresses: [],
        contacts: []
    }
};
