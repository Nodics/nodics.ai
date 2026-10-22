/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/config/properties.js @description Defines deployment-owned bidding eligibility and exact negotiation policy. @layer config @owner bidding */
module.exports = {
  tooling: {
    commands: {
      "acceptance:bidding-auction": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script: "src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs",
      },
    },
  },
  communication: {
    dispatchEligibilityOwners: { bidding: {
      AUCTION_SELECTED: "DefaultBiddingAuctionNotificationService",
      AUCTION_CANCELLED: "DefaultBiddingAuctionNotificationService",
      AUCTION_UNSELECTED_RELEASED: "DefaultBiddingAuctionNotificationService",
      AUCTION_WINNER_PENDING: "DefaultBiddingAuctionNotificationService",
      AUCTION_UNSOLD: "DefaultBiddingAuctionNotificationService",
    } },
    templateResources: { modules: { bidding: true } },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      bidding: {
        serviceNames: {
          DefaultCheckoutBidService: true,
          DefaultBiddingAuctionRoundService: true,
        },
      },
    },
  },

  bidding: {
    enabled: false,
    runtimeRoles: { COMMERCE: true },
    policyVersion: "bid-v2",
    holdTiming: "CHECKOUT_AFTER_ACCEPTANCE",
    validitySeconds: 86400,
    amountScale: 2,
    maximumAmount: "1000000",
    stores: {},
    identityService: "DefaultBiddingIdentityService",
    offerService: "DefaultBiddingOfferService",
    locale: "en",
    orderCodePrefix: "BID_ORDER_",
    profileTransport: { moduleName: "profile", connectionName: "profile", targetAuthority: { runtimeRole: "PLATFORM" },
      apiVersion: "v0", timeoutMs: 10000, maxAttempts: 1, followRedirects: false, rejectUnauthorized: true },
    acceptance: { requestTimeoutMs: 30000, maximumDuePages: 100, deadlineSafetyMs: 25 },
    auction: {
      holdTiming: "RESERVE_ON_BID",
      graceHours: 24,
      maximumBids: 1000,
      maximumCommands: 10000,
      duePageSize: 100,
      scheduler: { enabled: false, startNode: "DefaultBiddingCloseService.sweep", maximumPages: 10,
        target: { moduleName: "bidding", connectionName: "commerce", targetAuthority: { runtimeRole: "COMMERCE" },
          apiVersion: "v0", timeoutMs: 60000, maxAttempts: 1 } },
      notifications: {
        enabled: false, qualified: false, maximumRecipients: 100, maximumEventsPerRun: 50, timeoutMs: 15000,
        allowInsecureLoopback: false, locale: "en",
        profileConnectionName: "profile", communicationConnectionName: "engagement",
        biddingConnectionName: "commerce",
        templates: { SELECTED: "bidding.auction.selected", CANCELLED: "bidding.auction.cancelled", UNSOLD: "bidding.auction.unsold",
          UNSELECTED_RELEASED: "bidding.auction.unselectedReleased", WINNER_PENDING: "bidding.auction.winnerPending" },
      },
      portsService: "DefaultBiddingAuctionPortsService",
      spendService: "DefaultCommerceParticipantSpendService",
      checkoutService: "DefaultCheckoutAuctionService",
      listingService: "DefaultDigitalCommerceAuctionService",
      loyaltyTarget: {
        moduleName: "loyaltyApi",
        connectionName: "loyaltyServer",
        targetAuthority: { runtimeRole: "LOYALTY" },
        apiVersion: "v0",
        timeoutMs: 10000,
        maxAttempts: 1,
      },
      fundsPaths: {
        qualify: "/auction-funds/qualify",
        inspect: "/auction-funds/inspect",
        reserve: "/auction-funds/reserve",
        adjust: "/auction-funds/adjust",
        release: "/auction-funds/release",
      },
    },
  },
  schemaPolicies: {
    bidding: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
    },
  },

  apiExposure: {
    categories: {
      commerceCustomer: {
        enabled: true,
      },
    },
  },
};
