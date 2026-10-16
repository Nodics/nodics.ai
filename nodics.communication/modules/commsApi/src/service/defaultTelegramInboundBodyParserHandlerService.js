/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module commsApi/service/defaultTelegramInboundBodyParserHandlerService
 * @description Adds pre-body Telegram authentication inside nRouter's existing
 * selectable parser chain, after qualified private admission. No separate HTTP route.
 * @owner commsApi @layer service
 * @override Preserve exact route/privacy, pre-parse authentication, bounded JSON and safe errors.
 */
module.exports = {
  /** Requires the native owner route contract. @param {Object} route Effective router metadata. @returns {void} @throws {Error} Fixed refusal for weakened metadata. */
  assertRoute: function (route) {
    if (!route || route.key !== "/integrations/telegram/:receiverCode/start" ||
        String(route.method).toUpperCase() !== "POST" || route.controller !== "DefaultCommunicationApiController" ||
        route.operation !== "receiveTelegramStart" || route.publicAccess !== true ||
        route.secured !== false || route.apiExposure !== "communicationTelegramInbound" ||
        route.bodyParserHandler !== "telegramInboundBodyParserHandler" ||
        route.requestPrivacy?.sensitive !== true || route.cache?.enabled !== false)
      throw new CLASSES.NodicsError("ERR_COMMS_TELEGRAM_CONTEXT");
  },

  /**
   * Builds a route parser that authenticates before invoking Foundation JSON parsing.
   * @param {Object} route Registered native route. @returns {Array<Function>} nRouter middleware chain.
   * @throws {Error} Invalid route metadata at registration.
   */
  getBodyParser: function (route) {
    this.assertRoute(route);
    return [(req, res, next) => {
      try {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(req);
        res.setHeader("Cache-Control", "no-store");
        const policy = SERVICE.DefaultTelegramInboundService.authenticate(req);
        // An upstream parser must not have consumed native JSON before this authentication boundary.
        if (req._body === true) throw new CLASSES.NodicsError("ERR_COMMS_TELEGRAM_CONTEXT");
        const parsers = SERVICE.DefaultJsonBodyParserHandlerService.getBodyParser({ ...route, jsonBodyLimit: policy.maximumPayloadBytes });
        let index = 0;
        const advance = (error) => {
          if (error) return next(error);
          if (index === parsers.length) return next();
          parsers[index++](req, res, advance);
        };
        advance();
      } catch (_) {
        const error = new CLASSES.NodicsError("ERR_COMMS_TELEGRAM_CONTEXT");
        if (!SERVICE.DefaultRouterOperationService.sendPrivateError(req, res, error)) next(error);
      }
    }];
  },
};
