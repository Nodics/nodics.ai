/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/config/properties @description Defines loyaltyWallet schema access policy. @layer config @owner loyaltyWallet */
module.exports = {
  tooling: {
    commands: {
      "acceptance:loyalty-participant-transfer": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultLoyaltyParticipantTransferAcceptanceService.mjs",
      },
    },
  },
  loyalty: {
    transferNotifications: {
      enabled: false, qualified: false,
      profileConnectionName: "profile", communicationConnectionName: "commsApi",
      timeoutMs: 5000, maxResponseBytes: 16384, allowInsecureLoopback: false, locale: "en", maximumRecipients: 20,
      sourcePermission: "loyalty.transfer.notification.source",
      templates: { SENDER: "LOYALTY_TRANSFER_SENT_IN_APP", RECIPIENT: "LOYALTY_TRANSFER_RECEIVED_IN_APP" },
    },
    auctions: {
      enabled: false,
      maximumCommands: 10000,
      biddingEvidence: {
        moduleName: "bidding", connectionName: "commerce",
        targetAuthority: { runtimeRole: "COMMERCE" }, apiVersion: "v0",
        apiName: "/auctions/funds-evidence", timeoutMs: 10000, maxAttempts: 1,
      },
      checkoutEvidence: {
        moduleName: "checkoutCore", connectionName: "commerce",
        targetAuthority: { runtimeRole: "COMMERCE" }, apiVersion: "v0",
        apiName: "/checkout/auction-funds/evidence", timeoutMs: 10000, maxAttempts: 1,
      },
    },
    participantWallet: { maximumBalances: 100, ledgerPageSize: 50 },
    enterpriseTestCredits: {
      enabled: false,
      allowedEnvironments: [],
      maximumReasonLength: 500,
      platformAdministratorEvidencePath: "/identity/platform-administrator/evidence",
    },
    partnerRewardConversion: { enabled: false, providers: {}, selection: { maximumAccounts: 100, maximumRewardsPerIntegration: 100 } },
    transfers: {
      enabled: true,
      outgoingEnabled: true,
      incomingEnabled: true,
      feeAmount: "0",
      maximumAmount: null,
      maximumDailyAmount: null,
      maximumDailyCount: null,
      timeZone: "UTC",
      identityTimeoutMs: 10000,
      identityTarget: { moduleName: "profile", connectionName: "profile", targetAuthority: { runtimeRole: "PLATFORM" }, apiVersion: "v0", maxAttempts: 1 },
      validation: { identityTimeoutMs: { minimum: 1, maximum: 60000 }, identityMaxAttempts: { minimum: 1, maximum: 1 } },
    },
    transactions: { enabled: false, moduleName: "loyaltyWallet" },
    sampleCredits: { enabled: false, maximumInstructions: 100, allowedEnvironments: [], approvedSources: [] },
  },
  data: {
    dataReleases: {
      installers: { LOYALTY_SAMPLE_CREDITS: "DefaultLoyaltySampleCreditContributionService" },
    },
  },
  communication: {
    dispatchEligibilityOwners: {
      loyaltyWallet: { LOYALTY_TRANSFER_COMPLETED: "DefaultLoyaltyTransferNotificationService" },
    },
    templateResources: { modules: { loyaltyWallet: true } },
  },
  schemaPolicies: {
    loyaltyWallet: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          serviceAccountUserGroup: 10,
          employeeUserGroup: 10,
        },
      },
    },
  },
  localResetProvider: {
    contributions: {
      loyaltyWallet: {
        serviceNames: {
          DefaultLoyaltyWalletRewardBalanceService: true,
          DefaultLoyaltyWalletService: true,
        },
      },
    },
  },
};
