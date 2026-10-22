/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/src/router/routers.js @description Declares participant-scoped Commerce bid commands. @layer router @owner bidding */
/** Bidding APIs require the participant permission and repeat participant checks in the service. */
module.exports = { bidding: { bids: {} } };
module.exports.bidding.bids.list = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  permission: "commerce.bid.participate",
  apiExposure: "commerceCustomer",
  key: "/bids",
  method: "GET",
  controller: "DefaultBiddingController",
  operation: "list",
};
module.exports.bidding.bids.read = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  permission: "commerce.bid.participate",
  apiExposure: "commerceCustomer",
  key: "/bids/:code",
  method: "GET",
  controller: "DefaultBiddingController",
  operation: "read",
};
module.exports.bidding.bids.create = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  permission: "commerce.bid.participate",
  apiExposure: "commerceCustomer",
  key: "/bids",
  method: "POST",
  controller: "DefaultBiddingController",
  operation: "create",
};
module.exports.bidding.bids.decide = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  permission: "commerce.bid.participate",
  apiExposure: "commerceCustomer",
  key: "/bids/:code/decisions",
  method: "POST",
  controller: "DefaultBiddingController",
  operation: "decide",
};

/** Timed auctions share the same backend participant authority as negotiations. */
module.exports.bidding.auctions = {
  publicPublication: {
    secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'commerce.bid.participate',
    apiExposure: 'commerceCustomer', cache: { enabled: false },
    key: '/internal/auctions/publication', method: 'POST', controller: 'DefaultBiddingController', operation: 'publicAuctionPublication',
  },
  closeDue: {
    secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'commerce.bid.manage',
    apiExposure: 'commerceCustomer', cache: { enabled: false }, requestPrivacy: { sensitive: true },
    key: '/internal/auctions/close-due', method: 'POST', controller: 'DefaultBiddingController', operation: 'closeDueAuctions',
  },
  publication: {
    secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'commerce.bid.participate',
    apiExposure: 'commerceCustomer', cache: { enabled: false }, requestPrivacy: { sensitive: true },
    key: '/auction-publications/:code', method: 'GET', controller: 'DefaultBiddingController', operation: 'auctionPublication',
  },
  notificationSource: {
    secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
    permission: 'commerce.bid.manage', apiExposure: 'commerceCustomer',
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
    key: '/internal/auctions/notification-source', method: 'POST', controller: 'DefaultBiddingController', operation: 'auctionNotificationSource',
  },
  notificationEligibility: {
    secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
    permission: 'commerce.bid.manage', apiExposure: 'commerceCustomer',
    requestPrivacy: { sensitive: true }, cache: { enabled: false },
    key: '/internal/auctions/notification-eligibility', method: 'POST', controller: 'DefaultBiddingController', operation: 'auctionNotificationEligibility',
  },
  fundsEvidence: {
    secured: true, authTokenTypes: ["access", "service"],
    accessGroups: ["customerUserGroup", "employeeUserGroup", "serviceAccountUserGroup"],
    permissions: ["commerce.bid.participate", "commerce.bid.manage"], apiExposure: "commerceCustomer",
    key: "/auctions/funds-evidence", method: "POST", controller: "DefaultBiddingController", operation: "auctionFundsEvidence",
  },
  open: {
    secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"],
    permission: "commerce.bid.participate", apiExposure: "commerceCustomer",
    key: "/auctions", method: "POST", controller: "DefaultBiddingController", operation: "openAuction",
  },
  list: {
    secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"],
    permission: "commerce.bid.participate", apiExposure: "commerceCustomer",
    key: "/auctions", method: "GET", controller: "DefaultBiddingController", operation: "listAuctions",
  },
  read: {
    secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"],
    permission: "commerce.bid.participate", apiExposure: "commerceCustomer",
    key: "/auctions/:code", method: "GET", controller: "DefaultBiddingController", operation: "readAuction",
  },
  command: {
    secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"],
    permission: "commerce.bid.participate", apiExposure: "commerceCustomer",
    key: "/auctions/:code/commands", method: "POST", controller: "DefaultBiddingController", operation: "commandAuction",
  },
};
