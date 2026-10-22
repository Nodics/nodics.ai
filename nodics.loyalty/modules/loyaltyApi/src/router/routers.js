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
        transferNotifications: {
            source: { secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.transfer.notification.source', apiExposure: 'loyaltyInternal',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/internal/transfers/notification-source', method: 'POST',
                controller: 'DefaultLoyaltyInternalController', operation: 'transferNotificationSource' },
        },
        auctionFunds: Object.fromEntries(['qualify', 'inspect', 'reserve', 'adjust', 'release', 'capture'].map(operation => [operation, {
            secured: true, authTokenTypes: ['access', 'service'],
            accessGroups: ['customerUserGroup', 'employeeUserGroup', 'serviceAccountUserGroup'],
            permissions: ['commerce.bid.participate', 'commerce.bid.manage'], apiExposure: 'loyaltyAuction',
            cache: { enabled: false }, requestPrivacy: { sensitive: true },
            key: '/auction-funds/' + operation, method: 'POST', controller: 'DefaultLoyaltyInternalController',
            operation: 'auction' + operation[0].toUpperCase() + operation.slice(1),
        }])),
        participation: {
            wallet: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/wallet', method: 'GET', controller: 'DefaultLoyaltyInternalController', operation: 'participantWallet'
            },
            enterpriseTestCredit: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['platformAdministratorUserGroup'],
                permission: 'loyalty.wallet.testCredit', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/admin/enterprise-test-credits', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'enterpriseTestCredit'
            },
            transferSettings: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'loyalty.transfers.manage', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/transfer-policy/read', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'transferSettings'
            },
            updateTransferSettings: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'loyalty.transfers.manage', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/transfer-policy', method: 'PUT', controller: 'DefaultLoyaltyInternalController', operation: 'updateTransferSettings'
            },
            partnerConversionOptions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.partnerConversion.read', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/partner-conversions/options', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionOptions'
            },
            partnerConversionQuote: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.partnerConversion.execute', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/partner-conversions/quote', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionQuote'
            },
            partnerConversionConfirm: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.partnerConversion.execute', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/partner-conversions/confirm', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionConfirm'
            },
            partnerConversionStatus: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.partnerConversion.read', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/partner-conversions/status', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionStatus'
            },
            transfer: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.rewards.transfer', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/reward-transfers', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'participantTransfer'
            },
            transferStatus: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyParticipation',
                cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/participant/reward-transfers/:operationKey', method: 'GET', controller: 'DefaultLoyaltyInternalController', operation: 'participantTransferStatus'
            }
        },
        internal: {
            rewardUnitEvidence: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal', cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/reward-unit-evidence', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'rewardUnitEvidence'
            },
            walletEvidence: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal', cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/wallet-evidence', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'walletEvidence'
            },
            ledgerEvidence: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal', cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/reward-ledger-evidence', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'ledgerEvidence'
            },
            reservationEvidence: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal', cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/reward-reservation-evidence', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'reservationEvidence'
            },
            redemptionEvidence: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal', cache: { enabled: false }, requestPrivacy: { sensitive: true },
                key: '/reward-redemption-evidence', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'redemptionEvidence'
            },
            openWallet: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.open', apiExposure: 'loyaltyInternal',
                key: '/wallets', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'openWallet',
                help: { requestType: 'secured', message: 'Performs a Loyalty-owned wallet operation for a trusted calling service.' }
            },
            ownerWalletProjection: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal',
                key: '/wallet-projections', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'ownerWalletProjection',
                help: { requestType: 'secured', message: 'Performs a Loyalty-owned wallet operation for a trusted calling service.' }
            },
            earnRewards: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'loyalty.rewards.earn', apiExposure: 'loyaltyInternal',
                key: '/reward-earnings', method: 'POST', controller: 'DefaultLoyaltyInternalController', operation: 'earnRewards',
                help: { requestType: 'secured', message: 'Performs a Loyalty-owned wallet operation for a trusted calling service.' }
            },
            wallet: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'loyalty.wallet.read', apiExposure: 'loyaltyInternal',
                key: '/wallets/:walletCode', method: 'GET',
                controller: 'DefaultLoyaltyInternalController', operation: 'wallet',
                help: { requestType: 'secured', message: 'Reads a Loyalty wallet projection by wallet code.' }
            },
            transferRewards: {
                secured:true, authTokenTypes:['service'], accessGroups:['serviceAccountUserGroup'], permission:'loyalty.rewards.reserve',apiExposure:'loyaltyInternal',
                key:'/reward-transfers',method:'POST',controller:'DefaultLoyaltyInternalController',operation:'transferRewards'
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
