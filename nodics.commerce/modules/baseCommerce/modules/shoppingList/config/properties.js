/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module shoppingList/config/properties @description Defines customer-owned shopping-list policy for wishlist, compare, and save-for-later intent. @layer config @owner shoppingList */
module.exports = {
    shoppingList: {
        enabled: true,
        customerApi: {
            defaultStoreCode: 'agoraMainStore',
            defaultLocale: 'en',
            maximumWishlistItems: 100,
            maximumCompareItems: 4,
            maximumSaveForLaterItems: 100,
            supportedListTypes: ['WISHLIST', 'COMPARE', 'SAVE_FOR_LATER']
        }
    },
    schemaPolicies: { shoppingList: {
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};
