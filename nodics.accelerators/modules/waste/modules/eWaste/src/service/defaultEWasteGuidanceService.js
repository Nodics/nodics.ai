/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/service/defaultEWasteGuidanceService @description Supplies configured domain guidance while retaining canonical Waste conversation and correction commands. @layer service @owner eWaste */
module.exports = {
  /** Delegates persistence, revision checks and correction routing to the domain conversation. */
  message: function (request) {
    return SERVICE.DefaultEWasteConversationService.guidance(request, {
      fixedMessage: this.fixedMessage.bind(this),
    });
  },
  /** Explains domain handling and arrival policy without inventing retention terms. */
  fixedMessage: function (text) {
    let message;
    if (/location|gps|permission|from home|nearest|arriv/i.test(text)) {
      const journey = SERVICE.DefaultEWasteJourneyService.settings();
      const radius = journey.arrivalRadiusMetres;
      message = `Fresh location checks whether you are within ${radius} metres of a collection centre. If you already granted access, we capture it automatically. You may browse the map without sharing location; submission requires an arrival check. If location is blocked, enable it in device or browser settings and retry. Your item details are unchanged.`;
    } else if (
      /swollen|smoking|leaking|burning|hot battery|damaged battery/i.test(text)
    )
      message =
        "Do not put a damaged or swollen battery into a general bin. Ask collection-centre staff for their handling instructions. A photo cannot establish that an item is safe.";
    else if (/photo|camera|upload/i.test(text) && /\?|how|can|why/i.test(text))
      message =
        "At the collection centre, take a photo or upload one from your device. Keep the whole item visible. We identify supported details automatically, then you can correct them and confirm once. If analysis fails, your saved photo remains available for retry or essential manual details.";
    else if (/privacy|retain|delete|who sees/i.test(text))
      message =
        "Your photo is attached to your customer submission and is available to authorized reviewers. Refer to the published privacy policy for retention and deletion terms. I cannot promise a retention period or delete a record from this conversation.";
    return message;
  },
};
