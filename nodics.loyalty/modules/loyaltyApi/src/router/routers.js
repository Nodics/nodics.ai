/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyApi/src/router/routers @description Declares internal Loyalty resource APIs for remote module integrations. @layer router @owner loyaltyApi @override Later modules may add routes while preserving resource-oriented route keys. */
module.exports = {
    loyaltyApi: {
        internal: {
            wallet: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal',
                key: '/wallets/:walletCode', method: 'GET',
                controller: 'DefaultLoyaltyInternalController', operation: 'wallet',
                help: { requestType: 'secured', message: 'Reads a Loyalty wallet projection by wallet code.' }
            },
            reserveRewards: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.rewards.reserve', apiExposure: 'loyaltyInternal',
                key: '/reward-reservations', method: 'POST',
                controller: 'DefaultLoyaltyInternalController', operation: 'reserveRewards',
                help: { requestType: 'secured', message: 'Creates a reward reservation for a wallet and reward type.' }
            },
            captureReservation: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.rewards.capture', apiExposure: 'loyaltyInternal',
                key: '/reward-reservations/:reservationCode/capture', method: 'POST',
                controller: 'DefaultLoyaltyInternalController', operation: 'captureReservation',
                help: { requestType: 'secured', message: 'Captures a previously reserved reward amount.' }
            },
            releaseReservation: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.rewards.release', apiExposure: 'loyaltyInternal',
                key: '/reward-reservations/:reservationCode/release', method: 'POST',
                controller: 'DefaultLoyaltyInternalController', operation: 'releaseReservation',
                help: { requestType: 'secured', message: 'Releases a previously reserved reward amount.' }
            },
            reverseLedgerEntry: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.rewards.reverse', apiExposure: 'loyaltyInternal',
                key: '/reward-ledger-entries/:entryCode/reverse', method: 'POST',
                controller: 'DefaultLoyaltyInternalController', operation: 'reverseLedgerEntry',
                help: { requestType: 'secured', message: 'Posts a reversal entry for an existing reward ledger entry.' }
            }
        }
    }
};
