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
